# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project: SF Resume

SaaS app that tailors a user's resume to a pasted job description and outputs a downloadable PDF. Google SSO, server-side LLM calls, daily quotas, Stripe-based Pro tier.

Reference (predecessor): `C:/projects/resume-optimizer` is the original pure-frontend prototype. Its provider adapters, prompts, and PDF templates have been ported here in TypeScript. The full design doc lives at `../resume-optimizer/docs/superpowers/specs/2026-05-22-resume-optimizer-design.md` — read it for context on Step 1-4 wizard behavior, AnalysisJSON shape, and markdown conventions used by the PDF parser.

## Commands

```bash
# Dev server
npm run dev                       # http://localhost:3000

# Build & type-check
npx next build                    # also runs TypeScript

# Prisma
npx prisma generate               # regen client after schema changes
npx prisma migrate dev --name X   # new migration (needs real DATABASE_URL)
npx prisma studio                 # browse DB

# Lint
npm run lint
```

**Node version**: requires ≥ 22.12 / 24.0 (Prisma 6 requirement). On Windows the system Node at `C:\Program Files\nodejs\node.exe` (currently v24) satisfies this. The bash shell may default to an older nvm-installed Node — prepend system Node to PATH if commands fail: `export PATH="/c/Program Files/nodejs:$PATH"`.

## Architecture

Next.js 16 (App Router) + React 19 + Tailwind v4 + Auth.js v5 + Prisma 6 + Postgres. All LLM calls are server-side; the client never sees provider API keys.

### Layering rule

```
app/  →  components/  →  lib/
                          ├── providers/    (LLM dispatch)
                          ├── prompts/      (prompt builders)
                          ├── pdf-templates/ (react-pdf)
                          ├── auth.ts       (Auth.js config)
                          ├── prisma.ts     (DB singleton)
                          └── quota.ts      (daily limits)
```

Components and route handlers MUST NOT import provider modules client-side. Routes call `getProvider(id).impl.analyze(...)` server-side; clients fetch `/api/analyze` and `/api/rewrite`.

### Runtime decisions per route

| Route | Runtime | Why |
|---|---|---|
| `/api/rewrite` | **nodejs** | Streaming SSE with `maxDuration=60`; typical generation is 18–31s. Edge was avoided due to 1 MB bundle size limit on Vercel Hobby. |
| `/api/analyze` | nodejs | Returns JSON in one shot; uses Prisma for quota |
| `/api/resume/*`, `/api/usage`, `/api/application/*` | nodejs | All use Prisma |
| `/api/stripe/webhook` | nodejs | Uses Stripe SDK + Prisma; public (no auth middleware) |
| `/api/auth/*` | nodejs | Auth.js handlers; public (no auth middleware) |

Edge runtime can't use Prisma's standard client (Node-native engine). If `/api/rewrite` needs DB writes (e.g. quota), it must POST to an internal Node route OR Auth.js + Prisma must be replaced with Drizzle + Neon HTTP driver. Currently rewrite quota is consumed by the preceding `/api/analyze` call (analysis always runs first in the wizard).

### Auth flow

- Google OAuth via Auth.js v5 (`lib/auth.ts`)
- Session strategy: **database** (sessions stored in Postgres, cookie is just a session ID)
- `await auth()` in any server component or route reads the session
- Route protection: `src/proxy.ts` (formerly middleware.ts in Next ≤15) redirects unauthenticated `/app/*` to landing, returns 401 on protected `/api/*` except `/api/auth/*` and `/api/stripe/webhook`

### Provider abstraction (ported from resume-optimizer)

- `lib/providers/index.ts` — registry. `PROVIDER_IDS`, `getProvider(id)`, `getProviderKey(id)`
- `lib/providers/anthropic.ts` — Anthropic Messages API, SSE `content_block_delta`
- `lib/providers/openai.ts` + `deepseek.ts` — both delegate to `openaiCompatible.ts`. Differ only in base URL.
- `lib/providers/shared.ts` — typed errors, `fetchWithTimeout`, `classifyHttpError`, `parseAnalysisJson`, `Provider` interface

Adding a provider: write `lib/providers/<id>.ts`, import in `index.ts`, add to `PROVIDERS` and `PROVIDER_IDS`. The prompt builders are provider-agnostic (`buildAnalyzePrompt` / `buildRewritePrompt`).

Default model strategy: **analyze uses fast models**, **rewrite uses reasoning models**. DeepSeek default: `deepseek-chat` for analyze, `deepseek-v4-pro` for rewrite. Configured per provider in `PROVIDERS[id].defaultAnalyzeModel` / `defaultRewriteModel`, overridable via `DEFAULT_ANALYZE_MODEL` / `DEFAULT_REWRITE_MODEL` env vars.

### Bilingual output (en / zh)

`outputLang` flows from client request → `buildAnalyzePrompt` / `buildRewritePrompt` (language directive at end of prompt) → LLM. Analysis enum fields (`status`, `importance`, `category`) stay English so backend code can match. PDF templates accept a `lang` prop and switch:
- Section heading strings (en: "Experience" / zh: "工作经历")
- Font family via `pickFonts(lang)` — built-in Helvetica/Times for English, Noto Sans/Serif SC for Chinese

**CJK font files**: must be placed at `public/pdf-fonts/{NotoSansSC,NotoSerifSC}-{Regular,Bold}.ttf`. Until they exist, Chinese text in PDFs will render as boxes. Download script and Font.register wiring are in `lib/pdf-templates/shared.tsx`.

### Quota

`lib/quota.ts` exposes `checkAndConsumeQuota(userId, tier)` which atomically increments `UsageDay.count` in a transaction. Failures are rolled back via `decrementUsage(userId)`. Limits read from env (`FREE_DAILY_QUOTA`, `PRO_DAILY_QUOTA`).

### Database

Prisma schema at `prisma/schema.prisma`. Key models:
- **User** — `tier` ("free" | "pro"), `stripeCustomerId`
- **Resume** — user's saved resumes (markdown + optional structured JSON)
- **Application** — one row per analyze+rewrite call, with snapshots
- **UsageDay** — composite PK (userId, date), counter
- **Subscription** — Stripe subscription state

Migrations need a real `DATABASE_URL`. The placeholder `.env` lets `prisma generate` run but not `migrate`.

## Conventions

- **No client-side LLM calls.** Components fetch `/api/analyze` / `/api/rewrite`. The seam is `lib/server-llm.ts` (to be added in W2).
- **Streaming is rewrite-only.** Analyze is one-shot JSON; rewrite is SSE. Edge runtime requirement makes Prisma unusable inside rewrite handler — see runtime table above.
- **Errors are typed.** Provider code throws `InvalidApiKeyError`, `RateLimitError`, etc (from `lib/providers/shared.ts`). Route handlers catch and map to HTTP status codes.
- **i18n key, not literal.** Toasts and UI text use locale dictionaries (to be ported W2).
- **Server-only API keys.** Env vars NEVER use `NEXT_PUBLIC_` prefix for LLM keys. The only client-visible Stripe var is `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (safe by design).

## Env vars

See `.env.example`. The placeholder `.env` (committed) lets `prisma generate` run; real secrets go in `.env.local` (git-ignored).

## Status (Phase 1 progress)

- ✅ Scaffold + deps + Prisma + Auth.js + provider port + PDF templates port + route skeletons
- ⬜ Real DATABASE_URL + first migration (W1D3)
- ⬜ Resume CRUD UI + PDF parse handler (W1D5-7)
- ⬜ Step 1-4 wizard ported (W2D4-7)
- ⬜ Stripe integration (W3)
- ⬜ Chinese font files (anytime after CJK testing starts)
- ⬜ Vercel deploy + custom domain

Roadmap detail in conversation memory; see also `../resume-optimizer/docs/superpowers/specs/2026-05-22-resume-optimizer-design.md` for original-design context.
