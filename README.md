# MetroMitra

> Find your people on the line you already ride.

MetroMitra is a hyperlocal community web application built around **Indian metro rail stations**. It turns a daily, solitary commute into a connected experience — share a last-mile auto, find a trusted travel buddy for a late shift, recover a dropped wallet, and trade within your station's community, all anchored to the station you pass through every day.

This repository contains the complete application: product documentation (PRD), technical documentation (TechRD), a LaTeX architecture document with TikZ diagrams, an automated CI/CD pipeline, and the deployable Next.js application itself.

---

## What's inside

```
metromitra/
├── docs/
│   ├── PRD.md                              # Product requirements, market research, features
│   ├── TechRD.md                           # Technical architecture, stack, data model, API
│   ├── architecture/
│   │   └── MetroMitra-Architecture.tex     # LaTeX document with TikZ diagrams (→ PDF)
│   └── reference/                          # The playbooks that guided this build
├── prisma/
│   ├── schema.prisma                       # Data model (12 entities)
│   └── seed.js                             # Seeds 39 stations + 3 demo users
├── src/
│   ├── app/                                # Next.js App Router (routes + API handlers)
│   │   ├── api/                            # REST-style Route Handlers
│   │   ├── (public pages)                  # landing, stations, about
│   │   ├── login, register                 # auth
│   │   └── dashboard, carpools, buddies,   # authenticated app
│   │       lost-found, marketplace, feed, profile
│   ├── components/                         # UI (shadcn/ui + feature components)
│   └── lib/                                # auth, db, validators, trust, helpers
├── .github/workflows/ci.yml                # CI/CD: lint → typecheck → build → deploy
├── vercel.json                             # Vercel deployment config
└── package.json                            # npm-managed dependencies
```

---

## Tech stack

| Concern | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS 4 |
| UI primitives | shadcn/ui (New York) + lucide-react |
| Database ORM | Prisma 6 |
| Database (dev) | SQLite |
| Database (prod) | portable to Turso (libSQL) or Postgres — one-line change |
| Auth | NextAuth.js v4 (Credentials provider, JWT sessions) |
| Password hashing | Node built-in `scrypt` (no bcrypt native dep) |
| Server state | TanStack Query |
| Client state | Zustand |
| Motion | Framer Motion (Level 1 — refined interface motion only) |
| Package manager | **npm** (not bun — for Vercel deployment reliability) |
| Deployment | Vercel |

---

## Quick start (local development)

### Prerequisites

- Node.js 20+
- npm 10+

### Steps

```bash
# 1. Install dependencies
npm install

# 2. Copy the environment template and fill in values
cp .env.example .env
#   Then edit .env:
#     DATABASE_URL=file:/absolute/path/to/db/custom.db
#     NEXTAUTH_SECRET=<run: openssl rand -base64 32>
#     NEXTAUTH_URL=http://localhost:3000

# 3. Generate the Prisma client and create the database
npx prisma generate
npm run db:push

# 4. Seed the database with 39 Indian metro stations + 3 demo users
npm run db:seed

# 5. Start the dev server
npm run dev
```

Open <http://localhost:3000> in your browser.

### Demo accounts

Three demo accounts are seeded for testing. The password for all of them is `password123`:

| Email | Persona |
|---|---|
| `devika@metromitra.in` | Bengaluru Purple Line commuter |
| `rohan@metromitra.in` | Delhi Yellow Line, newly relocated |
| `anitha@metromitra.in` | Mumbai Andheri, monthly traveller |

---

## Available scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the Next.js dev server on port 3000 |
| `npm run build` | Production build (what Vercel runs) |
| `npm run start` | Start the production server (after build) |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run `tsc --noEmit` (strict type check) |
| `npm run db:push` | Push the Prisma schema to the database |
| `npm run db:generate` | Regenerate the Prisma client |
| `npm run db:seed` | Seed stations + demo users |

---

## Production deployment (Vercel)

MetroMitra is configured for one-command deployment to Vercel via GitHub Actions.

### One-time setup

1. **Fork or push** this repository to GitHub.
2. **Create a Vercel project** at <https://vercel.com/new> linked to the repository.
3. **Set environment variables** in the Vercel dashboard (Project → Settings → Environment Variables):
   - `DATABASE_URL` — a production database URL (see "Database in production" below)
   - `NEXTAUTH_SECRET` — `openssl rand -base64 32`
   - `NEXTAUTH_URL` — your production URL (e.g. `https://metromitra.vercel.app`)
4. **Copy Vercel IDs** from Project → Settings → General:
   - `VERCEL_ORG_ID` (your team/user ID)
   - `VERCEL_PROJECT_ID` (the project ID)
5. **Create a Vercel token** at <https://vercel.com/account/tokens>.
6. **Add GitHub secrets** (repository → Settings → Secrets and variables → Actions):
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`
   - `DATABASE_URL` (used by the CI job)
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`

### What the pipeline does

Every push or pull request to `main` triggers `.github/workflows/ci.yml`:

1. `npm ci` — reproducible install
2. `npx prisma generate` + `prisma db push` + `node prisma/seed.js` — set up a CI database
3. `npm run lint` — ESLint
4. `npm run typecheck` — `tsc --noEmit`
5. `npm run build` — production build
6. **On push to `main` only:** `vercel build --prod` → `vercel deploy --prebuilt --prod` — deploy to production

The deploy step runs only after all quality gates pass, and only on the `main` branch.

### Manual deploy (alternative)

If you prefer to deploy without the pipeline:

```bash
npm install -g vercel
vercel        # preview deploy
vercel --prod # production deploy
```

---

## Database in production

The dev database is SQLite (`db/custom.db`), which works locally but **does not persist across cold starts on Vercel** (Vercel's filesystem is read-only except for `/tmp`).

For a persistent production database, switch the Prisma `datasource` provider. No application code changes are required — only `prisma/schema.prisma` and `DATABASE_URL`:

### Option A: Turso (libSQL) — recommended, SQLite-compatible

1. Create a database at <https://turso.tech>.
2. In `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "libsql"
     url      = env("DATABASE_URL")
   }
   ```
3. Set `DATABASE_URL=libsql://<host>?authToken=<token>` in Vercel.
4. Run `npx prisma db push` against the production URL.

### Option B: Postgres (Vercel Postgres, Neon, Supabase)

1. In `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Set `DATABASE_URL=postgresql://...` in Vercel.
3. Run `npx prisma migrate deploy`.

---

## Features

- **Station directory** — 39 real metro stations across Delhi, Mumbai, Bengaluru, Hyderabad, Chennai, Kolkata.
- **Community feed** — station-scoped posts with tags (`help`, `info`, `alert`, `meetup`, `general`) and threaded replies.
- **Last-mile carpool** — offer or request rides from a station; trust-scored, with women-only filtering.
- **Travel buddy** — find a companion for a metro leg, distinct from carpool (no vehicle implied).
- **Lost & Found** — report lost or found items; contact flows keep your number private until you accept.
- **Station marketplace** — buy and sell within the commuter community (no payments processed in-app).
- **Trust scores** — a transparent, explainable score from profile completeness, ratings, and completed interactions.
- **Contact requests** — all contact flows are opt-in; no contact info is exposed without mutual acceptance.

---

## Documentation

| Document | Path | Purpose |
|---|---|---|
| Product Requirements | `docs/PRD.md` | What MetroMitra is, who it's for, what it does |
| Technical Requirements | `docs/TechRD.md` | Architecture, stack, data model, API design |
| LaTeX architecture document | `docs/architecture/MetroMitra-Architecture.tex` | Engineering document with TikZ diagrams (compile to PDF with `pdflatex`, `xelatex`, or `tectonic`) |
| Reference playbooks | `docs/reference/` | The Master Playbook, Ponytail skill, and anti-pattern notes that guided the build |

To compile the LaTeX document:

```bash
cd docs/architecture
pdflatex MetroMitra-Architecture.tex
pdflatex MetroMitra-Architecture.tex   # second pass for TOC + refs
# or, if you use tectonic:
tectonic MetroMitra-Architecture.tex
```

---

## Project conventions

- **TypeScript strict** — `tsc --noEmit` must pass before merge.
- **Zod at the boundary** — every API write is validated with a Zod schema from `src/lib/validators.ts`; the same schemas are used by client forms.
- **shadcn/ui only** — no custom re-implementations of button/card/dialog/input.
- **No `any` in application logic** — `unknown` + Zod parse at trust boundaries.
- **Accessibility** — semantic landmarks, keyboard-operable controls, visible focus, AA contrast, `prefers-reduced-motion` respected.
- **Responsive** — verified at 390px (mobile), 768px (tablet), 1440px (desktop).
- **No fabricated proof** — no fake testimonials, partner logos, or metrics. Demo data is clearly labelled.

---

## Security notes

- Passwords are hashed with `scrypt` (Node built-in, no native dependency).
- Sessions are JWT-based, stored in `httpOnly` secure cookies.
- Contact information is never exposed until both parties accept a contact request.
- `.env`, `db/*.db`, `node_modules`, `.next`, `bun.lock` are gitignored.
- No third-party analytics or tracking.

---

## Limitations (honest)

- **SQLite on Vercel is ephemeral.** Data resets on cold starts. Use Turso or Postgres for persistence (see above).
- **No real payments.** Marketplace and carpool cost-splitting express intent only; money changes hands directly between users (cash/UPI).
- **No real-time updates.** Lists use TanStack Query polling (30–60s). A WebSocket layer is a documented roadmap item.
- **No automated content moderation.** Reports go to a manual queue.
- **English only in v1.** The schema and UI are structured for Hindi/regional language addition without model changes.
- **MetroMitra is an independent project**, not affiliated with DMRC, MMRCL, BMRCL, HMRL, CMRL, or any metro corporation.

---

## License

This project is shared for educational and portfolio purposes. All metro system names, station names, and line colours are referenced only to orient members; they remain the property of their respective operators.
