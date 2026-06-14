# ASCEND — Progress Tracker

## Completed Features

- [x] **Project Structure** — pnpm workspaces, TypeScript 5.9, React 19 + Vite, Tailwind CSS, shadcn/ui
- [x] **Authentication** — Supabase auth with email/password, login/register/forgot-password flows, mock user mode when unconfigured
- [x] **Dark/Light/System Theme** — ThemeProvider with `next-themes`, settings toggle, persistent preference
- [x] **Dashboard** — Streak counter, daily score, weekly progress, goal cards, activity heatmap, quick actions, motivational card, startup/chess/guitar snapshots
- [x] **Academics Module** — Subjects page with chapters, revision tracking, study sessions, mock tests, analytics, formulas
- [x] **Startup Module** — Projects, ideas vault, roadmap, features, bugs, milestones, revenue metrics, user metrics
- [x] **Chess Module** — Rating history, training sessions, puzzle sessions, openings, endgame studies, tournaments, game notes, analytics
- [x] **Guitar Module** — Practice sessions, songs, chord progressions, scale progressions, theory lessons, recordings, progress tracking
- [x] **AI Mentor** — 5 coach roles (Achievement, Academic, Startup, Chess, Guitar), chat interface with streaming, context-aware system prompts, recommendations panel, goal analysis, weakness detection
- [x] **AI Personality Customization** — Per-role personality overrides in Settings, stored in Zustand with localStorage persistence
- [x] **Token Usage Tracking** — Tracks total and per-role token consumption across all AI providers, displayed in Settings
- [x] **4 AI Provider Support** — OpenRouter, OpenAI, Anthropic, Gemini with streaming + token usage
- [x] **Achievements** — Badge system for milestones, streaks, skills
- [x] **Daily/Weekly Reviews** — Modal for daily review, progress tracking
- [x] **Settings Page** — Appearance, notifications, AI personality, AI usage, sign-out
- [x] **Drizzle ORM Schema** — Complete PostgreSQL schema with all domain tables (lib/db/src/schema)
- [x] **Supabase Client Wiring** — Supabase client updated with real credentials, all domain files use `isSupabaseConfigured` flag
- [x] **Express API Backend** — AI endpoints, context builder, provider factory, prompt builder
- [x] **API Codegen** — Orval generates Zod schemas + TanStack Query hooks from OpenAPI spec

## In Progress

- [ ] **Supabase Database Setup** — SQL migration script created, needs to be run in Supabase SQL Editor

## TODO

- [ ] Fix and re-run the SQL migration in Supabase SQL Editor
- [ ] Verify all tables are created and readable via Supabase REST API
- [ ] Test CRUD operations for each domain (create, read, update, delete)
- [ ] Ensure data persists across page refresh
- [ ] Verify RLS policies are working (users only see their own data)
- [ ] Add onboarding flow for first-time users
- [ ] Deploy to production

## Current Session Task

**Setting up Supabase database**

The Supabase credentials (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`) have been stored in Replit shared env vars. The Supabase client in `artifacts/ascend/src/lib/supabase.ts` has been updated to connect to the real project. All 4 domain-specific Supabase files (academics, chess, guitar, startup) and the `AuthProvider` have been updated to use `isSupabaseConfigured` instead of checking env vars directly.

**The SQL migration file** is at `artifacts/ascend/supabase/migrations/001_initial_schema.sql` and contains all the table creation statements with Row Level Security policies.

**The migration failed with error 42804** when run in the Supabase SQL Editor:
```
column active_domains is of type domain_type[] but default expression is of type text[]
```

This is in the `profiles` table definition:
```sql
active_domains domain_type[] NOT NULL DEFAULT ARRAY['academics', 'startup', 'chess', 'guitar', 'life']
```

**Fix needed:** Cast the default array to the enum type:
```sql
active_domains domain_type[] NOT NULL DEFAULT ARRAY['academics', 'startup', 'chess', 'guitar', 'life']::domain_type[]
```

**Next steps for the next agent:**
1. Fix the `001_initial_schema.sql` file by casting all enum array defaults
2. Open https://supabase.com/dashboard/project/gkqhhudoiibopzhqfixj/sql-editor
3. Run the fixed SQL migration
4. Verify tables exist via `node artifacts/ascend/supabase/test-connection.js` (or via REST API)
5. Test a few CRUD operations to confirm data persistence
6. Typecheck and rebuild the app

**Typecheck status:** All packages pass (including `ascend` and `api-server`)
**API server build:** Successfully built
**App status:** Running but showing login screen (because Supabase is now configured and not in mock mode)
