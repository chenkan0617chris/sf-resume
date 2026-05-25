// Shared infrastructure for all LLM providers: typed errors, fetch wrapper
// with timeout/abort plumbing, and the defensive AnalysisJSON parser.

// ─── Typed errors ────────────────────────────────────────────────────────

export class InvalidApiKeyError extends Error {
  static code = 'INVALID_API_KEY' as const;
  code = InvalidApiKeyError.code;
  constructor(message = 'Invalid API key') {
    super(message);
    this.name = 'InvalidApiKeyError';
  }
}

export class RateLimitError extends Error {
  static code = 'RATE_LIMIT' as const;
  code = RateLimitError.code;
  retryAfterSeconds: number | null;
  constructor(message = 'Rate limited', retryAfterSeconds: number | null = null) {
    super(message);
    this.name = 'RateLimitError';
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export class TimeoutError extends Error {
  static code = 'TIMEOUT' as const;
  code = TimeoutError.code;
  constructor(message = 'Request timed out') {
    super(message);
    this.name = 'TimeoutError';
  }
}

export class NetworkError extends Error {
  static code = 'NETWORK' as const;
  code = NetworkError.code;
  constructor(message = 'Network error') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ServerError extends Error {
  static code = 'SERVER' as const;
  code = ServerError.code;
  status: number;
  constructor(message = 'Server error', status = 500) {
    super(message);
    this.name = 'ServerError';
    this.status = status;
  }
}

export class MalformedResponseError extends Error {
  static code = 'MALFORMED_RESPONSE' as const;
  code = MalformedResponseError.code;
  constructor(message = 'Malformed model response') {
    super(message);
    this.name = 'MalformedResponseError';
  }
}

export type ProviderError =
  | InvalidApiKeyError
  | RateLimitError
  | TimeoutError
  | NetworkError
  | ServerError
  | MalformedResponseError;

// ─── fetch with timeout + abort ──────────────────────────────────────────

export async function fetchWithTimeout(
  url: string,
  opts: RequestInit = {},
  ms = 30_000
): Promise<Response> {
  const controller = new AbortController();
  let timedOut = false;

  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, ms);

  const externalSignal = opts.signal as AbortSignal | undefined;
  let externalAbortHandler: (() => void) | null = null;
  if (externalSignal) {
    if (externalSignal.aborted) {
      clearTimeout(timer);
      controller.abort();
    } else {
      externalAbortHandler = () => controller.abort();
      externalSignal.addEventListener('abort', externalAbortHandler, { once: true });
    }
  }

  try {
    return await fetch(url, { ...opts, signal: controller.signal });
  } catch (err) {
    if (timedOut) throw new TimeoutError(`Request exceeded ${ms}ms`);
    if (externalSignal?.aborted) throw new DOMException('Aborted', 'AbortError');
    if (err instanceof Error && err.name === 'AbortError') throw err;
    throw new NetworkError(err instanceof Error ? err.message : 'Network error');
  } finally {
    clearTimeout(timer);
    if (externalSignal && externalAbortHandler) {
      externalSignal.removeEventListener('abort', externalAbortHandler);
    }
  }
}

// ─── HTTP error classifier ───────────────────────────────────────────────

export async function classifyHttpError(
  response: Response,
  opts: { errorBodyMessageGetter?: (body: unknown) => string | null } = {}
): Promise<ProviderError> {
  let bodyText = '';
  try {
    bodyText = await response.text();
  } catch {
    // ignore
  }
  let parsed: unknown = null;
  try {
    parsed = bodyText ? JSON.parse(bodyText) : null;
  } catch {
    // non-JSON
  }

  let apiMessage = bodyText || response.statusText;
  if (opts.errorBodyMessageGetter && parsed) {
    const m = opts.errorBodyMessageGetter(parsed);
    if (m) apiMessage = m;
  } else if (
    parsed &&
    typeof parsed === 'object' &&
    'error' in parsed &&
    parsed.error &&
    typeof parsed.error === 'object' &&
    'message' in parsed.error &&
    typeof (parsed.error as { message: unknown }).message === 'string'
  ) {
    apiMessage = (parsed.error as { message: string }).message;
  }

  if (response.status === 401 || response.status === 403) {
    return new InvalidApiKeyError(apiMessage || 'Invalid API key');
  }
  if (response.status === 429) {
    const retryAfterHeader = response.headers.get('retry-after');
    const retryAfterSeconds = retryAfterHeader
      ? parseInt(retryAfterHeader, 10) || null
      : null;
    return new RateLimitError(apiMessage || 'Rate limited', retryAfterSeconds);
  }
  if (response.status >= 500) {
    return new ServerError(apiMessage || 'Server error', response.status);
  }
  return new ServerError(apiMessage || `HTTP ${response.status}`, response.status);
}

// ─── AnalysisJSON parser ─────────────────────────────────────────────────

export type GapStatus = 'missing' | 'partial' | 'matched';
export type Importance = 'high' | 'medium' | 'low';

export interface AnalysisJson {
  score: number;
  scoreBreakdown: {
    skills: number;
    experience: number;
    keywords: number;
    education: number;
  };
  summary: string;
  gaps: Array<{
    category: string;
    item: string;
    status: GapStatus;
    importance: Importance;
    suggestion: string;
  }>;
  strengths: string[];
  improvements: string[];
}

const VALID_STATUS: Set<GapStatus> = new Set(['missing', 'partial', 'matched']);
const VALID_IMPORTANCE: Set<Importance> = new Set(['high', 'medium', 'low']);

function isInt0to100(n: unknown): n is number {
  return typeof n === 'number' && Number.isInteger(n) && n >= 0 && n <= 100;
}

export function parseAnalysisJson(text: string): AnalysisJson {
  if (!text || !text.trim()) {
    throw new MalformedResponseError('Empty response');
  }
  let stripped = text.trim();

  const fenceMatch = stripped.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fenceMatch) {
    stripped = fenceMatch[1].trim();
  } else {
    stripped = stripped.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '');
  }

  let obj: unknown;
  try {
    obj = JSON.parse(stripped);
  } catch (err) {
    throw new MalformedResponseError(
      `JSON parse failed: ${err instanceof Error ? err.message : 'unknown'}`
    );
  }

  if (!obj || typeof obj !== 'object') {
    throw new MalformedResponseError('Response is not an object');
  }
  const o = obj as Record<string, unknown>;
  if (!isInt0to100(o.score)) {
    throw new MalformedResponseError('score must be an integer 0-100');
  }
  const sb = o.scoreBreakdown;
  if (!sb || typeof sb !== 'object') {
    throw new MalformedResponseError('scoreBreakdown missing');
  }
  const sbObj = sb as Record<string, unknown>;
  for (const k of ['skills', 'experience', 'keywords', 'education'] as const) {
    if (!isInt0to100(sbObj[k])) {
      throw new MalformedResponseError(`scoreBreakdown.${k} must be 0-100`);
    }
  }
  if (typeof o.summary !== 'string' || !o.summary.trim()) {
    throw new MalformedResponseError('summary must be a non-empty string');
  }
  if (!Array.isArray(o.gaps)) {
    throw new MalformedResponseError('gaps must be an array');
  }
  o.gaps.forEach((g: unknown, i: number) => {
    if (!g || typeof g !== 'object') throw new MalformedResponseError(`gaps[${i}] invalid`);
    const gap = g as Record<string, unknown>;
    if (typeof gap.category !== 'string' || !gap.category.trim())
      throw new MalformedResponseError(`gaps[${i}].category invalid`);
    if (typeof gap.item !== 'string' || !gap.item.trim())
      throw new MalformedResponseError(`gaps[${i}].item invalid`);
    if (!VALID_STATUS.has(gap.status as GapStatus))
      throw new MalformedResponseError(`gaps[${i}].status must be missing|partial|matched`);
    if (!VALID_IMPORTANCE.has(gap.importance as Importance))
      throw new MalformedResponseError(`gaps[${i}].importance must be high|medium|low`);
    if (typeof gap.suggestion !== 'string')
      throw new MalformedResponseError(`gaps[${i}].suggestion must be a string`);
  });
  if (!Array.isArray(o.strengths) || o.strengths.some((s: unknown) => typeof s !== 'string'))
    throw new MalformedResponseError('strengths must be an array of strings');
  if (
    !Array.isArray(o.improvements) ||
    o.improvements.some((s: unknown) => typeof s !== 'string')
  )
    throw new MalformedResponseError('improvements must be an array of strings');

  return obj as AnalysisJson;
}

// ─── Provider interface ──────────────────────────────────────────────────

export type OutputLang = 'en' | 'zh';

export interface AnalyzeArgs {
  resumeMarkdown: string;
  jdText: string;
  apiKey: string;
  model: string;
  outputLang: OutputLang;
  signal?: AbortSignal;
}

export interface RewriteArgs extends AnalyzeArgs {
  onChunk?: (full: string) => void;
}

export interface Provider {
  analyze(args: AnalyzeArgs): Promise<AnalysisJson>;
  rewrite(args: RewriteArgs): Promise<string>;
}
