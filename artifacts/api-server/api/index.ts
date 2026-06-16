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

// Auth — get current user
app.get('/api/auth/user', async (req: Request, res: Response) => {
  const accessToken = req.cookies?.['sb-access-token'] as string | undefined;
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

export default app;
