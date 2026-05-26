# UI Redesign — Midnight Violet Design System

**Date:** 2026-05-26  
**Status:** Approved  
**Scope:** Full visual redesign of all pages — landing, app shell, dashboard, wizard, resumes, history.

---

## Goals

Replace the current zinc/white minimal UI with a commercial, futuristic SaaS aesthetic. The redesign should feel like a premium AI product — dark, polished, distinctive — without touching any business logic or backend code.

---

## Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Color palette | Midnight Violet | Deep dark base + electric purple accent — bold, distinctive, premium |
| Hero treatment | Glow Grid | Grid lines + central radial purple glow — clean, sharp, Linear/Supabase feel |
| App shell | Wide Sidebar with Labels | Most polished, most app-like, scales to more features |
| Landing page scope | Full marketing page | Hero + How It Works + Resume example + Cover Letter example + Features + CTA |
| Implementation | Tailwind-native design system | No new dependencies — pure Tailwind v4 + CSS custom properties |

---

## Design System

### Color Tokens (globals.css `@theme`)

```css
/* Backgrounds */
--color-bg-base:     #0d0d14   /* page background */
--color-bg-sunken:   #08080f   /* sidebar, deepest surfaces */
--color-bg-surface:  #111118   /* cards, panels */
--color-bg-elevated: #16161f   /* hover states, tooltips */

/* Borders */
--color-border-subtle:  rgba(124,58,237,0.12)
--color-border-default: rgba(124,58,237,0.20)
--color-border-strong:  rgba(124,58,237,0.35)

/* Accent (violet) */
--color-accent-900: #3b0764
--color-accent-700: #6d28d9
--color-accent-600: #7c3aed   /* primary interactive */
--color-accent-500: #8b5cf6
--color-accent-400: #a855f7   /* glow, highlights */
--color-accent-300: #c084fc   /* text on dark */
--color-accent-200: #e9d5ff   /* headings on dark accent bg */

/* Text */
--color-text-primary:   #f4f4f5
--color-text-secondary: #a1a1aa
--color-text-muted:     #71717a
--color-text-faint:     #52525b
--color-text-ghost:     #3f3f46

/* Status */
--color-success: #4ade80
--color-warning: #fbbf24
--color-danger:  #f87171
```

### Grid Background Utility

Applied to all dark page backgrounds:

```css
.grid-bg {
  background-image:
    linear-gradient(rgba(124,58,237,0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(124,58,237,0.07) 1px, transparent 1px);
  background-size: 40px 40px;
}
```

### Radial Glow Utility

Used in hero sections and primary card accent zones:

```css
.glow-violet {
  background: radial-gradient(ellipse, rgba(124,58,237,0.28) 0%, transparent 65%);
}
```

### Typography

- Font: Geist Sans (already loaded via `next/font`)
- Headline weight: 800, letter-spacing: -1.5px to -2px
- Gradient headline: `background: linear-gradient(135deg, #a855f7, #c084fc); -webkit-background-clip: text`

---

## Pages

### Landing Page (`/`)

**Layout:** Single full-width column, dark background, scrollable.

**Sections (top to bottom):**

1. **Sticky nav** — `#08080f` + blur backdrop, logo mark (gradient violet square) + wordmark, "Sign in →" pill button.

2. **Hero** — Grid background + central radial glow. Eyebrow pill ("AI-Powered Resume Tailoring" with pulsing dot), 52px 800-weight headline with gradient span, 17px subtext, Google sign-in button (gradient violet, glow shadow), "Free to start" note.

3. **How It Works** — 3-column step cards (numbered violet circles, dark glass card surface, subtle violet border). Steps: Upload resume → Paste JD → Download PDF.

4. **Resume Tailoring Example** — 2-column grid:
   - Left: JD snippet panel + gap analysis panel (score circle, matched/partial/missing badges per skill)
   - Right: AI-tailored resume output (keyword highlights in violet, skill tags)

5. **Cover Letter Section** — Full-width panel with cover letter preview on left, metadata panel on right (matched company/role, tone selector chips, keyword chips).

6. **6 Feature Cards** — 3-column grid: Gap Analysis, AI Resume Rewrite, Cover Letter, PDF Export, Application History, English & Chinese.

7. **Bottom CTA** — Repeat Google sign-in button, bottom radial glow.

---

### App Shell (`/app` layout)

**Layout:** Full viewport height flex row — sidebar left, main content right.

**Sidebar (220px, `#08080f`):**
- Logo mark + wordmark at top
- Section label "Workspace"
- Nav items: Dashboard, My Resumes, New Application, History
- Active item: `rgba(124,58,237,0.18)` bg + violet border, violet icon, `#e9d5ff` label
- Inactive: dimmed icon (`#52525b`), muted label (`#71717a`)
- Bottom: user avatar (gradient violet circle with initials) + name + plan + sign-out icon

**Main area:**
- `#0d0d14` + faint grid background (4% opacity)
- Scrollable, `padding: 36px 40px`

---

### Dashboard (`/app`)

> **Data note:** The current `/app/page.tsx` renders no applications. To show "Recent Applications" it needs a `prisma.application.findMany({ take: 5, orderBy: { createdAt: 'desc' } })` query added to the server component. This is a read-only DB query — no new API route or business logic needed.

- "Welcome back, [name]" page title, muted subtitle
- 2-column action cards:
  - **New Application** (primary): violet gradient bg, radial glow, violet icon box, arrow
  - **My Resumes** (secondary): dim surface, ghost icon, muted arrow
- "Recent Applications" section — list of activity items with colored score badges (green ≥70, yellow 40–69, red <40), company/role title, model + duration meta, date

---

### Wizard (`/app/new`)

**Step Indicator:**
- Completed steps: gradient violet filled circle + checkmark
- Active step: gradient violet circle + outer glow ring (`box-shadow: 0 0 0 4px rgba(124,58,237,0.2), 0 0 16px rgba(124,58,237,0.4)`)
- Future steps: dim glass circle, ghost label
- Connecting lines: gradient violet for done, dim for future

**Wizard Card:**
- `rgba(255,255,255,0.02)` background, `rgba(124,58,237,0.18)` border, `border-radius: 20px`
- 18px 800-weight step title, muted subtitle

**Form inputs:**
- `rgba(255,255,255,0.04)` bg, `rgba(255,255,255,0.09)` border, `border-radius: 10px`
- Focus: `rgba(124,58,237,0.5)` border, `rgba(124,58,237,0.06)` bg

**Language toggle:** Pill with active tab in `rgba(124,58,237,0.25)` + violet border

**Buttons:**
- Primary: `linear-gradient(135deg, #7c3aed, #a855f7)` + glow shadow
- Back/secondary: dim glass surface, muted text

**Gap Analysis panel (Step 3):**
- Score circle: violet border, `#a855f7` number
- Score bars: violet gradient fill, dim track
- Gap badges: `rgba(239,68,68,0.15)` red / `rgba(234,179,8,0.15)` yellow / `rgba(34,197,94,0.12)` green — all dark-tinted

**Processing screen:**
- Centered spinner (violet animated ring)
- "Generating your tailored resume…" heading

---

### Resumes Page (`/app/resumes`)

- Dark card list, same surface style as wizard card
- "+ New Resume" button: gradient violet primary
- Each resume card: dim surface, `Default` badge in violet tint, source/date in muted text
- ResumeActions buttons: ghost style matching app theme

---

### History Page (`/app/history`)

- Same dark card list pattern
- Score badges reuse dashboard color logic (green/yellow/red tinted circles)
- Hover: violet border tint, slight bg shift

---

## Component Inventory (files to change)

| File | Change |
|---|---|
| `src/app/globals.css` | Add full token set + grid-bg utility |
| `src/app/page.tsx` | Full landing page rewrite (all sections) |
| `src/app/layout.tsx` | Dark body bg |
| `src/app/app/layout.tsx` | Replace top nav with wide sidebar shell |
| `src/app/app/page.tsx` | Dark dashboard with action cards + recent list |
| `src/app/app/new/page.tsx` | No logic change — inherits new shell |
| `src/app/app/resumes/page.tsx` | Dark card list |
| `src/app/app/history/page.tsx` | Dark card list + score badges |
| `src/app/app/history/[id]/page.tsx` | Dark detail view |
| `src/components/auth/SignInButton.tsx` | Gradient violet Google button |
| `src/components/wizard/WizardClient.tsx` | Full dark restyle (step indicator, cards, inputs, buttons, gap panel) |
| `src/components/resumes/ResumesPageClient.tsx` | Dark restyle |
| `src/components/resumes/ResumeActions.tsx` | Ghost dark buttons |
| `src/components/history/DownloadButton.tsx` | Dark ghost button |

---

## Cover Letter Feature Note

The landing page now advertises cover letter generation as a first-class feature. This feature does **not yet exist** in the backend. The landing page example is illustrative. The wizard currently generates resume only. Cover letter generation should be added as a separate feature after the UI redesign ships — it is **out of scope for this redesign**.

---

## Out of Scope

- Backend logic changes
- New API routes
- Pricing/tier UI changes
- Cover letter generation backend
- Mobile responsiveness (sidebar collapses to icon-only on narrow viewports — deferred)
- Animation/transition polish (CSS transitions on hover only; no Framer Motion)
