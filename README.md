# MetroMitra

> Find your people on the line you already ride.

MetroMitra is a hyperlocal community web application built around **Indian metro rail stations**. It turns a daily, solitary commute into a connected experience — share a last-mile auto, post an entrepreneurial idea and find a co-founder among the people riding your line, recover a dropped wallet, and trade within your station's community, all anchored to the station you pass through every day.

This repository contains the complete application: product documentation (PRD), technical documentation (TechRD), a LaTeX architecture document with TikZ diagrams, an automated CI/CD pipeline, and the deployable Next.js application itself.

---

## What's inside

```
metromitra/
├── docs/
│   ├── PRD.md                              # Product requirements, market research, features
│   ├── TechRD.md                           # Technical architecture, stack, data model
│   ├── architecture/
│   │   └── MetroMitra-Architecture.tex     # LaTeX document with TikZ diagrams (→ PDF)
│   └── reference/                          # The playbooks that guided this build
├── src/
│   ├── app/                                # Next.js App Router (pages only — no API routes)
│   │   ├── (public pages)                  # landing, stations, about — server-rendered from static data
│   │   ├── login, register                 # client-side auth
│   │   └── dashboard, carpools, ideas,     # authenticated app — client components
│   │       lost-found, marketplace, feed, profile
│   ├── components/                         # UI (shadcn/ui + feature components)
│   └── lib/
│       ├── store.ts                        # Zustand store + manual localStorage sync
│       ├── auth-client.tsx                 # client-side demo auth context
│       └── stations-data.ts                # 80 static metro stations across 6 cities
├── .github/workflows/ci.yml                # CI/CD: lint → typecheck → build → deploy
├── vercel.json                             # Vercel deployment config
└── package.json                            # npm-managed dependencies
```

---

## Architecture (no backend, no database, no API)

MetroMitra runs **entirely in the browser**. There is no server, no database, and no API layer:

- All data (accounts, posts, rides, ideas, listings, contact requests) lives in a **Zustand store** that is **manually synced to `localStorage`**.
- **Stations are static reference data** — 80 real metro stations across Delhi, Mumbai, Bengaluru, Hyderabad, Chennai, and Kolkata, compiled into `src/lib/stations-data.ts`.
- **Authentication is client-side** — register, login, and logout write to the store. Passwords are hashed with a lightweight demo hash (not production-secure; see TechRD §10).
- Public pages (landing, station directory, about) are **server-rendered** from the static station data for SEO. Authenticated app pages are **client components** that read the store.
- Deployed to **Vercel** as a standard Next.js build. No database to provision, no environment secrets required.

This makes the app **zero-setup**: `npm install && npm run dev` and it works. Data persists per-browser via localStorage but does not sync across devices. See the TechRD for the honest limitations and the migration path to a real backend if the product were to scale.

---

## Tech stack

| Concern | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS 4 |
| UI primitives | shadcn/ui (New York) + lucide-react |
| State management | Zustand (manual localStorage sync) |
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

# 2. Start the dev server
npm run dev
```

Open <http://localhost:3000> in your browser. That's it — no database setup, no environment variables, no secrets.

On first visit, the app seeds itself with demo content (3 demo users, sample posts, rides, ideas, listings) so you can explore immediately. Use the **Profile → Demo data** tab to reset or clear the local data at any time.

### Demo accounts

Three demo accounts are seeded for testing. The password for all of them is `password123`:

| Email | Persona |
|---|---|
| `devika@metromitra.in` | Bengaluru Purple Line commuter |
| `rohan@metromitra.in` | Delhi Yellow Line, aspiring founder |
| `anitha@metromitra.in` | Mumbai Andheri, monthly traveller |

You can also register a new account — it will be stored in your browser's localStorage alongside the demo data.

---

## Available scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the Next.js dev server on port 3000 |
| `npm run build` | Production build (what Vercel runs) |
| `npm run start` | Start the production server (after build) |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run `tsc --noEmit` (strict type check) |

---

## Features

- **Station directory** — 80 real metro stations across Delhi, Mumbai, Bengaluru, Hyderabad, Chennai, Kolkata, each with its own community page.
- **Community feed** — station-scoped posts with tags (`help`, `info`, `alert`, `meetup`, `general`) and threaded replies.
- **Last-mile carpool** — offer or request rides from a station; trust-scored, with women-only filtering.
- **Idea Junction** — the standout feature. A station-anchored board for entrepreneurial ideas, side-project thoughts, and co-founder search among the people riding your line.
- **Lost & Found** — report lost or found items; contact flows keep your number private until you accept.
- **Station marketplace** — buy and sell within the commuter community (no payments processed in-app).
- **Trust scores** — a transparent, explainable score from profile completeness, ratings, and completed interactions.
- **Contact requests** — all contact flows are opt-in; no contact info is exposed without mutual acceptance.

---

## Documentation

| Document | Path | Purpose |
|---|---|---|
| Product Requirements | `docs/PRD.md` | What MetroMitra is, who it's for, what it does |
| Technical Requirements | `docs/TechRD.md` | Architecture, stack, data model, client-side data layer |
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

## Production deployment (Vercel)

MetroMitra is configured for deployment to Vercel via GitHub Actions CI/CD.

### One-time setup

1. **Fork or push** this repository to GitHub.
2. **Create a Vercel project** at <https://vercel.com/new> linked to the repository.
3. **Copy the Vercel IDs** from Project → Settings → General:
   - `VERCEL_ORG_ID` (your team/user ID)
   - `VERCEL_PROJECT_ID` (the project ID)
4. **Create a Vercel token** at <https://vercel.com/account/tokens>.
5. **Add GitHub secrets** (repository → Settings → Secrets and variables → Actions):
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`

No `DATABASE_URL`, no `NEXTAUTH_SECRET`, no environment variables are needed — the app is client-side only.

### What the pipeline does

Every push or pull request to `main` triggers `.github/workflows/ci.yml`:

1. `npm ci` — reproducible install
2. `npm run lint` — ESLint
3. `npm run typecheck` — `tsc --noEmit`
4. `npm run build` — production build
5. **On push to `main` only:** `vercel build --prod` → `vercel deploy --prebuilt --prod` — deploy to production

The deploy step runs only after all quality gates pass, and only on the `main` branch.

### Manual deploy (alternative)

```bash
npm install -g vercel
vercel        # preview deploy
vercel --prod # production deploy
```

---

## Project conventions

- **TypeScript strict** — `tsc --noEmit` must pass before merge.
- **shadcn/ui only** — no custom re-implementations of button/card/dialog/input.
- **No `any` in application logic** — `unknown` + validation at trust boundaries.
- **Zustand selectors must return stable references** — never return a fresh object/array from a `useStore((s) => ...)` selector; select the raw state field and derive with `useMemo` instead (see `useUsersById`, `useCurrentUser` in `src/lib/store.ts`).
- **Accessibility** — semantic landmarks, keyboard-operable controls, visible focus, AA contrast, `prefers-reduced-motion` respected.
- **Responsive** — verified at 390px (mobile), 768px (tablet), 1440px (desktop).
- **No fabricated proof** — no fake testimonials, partner logos, or metrics. Demo data is clearly labelled.

---

## Security notes (honest)

- This is a **client-side demo**. localStorage is not secure and demo auth is not production-grade.
- Passwords are hashed with a lightweight demo hash (djb2-style), not bcrypt/argon2.
- Contact information is never exposed until both parties accept a contact request.
- No real payments are processed.
- A production version would need: a real backend, server-side hashed passwords, a managed database, rate limiting, HTTPS-only cookies, and server-side validation. See TechRD §10 for the migration path.

---

## Limitations (honest)

- **Data is per-browser.** localStorage does not sync across devices and is cleared if you reset browser data. Use the Profile → Demo data tab to reset.
- **No real-time updates.** The UI updates instantly within your browser (Zustand is synchronous), but there's no cross-user real-time layer.
- **No real payments.** Marketplace and carpool cost-splitting express intent only.
- **No automated content moderation.** Reports go to a local queue visible in the store.
- **English only.** The UI strings are structured for future localisation but v1 ships in English.
- **MetroMitra is an independent project**, not affiliated with DMRC, MMRCL, BMRCL, HMRL, CMRL, or any metro corporation. Station names and line colours are referenced only to orient members.

---

## License

This project is shared for educational and portfolio purposes. All metro system names, station names, and line colours are referenced only to orient members; they remain the property of their respective operators.
