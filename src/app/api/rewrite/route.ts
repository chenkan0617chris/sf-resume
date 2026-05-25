// POST /api/rewrite — streaming resume rewrite. Returns text/event-stream.
// MUST run on Edge runtime to bypass Vercel Hobby's 60s function ceiling
// (Edge has no max duration as long as bytes keep flowing).
//
// SSE wire format (matches what the client useLLM hook expects):
//   data: {"type":"chunk","content":"<cumulative full text so far>"}
//   data: {"type":"done"}
//   data: {"type":"error","message":"..."}
//
// NOTE: Edge runtime can't talk to Postgres via the standard Prisma client
// because it bundles a Node-native engine. For quota checks we use a small
// fetch-based wrapper that hits the local /api/_internal/quota route which
// runs Node and does the DB work. Stubbed for now — wired in Phase 1 W2.

import { auth } from '@/lib/auth';
import {
  getProvider,
  getProviderKey,
  type ProviderId,
} from '@/lib/providers';
import type { OutputLang } from '@/lib/providers/shared';

export const runtime = 'edge';

interface RewriteBody {
  resumeMarkdown: string;
  jdText: string;
  outputLang?: OutputLang;
  provider?: ProviderId;
  model?: string;
}

function sseEvent(obj: object): string {
  return `data: ${JSON.stringify(obj)}\n\n`;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  let body: RewriteBody;
  try {
    body = await req.json();
  } catch {
    return new Response('Invalid JSON body', { status: 400 });
  }

  if (!body.resumeMarkdown?.trim() || !body.jdText?.trim()) {
    return new Response('resumeMarkdown and jdText are required', { status: 400 });
  }

  const providerId = (body.provider ||
    (process.env.DEFAULT_PROVIDER as ProviderId) ||
    'deepseek') as ProviderId;
  const provider = getProvider(providerId);
  const model =
    body.model || process.env.DEFAULT_REWRITE_MODEL || provider.defaultRewriteModel;
  const outputLang: OutputLang = body.outputLang === 'zh' ? 'zh' : 'en';

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const apiKey = getProviderKey(providerId);
        await provider.impl.rewrite({
          resumeMarkdown: body.resumeMarkdown,
          jdText: body.jdText,
          apiKey,
          model,
          outputLang,
          onChunk(full) {
            try {
              controller.enqueue(
                encoder.encode(sseEvent({ type: 'chunk', content: full }))
              );
            } catch {
              // controller may already be closed if client disconnected.
            }
          },
        });
        controller.enqueue(encoder.encode(sseEvent({ type: 'done' })));
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        try {
          controller.enqueue(encoder.encode(sseEvent({ type: 'error', message: msg })));
        } catch {
          // ignore
        }
      } finally {
        try {
          controller.close();
        } catch {
          // ignore
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
