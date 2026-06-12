---
name: DB Context Architecture for AI Mentor
description: How the AI Mentor fetches real user data from PostgreSQL and passes it to the AI providers.
---

## Rule
The frontend passes only `userId` (string) to all AI endpoints. The API server builds `UserContext` from the DB using Drizzle. Never pass full context JSON from the frontend.

**Why:** Security (client can't spoof data), performance (single DB fetch server-side), consistency (one source of truth).

## How to apply
- All AI endpoints accept `{ userId?: string; context?: UserContext }` — userId takes priority.
- `artifacts/api-server/src/lib/ai/context.ts` exports `buildContextFromDB(userId)`.
- Frontend stats card fetches context via `GET /api/ai/context?userId=...` on mount.
- Mock user ID: `mock-user-1` (set by AuthProvider when no Supabase URL configured).

## Drizzle Schema
- Schema files: `lib/db/src/schema/{enums,users,goals,tasks,habits,academics,startup,chess,guitar,achievements,reviews}.ts`
- All tables use `text("id")` primary keys (not UUID column type) to support mock string IDs.
- Push schema: `pnpm --filter @workspace/db run push`
- Seed: `node /home/runner/workspace/node_modules/.pnpm/tsx@4.21.0/node_modules/tsx/dist/cli.mjs src/seed.ts` from `lib/db/` directory.
