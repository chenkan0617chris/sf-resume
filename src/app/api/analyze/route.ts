// POST /api/analyze — one-shot gap analysis. Returns AnalysisJson + meta.
// Quota-protected. Uses the server-side API key for the active provider.

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { checkAndConsumeQuota, decrementUsage } from '@/lib/quota';
import {
  getProvider,
  getProviderKey,
  type ProviderId,
} from '@/lib/providers';
import {
  InvalidApiKeyError,
  RateLimitError,
  TimeoutError,
  NetworkError,
  ServerError,
  MalformedResponseError,
  type OutputLang,
} from '@/lib/providers/shared';

export const runtime = 'nodejs';
export const maxDuration = 60;

interface AnalyzeBody {
  resumeMarkdown: string;
  jdText: string;
  outputLang?: OutputLang;
  provider?: ProviderId;
  model?: string;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: AnalyzeBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.resumeMarkdown?.trim() || !body.jdText?.trim()) {
    return NextResponse.json(
      { error: 'resumeMarkdown and jdText are required' },
      { status: 400 }
    );
  }

  const providerId = (body.provider ||
    (process.env.DEFAULT_PROVIDER as ProviderId) ||
    'deepseek') as ProviderId;
  const provider = getProvider(providerId);
  const model =
    body.model || process.env.DEFAULT_ANALYZE_MODEL || provider.defaultAnalyzeModel;
  const outputLang: OutputLang = body.outputLang === 'zh' ? 'zh' : 'en';

  const quota = await checkAndConsumeQuota(session.user.id, session.user.tier);
  if (!quota.allowed) {
    return NextResponse.json(
      { error: 'QUOTA_EXCEEDED', limit: quota.limit, used: quota.used },
      { status: 429 }
    );
  }

  try {
    const apiKey = getProviderKey(providerId);
    const result = await provider.impl.analyze({
      resumeMarkdown: body.resumeMarkdown,
      jdText: body.jdText,
      apiKey,
      model,
      outputLang,
    });
    return NextResponse.json({ ...result, quota });
  } catch (err) {
    await decrementUsage(session.user.id);

    if (err instanceof InvalidApiKeyError) {
      return NextResponse.json(
        { error: 'PROVIDER_AUTH_FAILED', message: err.message },
        { status: 502 }
      );
    }
    if (err instanceof RateLimitError) {
      return NextResponse.json(
        { error: 'PROVIDER_RATE_LIMIT', retryAfter: err.retryAfterSeconds },
        { status: 503 }
      );
    }
    if (err instanceof TimeoutError) {
      return NextResponse.json({ error: 'TIMEOUT' }, { status: 504 });
    }
    if (err instanceof NetworkError) {
      return NextResponse.json({ error: 'NETWORK' }, { status: 502 });
    }
    if (err instanceof MalformedResponseError) {
      return NextResponse.json(
        { error: 'MALFORMED_RESPONSE', message: err.message },
        { status: 502 }
      );
    }
    if (err instanceof ServerError) {
      return NextResponse.json(
        { error: 'PROVIDER_ERROR', message: err.message },
        { status: 502 }
      );
    }
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: 'INTERNAL', message: msg }, { status: 500 });
  }
}
