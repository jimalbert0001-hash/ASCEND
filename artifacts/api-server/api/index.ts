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

function getSystemPrompt(role: CoachRole, personalityOverride?: string): string {
  const base = SYSTEM_PROMPTS[role] ?? SYSTEM_PROMPTS.achievement;
  if (personalityOverride?.trim()) {
    return `${base}\n\nAdditional personality/style guidance: ${personalityOverride.trim()}`;
  }
  return base;
}

// AI — status
app.get('/api/ai/status', (_req: Request, res: Response) => {
  res.json({
    provider: 'OpenRouter',
    configured: true,
    envVar: 'OPENAI_API_KEY',
  });
});

// AI — user context (used by DailyScoreCard and similar widgets)
app.get('/api/ai/context', (_req: Request, res: Response) => {
  res.json({
    reviews: { lastDailyScore: 0 },
    user: { name: 'User', stats: { studyHours: 0, chessRating: 0, habitStreak: 0 }, activeDomains: [] },
    goals: [],
    tasks: [],
  });
});

// AI — chat (streaming + non-streaming)
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: 'Set OPENAI_API_KEY to enable AI responses' });
    return;
  }

  const { messages, role, stream, personalityOverride } = req.body as {
    messages: Array<{ role: 'user' | 'assistant'; content: string }>;
    role: CoachRole;
    userId?: string;
    stream?: boolean;
    personalityOverride?: string;
  };

  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'messages array is required' });
    return;
  }

  const systemPrompt = getSystemPrompt(role ?? 'achievement', personalityOverride);

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

// ── Data routes ───────────────────────────────────────────────────────────────

// Goals — no DB schema defined yet, return empty list
app.get('/api/data/goals', (_req: Request, res: Response) => {
  res.json({ goals: [] });
});

export default app;
