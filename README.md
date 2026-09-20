# SimpleMMO — Idle Play2Earn MMO (Next.js 16 + Supabase)

Flagship mobile-first idle MMO: train 9 skills, PvP across 4 channels, trade on the
Black Market (public + SHARD-gated premium), guilds + territory control, world bosses,
jobs, bounties, seasonal leagues.

## Quickstart

1. Copy env: `cp .env.example .env.local` and fill Supabase keys.
2. Install: `npm ci`
3. Dev: `npm run dev` (Turbopack)
4. Typecheck: `npm run typecheck` — must be zero errors.
5. Tests: `npm run test` (Vitest) / `npm run test:e2e` (Playwright)
6. DB: `supabase link --project-ref <ref>` then `supabase db push`

## Architecture

- Server-first: mutations via Server Actions (`app/actions/`) + Edge Functions (`supabase/functions/`).
- DB-first: all state in Postgres; client Zustand store is optimistic cache with `persist`.
- Deterministic RNG server-side (`lib/game/rng.ts`); client never rolls.
- Batch writes: offline progress accumulates locally, validated + written once on claim.

## Substitutions

- `next-pwa` → `@ducanh2912/next-pwa` (maintained fork with Next 16 App Router support; same Workbox behavior).
- `react-incremental-lib` → vendored `lib/incremental/hooks.ts` (same hook contract: `useGameLoop`, `useTick`, `useIdleProgress`, `useOfflineProgress`; upstream package has no React 19 build on npm).

## Secrets

Never commit `.env.local`. Production secrets live in GitHub Actions Secrets + Vercel Env Vars:
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server only),
`SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF`, `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`,
`SUPABASE_MIGRATIONS_ENABLED`.
