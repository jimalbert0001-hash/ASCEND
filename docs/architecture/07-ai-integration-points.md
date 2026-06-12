# ASCEND — AI Integration Points

## Philosophy

AI in ASCEND is a **coach, not a chatbot**. It knows the user's context (goals, progress, streaks, weak chapters, chess rating trend) and gives specific, actionable advice — not generic productivity tips.

All AI integrations are **optional and additive**. The app works fully without them. AI is progressive enhancement.

---

## Integration Points

### 1. Daily Review AI Summary
**Trigger**: User completes a daily review and clicks "Generate Summary"  
**Edge Function**: `ai-chat`  
**Context sent**: energy, mood, productivity scores; wins; blockers; domains covered; active goals  
**Output**: 3–5 sentence personalised summary stored in `daily_reviews.ai_summary`  
**DB column**: `daily_reviews.ai_metadata` holds raw prompt/response metadata  

### 2. Weekly Digest
**Trigger**: `pg_cron` every Sunday at 20:00 IST  
**Edge Function**: `weekly-digest`  
**Context sent**: All 7 daily reviews; habit streaks; study hours by subject; chess session count; guitar practice minutes; goal progress delta  
**Output**: Writes `weekly_reviews.ai_summary`; creates a `notifications` row  
**Pattern**: Server-initiated, no user interaction required  

### 3. Spaced Repetition Scheduler
**Trigger**: `pg_cron` daily + after each revision completion  
**Edge Function**: `spaced-repetition`  
**Algorithm**: SM-2 (implemented in pure SQL/Deno — no LLM needed here)  
**AI hook**: `ai_metadata` on `revisions` stores AI-generated "why this chapter needs review" insight (future: uses LLM to explain weakness patterns)  

### 4. Study Coach Chat
**Trigger**: User opens AI chat panel on any page  
**Edge Function**: `ai-chat` (streaming)  
**Context injected per domain**:  
- Academics: current subject, chapter understanding levels, recent mock scores, upcoming revision schedule  
- Chess: recent session types, current rating, accuracy trend  
- Guitar: songs in progress, BPM progression, practice streaks  
- Startup: active project stage, recent features shipped, KPI trends  
**DB**: Each message stored in `ai_conversations`; `conversation_id` groups a session  
**Streaming**: Edge Function uses `TransformStream` to stream tokens back to client  

### 5. Achievement Detection
**Trigger**: DB trigger after insert on `habit_logs`, `mock_tests`, `chess_ratings`, etc.  
**Edge Function**: `compute-achievements`  
**No LLM needed**: Rule-based logic (e.g. "7-day streak → streak achievement"; "mock test > 90% → milestone")  
**AI hook**: Future — generate personalised achievement descriptions using GPT-4o mini  

### 6. Goal Decomposition Assistant
**Trigger**: User creates a new goal and clicks "Help me plan this"  
**Edge Function**: `ai-chat` (one-shot)  
**Input**: Goal title, domain, target date  
**Output**: Suggested list of sub-goals and tasks (returned as JSON, user approves before insert)  
**Pattern**: Human-in-the-loop — AI suggests, user confirms, app writes  

### 7. Semantic Search over Past AI Conversations
**Trigger**: User types in AI chat panel  
**Flow**:  
  1. Client sends query to Edge Function  
  2. Edge Function calls OpenAI embeddings API  
  3. Queries `ai_conversations` via `pgvector` cosine similarity  
  4. Injects top-k relevant past messages as context  
**DB column**: `ai_conversations.embedding vector(1536)`  
**Index**: IVFFlat approximate nearest-neighbour  

### 8. Personalised Insights Widget (Dashboard)
**Trigger**: Daily on login / on-demand  
**Edge Function**: `ai-chat`  
**Context**: All domain KPIs for the past 7 days  
**Output**: 1–3 insight cards (e.g. "You study 2x more Physics when you sleep before midnight") stored in `notifications` with `type = 'ai_insight'`  

---

## Edge Function Template

```typescript
// supabase/functions/ai-chat/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import OpenAI from 'npm:openai';
import { createClient } from 'npm:@supabase/supabase-js';

const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY')! });

serve(async (req) => {
  const { conversationId, domain, userMessage, contextSnapshot } = await req.json();

  // Auth
  const authHeader = req.headers.get('Authorization')!;
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  // Fetch conversation history (last 20 messages)
  const { data: history } = await supabase
    .from('ai_conversations')
    .select('role, content')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(20);

  // Build messages
  const messages = [
    {
      role: 'system' as const,
      content: buildSystemPrompt(domain, contextSnapshot),
    },
    ...(history ?? []).map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    { role: 'user' as const, content: userMessage },
  ];

  // Save user message
  await supabase.from('ai_conversations').insert({
    user_id: user.id,
    conversation_id: conversationId,
    domain,
    role: 'user',
    content: userMessage,
    context: contextSnapshot,
  });

  // Call OpenAI (streaming)
  const stream = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    stream: true,
  });

  // Stream response back + collect full text
  const encoder = new TextEncoder();
  let fullResponse = '';

  const readableStream = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content ?? '';
        fullResponse += text;
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
      }
      controller.close();

      // Save assistant message after stream completes
      await supabase.from('ai_conversations').insert({
        user_id: user.id,
        conversation_id: conversationId,
        domain,
        role: 'assistant',
        content: fullResponse,
        context: contextSnapshot,
        model: 'gpt-4o-mini',
      });
    },
  });

  return new Response(readableStream, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
  });
});

function buildSystemPrompt(domain: string | null, ctx: Record<string, unknown>): string {
  return `You are ASCEND, a personal achievement coach for an ambitious student.
Domain focus: ${domain ?? 'all domains'}.
Current context: ${JSON.stringify(ctx)}
Be specific, actionable, and direct. No generic advice. Max 3 sentences unless asked for more.`;
}
```

---

## ai_metadata Column Usage

Every table has an `ai_metadata jsonb` column. Convention:

```json
{
  "last_insight": "2026-06-11T12:00:00Z",
  "insight_text": "Your Physics understanding dipped after 3 chapters without revision.",
  "embedding_version": "text-embedding-3-small",
  "tags": ["weakness", "revision_needed"]
}
```

This allows AI features to annotate any entity without schema changes.
