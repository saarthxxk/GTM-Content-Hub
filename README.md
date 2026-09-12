# GTM Content Hub

AI-powered go-to-market content management, optimization, and publishing platform. A Next.js 16 + React 19 + TypeScript app that takes content through its full lifecycle — draft → AI-assisted optimization → review → approval → publish → analytics — with a real public website driven by what gets published.

## What's here

- **Internal CMS** at `/studio/*` — dashboard, content library, rich-text editor, AI Assistant, review queue, media library, analytics, and admin.
- **Public website** at `/`, `/articles`, `/campaigns`, `/events`, `/case-studies` — renders only `published` content, with per-page SEO metadata, a sitemap, and `robots.txt`.
- **Workflow engine** (`lib/workflow`) — a small, explicit state machine (`draft → in_review → approved → published → archived`, with a `changes_requested` branch back to `draft`) that gates every transition by role.
- **AI Assistant** (`lib/ai`, `prompts/`) — Generate Summary, SEO Metadata, Tags, Brand Check, CTA, and a combined Quality Score (40% deterministic rules + 60% AI assessment). Calls Claude via the Anthropic SDK when `ANTHROPIC_API_KEY` is set; otherwise falls back to a deterministic heuristic generator so the whole app works with zero API keys configured.
- **Bulk operations** — CSV/JSON content import (`/studio/content/import`) and bulk metadata updates across selected content.
- **RBAC** — Author / Reviewer / Admin roles enforced both in the UI and on the server (API routes re-check role + ownership; the client never carries the security boundary alone).
- **Audit log & version history** — every meaningful action is logged, and every content edit snapshots a version you can diff back to and restore.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Server Components, Route Handlers) |
| UI | React 19, TypeScript, Tailwind CSS v4 |
| Rich text editor | TipTap 3 |
| Validation | Zod |
| AI | Anthropic SDK (`@anthropic-ai/sdk`), Claude Sonnet 5 by default |
| Data | A small file-backed mock database (`lib/store/db.ts`) — see "Data layer" below |
| Testing | Vitest (unit), Playwright (e2e) |

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000. The public site is the root; the CMS lives at `/studio` (it will redirect you to `/studio/dashboard`).

There's no password login — visit `/login` and pick one of five seeded demo accounts (two authors, two reviewers, one admin) to explore the platform under that role. The account switcher in the CMS topbar does the same thing without leaving the app.

### Environment variables

None are required to run the app — everything works against seeded mock data and a heuristic AI fallback out of the box. Optionally:

```bash
# .env.local
ANTHROPIC_API_KEY=sk-ant-...   # enables real Claude calls for the AI Assistant
ANTHROPIC_MODEL=claude-sonnet-5 # optional override (default: claude-sonnet-5)
SITE_URL=https://your-domain.com # used to build absolute URLs in sitemap.xml / robots.txt
```

Without `ANTHROPIC_API_KEY`, every AI Assistant action still works — `lib/ai/mock.ts` provides fast, deterministic heuristic results (keyword extraction, sentence-based summaries, rule-based brand checks) matching the exact response shape the real model would return, so the UI, validation, and quality scoring pipeline are exercised identically either way. Each AI result is tagged **AI** or **Heuristic** in the UI so it's always clear which path ran.

### Tests

```bash
npm test          # Vitest — workflow state machine, validation schemas, quality rules
npm run test:e2e  # Playwright — run `npx playwright install` once first
```

## Demo script (5–10 minutes)

1. Visit `/login`, sign in as **Sarthak Awasthi (Author)**.
2. Go to **Content → New Content**, create an Article, write a few paragraphs.
3. In the **AI Assistant** sidebar: Generate Summary, Generate SEO Metadata, Suggest Tags, then **Analyze Content** for a combined quality score.
4. Click **Submit for Review**.
5. Switch accounts (topbar) to **Rahul Verma (Reviewer)** → open **Review Queue** → open the item → **Approve** (or **Request Changes** to see the `changes_requested` branch).
6. Switch to **Morgan Blake (Admin)** → open the content → **Publish**.
7. Visit the public site (`/articles`) — the content is now live.
8. Open **Analytics** to see it reflected in the seeded performance data.

## Architecture

```
Browser
  │
  ▼
Next.js App Router
  ├─ /studio/*        Server Components + Client Components (CMS)
  ├─ /, /articles/... Server Components (public site, SEO metadata)
  └─ /api/*           Route Handlers (content, workflow, AI, media, analytics, auth)
        │
        ├─ lib/store/*   Mock data layer (JSON-file backed) — swap for Supabase/Postgres
        ├─ lib/workflow  Content lifecycle state machine (role-gated transitions)
        ├─ lib/quality   Rule-based checks + AI assessment → combined score
        └─ lib/ai/*      Prompt building → Claude (or heuristic fallback) → Zod validation
```

**AI request flow** (`app/api/ai/*`): Frontend → Route Handler → `lib/ai/index.ts` (decides real vs. mock) → `prompts/*.ts` (prompt template) → `lib/ai/client.ts` (Anthropic call) → Zod schema validation (`prompts/schemas.ts`) → structured JSON back to the client. The model is never trusted blindly — every response is schema-validated, and a failed call falls back to the heuristic generator rather than breaking the editorial flow.

**Workflow**: every transition (`submit`, `approve`, `request_changes`, `revise`, `publish`, `archive`, ...) is defined once in `lib/workflow/index.ts` with its allowed roles. Both the UI (`WorkflowActions` only renders legal buttons) and the API (`performTransition` re-validates before mutating) go through the same table, so the rule can't drift or be bypassed by a UI bug.

## Data layer

The app runs against `data/db.json`, a single JSON file seeded on first run from `lib/store/seed.ts` (5 users, ~10 content items across all four types and every workflow status, categories, tags, campaigns, media assets, audit log, and two weeks of seeded analytics). Every `lib/store/*.ts` function (`listContent`, `createContent`, `performTransition`, ...) is written the way a Supabase/Postgres query function would be, so migrating to a real database means replacing the *implementation* of those functions, not the call sites.

A reference Postgres schema — table-for-table matching the TypeScript types in `types/index.ts`, including illustrative Row Level Security policies — lives at `supabase/migrations/0001_init.sql` for exactly that migration.

To reset the demo data at any time, stop the dev server and delete `data/db.json`; it will be reseeded on the next request.

## Project structure

```
app/
  (marketing)/       Public website — home, articles/campaigns/events/case-studies + [slug]
  studio/            Internal CMS — dashboard, content, review, media, analytics, settings
  api/               Route handlers — content, workflow transitions, AI, media, analytics, auth
  login/             Demo account picker
components/
  ui/                Design system primitives (Button, Card, Badge, Modal, Tabs, Toast, Table, ...)
  layout/            Sidebar, Topbar, account switcher
  content/           Content library, editor shell, filters, bulk actions, version history
  editor/            Rich text editor (TipTap) + metadata/SEO panel
  ai/                AI Assistant sidebar
  workflow/          Workflow action buttons
  media/             Media library grid, upload, detail modal
  analytics/         Chart primitives (stat tile, bar, area/line, status distribution)
  admin/             Users, taxonomy, campaigns, audit log
  public/            Public site header/footer, content cards, content detail renderer
lib/
  store/             Mock data layer (content, catalog, media, analytics, dashboard, db, seed)
  ai/                AI service (client, mock fallback, orchestration)
  workflow/           Content lifecycle state machine
  quality.ts          Rule-based + AI quality scoring
  auth.ts             Demo session handling
  validation.ts       Zod schemas for every API input
prompts/              AI prompt templates + response schemas
supabase/migrations/  Reference Postgres schema + RLS policies
tests/
  unit/               Vitest — workflow, validation, quality rules
  e2e/                Playwright — public site, full content lifecycle
```

## Accessibility

Status is always conveyed with an icon/dot *and* a text label, never color alone (`components/ui/Badge.tsx`). Interactive elements use visible focus rings (`.focus-ring`), forms use associated labels and `aria-live` error text, modals trap focus and close on `Escape`, and `prefers-reduced-motion` disables animation globally (`app/globals.css`). Charts (`components/analytics/*`) ship with legends, direct labels where they fit, and hover tooltips rather than relying on color to carry a value.

## What's real vs. simulated

This is a portfolio-grade build, so a few things are deliberately simplified rather than faked as production-grade:

- **Auth** is a demo account picker, not a password/OAuth flow — see `lib/auth.ts` for the seam where Supabase Auth would plug in.
- **The database** is a JSON file, not Postgres — see "Data layer" above for the swap path.
- **Media storage** stores uploaded files as inline `data:` URLs rather than uploading to object storage.
- **AI** genuinely calls Claude when `ANTHROPIC_API_KEY` is set; without a key it runs a heuristic fallback that returns the same response shape.

Everything else — the workflow engine, RBAC enforcement, validation, quality scoring, versioning, audit logging, and the public site — runs for real against the seeded data.
