# ASCEND — Security Considerations

## Authentication

- **Provider**: Supabase Auth (email/password + magic link + optional Google OAuth)
- **Session tokens**: Managed entirely by Supabase client SDK. JWTs are short-lived (1 hour); refresh tokens rotate automatically.
- **No secrets in client**: `VITE_SUPABASE_ANON_KEY` is a public key — it is safe to expose. The service role key NEVER leaves Edge Functions.
- **Session persistence**: `localStorage` via Supabase client default. Consider `sessionStorage` for shared devices.

## Row-Level Security (RLS)

Every table in the schema has RLS enabled. The universal policy is:

```sql
using (auth.uid() = user_id)
```

This means:
- No user can read another user's data — not even by guessing IDs.
- No server-side auth middleware is needed; the DB enforces access.
- Edge Functions that need elevated access use the service role key (set as Supabase secret, never in client code).

## Data Validation

| Layer | Tool | Responsibility |
|---|---|---|
| Client forms | Zod schemas (`src/types/forms.ts`) | UX validation before submission |
| Supabase DB | CHECK constraints, NOT NULL, ENUM types | Server-enforced data integrity |
| Edge Functions | Manual validation + Zod | Validate inputs to AI functions |

## AI Security

- **Prompt injection**: Edge Functions sanitize user input before injecting it into system prompts.
- **Rate limiting**: Supabase Edge Function rate limits via `RATE_LIMIT` env var + IP-based limits.
- **Conversation isolation**: Each conversation is user-scoped by RLS. Users cannot access other users' AI history.
- **Embeddings**: Stored in `pgvector` with RLS. Semantic search only runs against the requesting user's embeddings.

## Storage Security

- Supabase Storage buckets for paper/recording uploads.
- Bucket policy: authenticated user can only access their own folder (`/user-id/...`).
- Signed URLs for temporary access — never expose public permanent URLs for user files.

## Client-Side

- **No secrets in `.env`**: Only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` — both safe to be public.
- **CSP headers**: Set via Vercel/hosting edge config to block XSS vectors.
- **PWA cache**: Service worker caches only public assets, not API responses containing PII by default.
- **HTTPS only**: Enforced by Supabase and hosting provider; no HTTP fallback.

## Sensitive Data Handling

| Data | Risk | Mitigation |
|---|---|---|
| Offline queue (Zustand persist) | Stored in localStorage — visible to XSS | Sanitize, no auth tokens in queue |
| AI conversation content | Could include personal plans/goals | RLS + encrypted at rest (Supabase default) |
| Mock test papers | Uploaded files | Signed URLs, user-scoped bucket paths |
| Analytics events | Behavioral data | No PII in `properties` column; `user_id` is sufficient |

## Future AI Security

- Before sending any user context to OpenAI: strip direct identifiers (name, email) — send only domain data (chess rating, chapter name, score).
- Keep a `tokens_used` log per conversation for budget alerting.
- Add a `consent` flag to `profiles` before enabling AI features.
