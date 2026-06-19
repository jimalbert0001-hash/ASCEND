import express, { type Request, type Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import pino from 'pino';
import { createClient } from '@supabase/supabase-js';

// ── Logger ────────────────────────────────────────────────────────────────────

const isProduction = process.env.NODE_ENV === 'production';

const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  redact: [
    'req.headers.authorization',
    'req.headers.cookie',
    "res.headers['set-cookie']",
  ],
  ...(isProduction
    ? {}
    : {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true },
        },
      }),
});

// ── Supabase ──────────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY environment variables are required');
}

function createSupabaseServerClient(req: Request, res: Response) {
  return createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: true,
      detectSessionInUrl: false,
      storage: {
        getItem: (key: string) => req.cookies?.[key] ?? null,
        setItem: (key: string, value: string) => {
          res.cookie(key, value, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7 * 1000,
            path: '/',
          });
        },
        removeItem: (key: string) => {
          res.clearCookie(key, { path: '/' });
        },
      },
    },
  });
}

// ── App ───────────────────────────────────────────────────────────────────────

const app = express();

const ALLOWED_ORIGINS: string[] = [
  'https://ascend-frontend-git-main-ascend-v1.vercel.app',
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
];

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split('?')[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin) || /\.vercel\.app$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin not allowed — ${origin}`));
    }
  },
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ────────────────────────────────────────────────────────────────────

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://ascend-frontend-git-main-ascend-v1.vercel.app';
const API_URL = process.env.API_URL || 'http://localhost:3000';

// Health
app.get('/api/healthz', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Auth — login
app.get('/api/login', async (req: Request, res: Response) => {
  const supabase = createSupabaseServerClient(req, res);
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${API_URL}/api/auth/callback`,
      skipBrowserRedirect: true,
    },
  });
  if (error || !data.url) {
    res.status(500).json({ error: 'Failed to generate login URL' });
    return;
  }
  res.redirect(data.url);
});

// Auth — OAuth callback
app.get('/api/auth/callback', async (req: Request, res: Response) => {
  const code = req.query['code'] as string | undefined;
  if (!code) {
    res.redirect(`${FRONTEND_URL}/login?error=no_code`);
    return;
  }
  const supabase = createSupabaseServerClient(req, res);
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.session) {
    res.redirect(`${FRONTEND_URL}/login?error=auth_failed`);
    return;
  }
  res.cookie('sb-access-token', data.session.access_token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 1000,
    path: '/',
  });
  res.cookie('sb-refresh-token', data.session.refresh_token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 * 1000,
    path: '/',
  });
  res.redirect(FRONTEND_URL);
});

// Auth — email/password login
app.post('/api/login', async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }
  const supabase = createSupabaseServerClient(req, res);
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    res.status(401).json({ error: error?.message ?? 'Invalid email or password' });
    return;
  }
  res.json({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  });
});

// Auth — refresh token
app.post('/api/auth/refresh', async (req: Request, res: Response) => {
  const { refresh_token } = req.body as { refresh_token?: string };
  if (!refresh_token) {
    res.status(400).json({ error: 'refresh_token is required' });
    return;
  }
  const supabase = createSupabaseServerClient(req, res);
  const { data, error } = await supabase.auth.refreshSession({ refresh_token });
  if (error || !data.session) {
    res.status(401).json({ error: error?.message ?? 'Could not refresh session' });
    return;
  }
  res.json({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    user: data.user
      ? {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.['full_name'] ?? data.user.user_metadata?.['name'] ?? null,
          profileImageUrl: data.user.user_metadata?.['avatar_url'] ?? null,
        }
      : null,
  });
});

// Auth — get current user
app.get('/api/auth/user', async (req: Request, res: Response) => {
  // Accept token from Authorization header (Bearer) or cookie
  const authHeader = req.headers['authorization'] as string | undefined;
  const accessToken =
    (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined) ??
    (req.cookies?.['sb-access-token'] as string | undefined);
  const refreshToken = req.cookies?.['sb-refresh-token'] as string | undefined;

  if (!accessToken) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  const supabase = createSupabaseServerClient(req, res);

  const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);

  if (!userError && userData.user) {
    res.json({
      id: userData.user.id,
      email: userData.user.email,
      name: userData.user.user_metadata?.['full_name'] ?? userData.user.user_metadata?.['name'] ?? null,
      profileImageUrl: userData.user.user_metadata?.['avatar_url'] ?? null,
    });
    return;
  }

  if (refreshToken) {
    const { data: refreshData, error: refreshError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (!refreshError && refreshData.user) {
      if (refreshData.session) {
        res.cookie('sb-access-token', refreshData.session.access_token, {
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          maxAge: 60 * 60 * 1000,
          path: '/',
        });
        res.cookie('sb-refresh-token', refreshData.session.refresh_token, {
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7 * 1000,
          path: '/',
        });
      }
      res.json({
        id: refreshData.user.id,
        email: refreshData.user.email,
        name: refreshData.user.user_metadata?.['full_name'] ?? refreshData.user.user_metadata?.['name'] ?? null,
        profileImageUrl: refreshData.user.user_metadata?.['avatar_url'] ?? null,
      });
      return;
    }
  }

  res.clearCookie('sb-access-token', { path: '/' });
  res.clearCookie('sb-refresh-token', { path: '/' });
  res.status(401).json({ error: 'Session expired' });
});

// Auth — logout
app.get('/api/logout', (_req: Request, res: Response) => {
  res.clearCookie('sb-access-token', { path: '/' });
  res.clearCookie('sb-refresh-token', { path: '/' });
  res.redirect(`${FRONTEND_URL}/login`);
});

// ── AI routes ────────────────────────────────────────────────────────────────

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const DEFAULT_MODEL = 'meta-llama/llama-3.1-8b-instruct';

type CoachRole = 'academic' | 'startup' | 'chess' | 'guitar' | 'achievement';

const SYSTEM_PROMPTS: Record<CoachRole, string> = {
  achievement: `You are an Achievement Coach — a sharp, data-driven mentor who helps ambitious students track progress across all life domains (academics, chess, startup, music, habits). You give concise, actionable advice and motivate with honest assessments. Keep responses focused and under 300 words unless a detailed breakdown is explicitly requested.`,
  academic: `You are an Academic Coach specialising in board exam preparation and spaced-repetition study systems. You help students build effective study schedules, identify weak subjects, and optimise revision strategies. Keep responses practical, specific, and under 300 words.`,
  startup: `You are a Startup Coach for student founders. You help with product strategy, GTM, user acquisition, and balancing studies with building. You give blunt, founder-first advice grounded in lean startup principles. Keep responses under 300 words.`,
  chess: `You are a Chess Coach who helps players improve their rating through targeted training. You advise on openings, tactics, endgame study, and mental game. Give specific, actionable training recommendations. Keep responses under 300 words.`,
  guitar: `You are a Guitar Coach helping students build technique, overcome plateaus, and design effective practice sessions. Give structured, specific practice advice. Keep responses under 300 words.`,
};

const ACTION_INSTRUCTIONS = `

DATA ACCESS: You have full read access to the user's real-time data snapshot provided in USER DATA below. Always reference specific numbers, dates, chapter names, ratings, percentages, and session counts when giving advice — never speak in generics when real data is available. Proactively surface insights like missed sessions, low completion, stagnant ratings, or overdue revisions.

WRITE ACTIONS: When the user explicitly asks you to log, update, or record something, respond naturally AND append exactly one action block at the very end of your message using this exact format:
<ACTION>{"type":"ACTION_TYPE","field":"value"}</ACTION>

Supported action types:
• log_study_session — fields: subjectId (phy/chem/math/eng/cs), subjectName, durationMins (number), sessionType (study/revision/mock_prep), notes
• log_chess_session — fields: focus (tactics/openings/endgames/analysis/blitz/strategy), durationMins (number), notes
• log_guitar_session — fields: focus (chords/scales/songs/technique/fingerpicking), durationMins (number), notes
• mark_chapter_complete — fields: subjectId (phy/chem/math/eng/cs), chapterName (use exact chapter name from the data)
• add_chess_rating — fields: rating (number), platform (lichess/chess.com/otb)
• log_startup_progress — fields: projectName, metric (mrr/users/bugs/milestone), value

Rules: Only include one action block per response. Only include it when the user explicitly requests a change. Do not make up data or invent chapters that don't appear in the snapshot.`;

function getSystemPrompt(role: CoachRole, personalityOverride?: string, context?: string): string {
  const base = SYSTEM_PROMPTS[role] ?? SYSTEM_PROMPTS.achievement;
  const contextSection = context
    ? `\n\nUSER DATA SNAPSHOT:\n${context}`
    : '';
  const combined = `${base}${ACTION_INSTRUCTIONS}${contextSection}`;
  if (personalityOverride?.trim()) {
    return `${combined}\n\nAdditional personality/style guidance: ${personalityOverride.trim()}`;
  }
  return combined;
}

// AI — status
app.get('/api/ai/status', (_req: Request, res: Response) => {
  res.json({
    provider: 'OpenRouter',
    configured: true,
    envVar: 'OPENAI_API_KEY',
  });
});

// ── Server-side context builder ───────────────────────────────────────────────

async function buildContextFromSupabase(userId: string, accessToken: string): Promise<string> {
  const db = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  async function q<T = Record<string, unknown>>(
    fn: () => { then: (cb: (v: { data: T[] | null; error: unknown }) => T[]) => Promise<T[]> }
  ): Promise<T[]> {
    try { return await (fn() as unknown as Promise<{ data: T[] | null; error: unknown }>).then(r => r.data ?? []); }
    catch { return []; }
  }

  const [studySessions, chessSessions, ratings, guitarSessions, songs, projects] = await Promise.all([
    q(() => db.from('study_sessions').select('subject_id,duration_mins,session_type,started_at,notes')
      .eq('user_id', userId).order('started_at', { ascending: false }).limit(10) as unknown as Promise<{ data: Record<string, unknown>[] | null; error: unknown }>),
    q(() => db.from('chess_training_sessions').select('*')
      .eq('user_id', userId).order('date', { ascending: false }).limit(5) as unknown as Promise<{ data: Record<string, unknown>[] | null; error: unknown }>),
    q(() => db.from('chess_rating_history').select('date,rating,platform')
      .eq('user_id', userId).order('date', { ascending: false }).limit(5) as unknown as Promise<{ data: Record<string, unknown>[] | null; error: unknown }>),
    q(() => db.from('guitar_practice_sessions').select('*')
      .eq('user_id', userId).order('date', { ascending: false }).limit(5) as unknown as Promise<{ data: Record<string, unknown>[] | null; error: unknown }>),
    q(() => db.from('guitar_songs').select('title,status').eq('user_id', userId) as unknown as Promise<{ data: Record<string, unknown>[] | null; error: unknown }>),
    q(() => db.from('startup_projects').select('name,stage,description').eq('user_id', userId).limit(5) as unknown as Promise<{ data: Record<string, unknown>[] | null; error: unknown }>),
  ]);

  const totalStudyMins = studySessions.reduce((s, r) => s + (Number(r['duration_mins']) || 0), 0);
  const totalGuitarMins = guitarSessions.reduce((s, r) => s + (Number(r['duration_mins'] ?? r['durationMins']) || 0), 0);
  const latestRating = ratings[0]?.['rating'] ?? null;

  const snapshot = {
    academics: {
      totalStudyHours: Math.round((totalStudyMins / 60) * 10) / 10,
      recentSessions: studySessions.map(s => ({
        subjectId: s['subject_id'],
        durationMins: s['duration_mins'],
        type: s['session_type'],
        date: String(s['started_at'] ?? '').slice(0, 10),
        notes: s['notes'] ?? null,
      })),
    },
    chess: {
      latestRating,
      ratingHistory: ratings.slice(0, 5).map(r => ({ date: r['date'], rating: r['rating'], platform: r['platform'] })),
      recentSessions: chessSessions.map(s => ({
        date: s['date'] ?? s['session_date'] ?? s['sessionDate'],
        focus: s['focus'] ?? s['focus_area'] ?? s['focusArea'],
        durationMins: s['duration_mins'] ?? s['durationMins'],
      })),
    },
    guitar: {
      totalPracticeHours: Math.round((totalGuitarMins / 60) * 10) / 10,
      recentSessions: guitarSessions.map(s => ({
        date: s['date'],
        focus: s['focus'],
        durationMins: s['duration_mins'] ?? s['durationMins'],
      })),
      songs: {
        learning: songs.filter(s => s['status'] === 'learning').map(s => s['title']),
        repertoire: songs.filter(s => s['status'] === 'repertoire').map(s => s['title']),
        polished: songs.filter(s => s['status'] === 'polished').map(s => s['title']),
      },
    },
    startup: {
      projects: projects.map(p => ({
        name: p['name'],
        stage: p['stage'],
        description: String(p['description'] ?? '').slice(0, 120),
      })),
    },
  };

  return JSON.stringify(snapshot, null, 2);
}

// AI — user context (authenticated — returns real DB snapshot)
const EMPTY_STATS = { studyHours: 0, chessRating: 0, habitStreak: 0 };

app.get('/api/ai/context', async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store');
  const accessToken = getAccessToken(req);
  if (!accessToken) {
    res.json({ reviews: { lastDailyScore: 0 }, user: { name: 'User', stats: EMPTY_STATS, activeDomains: [] }, goals: [], tasks: [] });
    return;
  }
  const verifyClient = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
  const { data: userData, error } = await verifyClient.auth.getUser(accessToken);
  if (error || !userData.user) {
    res.json({ reviews: { lastDailyScore: 0 }, user: { name: 'User', stats: EMPTY_STATS, activeDomains: [] }, goals: [], tasks: [] });
    return;
  }
  const userId = userData.user.id;
  const contextJson = await buildContextFromSupabase(userId, accessToken);
  const snapshot = JSON.parse(contextJson) as Record<string, unknown>;
  const academics = snapshot['academics'] as { totalStudyHours?: number } | undefined;
  const chess = snapshot['chess'] as { latestRating?: number | null } | undefined;
  res.json({
    ...snapshot,
    user: {
      id: userId,
      name: userData.user.user_metadata?.['full_name'] ?? userData.user.email ?? 'User',
      stats: {
        studyHours: academics?.totalStudyHours ?? 0,
        chessRating: (chess?.latestRating ?? 0) as number,
        habitStreak: 0,
      },
      activeDomains: [],
    },
  });
});

// AI — chat (streaming + non-streaming)
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: 'Set OPENAI_API_KEY to enable AI responses' });
    return;
  }

  const { messages, role, stream, personalityOverride, context: clientContext } = req.body as {
    messages: Array<{ role: 'user' | 'assistant'; content: string }>;
    role: CoachRole;
    userId?: string;
    stream?: boolean;
    personalityOverride?: string;
    context?: string;
  };

  // Build context server-side when the user is authenticated (preferred — reads real DB data).
  // Fall back to whatever context the client passed when no token is present.
  let context = clientContext;
  const accessToken = getAccessToken(req);
  if (accessToken) {
    try {
      const verifyClient = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
      const { data: userData } = await verifyClient.auth.getUser(accessToken);
      if (userData?.user?.id) {
        context = await buildContextFromSupabase(userData.user.id, accessToken);
      }
    } catch {
      // ignore — fall back to clientContext
    }
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'messages array is required' });
    return;
  }

  const systemPrompt = getSystemPrompt(role ?? 'achievement', personalityOverride, context);

  const payload = {
    model: DEFAULT_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
    ],
    stream: Boolean(stream),
  };

  try {
    const upstream = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.FRONTEND_URL ?? 'https://ascend-ascend.vercel.app',
        'X-Title': 'Ascend AI Mentor',
      },
      body: JSON.stringify(payload),
    });

    if (!upstream.ok) {
      const errText = await upstream.text().catch(() => upstream.statusText);
      res.status(upstream.status).json({ error: `OpenRouter error: ${errText}` });
      return;
    }

    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const reader = upstream.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let promptTokens = 0;
      let completionTokens = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') {
            if (promptTokens > 0 || completionTokens > 0) {
              res.write(`data: ${JSON.stringify({ usage: { promptTokens, completionTokens, totalTokens: promptTokens + completionTokens } })}\n\n`);
            }
            res.write('data: [DONE]\n\n');
            res.end();
            return;
          }
          try {
            const parsed = JSON.parse(data) as {
              choices?: Array<{ delta?: { content?: string } }>;
              usage?: { prompt_tokens?: number; completion_tokens?: number };
            };
            const chunk = parsed.choices?.[0]?.delta?.content;
            if (chunk) res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
            if (parsed.usage) {
              promptTokens = parsed.usage.prompt_tokens ?? 0;
              completionTokens = parsed.usage.completion_tokens ?? 0;
            }
          } catch {
            // skip malformed SSE lines
          }
        }
      }

      res.write('data: [DONE]\n\n');
      res.end();
    } else {
      const data = await upstream.json() as {
        choices?: Array<{ message?: { content?: string } }>;
        usage?: { prompt_tokens?: number; completion_tokens?: number };
      };
      const content = data.choices?.[0]?.message?.content ?? '';
      const usage = data.usage
        ? {
            promptTokens: data.usage.prompt_tokens ?? 0,
            completionTokens: data.usage.completion_tokens ?? 0,
            totalTokens: (data.usage.prompt_tokens ?? 0) + (data.usage.completion_tokens ?? 0),
          }
        : undefined;
      res.json({ content, usage });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: `Failed to reach AI provider: ${message}` });
  }
});

// AI — daily recommendations
app.post('/api/ai/recommendations/daily', async (req: Request, res: Response) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) { res.status(503).json({ error: 'Set OPENAI_API_KEY to enable AI responses' }); return; }
  try {
    const upstream = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}`, 'HTTP-Referer': process.env.FRONTEND_URL ?? 'https://ascend-ascend.vercel.app', 'X-Title': 'Ascend AI Mentor' },
      body: JSON.stringify({ model: DEFAULT_MODEL, messages: [{ role: 'system', content: 'You are an achievement coach. Respond ONLY with valid JSON — no markdown, no prose.' }, { role: 'user', content: 'Generate 3 daily recommendations as JSON: { "recommendations": [{ "id": string, "domain": string, "title": string, "detail": string, "priority": "high"|"medium"|"low", "type": "action"|"insight"|"warning"|"celebration" }], "morningBriefing": string }' }] }),
    });
    if (!upstream.ok) { res.status(upstream.status).json({ error: 'AI provider error' }); return; }
    const data = await upstream.json() as { choices?: Array<{ message?: { content?: string } }> };
    res.json(JSON.parse(data.choices?.[0]?.message?.content ?? '{}'));
  } catch { res.status(500).json({ error: 'Failed to generate recommendations' }); }
});

// AI — weekly recommendations
app.post('/api/ai/recommendations/weekly', async (req: Request, res: Response) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) { res.status(503).json({ error: 'Set OPENAI_API_KEY to enable AI responses' }); return; }
  try {
    const upstream = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}`, 'HTTP-Referer': process.env.FRONTEND_URL ?? 'https://ascend-ascend.vercel.app', 'X-Title': 'Ascend AI Mentor' },
      body: JSON.stringify({ model: DEFAULT_MODEL, messages: [{ role: 'system', content: 'You are an achievement coach. Respond ONLY with valid JSON — no markdown, no prose.' }, { role: 'user', content: 'Generate 5 weekly recommendations as JSON: { "recommendations": [{ "id": string, "domain": string, "title": string, "detail": string, "priority": "high"|"medium"|"low", "type": "action"|"insight"|"warning"|"celebration" }], "weeklyDigest": string }' }] }),
    });
    if (!upstream.ok) { res.status(upstream.status).json({ error: 'AI provider error' }); return; }
    const data = await upstream.json() as { choices?: Array<{ message?: { content?: string } }> };
    res.json(JSON.parse(data.choices?.[0]?.message?.content ?? '{}'));
  } catch { res.status(500).json({ error: 'Failed to generate weekly recommendations' }); }
});

// AI — weakness detection
app.post('/api/ai/recommendations/weaknesses', async (req: Request, res: Response) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) { res.status(503).json({ error: 'Set OPENAI_API_KEY to enable AI responses' }); return; }
  try {
    const upstream = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}`, 'HTTP-Referer': process.env.FRONTEND_URL ?? 'https://ascend-ascend.vercel.app', 'X-Title': 'Ascend AI Mentor' },
      body: JSON.stringify({ model: DEFAULT_MODEL, messages: [{ role: 'system', content: 'You are an achievement coach. Respond ONLY with valid JSON — no markdown, no prose.' }, { role: 'user', content: 'Identify 3 weaknesses as JSON: { "weaknesses": [{ "domain": string, "weakness": string, "evidence": string, "suggestion": string, "severity": "critical"|"moderate"|"minor" }] }' }] }),
    });
    if (!upstream.ok) { res.status(upstream.status).json({ error: 'AI provider error' }); return; }
    const data = await upstream.json() as { choices?: Array<{ message?: { content?: string } }> };
    res.json(JSON.parse(data.choices?.[0]?.message?.content ?? '{}'));
  } catch { res.status(500).json({ error: 'Failed to detect weaknesses' }); }
});

// AI — goal analysis
app.post('/api/ai/analyze/goals', async (req: Request, res: Response) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) { res.status(503).json({ error: 'Set OPENAI_API_KEY to enable AI responses' }); return; }
  try {
    const upstream = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}`, 'HTTP-Referer': process.env.FRONTEND_URL ?? 'https://ascend-ascend.vercel.app', 'X-Title': 'Ascend AI Mentor' },
      body: JSON.stringify({ model: DEFAULT_MODEL, messages: [{ role: 'system', content: 'You are an achievement coach. Respond ONLY with valid JSON — no markdown, no prose.' }, { role: 'user', content: 'Analyse 3 sample goals as JSON: { "analyses": [{ "goalId": string, "goalTitle": string, "domain": string, "progress": number, "assessment": string, "blockers": string[], "nextSteps": string[], "projectedCompletion": string, "riskLevel": "on-track"|"at-risk"|"off-track" }] }' }] }),
    });
    if (!upstream.ok) { res.status(upstream.status).json({ error: 'AI provider error' }); return; }
    const data = await upstream.json() as { choices?: Array<{ message?: { content?: string } }> };
    res.json(JSON.parse(data.choices?.[0]?.message?.content ?? '{}'));
  } catch { res.status(500).json({ error: 'Failed to analyse goals' }); }
});

// ── Chess routes ──────────────────────────────────────────────────────────────

function getAccessToken(req: Request): string | undefined {
  const authHeader = req.headers['authorization'] as string | undefined;
  return (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined)
    ?? (req.cookies?.['sb-access-token'] as string | undefined);
}

interface ChessGameInput {
  id: string;
  platform: string;
  externalId?: string;
  pgn?: string;
  fen?: string;
  result: string;
  playerColor: string;
  playerRating?: number;
  opponentUsername?: string;
  opponentRating?: number;
  openingName?: string;
  openingEco?: string;
  timeControl?: string;
  gameDurationSecs?: number;
  gameDate: string;
  movesCount?: number;
  isAnalyzed?: boolean;
  accuracy?: number;
  bestMove?: string;
  worstMove?: string;
  analysisNotes?: string;
}

function mapGameRow(g: Record<string, unknown>): Record<string, unknown> {
  return {
    id: g['id'],
    platform: g['platform'],
    externalId: g['external_id'],
    pgn: g['pgn'],
    fen: g['fen'],
    result: g['result'],
    playerColor: g['player_color'],
    playerRating: g['player_rating'],
    opponentUsername: g['opponent_username'],
    opponentRating: g['opponent_rating'],
    openingName: g['opening_name'],
    openingEco: g['opening_eco'],
    timeControl: g['time_control'],
    gameDurationSecs: g['game_duration_secs'],
    gameDate: g['game_date'],
    movesCount: g['moves_count'],
    isAnalyzed: g['is_analyzed'],
    accuracy: g['accuracy'],
    bestMove: g['best_move'],
    worstMove: g['worst_move'],
    analysisNotes: g['analysis_notes'],
  };
}

// Chess Accounts — GET
app.get('/api/chess/accounts/:userId', async (req: Request, res: Response) => {
  const accessToken = getAccessToken(req);
  if (!accessToken) { res.status(401).json({ error: 'Not authenticated' }); return; }
  try {
    const db = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    });
    const { data, error } = await db.from('chess_accounts').select('*').eq('user_id', req.params['userId']).maybeSingle();
    if (error) {
      logger.error({ err: error.message, table: 'chess_accounts', userId: req.params['userId'] }, 'chess_accounts SELECT failed');
      res.status(500).json({ error: error.message });
      return;
    }
    res.json({
      chesscomUsername: (data as Record<string, unknown> | null)?.['chesscom_username'] ?? '',
      lichessUsername: (data as Record<string, unknown> | null)?.['lichess_username'] ?? '',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error({ err: message, route: '/api/chess/accounts/:userId' }, 'Unexpected exception');
    res.status(500).json({ error: message });
  }
});

// Chess Accounts — PUT (upsert)
app.put('/api/chess/accounts/:userId', async (req: Request, res: Response) => {
  const accessToken = getAccessToken(req);
  if (!accessToken) { res.status(401).json({ error: 'Not authenticated' }); return; }
  const db = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
  const { chesscomUsername, lichessUsername } = req.body as { chesscomUsername?: string; lichessUsername?: string };
  const { error } = await db.from('chess_accounts').upsert({
    user_id: req.params['userId'],
    chesscom_username: chesscomUsername ?? '',
    lichess_username: lichessUsername ?? '',
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });
  if (error) {
    logger.error({
      err: error.message,
      errFull: error,
      code: error.code,
      details: error.details,
      hint: error.hint,
      userId: req.params['userId'],
      route: 'PUT /api/chess/accounts/:userId',
    }, 'chess_accounts upsert failed');
    res.status(500).json({ error: error.message, code: error.code, details: error.details });
    return;
  }
  res.json({ ok: true });
});

// Chess Games — GET (with optional ?platform= filter)
app.get('/api/chess/games/:userId', async (req: Request, res: Response) => {
  const accessToken = getAccessToken(req);
  if (!accessToken) { res.status(401).json({ error: 'Not authenticated' }); return; }
  try {
    const db = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    });
    let query = db.from('chess_games').select('*').eq('user_id', req.params['userId']).order('game_date', { ascending: false });
    if (req.query['platform']) {
      query = query.eq('platform', req.query['platform'] as string);
    }
    const { data, error } = await query;
    if (error) {
      logger.error({
        err: error.message,
        errFull: error,
        code: error.code,
        details: error.details,
        hint: error.hint,
        table: 'chess_games',
        userId: req.params['userId'],
      }, 'chess_games SELECT failed');
      res.status(500).json({ error: error.message, code: error.code, details: error.details });
      return;
    }
    logger.info({
      userId: req.params['userId'],
      rowCount: (data ?? []).length,
      platformFilter: req.query['platform'] ?? 'all',
    }, 'chess_games GET success');
    res.json((data ?? []).map(g => mapGameRow(g as Record<string, unknown>)));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error({ err: message, route: '/api/chess/games/:userId' }, 'Unexpected exception');
    res.status(500).json({ error: message });
  }
});

// Chess Games — POST (bulk save/upsert)
app.post('/api/chess/games/:userId', async (req: Request, res: Response) => {
  const accessToken = getAccessToken(req);
  if (!accessToken) { res.status(401).json({ error: 'Not authenticated' }); return; }
  const db = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
  const { games = [] } = req.body as { games?: ChessGameInput[] };
  if (!Array.isArray(games) || games.length === 0) { res.json({ ok: true, count: 0 }); return; }
  const rows = games.map((g: ChessGameInput) => ({
    id: g.id,
    user_id: req.params['userId'],
    platform: g.platform,
    external_id: g.externalId ?? null,
    pgn: g.pgn ?? null,
    fen: g.fen ?? null,
    result: g.result,
    player_color: g.playerColor,
    player_rating: g.playerRating ?? null,
    opponent_username: g.opponentUsername ?? null,
    opponent_rating: g.opponentRating ?? null,
    opening_name: g.openingName ?? null,
    opening_eco: g.openingEco ?? null,
    time_control: g.timeControl ?? null,
    game_duration_secs: g.gameDurationSecs ?? null,
    game_date: g.gameDate,
    moves_count: g.movesCount ?? null,
    is_analyzed: g.isAnalyzed ?? false,
    accuracy: g.accuracy ?? null,
    best_move: g.bestMove ?? null,
    worst_move: g.worstMove ?? null,
    analysis_notes: g.analysisNotes ?? null,
  }));
  const { error } = await db.from('chess_games').upsert(rows, { onConflict: 'id' });
  if (error) {
    logger.error({
      err: error.message,
      errFull: error,
      code: error.code,
      details: error.details,
      hint: error.hint,
      userId: req.params['userId'],
      rowCount: rows.length,
    }, 'chess_games upsert failed');
    res.status(500).json({ error: error.message, code: error.code, details: error.details });
    return;
  }
  logger.info({
    userId: req.params['userId'],
    rowCount: rows.length,
  }, 'chess_games POST success');
  res.json({ ok: true, count: rows.length });
});

// Chess Games — PUT analysis for a specific game
app.put('/api/chess/games/:userId/:gameId/analysis', async (req: Request, res: Response) => {
  const accessToken = getAccessToken(req);
  if (!accessToken) { res.status(401).json({ error: 'Not authenticated' }); return; }
  const db = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
  const { accuracy, bestMove, worstMove, analysisNotes } = req.body as {
    accuracy?: number; bestMove?: string; worstMove?: string; analysisNotes?: string;
  };
  const { error } = await db.from('chess_games').update({
    is_analyzed: true,
    accuracy: accuracy ?? null,
    best_move: bestMove ?? null,
    worst_move: worstMove ?? null,
    analysis_notes: analysisNotes ?? null,
  }).eq('id', req.params['gameId']).eq('user_id', req.params['userId']);
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json({ ok: true });
});

// Chess Stats — GET (computed from stored games + rating history)
app.get('/api/chess/stats/:userId', async (req: Request, res: Response) => {
  const accessToken = getAccessToken(req);
  if (!accessToken) { res.status(401).json({ error: 'Not authenticated' }); return; }
  const db = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
  const [gamesRes, ratingRes] = await Promise.all([
    db.from('chess_games').select('result, opening_name, game_date').eq('user_id', req.params['userId']),
    db.from('chess_rating_history').select('date, rating, platform').eq('user_id', req.params['userId']).order('date', { ascending: true }),
  ]);
  if (gamesRes.error) { res.status(500).json({ error: gamesRes.error.message }); return; }
  const games = (gamesRes.data ?? []) as Array<{ result: string; opening_name: string | null; game_date: string }>;
  const wins = games.filter(g => g.result === 'win').length;
  const losses = games.filter(g => g.result === 'loss').length;
  const draws = games.filter(g => g.result === 'draw').length;
  const total = games.length;
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
  const openingCounts: Record<string, number> = {};
  for (const g of games) {
    if (g.opening_name) openingCounts[g.opening_name] = (openingCounts[g.opening_name] ?? 0) + 1;
  }
  const topOpenings = Object.entries(openingCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));
  const hourMap: Record<number, { wins: number; losses: number; draws: number; total: number }> = {};
  for (const g of games) {
    const hour = new Date(g.game_date).getUTCHours();
    if (!hourMap[hour]) hourMap[hour] = { wins: 0, losses: 0, draws: 0, total: 0 };
    hourMap[hour].total++;
    if (g.result === 'win') hourMap[hour].wins++;
    else if (g.result === 'loss') hourMap[hour].losses++;
    else hourMap[hour].draws++;
  }
  const hourPerformance = Object.entries(hourMap)
    .map(([h, v]) => ({ hour: Number(h), ...v }))
    .sort((a, b) => a.hour - b.hour);
  const ratingRows = (ratingRes.data ?? []) as Array<{ date: string; rating: number; platform: string }>;
  const ratingTimeline = ratingRows.map(r => ({ date: r.date, rating: r.rating, platform: r.platform }));
  res.json({ wins, losses, draws, total, winRate, topOpenings, hourPerformance, ratingTimeline });
});

// ── Data routes ───────────────────────────────────────────────────────────────

// Goals — GET
app.get('/api/data/goals', (_req: Request, res: Response) => {
  res.json([]);
});

// Goals — PUT (upsert all goals for a user; no DB schema yet so echo back)
app.put('/api/data/goals', (req: Request, res: Response) => {
  const { goals = [] } = req.body as { userId?: string; goals?: unknown[] };
  res.json(goals);
});

// ── Helper: verify token and return userId ────────────────────────────────────

async function requireUser(req: Request, res: Response): Promise<string | null> {
  const accessToken = getAccessToken(req);
  if (!accessToken) { res.status(401).json({ error: 'Not authenticated' }); return null; }
  try {
    const verifyClient = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
    const { data, error } = await verifyClient.auth.getUser(accessToken);
    if (error || !data.user) {
      logger.warn({ err: error?.message ?? 'no user returned', path: req.path }, 'requireUser: auth verification failed');
      res.status(401).json({ error: 'Invalid or expired token' });
      return null;
    }
    return data.user.id;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error({ err: message, path: req.path }, 'requireUser: unexpected exception during auth.getUser');
    res.status(401).json({ error: 'Auth verification error' });
    return null;
  }
}

// ── Academics data routes ─────────────────────────────────────────────────────

// GET /api/data/academics — study sessions + computed total hours
app.get('/api/data/academics', async (req: Request, res: Response) => {
  const accessToken = getAccessToken(req);
  if (!accessToken) { res.status(401).json({ error: 'Not authenticated' }); return; }
  const userId = await requireUser(req, res);
  if (!userId) return;
  const db = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
  const { data, error } = await db
    .from('study_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .limit(100);
  if (error) { res.status(500).json({ error: error.message }); return; }
  const rows = (data ?? []) as Array<Record<string, unknown>>;
  const sessions = rows.map(s => ({
    id: s['id'],
    subjectId: s['subject_id'],
    chapterId: s['chapter_id'],
    startedAt: s['started_at'],
    endedAt: s['ended_at'],
    durationMins: s['duration_mins'],
    sessionType: s['session_type'],
    focusScore: s['focus_score'],
    notes: s['notes'],
  }));
  const totalMins = sessions.reduce((sum, s) => sum + (Number(s.durationMins) || 0), 0);
  const totalHours = Math.round((totalMins / 60) * 10) / 10;
  res.json({ sessions, totalHours });
});

// POST /api/data/academics — save/upsert a study session
app.post('/api/data/academics', async (req: Request, res: Response) => {
  const accessToken = getAccessToken(req);
  if (!accessToken) { res.status(401).json({ error: 'Not authenticated' }); return; }
  const userId = await requireUser(req, res);
  if (!userId) return;
  const db = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
  const body = req.body as {
    subjectId?: string; chapterId?: string; durationMins?: number;
    sessionType?: string; focusScore?: number; notes?: string;
  };
  const row = {
    id: crypto.randomUUID(),
    user_id: userId,
    subject_id: body.subjectId ?? null,
    chapter_id: body.chapterId ?? null,
    started_at: new Date(Date.now() - (body.durationMins ?? 0) * 60000).toISOString(),
    ended_at: new Date().toISOString(),
    duration_mins: body.durationMins ?? 0,
    session_type: body.sessionType ?? 'study',
    focus_score: body.focusScore ?? 3,
    notes: body.notes ?? null,
  };
  const { error } = await db.from('study_sessions').insert(row);
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json({ ok: true, id: row.id });
});

// ── Chess data routes ─────────────────────────────────────────────────────────

// GET /api/data/chess — training sessions + rating history + basic stats
app.get('/api/data/chess', async (req: Request, res: Response) => {
  const accessToken = getAccessToken(req);
  if (!accessToken) { res.status(401).json({ error: 'Not authenticated' }); return; }
  const userId = await requireUser(req, res);
  if (!userId) return;
  const db = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
  const [sessionsRes, ratingsRes] = await Promise.all([
    db.from('chess_training_sessions').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(100),
    db.from('chess_rating_history').select('*').eq('user_id', userId).order('date', { ascending: true }),
  ]);
  if (sessionsRes.error) { res.status(500).json({ error: sessionsRes.error.message }); return; }
  const sessionRows = (sessionsRes.data ?? []) as Array<Record<string, unknown>>;
  const ratingRows = (ratingsRes.data ?? []) as Array<Record<string, unknown>>;
  // Map sessions — columns may be camelCase (inserted directly from TrainingSession type)
  // or snake_case depending on how the table was created. Return both forms so consumers work either way.
  const sessions = sessionRows.map(s => ({
    ...s,
    sessionDate: s['session_date'] ?? s['sessionDate'] ?? s['date'],
    durationMins: s['duration_mins'] ?? s['durationMins'],
    focusArea: s['focus_area'] ?? s['focusArea'] ?? s['focus'],
  }));
  const ratings = ratingRows.map(r => ({
    ...r,
    sessionDate: r['date'],
  }));
  // Basic stats
  const totalSessions = sessions.length;
  const totalMins = sessions.reduce((sum, s) => sum + (Number(s.durationMins) || 0), 0);
  const latestRating = ratingRows.length > 0 ? ratingRows[ratingRows.length - 1]?.['rating'] : null;
  const stats = { totalSessions, totalMins, totalHours: Math.round(totalMins / 60), latestRating };
  res.json({ sessions, ratings, stats });
});

// POST /api/data/chess — save a training session
app.post('/api/data/chess', async (req: Request, res: Response) => {
  const accessToken = getAccessToken(req);
  if (!accessToken) { res.status(401).json({ error: 'Not authenticated' }); return; }
  const userId = await requireUser(req, res);
  if (!userId) return;
  const db = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
  const body = req.body as {
    sessionType?: string; durationMins?: number; focus?: string; notes?: string; newRating?: number;
  };
  const today = new Date().toISOString().split('T')[0];
  const row = {
    id: crypto.randomUUID(),
    user_id: userId,
    date: today,
    session_date: today,
    sessionDate: today,
    session_type: body.sessionType ?? 'tactics',
    duration_mins: body.durationMins ?? 0,
    durationMins: body.durationMins ?? 0,
    focus: body.focus ?? null,
    notes: body.notes ?? null,
  };
  const { error } = await db.from('chess_training_sessions').insert(row);
  if (error) { res.status(500).json({ error: error.message }); return; }
  if (body.newRating) {
    await db.from('chess_rating_history').insert({
      id: crypto.randomUUID(),
      user_id: userId,
      date: today,
      rating: body.newRating,
      platform: 'lichess',
    });
  }
  res.json({ ok: true, id: row.id });
});

// ── Guitar data routes ────────────────────────────────────────────────────────

// GET /api/data/guitar — practice sessions + songs + basic stats
app.get('/api/data/guitar', async (req: Request, res: Response) => {
  const accessToken = getAccessToken(req);
  if (!accessToken) { res.status(401).json({ error: 'Not authenticated' }); return; }
  const userId = await requireUser(req, res);
  if (!userId) return;
  const db = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
  const [sessionsRes, songsRes] = await Promise.all([
    db.from('guitar_practice_sessions').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(100),
    db.from('guitar_songs').select('*').eq('user_id', userId).order('start_date', { ascending: false }),
  ]);
  if (sessionsRes.error) { res.status(500).json({ error: sessionsRes.error.message }); return; }
  const sessionRows = (sessionsRes.data ?? []) as Array<Record<string, unknown>>;
  const songRows = (songsRes.data ?? []) as Array<Record<string, unknown>>;
  // Normalise sessions — expose sessionDate for DailyReviewModal compatibility
  const sessions = sessionRows.map(s => ({
    ...s,
    sessionDate: s['session_date'] ?? s['sessionDate'] ?? s['date'],
    durationMins: s['duration_mins'] ?? s['durationMins'],
  }));
  const songs = songRows;
  const totalMins = sessions.reduce((sum, s) => sum + (Number(s.durationMins) || 0), 0);
  const songsLearned = songRows.filter(s => ['repertoire', 'polished'].includes(String(s['status'] ?? ''))).length;
  const stats = {
    totalSessions: sessions.length,
    totalMins,
    totalHours: Math.round(totalMins / 60),
    songsLearned,
  };
  res.json({ sessions, songs, stats });
});

// POST /api/data/guitar — save a practice session
app.post('/api/data/guitar', async (req: Request, res: Response) => {
  const accessToken = getAccessToken(req);
  if (!accessToken) { res.status(401).json({ error: 'Not authenticated' }); return; }
  const userId = await requireUser(req, res);
  if (!userId) return;
  const db = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
  const body = req.body as {
    durationMins?: number; focusAreas?: string[]; notes?: string; qualityScore?: number;
  };
  const today = new Date().toISOString().split('T')[0];
  const focus = (body.focusAreas ?? []).join(', ') || 'general';
  const row = {
    id: crypto.randomUUID(),
    user_id: userId,
    date: today,
    session_date: today,
    sessionDate: today,
    duration_mins: body.durationMins ?? 0,
    durationMins: body.durationMins ?? 0,
    focus,
    notes: body.notes ?? null,
    intensity: 'focused',
  };
  const { error } = await db.from('guitar_practice_sessions').insert(row);
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json({ ok: true, id: row.id });
});

// ── Tasks data route ──────────────────────────────────────────────────────────

// GET /api/data/tasks — placeholder (tasks not yet in DB)
app.get('/api/data/tasks', (_req: Request, res: Response) => {
  res.json({ tasks: [] });
});

// ── AI Action handler routes ──────────────────────────────────────────────────
// These routes let the frontend (and AI-generated actions) write data after
// the AI instructs a change via an <ACTION> block.

// POST /api/actions/log-session — log an academic study session
app.post('/api/actions/log-session', async (req: Request, res: Response) => {
  const accessToken = getAccessToken(req);
  if (!accessToken) { res.status(401).json({ error: 'Not authenticated' }); return; }
  const userId = await requireUser(req, res);
  if (!userId) return;
  const db = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
  const body = req.body as {
    subjectId?: string; subjectName?: string; durationMins?: number;
    sessionType?: string; focusScore?: number; notes?: string; date?: string;
  };
  const started = body.date
    ? new Date(body.date).toISOString()
    : new Date(Date.now() - (body.durationMins ?? 0) * 60000).toISOString();
  const row = {
    id: crypto.randomUUID(),
    user_id: userId,
    subject_id: body.subjectId ?? null,
    chapter_id: null,
    started_at: started,
    ended_at: new Date().toISOString(),
    duration_mins: body.durationMins ?? 60,
    session_type: body.sessionType ?? 'study',
    focus_score: body.focusScore ?? 4,
    notes: body.notes ?? `Logged via AI Mentor — ${body.subjectName ?? body.subjectId ?? 'study'}`,
  };
  const { error } = await db.from('study_sessions').insert(row);
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json({ ok: true, id: row.id, message: `✓ Logged ${body.durationMins ?? 60} min ${body.sessionType ?? 'study'} session for ${body.subjectName ?? body.subjectId ?? 'your subject'}` });
});

// POST /api/actions/mark-chapter — mark a chapter complete by ID or name match
app.post('/api/actions/mark-chapter', async (req: Request, res: Response) => {
  const accessToken = getAccessToken(req);
  if (!accessToken) { res.status(401).json({ error: 'Not authenticated' }); return; }
  const userId = await requireUser(req, res);
  if (!userId) return;
  const db = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
  const body = req.body as { chapterId?: string; chapterName?: string; subjectId?: string };
  if (body.chapterId) {
    const { error } = await db.from('chapters').update({
      is_completed: true,
      completed_at: new Date().toISOString(),
      understanding_level: 3,
    }).eq('id', body.chapterId).eq('user_id', userId);
    if (error) { res.status(500).json({ error: error.message }); return; }
    res.json({ ok: true, message: `✓ Marked chapter as complete` });
    return;
  }
  if (body.chapterName) {
    // Find by name (partial match) within user's chapters
    let query = db.from('chapters').select('id, name').ilike('name', `%${body.chapterName}%`).eq('user_id', userId);
    if (body.subjectId) query = query.eq('subject_id', body.subjectId);
    const { data, error } = await query.limit(1).single();
    if (error || !data) {
      res.status(404).json({ error: `Chapter not found: "${body.chapterName}"` });
      return;
    }
    const chapter = data as Record<string, unknown>;
    await db.from('chapters').update({
      is_completed: true,
      completed_at: new Date().toISOString(),
      understanding_level: 3,
    }).eq('id', chapter['id']);
    res.json({ ok: true, id: chapter['id'], message: `✓ Marked "${chapter['name']}" as complete` });
    return;
  }
  res.status(400).json({ error: 'Provide chapterId or chapterName' });
});

// POST /api/actions/log-chess — log a chess training session
app.post('/api/actions/log-chess', async (req: Request, res: Response) => {
  const accessToken = getAccessToken(req);
  if (!accessToken) { res.status(401).json({ error: 'Not authenticated' }); return; }
  const userId = await requireUser(req, res);
  if (!userId) return;
  const db = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
  const body = req.body as { durationMins?: number; focus?: string; notes?: string; rating?: number; platform?: string };
  const today = new Date().toISOString().split('T')[0];
  const row = {
    id: crypto.randomUUID(),
    user_id: userId,
    date: today,
    sessionDate: today,
    duration_mins: body.durationMins ?? 60,
    durationMins: body.durationMins ?? 60,
    focus: body.focus ?? 'tactics',
    notes: body.notes ?? 'Logged via AI Mentor',
    intensity: 'medium',
  };
  const { error } = await db.from('chess_training_sessions').insert(row);
  if (error) { res.status(500).json({ error: error.message }); return; }
  if (body.rating) {
    await db.from('chess_rating_history').insert({
      id: crypto.randomUUID(),
      user_id: userId,
      date: today,
      rating: body.rating,
      platform: body.platform ?? 'lichess',
      change: 0,
    });
  }
  res.json({ ok: true, id: row.id, message: `✓ Logged ${body.durationMins ?? 60} min chess ${body.focus ?? 'training'} session` });
});

// POST /api/actions/log-guitar — log a guitar practice session
app.post('/api/actions/log-guitar', async (req: Request, res: Response) => {
  const accessToken = getAccessToken(req);
  if (!accessToken) { res.status(401).json({ error: 'Not authenticated' }); return; }
  const userId = await requireUser(req, res);
  if (!userId) return;
  const db = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
  const body = req.body as { durationMins?: number; minutes?: number; focus?: string; notes?: string };
  const durationMins = body.durationMins ?? body.minutes ?? 30;
  const today = new Date().toISOString().split('T')[0];
  const row = {
    id: crypto.randomUUID(),
    user_id: userId,
    date: today,
    sessionDate: today,
    duration_mins: durationMins,
    durationMins,
    focus: body.focus ?? 'technique',
    notes: body.notes ?? 'Logged via AI Mentor',
    intensity: 'focused',
  };
  const { error } = await db.from('guitar_practice_sessions').insert(row);
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json({ ok: true, id: row.id, message: `✓ Logged ${durationMins} min guitar practice (${body.focus ?? 'technique'})` });
});

// POST /api/actions/update-metric — update a startup project metric
app.post('/api/actions/update-metric', async (req: Request, res: Response) => {
  const accessToken = getAccessToken(req);
  if (!accessToken) { res.status(401).json({ error: 'Not authenticated' }); return; }
  const userId = await requireUser(req, res);
  if (!userId) return;
  const db = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
  const body = req.body as { projectName?: string; metric?: string; value?: number | string };
  if (!body.metric || body.value === undefined) {
    res.status(400).json({ error: 'metric and value are required' });
    return;
  }
  const validMetrics: Record<string, string> = { mrr: 'mrr', users: 'users', bugs: 'open_bugs', milestone: 'latest_milestone' };
  const col = validMetrics[body.metric];
  if (!col) { res.status(400).json({ error: `Unknown metric: ${body.metric}` }); return; }
  let query = db.from('startup_projects').update({ [col]: body.value, updated_at: new Date().toISOString() }).eq('user_id', userId);
  if (body.projectName) query = query.ilike('name', `%${body.projectName}%`);
  const { error } = await query;
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json({ ok: true, message: `✓ Updated ${body.metric} to ${body.value}${body.projectName ? ` for ${body.projectName}` : ''}` });
});

// Reset all user data — deletes every row owned by the authenticated user
app.post('/api/data/reset', async (req: Request, res: Response) => {
  const authHeader = req.headers['authorization'] as string | undefined;
  const accessToken =
    (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined) ??
    (req.cookies?.['sb-access-token'] as string | undefined);

  if (!accessToken) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  // Verify the caller
  const verifyClient = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
  const { data: userData, error: userError } = await verifyClient.auth.getUser(accessToken);
  if (userError || !userData.user) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }

  const userId = userData.user.id;

  // Authenticated client — RLS enforces ownership, each delete is scoped to userId
  const db = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  const tables = [
    'goals', 'tasks', 'daily_reviews',
    'study_sessions', 'mock_tests', 'subjects',
    'startup_projects', 'startup_ideas',
    'startup_roadmap', 'startup_features', 'startup_bugs',
    'startup_milestones', 'startup_revenue', 'startup_user_metrics',
    'guitar_practice_sessions', 'guitar_songs', 'guitar_chords',
    'guitar_scales', 'guitar_theory_lessons', 'guitar_recordings', 'guitar_skill_areas',
    'chess_rating_history', 'chess_puzzle_sessions', 'chess_openings',
    'chess_endgame_studies', 'chess_tournaments', 'chess_training_sessions',
    'chess_game_notes', 'chess_accounts',
    'achievements',
  ];

  // Fire all deletes concurrently; ignore individual failures (table may not exist or already empty)
  await Promise.allSettled(
    tables.map((table) => db.from(table).delete().eq('user_id', userId))
  );

  res.json({ ok: true, userId });
});

export default app;
