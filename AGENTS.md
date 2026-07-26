# AGENTS.md

Operational guide for AI agents (and humans) working on MetroMitra.
Keep this concise — the full rationale lives in `docs/TechRD.md`.

## Architecture

MetroMitra is a **client-side Next.js application with no backend, no database, and no API**. All data lives in the browser via a Zustand store synced to localStorage. Stations are static reference data. There is no Prisma, no NextAuth, no API route handler layer.

## Stack & package manager

- **Next.js 16** (App Router), **TypeScript strict**, **Tailwind CSS 4**, **shadcn/ui**.
- **Zustand** for state (manual localStorage sync — NOT the persist middleware).
- **Framer Motion** (Level 1 motion only).
- **Package manager: npm.** Do NOT introduce `bun.lock` or `yarn.lock`. The `package-lock.json` is committed and is what Vercel uses.

## Source-of-truth documents

- `docs/PRD.md` — what and why.
- `docs/TechRD.md` — how (architecture, data model, client-side data layer).
- `docs/architecture/MetroMitra-Architecture.tex` — engineering document with TikZ diagrams.
- `docs/reference/` — the playbooks that guided the build (read before redesigning).

## Architecture constraints

- **Data = Zustand store** at `src/lib/store.ts`, synced to localStorage manually (load at module init guarded by `typeof window`, `useStore.subscribe()` to save).
- **Stations = static** in `src/lib/stations-data.ts` (80 stations, 6 cities). Never fetch stations from a server.
- **Auth = client-side** via `src/lib/auth-client.tsx` (register/login/logout write to the store; demo hash only).
- **No API routes.** There is no `src/app/api/` directory. All mutations go through store actions.
- **Zustand selectors must return stable references.** Never return a fresh object/array from `useStore((s) => ...)` — select the raw state field and derive with `useMemo`. See `useUsersById` / `useCurrentUser` for the pattern. Returning fresh objects causes `useSyncExternalStore` infinite-loop warnings.
- **No `any`** in application logic.

## Forbidden visual patterns

(see `docs/reference/anti-patterns.md`)

- No centered headline over a gradient blob.
- No three-equal-cards default page.
- No purple-to-blue gradients. No indigo/blue default.
- No fabricated testimonials, partner logos, or metrics.
- No "built like a real product" framing — the app is honestly a zero-setup browser-local build.

## Quality commands

```bash
npm run lint        # ESLint — must pass
npm run typecheck   # tsc --noEmit — must pass
npm run build       # production build — must pass
```

All three must pass before a change is considered done. Browser-verified interactivity is the standard of done — "it compiles" is not enough.

## Browser viewport requirements

Verify at: **390px** (mobile), **768px** (tablet), **1440px** (desktop). Test intermediate widths where wrapping can fail.

## Deployment constraints

- Deploy target: **Vercel**.
- Build command: `npm run build` (plain `next build`).
- CI/CD: `.github/workflows/ci.yml` — runs on push/PR to `main`; deploys to Vercel on push to `main` only.
- No environment variables or secrets required (the app is client-side only).

## Git rules

- Never commit `.env`, `db/*.db`, `node_modules`, `.next`, `bun.lock`, `tsconfig.tsbuildinfo`, `dev.log`, `server.log`.
- Never rewrite history unless explicitly requested.
- `docs/reference/` IS committed (it's the playbook the build follows).
- `skills/`, `examples/`, `tests/`, `tool-results/`, `download/`, `upload/`, `mini-services/`, `Caddyfile`, `.zscripts/` are gitignored scratch or non-application files — do NOT push them.

## Motion level

**Level 1** (refined interface motion). Hover, focus, press, dialog, tab transitions only. Respect `prefers-reduced-motion`. No WebGL, no scroll-linked choreography.
