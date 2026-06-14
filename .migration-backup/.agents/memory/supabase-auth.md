---
name: Supabase Auth migration
description: How the auth system works after migrating from Replit OIDC to Supabase Auth.
---

## Env var semantics

- `SUPABASE_DB_URL` → Supabase project API URL (e.g., `https://xyz.supabase.co`), used as `SUPABASE_URL` for Supabase clients.
- `SUPABASE_ANON_KEY` → Public anon key for frontend Supabase client.
- `SUPABASE_SERVICE_KEY` → Service role key for backend admin client.
- `DATABASE_URL` → PostgreSQL connection string (Replit managed), used for Drizzle ORM and backend DB connections.

## Auth flow

1. **Frontend** → Supabase client (with localStorage persistence) handles email/password, magic link, and OAuth.
2. **Frontend** → `apiFetch` gets Bearer token from Supabase session and injects into all API calls.
3. **Backend** → `supabaseAuth.ts` validates JWT via `supabase.auth.getUser(token)` using the admin client.
4. **Backend** → `upsertUser` ensures the user exists in the Drizzle `users` table.

## Middleware

- `isAuthenticated` → returns 401 if no valid Bearer token.
- `optionalAuth` → allows unauthenticated requests but still attaches user/token if present.

## Node.js 20 WebSocket fix

Supabase JS Realtime requires native WebSocket, which Node.js 20 lacks. We shim it globally:

```ts
import ws from "ws";
if (!globalThis.WebSocket) {
  (globalThis as any).WebSocket = ws;
}
```

The `ws` package is externalized in `build.mjs` so it is not bundled (it loads dynamically at runtime).

## Dev mock user

When Supabase is not configured (dev mode without env vars), `AuthProvider` falls back to `mock-user-1` so the app still works locally.
