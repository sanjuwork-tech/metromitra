# Technical Requirements Document (TechRD)
## MetroMitra — Technical Architecture, Stack, and Implementation Contract

> **Document status:** Baseline for the v2 build (no-backend, browser-local)
> **Companion to:** `docs/PRD.md`
> **Author:** MetroMitra engineering team

---

## 1. Architecture overview

MetroMitra is a **client-side Next.js application**. There is no backend, no database, and no API layer. The browser loads a static bundle from Vercel; the React client renders public pages from static reference data and renders authenticated surfaces from a Zustand store that is manually persisted to `localStorage`. Everything a commuter creates — an account, a feed post, a carpool, an idea, a marketplace listing, a rating — lives in that one browser's storage and goes nowhere else.

The decision to ship without a backend is deliberate, not a fallback. The v2 product is a functionality-exploration build: the goal is to let a reviewer clone the repository, run `npm install && npm run dev`, and exercise every feature end-to-end with no Prisma setup, no environment variables, no database file, and no server to provision. A backend would have added setup cost without changing what the v2 build is trying to demonstrate. The Ponytail principle applies: the simplest correct implementation of "persisted client state in a Next.js app" is a Zustand store plus `localStorage`. Everything more elaborate was rejected for v2 and is documented as a roadmap item.

### 1.1 High-level component map

```
┌──────────────────────────────────────────────────────────────────┐
│                          Browser (client)                          │
│                                                                    │
│   React 19 + Tailwind 4 + shadcn/ui + Framer Motion (Level 1)     │
│                                                                    │
│   ┌────────────────────────────────────────────────────────────┐  │
│   │   Public pages (landing, /stations, /stations/[code],      │  │
│   │   /about) — server-rendered from static station data        │  │
│   └────────────────────────────────────────────────────────────┘  │
│   ┌────────────────────────────────────────────────────────────┐  │
│   │   App pages (/dashboard, /feed, /carpools, /ideas,         │  │
│   │   /lost-found, /marketplace, /profile) — client-rendered,  │  │
│   │   reading from the Zustand store                           │  │
│   └────────────────────────────────────────────────────────────┘  │
│                              │                                     │
│                              ▼                                     │
│   ┌────────────────────────────────────────────────────────────┐  │
│   │   Zustand store (single source of client state)             │  │
│   │   users · currentUserId · posts · carpools · ideas ·        │  │
│   │   lostFound · marketplace · contactRequests · ratings ·     │  │
│   │   reports · seeded                                           │  │
│   └────────────────────────────────────────────────────────────┘  │
│         │ load on module init            ▲ subscribe on change    │
│         ▼                                  │                       │
│   ┌────────────────────────────────────────────────────────────┐  │
│   │   localStorage  (key: "metromitra-store")                  │  │
│   └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
                              ▲
                              │ static HTML/JS/CSS
┌──────────────────────────────────────────────────────────────────┐
│                       Vercel (static host)                         │
│   Next.js build output. No server runtime state. No DB.            │
└──────────────────────────────────────────────────────────────────┘
```

A TikZ-rendered version of the architecture, the data model, the auth flow, the persist cycle, the Idea Junction concept, and the deployment topology is provided in `docs/architecture/MetroMitra-Architecture.tex` (see §11).

### 1.2 Rendering strategy

| Surface | Rendering | Rationale |
|---|---|---|
| Landing page, station directory, public station pages, about | Server-rendered (RSC) from static station data | SEO, fast first paint, crawlable; no store access on the server |
| Auth pages (`/login`, `/register`) | Client-rendered form inside a server-rendered shell | Auth is store-driven; no server session exists |
| Dashboard, feed, carpool, ideas, lost-found, marketplace, profile | Client-rendered from the Zustand store | All data is local; no network round-trip needed |

### 1.3 Application layering

```
src/
├── app/                      # Next.js App Router
│   ├── (public)/             # public, SEO surfaces (server components)
│   ├── (auth)/               # /login, /register (client forms)
│   ├── (app)/                # authenticated application (client components)
│   ├── stations/             # directory + detail (server, static data)
│   ├── ideas/                # Idea Junction (client, store-driven)
│   ├── layout.tsx
│   ├── page.tsx              # landing
│   ├── sitemap.ts            # generated from static station list
│   ├── robots.ts
│   └── globals.css
├── components/
│   ├── ui/                   # shadcn/ui primitives
│   ├── site/                 # marketing + shell components
│   ├── shared/               # trust badges, station chips, empty states
│   └── <feature>/            # feed, carpools, ideas, lost-found, marketplace
├── lib/
│   ├── store.ts              # Zustand store + manual localStorage sync
│   ├── auth-client.tsx       # client-side AuthProvider + useAuth hook
│   ├── stations-data.ts      # static station reference (80 stations)
│   ├── trust.ts              # trust-score computation (explainable)
│   └── utils.ts              # cn() helper
├── hooks/
│   ├── use-mobile.ts
│   ├── use-session.ts
│   └── use-toast.ts
└── types/
```

There is no `app/api/` directory. There is no `lib/db.ts`. There is no `prisma/` directory. These were removed as part of the v2 pivot.

---

## 2. Technology stack and rationale

### 2.1 Core stack

| Concern | Choice | Why |
|---|---|---|
| Framework | **Next.js 16 (App Router)** | Project requirement; static + client rendering from a single codebase, deploys cleanly to Vercel with no server runtime |
| Language | **TypeScript 5 (strict)** | End-to-end type safety; the store types are the schema, so a strict compiler catches shape errors at the boundary |
| Styling | **Tailwind CSS 4** | Utility-first, design-token friendly |
| UI primitives | **shadcn/ui (New York style)** | Accessible, composable, themeable; already scaffolded |
| Icons | **lucide-react** | Consistent with shadcn/ui |
| Client state | **Zustand** (manual `localStorage` sync) | Minimal, no boilerplate, no provider; persists to `localStorage` via `useStore.subscribe()` |
| Motion | **Framer Motion** | Used at Level 1 only (refined interface motion) |
| Notifications | **sonner** | Accessible toasts |
| Forms | native form state + Zod-validated actions | The forms are small enough that react-hook-form was unnecessary weight |
| Package manager | **npm** (lockfile committed) | Required by user for Vercel deployment reliability; avoids bun-specific lockfile resolution on Vercel |

### 2.2 What was rejected, and why

Following the Ponytail ladder (`docs/reference/Ponytail-SKILL.md`), each of these was considered for v1 and removed for v2 — or considered for v2 and rejected:

- **Prisma + SQLite.** Removed. There is no database. A client-side app has no use for an ORM, and the read-only-filesystem caveat that Vercel imposes on SQLite would have made the v1 deployment story fragile for no gain. Migrating to a managed Postgres or Turso/libSQL instance is a roadmap item, documented in §10, and would re-introduce Prisma at that point.
- **NextAuth (Auth.js).** Removed. NextAuth requires a server runtime, secret environment variables, and a session store. None of those exist in v2. The demo auth context in `src/lib/auth-client.tsx` covers register/login/logout against the local store. This is intentionally not production-grade and is labelled as such.
- **API Route Handlers under `src/app/api/*`.** Removed. There is no API. Every read and write is a store action.
- **bcrypt.** Removed. bcrypt is a native dependency with install-time friction on several common dev environments. For a demo hash that is explicitly not cryptographic, a 30-line djb2-style hash in `store.ts` is sufficient and dependency-free. A production version would use scrypt or argon2 on the server.
- **zustand/middleware `persist`.** Rejected. The persist middleware is the obvious choice for "Zustand + localStorage", but it interacts poorly with Next.js SSR and `useSyncExternalStore`: the hydration step runs on the client after the server render, and the middleware's `getServerSnapshot` implementation produces an infinite reconciliation loop in some App Router configurations. The fix is manual: load state at module init guarded by `typeof window !== 'undefined'`, and `useStore.subscribe()` to save on every change. This is two short functions in `store.ts` and avoids the loop entirely. See §5 for the pattern.
- **TanStack Query.** Removed. There are no network requests to cache.
- **A separate backend service.** Not needed; there is no backend at all.
- **Redis / a cache layer.** Not needed; no server traffic.
- **WebSockets for real-time.** Not needed; the store is local. A cross-tab `storage` event listener is a roadmap item if multi-tab sync becomes important.
- **A CMS.** Not needed; content is user-generated or static reference data in code.
- **An email service.** Not needed for v2; in-app contact requests replace email.
- **A payment provider.** Out of scope (PRD §3.2).
- **3D / WebGL.** Motion Level 1 only; the metro-line motif is delivered with CSS and SVG, not WebGL (Master Playbook §15.1).
- **Storybook / Chromatic.** Not needed at this scope.

### 2.3 Dependency policy

- Every dependency added during the build must be justified against the Ponytail ladder (does it need to exist? does an installed dependency already solve it? can the standard library solve it?).
- No `any` types in application code; `unknown` + runtime check at boundaries.
- No `z-ai-web-dev-sdk` usage in the client bundle (per project rules; AI skills are not part of v2).

---

## 3. Data model

There is no Prisma schema. The store types in `src/lib/store.ts` are the schema. The model below summarises the entities; the file is the source of truth for exact field shapes.

### 3.1 Store entities

```
User            account, profile, home/work stations, trustScore, verifiedBadge
Post            community feed post (station-scoped or global); embeds Reply[]
Reply           reply on a post (denormalised into Post.replies for simplicity)
Carpool         ride offer or request, with status lifecycle; embeds CarpoolJoin[]
CarpoolJoin     join request on a carpool, pending/accepted/declined
Idea            Idea Junction card (title, description, category, looking-for,
                station, stage, notes); embeds interested[] (user ids)
LostFound       lost or found item, status lifecycle
Marketplace     listing (title, price INR, category, condition, station, status)
ContactRequest  opt-in contact flow across carpool / idea / lost-found / marketplace
Rating          1–5 rating between users after a completed interaction
Report          user-flagged content for manual review
```

All of the above are persisted to `localStorage` under a single key (`metromitra-store`) as a JSON blob. The `seeded` boolean flag distinguishes "we have already seeded demo content / loaded user state" from "first visit, please seed".

### 3.2 Static reference: Station

The station list is **not** in the store. It is static reference data in `src/lib/stations-data.ts`, compiled into the bundle. There are **80 real Indian metro stations across six cities**:

| City | Count | Source |
|---|---|---|
| Delhi (DMRC + NCR) | 16 | DMRC public station list |
| Mumbai (MMRCL + MMOPL) | 14 | MMRCL public station list |
| Bengaluru (BMRCL / Namma Metro) | 14 | BMRCL public station list |
| Hyderabad (HMRL) | 12 | HMRL public station list |
| Chennai (CMRL) | 12 | CMRL public station list |
| Kolkata (Metro Railway) | 12 | Metro Railway (Kolkata) public station list |

Each `StationSeed` has `id` (derived as `st-<CODE>`), `code`, `name`, `city`, `lines` (comma-separated string), `lineColors` (parallel comma-separated colour tokens), and an optional `exitCount`. The colour tokens map to a hex palette via `LINE_COLOR_HEX`, used by station chips and line badges in the UI. Stations are read with `getStationById(id)` — a plain array find, no async, no cache.

### 3.3 Trust score

`computeTrust` is a deterministic 0–100 score, recomputed whenever a rating or contact-request status changes:

```
trustScore = clamp(
    20 if profile complete (name + bio + city + (home or work station))
  + 10 if verifiedBadge
  + round(avgRating * 4)        // 0 if no ratings yet
  + min(completedContacts * 5, 35)
  , 0, 100)
```

`completedContacts` is the number of `ContactRequest` rows involving the user that have status `accepted`. The score is intentionally simple and explainable: a reviewer can read the function and predict the output for any user. A learned model is a roadmap item.

### 3.4 Why not a normalised relational schema?

Because there is no relational engine. The store arrays are small (a few hundred rows at most for a demo session) and every "query" is a `filter` or `find` in a selector. The denormalisation of `Reply` into `Post.replies` and `CarpoolJoin` into `Carpool.joins` keeps reads to a single array lookup and avoids join logic in selectors. If and when this moves to a real database, the entities map almost 1:1 to tables and the embedded arrays become child tables — the migration is mechanical (see §10).

---

## 4. Authentication

### 4.1 What it is

Client-side demo auth, implemented in `src/lib/auth-client.tsx` as a React context (`AuthProvider` + `useAuth`). The three operations — `register`, `login`, `logout` — call the corresponding store actions, which mutate `users` and `currentUserId` and persist to `localStorage` via the store's subscribe hook.

### 4.2 Password hashing

A non-cryptographic djb2-style hash in `store.ts`:

```ts
function demoHash(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h) ^ s.charCodeAt(i);
  return `h$${(h >>> 0).toString(16)}`;
}
```

It is a 32-bit integer XOR-shift hash, deliberately weak. It exists to avoid storing plaintext in `localStorage` and to make the demo flow feel like real auth. It does not resist any attacker who can read `localStorage`, which is every attacker who can read `localStorage`.

### 4.3 Session

There is no session token. The store's `currentUserId` is the session. On boot, the store loads from `localStorage`; if a `currentUserId` is present, the user is "logged in". Logout sets `currentUserId` to `null` and persists.

### 4.4 Why this is acceptable for v2 (and only for v2)

- The product is honestly labelled as a functionality-exploration build. There is no production traffic, no real user data, and no claim of security.
- The demo flow lets a reviewer exercise every authenticated feature without server setup.
- The contact-request flow still gates contact info behind mutual acceptance, so the worst case is local-only data exposure on a machine the reviewer already controls.

A production version would replace this entire layer with server-side scrypt or argon2, httpOnly secure cookies, CSRF protection, and rate-limited endpoints. That path is documented in §8 and §10.

---

## 5. Client-side data layer

This section replaces what would be "API design" in a backend TechRD. There is no API. The store is the data layer.

### 5.1 Store actions (summary)

The store exposes one action per write operation. Each action is a Zustand `set` call that updates the relevant slice and (transitively, via the subscribe hook) writes to `localStorage`. Read access is via selectors.

```
register(name, email, password, city?)        → { ok, error? }
login(email, password)                         → { ok, error? }
logout()                                       → void
updateProfile(patch)                           → void   (recomputes trust)

createPost(body, tag, stationId?)              → void
createReply(postId, body)                      → void

createCarpool(payload)                         → void
joinCarpool(carpoolId, message?)               → { ok, error? }
respondCarpoolJoin(carpoolId, joinId, status)  → void
updateCarpoolStatus(carpoolId, status)         → void

createIdea(payload)                            → void
expressInterestInIdea(ideaId, message?)        → { ok, error? }  // creates a ContactRequest
updateIdeaStatus(ideaId, status)               → void

createLostFound(payload)                       → void
contactLostFound(id, message?)                 → { ok, error? }  // creates a ContactRequest
updateLostFoundStatus(id, status)              → void

createMarketplace(payload)                     → void
contactMarketplace(id, message?)               → { ok, error? }  // creates a ContactRequest
updateMarketplaceStatus(id, status)            → void

respondContact(id, status)                     → void
rateUser(ratedId, ctx, ctxId, score, note?)    → { ok, error? }  // recomputes trust
reportContent(subjectId, targetType, targetId, reason) → void

reseedDemo()                                   → void   (replaces state with demoSeed(), logs out)
clearAll()                                     → void   (wipes everything)
```

The `{ ok, error? }` return convention mirrors what a REST client would expect, so the migration to real endpoints is mostly mechanical: replace the store call with a `fetch`, keep the return contract.

### 5.2 Manual localStorage sync (the pattern that replaces `persist`)

```ts
const STORAGE_KEY = "metromitra-store";

function loadFromStorage(): Partial<StoreState> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Partial<StoreState>) : null;
  } catch { return null; }
}

function saveToStorage(state: StoreState) {
  if (typeof window === "undefined") return;
  try {
    const { users, currentUserId, posts, carpools, ideas, lostFound,
            marketplace, contactRequests, ratings, reports, seeded } = state;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
      users, currentUserId, posts, carpools, ideas, lostFound,
      marketplace, contactRequests, ratings, reports, seeded,
    }));
  } catch { /* storage full or unavailable */ }
}

// Load persisted state (or seed demo content) on the client, once.
if (typeof window !== "undefined") {
  const persisted = loadFromStorage();
  if (persisted && persisted.seeded) {
    useStore.setState({ ...persisted } as Partial<StoreState>);
  } else {
    useStore.setState({ ...demoSeed() } as Partial<StoreState>);
  }
  useStore.subscribe((state) => saveToStorage(state));
}
```

Three things make this SSR-safe where the `persist` middleware is not:

1. **The load runs at module init, guarded by `typeof window`.** It does not run during the server render, so the server and the first client render see the same initial state (the empty defaults from `create(...)`). The store then updates synchronously before any component reads it on the client, because the module is imported before the React tree mounts.
2. **`saveToStorage` is also guarded.** It cannot fire on the server.
3. **`useStore.subscribe` is called once, at module init.** It is not coupled to React's render cycle, so it cannot produce a `useSyncExternalStore` loop.

### 5.3 Why `persist` was rejected

`zustand/middleware`'s `persist` middleware is the obvious choice. It is also the wrong choice here. The middleware:

- Hydrates asynchronously on the client, after the server has rendered with the initial state.
- Returns a `getServerSnapshot` to `useSyncExternalStore` that, in some Next.js App Router configurations, does not match the post-hydration client snapshot.
- Triggers a re-render immediately after hydration, which `useSyncExternalStore` then sees as a snapshot mismatch, leading to either a console warning or an infinite reconciliation loop.

The manual pattern above avoids the issue by making hydration synchronous at module init. The cost is two functions and one `subscribe` call. The benefit is no hydration warnings and no infinite loops. Ponytail applies: the simplest correct implementation wins.

### 5.4 Selector hygiene

Zustand selectors that return fresh objects on every call are a known foot-gun: `useSyncExternalStore` compares snapshots by reference, so a selector that builds a new object each time produces an infinite render loop. The store avoids this with two memoised hooks:

```ts
export function useCurrentUser(): User | null {
  const currentUserId = useStore((s) => s.currentUserId);   // primitive — stable
  const users = useStore((s) => s.users);                    // array — stable unless mutated
  return useMemo(
    () => users.find((u) => u.id === currentUserId) ?? null,
    [users, currentUserId]
  );
}

export function useUsersById(): Record<string, User> {
  const users = useStore((s) => s.users);
  return useMemo(() => Object.fromEntries(users.map((u) => [u.id, u])), [users]);
}
```

Both selectors read primitive or array references (stable across renders unless the underlying data changes), then derive the result with `useMemo`. This pattern is the rule, not the exception: any selector that would return a derived object must be wrapped this way.

### 5.5 Static station lookup

`getStationById(id)` is a plain array find against the imported `STATIONS` constant. No selector, no memoisation — the array is module-level static and never changes. This is the pattern for all static reference data: import it, use it directly.

---

## 6. Frontend architecture

### 6.1 Route groups

- `(public)` — landing, station directory, public station pages, about. Server components reading static station data. SEO metadata via `generateMetadata`.
- `(auth)` — `/login`, `/register`. Server-rendered shell with a client form inside.
- `(app)` — authenticated dashboard and feature surfaces. Client components reading the store.

Route groups do not affect the URL. User-visible routes remain `/`, `/login`, `/register`, `/dashboard`, `/stations`, `/stations/[code]`, `/feed`, `/carpools`, `/ideas`, `/lost-found`, `/marketplace`, `/profile`, `/about`.

### 6.2 State management

- **Application state:** Zustand store (see §5). All feature data — feed posts, carpools, ideas, marketplace, contact requests, ratings, reports — lives there.
- **Server session state:** none. There is no server session.
- **Form state:** local component state, validated by Zod schemas on submit. The schemas live alongside the store types and are the single source of truth for input shapes.
- **URL state:** `useSearchParams` for filters (city, station, category, status) on directory pages, so a filtered view is shareable and back-button friendly.

### 6.3 Component contract

- shadcn/ui primitives are the only button/card/dialog/input/etc. used. No custom re-implementations.
- Feature components (e.g. `CarpoolCard`, `IdeaCard`, `FeedItem`, `StationHeader`) live under `components/<feature>/` and accept typed props.
- Empty, loading, and error states are mandatory for every data-driven component (Master Playbook §13, dashboard archetype). For a local store the "loading" state is effectively never shown — data is synchronously available — but the contract still requires an empty state for the no-data case.
- Every interactive element is keyboard-operable with visible focus.

### 6.4 Motion level

Motion Level 1 (refined interface motion) per Master Playbook §14:

- Hover, focus, press, dialog open/close, tab switch, and section entry transitions only.
- Directional motion (x-axis slide for "arriving" content) used sparingly to echo the metro motif.
- `prefers-reduced-motion` fully respected; all motion degrades to opacity-only or none.

---

## 7. Design system (summary)

### 7.1 Brand thesis

> *A dependable, transit-fluent companion rendered as a living metro map — every station is a node, every member is a connection, every interaction is a journey.*

### 7.2 Motif

The **node-and-line** motif of a metro map: coloured lines connecting filled nodes. It appears as the section divider treatment, the connection visualisations on carpool/idea match cards, the profile "route graph" (home station → work station), and the footer rail motif. It does not appear as a pasted logo or repetitive decoration.

### 7.3 Colour roles

| Role | Token | Value | Use |
|---|---|---|---|
| Canvas | `--background` | warm off-white | page background |
| Ink | `--foreground` | near-black warm | primary text |
| Primary | `--primary` | deep terracotta/saffron `oklch(0.55 0.15 45)` | brand actions, links |
| Line accents | `--chart-1..5` + `LINE_COLOR_HEX` | metro line colours (blue, yellow, green, violet, red, magenta, purple, aqua, orange, pink) | used semantically on station chips and line badges |
| Semantic | standard shadcn semantic tokens | — | success/warning/destructive |

No indigo/blue default. No purple-to-blue gradients (rejected per `docs/reference/anti-patterns.md`).

### 7.4 Typography

- Geist Sans for body and UI.
- Display headings use a tighter tracking and heavier weight; body measure 55–70 characters.
- Fluid type with controlled min/max; no three-line mobile headlines from desktop-only wording.

---

## 8. DevOps and CI/CD

### 8.1 Package manager

- **npm** is the package manager of record. `package-lock.json` is committed.
- `bun.lock` is removed to avoid ambiguous lockfile resolution on Vercel.
- The `build` script is plain `next build` (no standalone copy step) so Vercel's default Next.js builder works without customisation.

### 8.2 Environments

- There are **no required environment variables** in v2. No `DATABASE_URL`. No `NEXTAUTH_SECRET`. No `NEXTAUTH_URL`. A reviewer clones and runs.
- `.env.example` is empty or omitted; it is not needed.
- Vercel environment variables are not required for the build.

### 8.3 CI/CD pipeline (GitHub Actions)

Located at `.github/workflows/ci.yml`. On every push and PR to `main`:

1. Checkout.
2. Setup Node 20.
3. `npm ci`.
4. `npm run lint`.
5. `npx tsc --noEmit` (type check).
6. `npm run build`.
7. (On push to `main` only) Deploy to Vercel via the Vercel CLI using `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` secrets, targeting production.

There is no `prisma generate`, no `prisma db push`, no `prisma db seed`. There is no migration step. A separate `.github/workflows/deploy.yml` is intentionally avoided; the single workflow keeps the pipeline auditable in one place.

### 8.4 Vercel configuration

- `vercel.json` is minimal: sets the Node runtime framework hint and rewrites nothing (Next.js handles routing).
- Build command: `npm run build` (Vercel default).
- Output: `.next` (Vercel default for Next.js).

### 8.5 What is *not* on Vercel

There is no database on Vercel. There is no server runtime state. There is no ephemeral filesystem caveat to document. The deployment is a static HTML/JS/CSS bundle plus the Next.js server-rendered shell for public pages, and that is the entire footprint.

---

## 9. Security, privacy, and compliance (honestly stated)

This section is written to be read by a security reviewer. It does not oversell.

- **Passwords:** hashed with a non-cryptographic demo hash (djb2-style, see §4.2) and stored in `localStorage`. Anybody with browser access to the device can read or modify the stored state, including the hashed passwords. The hash resists casual shoulder-surfing of the stored blob; it does not resist a determined attacker with browser access.
- **Sessions:** none. `currentUserId` in the store is the session. There is no token, no cookie, no server-issued credential.
- **Input validation:** Zod schemas validate every form submission before the store action runs. There is no server trust boundary because there is no server; the validation exists to give the user fast, structured feedback and to keep malformed data out of the store.
- **Contact info:** never exposed until both parties accept a `ContactRequest`. The flow is enforced by the store actions, not by a server; in a production version it would be enforced server-side.
- **Reports:** stored in the local store with the reporter's user id for audit. No automated action in v2.
- **`.env`, `node_modules`, `.next`:** gitignored.
- **No third-party analytics or tracking** in v2.

### 9.1 What a production version would need

- Server-side password hashing with scrypt or argon2.
- A real database (Postgres or libSQL/Turso) with row-level constraints and migrations.
- Server-issued httpOnly secure session cookies; no client-side session state.
- Rate limiting on every write endpoint.
- HTTPS-only cookies; CSRF protection on state-changing requests.
- Server-side input validation at the trust boundary (Zod schemas can move directly from client to server).
- A real content-moderation queue, backed by the database.
- Audit logging for reports and contact-request flows.
- A privacy policy and data-retention controls, which a local-only demo does not require but a real product would.

These are documented as the migration path in §10 and are out of scope for v2.

---

## 10. Accessibility and performance

### 10.1 Accessibility contract

- Semantic landmarks (`header`, `main`, `nav`, `footer`).
- Heading order preserved per route.
- Keyboard-operable controls; visible focus rings.
- ≥ 44 px touch targets.
- AA contrast on all text.
- `prefers-reduced-motion` respected (motion degrades to opacity-only or none).
- No colour-only meaning: line colours are always paired with a label.

### 10.2 Performance contract

- Public pages are server-rendered from static data; LCP is bounded by HTML/CSS delivery, not by data fetching.
- App pages render from a synchronous store; there is no network waterfall.
- `localStorage` reads happen once per page load, at module init; subsequent writes are synchronous and cheap.
- No third-party scripts in v2.
- No images are loaded unless the user supplies a URL in a form (feed post image, marketplace listing image); there is no decorative image payload.

---

## 11. Limitations and migration path

### 11.1 v2 limitations (acknowledged, not hidden)

- **Local memory is ephemeral per-browser.** Data created in one browser does not appear in another. Clearing browser data wipes the store. There is no account recovery.
- **No cross-device sync.** A user who logs in on their phone has none of their desktop data.
- **No real-time updates.** Two tabs on the same browser are not synchronised via the `storage` event in v2 (a roadmap item); they each load `localStorage` once at module init and write independently, so the last writer wins on refresh.
- **Demo auth is not secure.** See §4 and §9.
- **No real payments.** Marketplace transactions happen offline.
- **English only.** i18n scaffolding is in place but no other locale ships.
- **No automated moderation.** Reports sit in the local store for manual inspection.
- **Single-user demo density.** The seed places a handful of posts, carpools, ideas, and listings across three demo users. Real network effects require real users, which requires a real backend.

### 11.2 Migration path to a real backend

The migration is mechanical, not a rewrite, because the store types are the schema and the store actions are the API surface:

1. **Provision a database** (Postgres or Turso/libSQL). Create tables from the store types: `users`, `posts`, `replies`, `carpools`, `carpool_joins`, `ideas`, `lost_found`, `marketplace`, `contact_requests`, `ratings`, `reports`. The denormalised embedded arrays (`Post.replies`, `Carpool.joins`, `Idea.interested`) become child tables with a foreign key.
2. **Introduce Prisma** (or Drizzle, or raw SQL) with a schema that mirrors the store types. Re-introducing Prisma at this point is straightforward because the v1 schema already existed; it was removed, not lost.
3. **Move store actions to Route Handlers** under `src/app/api/*`. Each action becomes an endpoint; the `{ ok, error? }` return contract is preserved. Replace the store call in components with a `fetch` (or a TanStack Query mutation, which would re-enter the dependency list at that point).
4. **Replace demo auth** with NextAuth (Auth.js) credentials provider, scrypt or argon2 hashing, and httpOnly session cookies. The `AuthProvider` interface in `auth-client.tsx` is preserved; only its internals change.
5. **Re-introduce input validation at the trust boundary** — the same Zod schemas, run server-side.
6. **Add rate limiting, CSRF protection, audit logging.**

The component layer is largely unchanged through this migration. Most feature components read from selectors that look like `useStore((s) => s.carpools)`; after migration they would read from a TanStack Query cache fed by the API, but the prop shapes they pass down do not change.

---

## 12. Documentation deliverables

The following documents are produced as part of this build:

| Document | Path | Purpose |
|---|---|---|
| Product Requirements Document | `docs/PRD.md` | what and why |
| Technical Requirements Document | `docs/TechRD.md` | how (this file) |
| LaTeX architecture document with TikZ diagrams | `docs/architecture/MetroMitra-Architecture.tex` (+ compiled PDF) | professional, human-readable engineering document |
| README | `README.md` | setup, run, deploy |
| CI/CD pipeline | `.github/workflows/ci.yml` | automated quality + deploy |
| Vercel config | `vercel.json` | deployment hint |
| Reference playbooks | `docs/reference/*` | the source playbooks that guided this build |

### 12.1 LaTeX document scope

The LaTeX document (`docs/architecture/MetroMitra-Architecture.tex`) is written to read like a real engineering architecture document, not AI-generated marketing. It includes a title page with a TikZ metro-map motif, an abstract, a table of contents, and thirteen numbered sections covering: introduction, system overview, technology stack and rationale (including the "what we rejected" subsection), local data model, client-side authentication, feature architecture, Idea Junction, frontend architecture, deployment and CI/CD, security and privacy, accessibility and performance, limitations and future work, and conclusion. Six TikZ figures: system architecture, conceptual entity model, auth flow, Zustand persist cycle, Idea Junction concept diagram, and deployment topology. One TypeScript code listing (an excerpt of the Idea Junction store slice).

It is compiled with tectonic (XeTeX-based). The `.tex` source is committed; a compiled PDF is produced if a LaTeX toolchain is available.

---

## 13. Acceptance criteria for "done"

The build is considered complete only when ALL of the following are true:

1. `npm run lint` passes with no errors.
2. `npx tsc --noEmit` passes.
3. `npm run build` succeeds.
4. `npm install && npm run dev` brings the app up on port 3000 with no fatal errors and no required environment variables.
5. The landing page renders with real content (not the scaffold) and no console errors.
6. A new user can register, log in, and reach the dashboard.
7. Every feature surface (feed, carpool, ideas, lost-found, marketplace) loads data and accepts a valid submission end-to-end.
8. Idea Junction accepts a new idea, lists it on `/ideas` and on the originating station page, and accepts a "Let's discuss" contact request from a second user.
9. The station directory lists all 80 real Indian metro stations across the six cities.
10. State persists across a page refresh in `localStorage`; the "reset demo data" action restores the seed.
11. The footer is sticky on short pages and pushed down on long pages.
12. The layout holds at 390 px, 768 px, and 1440 px.
13. Browser self-verification (via agent-browser) confirms the golden path with no console errors.
14. The GitHub Actions workflow file is valid YAML and would run the steps in §8.3.
15. The LaTeX architecture document compiles (or its source is valid and complete).
16. The README explains how to run, build, and deploy — and explicitly notes that no environment variables or database are required.

"It compiles" is necessary but not sufficient. Browser-verified interactivity with zero external setup is the standard of done (per `docs/reference/critique-verification.md`).

---

## 14. Alignment with the Master Playbook

| Playbook section | How this TechRD complies |
|---|---|
| §4 Skill preflight | Read `docs/reference/Ponytail-SKILL.md` and the Master Playbook before any code decision |
| §6 Classify the website | Classified as **application/dashboard** primary, **playful consumer** secondary |
| §7 Reference selection | No external brand cloned; motif derived from the product's own domain (metro map) |
| §8 Originality | Station-node motif; no generic gradient hero; no fabricated proof; no "built like a real product" claim |
| §10 DESIGN.md | Summarised in §7 of this doc; full tokens in `src/app/globals.css` |
| §11 AGENTS.md | Concise operational file committed at repo root |
| §12 Technical route | Next.js App Router, TypeScript strict, Tailwind 4, shadcn/ui — the project's fixed stack |
| §14 Motion level | Level 1 explicitly chosen |
| §15.1 No WebGL | Motif delivered with CSS and SVG |
| §18 Responsive/a11y/perf | Contract stated in §10 |
| §24 Git and deployment safety | `.gitignore` protects secrets and build output; npm lockfile committed; deploy only on push to `main`; no secrets required for the build |
