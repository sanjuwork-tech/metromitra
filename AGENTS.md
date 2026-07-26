# AGENTS.md

Operational guide for AI agents (and humans) working on MetroMitra.
Keep this concise — the full rationale lives in `docs/TechRD.md`.

## Stack & package manager

- **Next.js 16** (App Router), **TypeScript strict**, **Tailwind CSS 4**, **shadcn/ui**.
- **Prisma 6** + SQLite (dev). Portable to Turso/Postgres.
- **NextAuth.js v4** (Credentials, JWT sessions).
- **Package manager: npm.** Do NOT introduce `bun.lock` or `yarn.lock`. The `package-lock.json` is committed and is what Vercel uses.

## Source-of-truth documents

- `docs/PRD.md` — what and why.
- `docs/TechRD.md` — how (architecture, data model, API).
- `docs/architecture/MetroMitra-Architecture.tex` — engineering document with TikZ diagrams.
- `docs/reference/` — the playbooks that guided the build (read before redesigning).

## Architecture constraints

- **API = Route Handlers** under `src/app/api/*`. No separate backend service.
- **Validation = Zod** in `src/lib/validators.ts`. Client forms and server handlers share the same schemas.
- **DB access = Prisma** via `src/lib/db.ts` singleton. Never `new PrismaClient()` elsewhere.
- **Auth = NextAuth** via `src/lib/auth.ts`. Use `requireSession()` from `src/lib/session.ts` in protected handlers.
- **No `any`** in application logic. `unknown` + Zod parse at trust boundaries.
- **No `z-ai-web-dev-sdk` on the client.** Backend only.

## Forbidden visual patterns

(see `docs/reference/anti-patterns.md`)

- No centered headline over a gradient blob.
- No three-equal-cards default page.
- No purple-to-blue gradients. No indigo/blue default.
- No fabricated testimonials, partner logos, or metrics.
- No decorative glassmorphism or floating 3D objects.

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
- Build command: `npm run build` (plain `next build`, no standalone).
- CI/CD: `.github/workflows/ci.yml` — runs on push/PR to `main`; deploys to Vercel on push to `main` only.
- Vercel filesystem is read-only except `/tmp`. SQLite is ephemeral in production — use Turso or Postgres for persistence (documented in README).

## Git rules

- Never commit `.env`, `db/*.db`, `node_modules`, `.next`, `bun.lock`.
- Never rewrite history unless explicitly requested.
- `docs/reference/` IS committed (it's the playbook the build follows).
- `skills/`, `examples/`, `tests/`, `tool-results/`, `download/` are gitignored scratch.

## Motion level

**Level 1** (refined interface motion). Hover, focus, press, dialog, tab transitions only. Respect `prefers-reduced-motion`. No WebGL, no scroll-linked choreography in v1.
