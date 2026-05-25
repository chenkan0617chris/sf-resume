// Shared implementation for OpenAI Chat Completions API and any compatible
// provider (e.g., DeepSeek). The only differences between OpenAI and DeepSeek
// are the base URL and the supported model names.
//
// SSE format:
//   data: {"choices":[{"delta":{"content":"hi"}}]}
//   data: [DONE]

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
  type Provider,
} from './shared';

// DeepSeek reasoning models (V4 Pro, Reasoner) burn 2-5k tokens internally
// before emitting visible output, so we need headroom above what the user
// actually sees.
const TIMEOUT_ANALYZE_MS = 120_000;
const TIMEOUT_REWRITE_MS = 240_000;
const MAX_TOKENS_ANALYZE = 16_384;
const MAX_TOKENS_REWRITE = 16_384;

interface OpenAICompatibleConfig {
  baseUrl: string;
  chatPath?: string;
  supportsJsonMode?: boolean;
}

export function makeOpenAICompatibleProvider(cfg: OpenAICompatibleConfig): Provider {
  const base = cfg.baseUrl.replace(/\/$/, '');
  const endpoint = `${base}${cfg.chatPath || '/v1/chat/completions'}`;
  const supportsJsonMode = cfg.supportsJsonMode ?? false;

  function buildHeaders(apiKey: string): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    };
  }

  function extractMessageText(json: unknown): string {
    if (!json || typeof json !== 'object') return '';
    const choices = (json as { choices?: unknown }).choices;
    if (!Array.isArray(choices) || choices.length === 0) return '';
    const message = (choices[0] as { message?: unknown }).message;
    if (!message || typeof message !== 'object') return '';
    const content = (message as { content?: unknown }).content;
    return typeof content === 'string' ? content : '';
  }

  async function analyze({
    resumeMarkdown,
    jdText,
    apiKey,
    model,
    outputLang,
    signal,
  }: AnalyzeArgs): Promise<AnalysisJson> {
    const callOnce = async (retryHint: string | undefined) => {
      const body: Record<string, unknown> = {
        model,
        messages: [
          {
            role: 'user',
            content: buildAnalyzePrompt(resumeMarkdown, jdText, outputLang, retryHint),
          },
        ],
        max_tokens: MAX_TOKENS_ANALYZE,
      };
      if (supportsJsonMode) {
        body.response_format = { type: 'json_object' };
      }
      const res = await fetchWithTimeout(
        endpoint,
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
          if (!payload) continue;
          if (payload === '[DONE]') {
            stopped = true;
            break;
          }
          let evt: unknown;
          try {
            evt = JSON.parse(payload);
          } catch {
            continue;
          }
          if (!evt || typeof evt !== 'object') continue;
          const e = evt as Record<string, unknown>;
          const choices = e.choices as Array<{ delta?: { content?: string } }> | undefined;
          const piece = choices?.[0]?.delta?.content;
          if (typeof piece === 'string' && piece) {
            full += piece;
            try {
              onChunk?.(full);
            } catch {
              // ignore listener errors
            }
          }
          if (e.error && typeof e.error === 'object') {
            const errObj = e.error as { message?: string };
            throw new ServerError(errObj.message ?? 'Stream error', 500);
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

  async function rewrite({
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
      messages: [
        { role: 'user', content: buildRewritePrompt(resumeMarkdown, jdText, outputLang) },
      ],
      max_tokens: MAX_TOKENS_REWRITE,
      stream: true,
    };
    const res = await fetchWithTimeout(
      endpoint,
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

  return { analyze, rewrite };
}
