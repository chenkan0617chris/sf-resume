# SF Resume — Remaining Work

## Already Done
- Google SSO + Auth.js v5 + Supabase (JWT sessions, edge-compatible middleware)
- Prisma schema + migration + `prisma.config.ts` (directUrl moved out of schema)
- Dashboard with user name / avatar / nav
- Resume manager: list, create (upload PDF/DOCX or paste markdown), set default, delete
- 4-step wizard: select resume → JD → gap analysis + streaming rewrite → save / download
- All backend API routes: `/api/resume`, `/api/resume/[id]`, `/api/application`, `/api/application/[id]`
- PDF Export: `/api/pdf` route with Classic / Modern / Kan templates via `@react-pdf/renderer`
- Download PDF button in Step 4 (fixed: was never shown due to missing step transition)
- PDF Resume Upload: `/api/resume/parse-pdf` with `unpdf`, wired into `NewResumeForm`
- DOCX Upload: `/api/resume/parse-docx` wired into `NewResumeForm`
- Application History: `/app/history` list + `/app/history/[id]` detail pages
- Language Selector: EN / 中文 toggle in Step 2, flows through analyze + rewrite + PDF render

---

## Phase 2 — Remaining

### Template Picker (Step 4)
- Step 4 currently hardcodes `template: 'kan'` when calling `/api/pdf`
- Add a small picker UI (Classic / Modern / Kan) in Step 4 so user can choose before downloading

### Chinese Font Files
- Download Noto Sans SC + Noto Serif SC TTF (Regular + Bold) to `public/pdf-fonts/`
- `registerCjkFonts(baseUrl)` is already stubbed in `src/lib/pdf-templates/shared.tsx`
- Until fonts exist, Chinese PDF output renders as boxes

---

## Phase 3 — Stripe & Monetisation

### Stripe Setup
- Create products + prices in Stripe Dashboard (Pro Monthly)
- Fill `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID_PRO_MONTHLY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in `.env.local`

### Checkout Flow
- `POST /api/stripe/checkout` — creates a Stripe Checkout Session, redirects user
- Success page at `/app/upgrade/success` — shows confirmation
- Add "Upgrade to Pro" CTA on dashboard when user is on free tier

### Webhook
- `POST /api/stripe/webhook` (already in public routes, runtime = nodejs) — verify Stripe signature
- Handle `customer.subscription.created/updated/deleted` → update `User.tier` + `Subscription` table
- Handle `checkout.session.completed` → link `stripeCustomerId` on User

### Customer Portal
- `POST /api/stripe/portal` — creates a Billing Portal session
- "Manage Subscription" link in header for Pro users

### Quota Display
- Show daily usage in dashboard: "X / 5 analyses used today" (free) or "X / 100" (pro)
- `/api/usage` route already exists — wire it up to a Usage indicator component
- Block the Analyze button in wizard when quota is exhausted (show upgrade CTA)

---

## Phase 4 — Polish & Deploy

### Vercel Deploy
- Connect GitHub repo to Vercel
- Set all env vars in Vercel project settings (same as `.env.local` minus DATABASE_URL comment)
- Add production Google OAuth redirect URI: `https://<domain>/api/auth/callback/google`
- Add production Stripe webhook endpoint in Stripe Dashboard

### Landing Page
- Improve `/` with real marketing copy, feature screenshots, pricing table
- Add FAQ, footer with links

### SEO
- `metadata` exports in `src/app/layout.tsx` and key pages
- `opengraph-image` for social previews

### Error Handling & UX
- Toast notifications for save/delete actions in resume manager and history
- Skeleton loaders while resumes/history load
- Empty-state illustrations

---

## Known Issues / Tech Debt
- `prisma.config.ts`: `directUrl` moved here from schema; `url` also present in config — confirm runtime Prisma Client still reads `DATABASE_URL` from env correctly after `prisma generate`
- Wizard hardcodes `provider: 'deepseek'` and `model: 'deepseek-chat'` when saving application — should read the actual provider/model used
- `resultEditedMarkdown` vs `resultMarkdown` logic: if user edits then regenerates, edited content is cleared correctly but the display logic (`resultEditedMarkdown || resultMarkdown`) could confuse the user — consider explicit "discard edits" state
- No error boundary around `WizardClient` — a thrown error will crash the whole page
