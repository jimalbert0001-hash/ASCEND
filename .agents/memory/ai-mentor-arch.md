---
name: AI Mentor Architecture
description: How the ASCEND AI Mentor is wired — provider abstraction, API routes, frontend state, and URL conventions
---

## Provider Abstraction
- `artifacts/api-server/src/lib/ai/` — full provider layer
- Controlled by `AI_PROVIDER` env var: `openai` | `anthropic` | `gemini` | `openrouter`
- Corresponding key env vars: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, `OPENROUTER_API_KEY`
- Factory is a singleton: `getAIProvider()` in `factory.ts`
- OpenRouter uses composition (not inheritance) of OpenAIProvider to avoid TS name conflict

## API Routes (all under `/api/ai/`)
- `GET /api/ai/status` — provider config check
- `POST /api/ai/chat` — streaming (SSE) or non-streaming chat; accepts `stream: boolean`
- `POST /api/ai/recommendations/daily` — returns JSON {recommendations[], morningBriefing}
- `POST /api/ai/recommendations/weekly` — returns JSON {recommendations[], weeklyDigest}
- `POST /api/ai/recommendations/weaknesses` — returns JSON {weaknesses[]}
- `POST /api/ai/analyze/goals` — returns JSON {analyses[]}

## Frontend State
- `artifacts/ascend/src/stores/ai.store.ts` — Zustand persisted store (localStorage key: `ascend-ai-storage`)
- Stores conversations (last 50), active role, all insight caches
- Streaming uses a sentinel message id `'streaming'` that gets replaced on `finalizeStream()`

## URL Convention
- Frontend calls API at `/api/ai/...` (absolute path, no BASE_URL prefix)
- The Replit proxy routes `/api/*` to the API server which is mounted at `app.use("/api", router)`

## Context System
- `buildUserContext()` in `artifacts/ascend/src/lib/ai-api.ts` maps sampleData → UserContext
- Frontend sends UserContext with every request (no server-side Supabase fetch required)
- Each provider gets a rich system prompt built by `buildSystemPrompt(role, context)` in `prompts.ts`

**Why:** Context is sent from frontend so the system works without Supabase configured; swap to server-side fetch later when Supabase is live.
