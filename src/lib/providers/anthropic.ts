// Anthropic Messages API provider. SSE format: content_block_delta events
// carry { delta: { text } } pieces; message_stop ends the stream.

import { buildAnalyzePrompt } from '../prompts/analyzePrompt';
import { buildRewritePrompt } from '../prompts/rewritePrompt';
import {
  fetchWithTimeout,
  classifyHttpError,
  parseAnalysisJson,
  MalformedResponseError,
  NetworkError,
  ServerError,
  type AnalyzeArgs,
  type RewriteArgs,
  type AnalysisJson,
} from './shared';

const DEFAULT_BASE = 'https://api.anthropic.com';
const API_BASE = process.env.VITE_ANTHROPIC_API_BASE || DEFAULT_BASE;
const ENDPOINT = `${API_BASE.replace(/\/$/, '')}/v1/messages`;

const TIMEOUT_ANALYZE_MS = 60_000;
const TIMEOUT_REWRITE_MS = 120_000;
const MAX_TOKENS_ANALYZE = 4096;
const MAX_TOKENS_REWRITE = 4096;

function buildHeaders(apiKey: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'anthropic-version': '2023-06-01',
    'x-api-key': apiKey,
  };
}

function extractMessageText(json: unknown): string {
  if (
    !json ||
    typeof json !== 'object' ||
    !('content' in json) ||
    !Array.isArray((json as { content: unknown[] }).content)
  ) {
    return '';
  }
  const content = (json as { content: unknown[] }).content;
  return content
    .filter(
      (b): b is { type: string; text: string } =>
        !!b &&
        typeof b === 'object' &&
        'type' in b &&
        (b as { type: unknown }).type === 'text' &&
        'text' in b &&
        typeof (b as { text: unknown }).text === 'string'
    )
    .map((b) => b.text)
    .join('');
}

export async function analyze({
  resumeMarkdown,
  jdText,
  apiKey,
  model,
  outputLang,
  signal,
}: AnalyzeArgs): Promise<AnalysisJson> {
  const callOnce = async (retryHint: string | undefined) => {
    const body = {
      model,
      max_tokens: MAX_TOKENS_ANALYZE,
      messages: [
        {
          role: 'user',
          content: buildAnalyzePrompt(resumeMarkdown, jdText, outputLang, retryHint),
        },
      ],
    };
    const res = await fetchWithTimeout(
      ENDPOINT,
      {
        method: 'POST',
        headers: buildHeaders(apiKey),
        body: JSON.stringify(body),
        signal,
      },
      TIMEOUT_ANALYZE_MS
    );
    if (!res.ok) throw await classifyHttpError(res);
    let json: unknown;
    try {
      json = await res.json();
    } catch (err) {
      throw new MalformedResponseError(
        `Response body not JSON: ${err instanceof Error ? err.message : 'unknown'}`
      );
    }
    return parseAnalysisJson(extractMessageText(json));
  };

  try {
    return await callOnce(undefined);
  } catch (err) {
    if (err instanceof MalformedResponseError) {
      return await callOnce(
        'Your previous response was not valid JSON. Respond with valid JSON only, no fences, no preamble.'
      );
    }
    throw err;
  }
}

async function readSseStream(
  response: Response,
  onChunk?: (full: string) => void
): Promise<string> {
  if (!response.body || !response.body.getReader) {
    throw new NetworkError('Streaming not supported');
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let full = '';
  let stopped = false;

  try {
    while (!stopped) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let nlIdx: number;
      while ((nlIdx = buffer.indexOf('\n')) !== -1) {
        const line = buffer.slice(0, nlIdx).replace(/\r$/, '').trim();
        buffer = buffer.slice(nlIdx + 1);
        if (!line || !line.startsWith('data:')) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === '[DONE]') continue;
        let evt: unknown;
        try {
          evt = JSON.parse(payload);
        } catch {
          continue;
        }
        if (!evt || typeof evt !== 'object') continue;
        const e = evt as Record<string, unknown>;

        if (e.type === 'content_block_delta' && e.delta && typeof e.delta === 'object') {
          const d = e.delta as Record<string, unknown>;
          const piece = typeof d.text === 'string' ? d.text : '';
          if (piece) {
            full += piece;
            try {
              onChunk?.(full);
            } catch {
              // listener errors must not kill the stream
            }
          }
        } else if (e.type === 'message_stop') {
          stopped = true;
          break;
        } else if (e.type === 'error') {
          const errObj = e.error as { message?: string } | undefined;
          throw new ServerError(errObj?.message ?? 'Stream error', 500);
        }
      }
    }
  } finally {
    try {
      reader.releaseLock();
    } catch {
      // ignore
    }
  }
  return full;
}

export async function rewrite({
  resumeMarkdown,
  jdText,
  apiKey,
  model,
  outputLang,
  onChunk,
  signal,
}: RewriteArgs): Promise<string> {
  const body = {
    model,
    max_tokens: MAX_TOKENS_REWRITE,
    stream: true,
    messages: [
      { role: 'user', content: buildRewritePrompt(resumeMarkdown, jdText, outputLang) },
    ],
  };
  const res = await fetchWithTimeout(
    ENDPOINT,
    {
      method: 'POST',
      headers: { ...buildHeaders(apiKey), Accept: 'text/event-stream' },
      body: JSON.stringify(body),
      signal,
    },
    TIMEOUT_REWRITE_MS
  );
  if (!res.ok) throw await classifyHttpError(res);
  return readSseStream(res, onChunk);
}
