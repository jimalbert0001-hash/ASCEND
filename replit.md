# ASCEND

A productivity and self-improvement platform for tracking academics, chess, guitar, and startup progress — with an AI mentor coach.

## Run & Operate

- `PORT=3001 pnpm --filter @workspace/api-server run start & PORT=5000 BASE_PATH=/ pnpm --filter @workspace/ascend run dev` — run both servers (workflow command)
- `pnpm --filter @workspace/api-server run build` — build the API server (must run before starting)
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- Required env: `DATABASE_URL` — Postgres connection string (auto-provisioned by Replit)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite (port 5000), Tailwind CSS, shadcn/ui, wouter, Zustand, TanStack Query
- API: Express 5 (port 3001 in dev)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Auth/DB: Supabase (via `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`)

## Where things live

- `artifacts/ascend/` — React frontend (Vite)
- `artifacts/api-server/` — Express API backend
- `lib/db/` — Drizzle ORM schema and client
- `lib/api-spec/` — OpenAPI spec (source of truth for API contracts)
- `lib/api-zod/` — Generated Zod schemas
- `lib/api-client-react/` — Generated TanStack Query hooks
- `artifacts/ascend/src/lib/supabase.ts` — Supabase client
- `artifacts/ascend/src/lib/ai-api.ts` — AI Mentor API calls
- `artifacts/ascend/src/lib/log-api.ts` — Session logging API calls

## Architecture decisions

- Frontend and API run on separate ports; Vite proxies `/api` to the Express server in dev
- Frontend uses Supabase directly for core CRUD; Express backend handles AI mentor and session logging
- API server built with esbuild before starting; run `pnpm --filter @workspace/api-server run build` first
- `PORT` env controls frontend (5000); `API_PORT` (3001) controls the backend

## Product

ASCEND is a personal productivity dashboard with domain-specific tracking for:
- **Academics** — study sessions, subjects, chapters, mock prep
- **Startup** — tasks and progress tracking
- **Chess** — game logs, rating tracking, tactics
- **Guitar** — practice sessions, BPM tracking
- **AI Mentor** — coaching chat with daily/weekly recommendations

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- The API server must be built (`pnpm --filter @workspace/api-server run build`) before starting
- Vite proxy in `artifacts/ascend/vite.config.ts` forwards `/api` to `localhost:$API_PORT`
- `PORT` is shared env — workflow command overrides it per-process with inline env vars

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
