# Technical Requirements Document (TechRD)
## MetroMitra — Technical Architecture, Stack, and Implementation Contract

> **Document status:** Approved baseline for v1.0 build
> **Companion to:** `docs/PRD.md`
> **Author:** MetroMitra engineering team

---

## 1. Architecture overview

MetroMitra is a **server-rendered Next.js application** with a relational database accessed through Prisma, session-based authentication through NextAuth, and a thin REST-style API layer implemented as Next.js Route Handlers. The architecture follows the Ponytail principle: the simplest correct implementation that satisfies the PRD, with no speculative infrastructure.

### 1.1 High-level component map

```
┌─────────────────────────────────────────────────────────────┐
│                       Browser (client)                       │
│  React 19 + Tailwind 4 + shadcn/ui + TanStack Query          │
└───────────────┬─────────────────────────────────┬───────────┘
                │ HTTPS (same origin)              │
                ▼                                  ▼
┌──────────────────────────────┐   ┌──────────────────────────┐
│   Next.js 16 App Router       │   │  NextAuth.js v4          │
│   (Node.js runtime)           │   │  Credentials provider     │
│                               │   │  JWT session strategy     │
│  ┌─────────────────────────┐  │   └──────────────────────────┘
│  │  Server Components       │  │
│  │  (public, SSR, SEO)      │  │
│  ├─────────────────────────┤  │
│  │  Route Handlers /api/*   │  │
│  │  (validated with Zod)    │  │
│  └───────────┬─────────────┘  │
└──────────────┼─────────────────┘
               ▼
┌──────────────────────────────┐   ┌──────────────────────────┐
│   Prisma Client (singleton)   │   │  SQLite (local dev)       │
│   (typed data access)         │──▶│  → Turso/Postgres (prod)  │
└──────────────────────────────┘   └──────────────────────────┘
```

A TikZ-rendered version of the full architecture, request flow, and data model is provided in `docs/architecture/` (see §11).

### 1.2 Rendering strategy

| Surface | Rendering | Rationale |
|---|---|---|
| Landing page, station directory, public station pages | Server-rendered (RSC) | SEO, fast first paint, crawlable |
| Auth pages (login, register) | Server-rendered shell + client form | Avoid exposing auth logic to client |
| Dashboard, feed, carpool/buddy/lost/marketplace work surfaces | Server-rendered lists + client interactivity | Balance crawlability of public parts with interactivity |
| API routes (`/api/*`) | Node.js runtime Route Handlers | Direct DB access, Zod validation |

### 1.3 Application layering

The codebase is layered to keep trust-boundary validation in one place and to keep components dumb:

```
src/
├── app/                      # Next.js App Router (routes + Route Handlers)
│   ├── (public)/             # public, SEO surfaces
│   ├── (auth)/               # login, register
│   ├── (app)/                # authenticated application
│   ├── api/                  # REST-style Route Handlers
│   │   ├── auth/             # NextAuth catch-all
│   │   ├── stations/
│   │   ├── feed/
│   │   ├── carpools/
│   │   ├── buddies/
│   │   ├── lost-found/
│   │   ├── marketplace/
│   │   └── ratings/
│   ├── layout.tsx
│   ├── page.tsx              # landing
│   └── globals.css
├── components/
│   ├── ui/                   # shadcn/ui primitives (already present)
│   ├── site/                 # marketing + shell components
│   ├── stations/
│   ├── feed/
│   ├── carpools/
│   ├── buddies/
│   ├── lost-found/
│   ├── marketplace/
│   └── shared/               # trust badges, empty states, etc.
├── lib/
│   ├── db.ts                 # Prisma singleton (existing)
│   ├── auth.ts               # NextAuth config
│   ├── validators.ts         # Zod schemas (single source of truth)
│   ├── stations-data.ts      # static Indian metro station seed
│   ├── trust.ts              # trust-score computation
│   └── utils.ts              # existing cn() helper
├── hooks/
└── types/
```

---

## 2. Technology stack and rationale

### 2.1 Core stack (non-negotiable for this project)

| Concern | Choice | Why |
|---|---|---|
| Framework | **Next.js 16 (App Router)** | Required by project; server components, route handlers, SSR, edge-ready deployment on Vercel |
| Language | **TypeScript 5 (strict)** | Required by project; end-to-end type safety with Zod + Prisma |
| Styling | **Tailwind CSS 4** | Required by project; utility-first, design-token friendly |
| UI primitives | **shadcn/ui (New York style)** | Already scaffolded; accessible, composable, themeable |
| Icons | **lucide-react** | Already installed; consistent with shadcn/ui |
| Database ORM | **Prisma 6** | Already configured; typed queries, migrations, SQLite + Postgres support |
| Database (dev) | **SQLite** | Already configured; zero-infra local dev |
| Auth | **NextAuth.js v4 (Credentials provider, JWT sessions)** | Already installed; server-side, session cookies, no external auth vendor needed for v1 |
| Forms | **react-hook-form + Zod** | Already installed; performant, validated forms |
| Client state | **Zustand** | Already installed; minimal, no boilerplate |
| Server state | **TanStack Query** | Already installed; cache, invalidation, optimistic updates |
| Motion | **Framer Motion** | Already installed; used at Level 1 only (refined interface motion) |
| Notifications | **sonner** | Already installed; accessible toasts |
| Package manager | **npm** (lockfile committed) | Required by user for Vercel deployment reliability; avoids bun-specific lockfile resolution on Vercel |

### 2.2 What we deliberately did NOT add

Following the Ponytail ladder (`docs/reference/Ponytail-SKILL.md`), each of these was considered and rejected for v1:

- **A separate backend service.** Not needed; Next.js Route Handlers satisfy every API requirement and keep the deployment as one unit.
- **Redis / a cache layer.** Not needed at v1 traffic; TanStack Query handles client caching, Prisma connection pooling handles DB reuse.
- **WebSockets for real-time.** Considered; rejected for v1. Carpool/buddy matching is polling/refresh-driven (60 s TanStack Query refetch). A websocket mini-service is documented as a roadmap item only if real-time density demands it.
- **A CMS.** Not needed; content is user-generated or static seed data in code.
- **An email service.** Not needed for v1; in-app contact requests replace email.
- **A payment provider.** Explicitly out of scope (PRD §3.2).
- **3D / WebGL.** Motion Level 1 only; the metro-line motif is delivered with CSS and SVG, not WebGL (Master Playbook §15.1).
- **Storybook / Chromatic.** Not needed at this scope.
- **Tailwind config plugins beyond what's installed.** The default Tailwind 4 + shadcn token system is sufficient.

### 2.3 Dependency policy

- Every dependency added during the build must be justified against the Ponytail ladder (does it need to exist? does an installed dependency already solve it? can the standard library solve it?).
- No `any` types in application code; `unknown` + Zod parse at boundaries.
- No client-side `z-ai-web-dev-sdk` usage (per project rules; AI skills are backend-only and not used in v1 of this product).

---

## 3. Data model

The Prisma schema (`prisma/schema.prisma`) is the single source of truth. The model below is summarised; see the schema file for exact fields, indices, and relations.

### 3.1 Entities

```
User            accounts, profile, home/work stations, trust score
Station         static seed of Indian metro stations (city, lines, code, name)
Post            community feed posts (station-scoped or global)
Reply           replies to posts
Carpool         ride offers + requests, with status lifecycle
CarpoolJoin     join requests on a carpool, accepted/declined
BuddyRequest    travel companion requests, women-only flag
LostFound       lost or found items, status lifecycle
Marketplace     listings, category, price INR, status
ContactRequest  opt-in contact flow (carpool, lost-found, marketplace)
Rating          1–5 ratings between users after a completed interaction
Report          user-flagged content for manual moderation
```

### 3.2 Key relationships

- `User 1—* Post`, `Post 1—* Reply`
- `User 1—* Carpools` (as requester or offerer)
- `Carpool 1—* CarpoolJoin`, `CarpoolJoin *—1 User`
- `User 1—* LostFound`, `User 1—* Marketplace`
- `User 1—* ContactRequest` (as initiator and as recipient)
- `User 1—* Rating` (as rater and as rated)
- `Station 1—* Posts/Carpools/BuddyRequests/LostFound/Marketplace` (scoped)

### 3.3 Indices and query patterns

- `Station(code)` unique; `Station(city, name)` composite for directory queries.
- `Post(stationId, createdAt)` for feed ordering.
- `Carpool(originStationId, status, departAt)` for "active rides from this station".
- `LostFound(stationId, category, status)` for filtering.
- `Marketplace(stationId, category, status)` for filtering.
- `Rating(ratedUserId)` aggregate for trust score.

### 3.4 Trust score computation

`trust.ts` computes a 0–100 score per user:

```
trustScore = clamp(
    baseForProfileCompletion
  + 4 * averageRating
  + 0.2 * completedInteractions
  - penaltyForReports,
  0, 100
)
```

This is recomputed on rating/report events and cached on the user row. It is intentionally simple and explainable; a learned model is a roadmap item.

### 3.5 Database portability

- The schema uses only portable types (no SQLite-specific JSON arrays as primitives).
- Switching to Turso (libSQL) requires only changing the `datasource` provider and `DATABASE_URL`; no schema changes.
- Switching to Postgres requires changing provider and replacing any SQLite-specific defaults (none in v1 schema); Prisma handles the rest.

---

## 4. Authentication and session design

### 4.1 Provider

- **NextAuth.js v4** with the **Credentials provider**.
- Passwords are hashed with bcrypt before storage (`User.passwordHash`).
- JWT session strategy (not database sessions) to keep the deployment stateless and Vercel-friendly.

### 4.2 Session shape

The session callback enriches the JWT/session with `user.id`, `user.name`, `user.homeStationId`, and `trustScore`, so server components and API routes can read them without an extra DB hit.

### 4.3 Protected routes

- `(app)` route group requires a session; a middleware redirects unauthenticated users to `/login` with a `callbackUrl`.
- API routes under `/api/*` (except `/api/auth/*` and public read endpoints) require a valid session.

### 4.4 Security constraints

- Zod validation on every write endpoint (signup, post, carpool, buddy, lost-found, marketplace, rating, report).
- No `select: false` secrets leaked to the client; `passwordHash` is never selected in API responses.
- Rate limiting is not implemented in v1 (documented limitation); NextAuth's built-in CSRF and secure cookies are enabled.

---

## 5. API design

### 5.1 Conventions

- REST-style Route Handlers under `/api/*`.
- `GET` endpoints are public for read where the PRD allows (stations, public feed); `POST`/`PATCH` require a session.
- Every response follows `{ ok: boolean, data?: T, error?: string }`.
- Zod schemas in `lib/validators.ts` are imported by both client forms and server handlers — single source of truth.

### 5.2 Endpoint map (summary)

```
POST   /api/auth/register                 create account
POST   /api/auth/callback/credentials     (NextAuth internal)

GET    /api/stations                      list/filter stations
GET    /api/stations/:code                station detail + aggregates

GET    /api/feed?stationId=               feed (global or station)
POST   /api/feed                          create post
POST   /api/feed/:id/reply                reply
POST   /api/feed/:id/report               flag

GET    /api/carpools?stationId=&status=   list
POST   /api/carpools                      create
PATCH  /api/carpools/:id                  update status
POST   /api/carpools/:id/join             request to join
PATCH  /api/carpools/:id/join/:jid        accept/decline

GET    /api/buddies?...                   list
POST   /api/buddies                       create
PATCH  /api/buddies/:id                   update status

GET    /api/lost-found?stationId=&type=   list
POST   /api/lost-found                    create
PATCH  /api/lost-found/:id                status
POST   /api/lost-found/:id/contact        contact request

GET    /api/marketplace?stationId=&cat=   list
POST   /api/marketplace                   create
PATCH  /api/marketplace/:id               status
POST   /api/marketplace/:id/contact       contact request

POST   /api/ratings                       rate after completion
GET    /api/users/:id                     public profile + trust
POST   /api/reports                        generic report
```

### 5.3 Validation contract

Every write endpoint:

1. Parses the body with a Zod schema.
2. Returns `400 { ok:false, error }` on parse failure.
3. Authorises against the session.
4. Performs the DB write inside a try/catch; returns `500` only for unexpected errors, never leaking the message.
5. Returns `200/201 { ok:true, data }` on success.

---

## 6. Frontend architecture

### 6.1 Route groups

- `(public)` — landing, station directory, public station pages, about. Server-rendered, SEO metadata.
- `(auth)` — `/login`, `/register`. Minimal chrome.
- `(app)` — authenticated dashboard and feature surfaces. Requires session.

> Note: Next.js route groups do not affect the URL. The user-visible routes remain `/`, `/login`, `/register`, `/dashboard`, `/stations`, `/stations/[code]`, `/carpools`, `/buddies`, `/lost-found`, `/marketplace`, `/profile`.

### 6.2 State management

- **Server state:** TanStack Query for all list/detail fetches with sensible `staleTime` (60 s for feeds, 30 s for carpool/buddy lists).
- **Client UI state:** Zustand for cross-component UI concerns (e.g. the SOS dialog open state, the active station filter).
- **Form state:** react-hook-form + Zod resolver; forms call API routes via TanStack Query mutations.

### 6.3 Component contract

- shadcn/ui primitives are the only button/card/dialog/input/etc. used. No custom re-implementations.
- Feature components (e.g. `CarpoolCard`, `FeedItem`, `StationHeader`) live under `components/<feature>/` and accept typed props.
- Empty, loading, and error states are mandatory for every data-driven component (Master Playbook §13, dashboard archetype).
- Every interactive element is keyboard-operable with visible focus.

### 6.4 Motion level

Motion Level 1 (refined interface motion) per Master Playbook §14:

- Hover, focus, press, dialog open/close, tab switch, and section entry transitions only.
- Directional motion (x-axis slide for "arriving" content) used sparingly to echo the metro motif.
- `prefers-reduced-motion` fully respected; all motion degrades to opacity-only or none.

---

## 7. Design system (summary — full detail in DESIGN.md)

### 7.1 Brand thesis

> *A dependable, transit-fluent companion rendered as a living metro map — every station is a node, every member is a connection, every interaction is a journey.*

### 7.2 Motif

The **node-and-line** motif of a metro map: coloured lines connecting filled nodes. It appears as:

- the section divider treatment (a horizontal line with node dots);
- connection visualisations on carpool/buddy match cards;
- the profile "route graph" (home station → work station);
- the footer rail motif.

It does **not** appear as a pasted logo or repetitive decoration.

### 7.3 Colour roles

| Role | Token | Value | Use |
|---|---|---|---|
| Canvas | `--background` | warm off-white | page background |
| Ink | `--foreground` | near-black warm | primary text |
| Primary | `--primary` | deep terracotta/saffron `oklch(0.55 0.15 45)` | brand actions, links |
| Line accents | `--chart-1..5` | metro line colours (yellow, blue, green, violet, magenta) | used semantically on station chips, line badges |
| Semantic | standard shadcn semantic tokens | — | success/warning/destructive |

No indigo/blue default. No purple-to-blue gradients (rejected per `docs/reference/anti-patterns.md`).

### 7.4 Typography

- Geist Sans (already configured) for body and UI.
- Display headings use a tighter tracking and heavier weight; body measure 55–70 characters.
- Fluid type with controlled min/max; no three-line mobile headlines from desktop-only wording.

---

## 8. DevOps and deployment

### 8.1 Package manager

- **npm** is the package manager of record. `package-lock.json` is committed.
- `bun.lock` is removed to avoid ambiguous lockfile resolution on Vercel.
- The `build` script is plain `next build` (no standalone copy step) so Vercel's default Next.js builder works without customisation.

### 8.2 Environments

- `.env` (gitignored) holds `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`.
- `.env.example` documents required keys without values.
- Vercel environment variables are set in the Vercel dashboard (or via CLI); never committed.

### 8.3 CI/CD pipeline (GitHub Actions)

Located at `.github/workflows/ci.yml`. On every push and PR to `main`:

1. Checkout.
2. Setup Node 20.
3. `npm ci`.
4. `npm run lint`.
5. `npx tsc --noEmit` (type check).
6. `npx prisma generate`.
7. `npm run build`.
8. (On push to `main` only) Deploy to Vercel via the Vercel CLI using `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` secrets, targeting production.

A separate `.github/workflows/deploy.yml` is intentionally avoided; the single workflow keeps the pipeline auditable in one place (Ponytail: no scaffolding for a speculative future).

### 8.4 Vercel configuration

- `vercel.json` is minimal: sets the Node runtime framework hint and rewrites nothing (Next.js handles routing).
- Build command: `npm run build` (Vercel default).
- Output: `.next` (Vercel default for Next.js).

### 8.5 Database on Vercel

- Vercel's filesystem is read-only except for `/tmp`. SQLite in `db/custom.db` works for local dev and for ephemeral demo data on Vercel, but data will not persist across cold starts in production.
- **Documented migration path (not auto-applied):** switch `datasource` provider to `turso` or `postgresql` and set `DATABASE_URL` to the hosted DSN. No application code changes required. This is clearly noted in the README and in the LaTeX architecture document.

---

## 9. Testing strategy

Per project rules, no test code is written for v1. However, the architecture supports future testing:

- Zod schemas are pure functions — trivially unit-testable.
- API Route Handlers are thin — integration-testable with a test SQLite DB.
- Components are presentational — Storybook-compatible if added later.

The "one small runnable check" required by Ponytail for non-trivial logic is satisfied by the Zod validators (they fail loudly on malformed input at the trust boundary) and by the TypeScript compiler (strict mode catches type errors at build time).

---

## 10. Security, privacy, and compliance

- Passwords: bcrypt-hashed via NextAuth credentials provider.
- Sessions: JWT in `httpOnly` secure cookies; `NEXTAUTH_SECRET` required.
- Input: Zod validation on every write endpoint; no raw `req.body` use.
- Output: `passwordHash` never selected in API responses; a serialiser helper strips sensitive fields.
- Contact info: never exposed until both parties accept a `ContactRequest`.
- Reports: stored with reporter ID for audit; no automated action in v1.
- `.env`, `db/custom.db`, `node_modules`, `.next` are gitignored.
- No third-party analytics or tracking in v1.

### 10.1 Accessibility contract

- Semantic landmarks (`header`, `main`, `nav`, `footer`).
- Heading order preserved per route.
- Keyboard-operable controls; visible focus rings.
- ≥ 44px touch targets.
- AA contrast on all text.
- `prefers-reduced-motion` respected.
- No colour-only meaning (line colours are always paired with a label).

---

## 11. Documentation deliverables

The following documents are produced as part of this build:

| Document | Path | Purpose |
|---|---|---|
| Product Requirements Document | `docs/PRD.md` | what and why |
| Technical Requirements Document | `docs/TechRD.md` | how (this file) |
| LaTeX architecture document with TikZ diagrams | `docs/architecture/methamitra-architecture.tex` (+ compiled PDF) | professional, human-readable engineering document |
| README | `README.md` | setup, run, deploy |
| CI/CD pipeline | `.github/workflows/ci.yml` | automated quality + deploy |
| Vercel config | `vercel.json` | deployment hint |
| Reference playbook | `docs/reference/*` | the source playbooks that guided this build |

### 11.1 LaTeX document scope

The LaTeX document is written to read like a real engineering architecture document, not AI-generated marketing. It includes:

- a title page and abstract;
- system overview with a TikZ component diagram;
- deployment topology (TikZ);
- request-flow sequence (TikZ);
- data-model entity-relationship diagram (TikZ);
- authentication flow (TikZ);
- CI/CD pipeline diagram (TikZ);
- security and accessibility notes;
- limitations and roadmap.

It is compiled with a standard LaTeX distribution (e.g. TeX Live / `pdflatex` or `xelatex`). The `.tex` source is committed; a compiled PDF is produced if a LaTeX toolchain is available.

---

## 12. Acceptance criteria for "done"

The build is considered complete only when ALL of the following are true:

1. `npm run lint` passes with no errors.
2. `npx tsc --noEmit` passes.
3. `npm run build` succeeds.
4. The dev server runs on port 3000 with no fatal errors in `dev.log`.
5. The landing page renders with real content (not the scaffold).
6. A new user can register, log in, and reach the dashboard.
7. Every feature surface (feed, carpool, buddy, lost-found, marketplace) loads data and accepts a valid submission end-to-end.
8. The station directory lists real Indian metro stations across six cities.
9. The footer is sticky on short pages and pushed down on long pages.
10. The layout holds at 390 px, 768 px, and 1440 px.
11. Browser self-verification (via agent-browser) confirms the golden path with no console errors.
12. The GitHub Actions workflow file is valid YAML and would run the steps in §8.3.
13. The LaTeX architecture document compiles (or its source is valid and complete).
14. The README explains how to run, build, and deploy.

"It compiles" is necessary but not sufficient. Browser-verified interactivity is the standard of done (per `docs/reference/critique-verification.md`).

---

## 13. Alignment with the Master Playbook

| Playbook section | How this TechRD complies |
|---|---|
| §4 Skill preflight | Read `docs/reference/SKILL.md` (Ponytail) and the Master Playbook before any code decision |
| §6 Classify the website | Classified as **application/dashboard** primary, **playful consumer** secondary |
| §7 Reference selection | No external brand cloned; motif derived from the product's own domain (metro map) |
| §8 Originality | Station-node motif; no generic gradient hero; no fabricated proof |
| §10 DESIGN.md | Summarised in §7 of this doc; full tokens in `src/app/globals.css` |
| §11 AGENTS.md | Concise operational file committed at repo root |
| §12 Technical route | Next.js App Router, TypeScript strict, Tailwind 4, shadcn/ui — the project's fixed stack |
| §14 Motion level | Level 1 explicitly chosen |
| §18 Responsive/a11y/perf | Contract stated in §6.4 and §10.1 |
| §24 Git and deployment safety | `.gitignore` protects secrets, DB, build output; npm lockfile committed; deploy only on push to `main` |
