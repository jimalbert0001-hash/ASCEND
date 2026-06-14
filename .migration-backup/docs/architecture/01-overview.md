# ASCEND — Architecture Overview

## What It Is

ASCEND is a Personal Achievement Operating System for an ambitious student managing five concurrent life tracks:

1. **Academics** — CBSE Class 12 (subjects, chapters, revisions, mock tests)
2. **Startup** — Building a company (projects, features, metrics, milestones)
3. **Chess** — Competitive improvement (sessions, ratings, game analysis)
4. **Guitar** — Skill mastery (practice sessions, songs, technique logs)
5. **Life** — Cross-domain goals, habits, daily/weekly reviews, achievements

## Core Principles

- **Single source of truth** — Supabase (PostgreSQL + Auth + Realtime) owns all data.
- **Offline-capable** — PWA with service worker; critical reads are cached locally.
- **Type-safe end-to-end** — Supabase-generated types flow through to the UI.
- **AI-ready** — Every entity has an `ai_metadata` JSONB column; `ai_conversations` table stores all LLM context.
- **Domain isolation** — Each life track is a self-contained module but shares cross-cutting primitives (goals, habits, tasks, achievements).

## System Topology

```
┌──────────────────────────────────────────────────────┐
│                   React PWA (Client)                  │
│  Zustand stores │ React Query │ Framer Motion UI      │
└───────────────────────┬──────────────────────────────┘
                        │ HTTPS / Realtime WS
┌───────────────────────▼──────────────────────────────┐
│                   Supabase Platform                    │
│  Auth │ PostgreSQL │ Row-Level Security │ Realtime     │
│  Edge Functions (Deno) │ Storage │ pg_cron             │
└──────────────────────────────────────────────────────┘
                        │ (future)
┌───────────────────────▼──────────────────────────────┐
│               AI Layer (future)                        │
│  OpenAI / Anthropic via Edge Functions                 │
│  Embeddings in pgvector │ ai_conversations table       │
└──────────────────────────────────────────────────────┘
```

## Tech Decisions & Rationale

| Decision | Choice | Rationale |
|---|---|---|
| Frontend framework | React + TypeScript | Ecosystem, PWA support, team familiarity |
| Styling | Tailwind + shadcn/ui | Zero runtime CSS, accessible primitives |
| Animation | Framer Motion | Layout animations, gesture support |
| Backend | Supabase | Auth + DB + Realtime in one; no server to manage |
| State (server) | TanStack React Query | Supabase client returns promises; Query handles caching/invalidation |
| State (client) | Zustand | Lightweight, no boilerplate, domain-scoped stores |
| PWA runtime cache | Workbox | Offline support for read-heavy flows |
| AI conversations | pgvector + Edge Functions | Keep embeddings co-located with data; Edge Functions call OpenAI |
