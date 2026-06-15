// @ts-nocheck
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createClient } from '@supabase/supabase-js';

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://ascend-frontend-git-main-ascend-v1.vercel.app';
const API_URL = process.env.API_URL || 'http://localhost:3000';
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

const app = express();

app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function makeSupabase(req: express.Request, res: express.Response) {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: true,
      detectSessionInUrl: false,
      storage: {
        getItem: (key: string) => (req.cookies as Record<string, string>)?.[key] ?? null,
        setItem: (key: string, value: string) => {
          res.cookie(key, value, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 7 * 1000, path: '/' });
        },
        removeItem: (key: string) => {
          res.clearCookie(key, { path: '/' });
        },
      },
    },
  });
}

app.get('/api/healthz', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/login', async (req, res) => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    res.status(500).json({ error: 'Supabase not configured' });
    return;
  }
  const supabase = makeSupabase(req, res);
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

app.get('/api/auth/callback', async (req, res) => {
  const code = req.query['code'] as string | undefined;
  if (!code) {
    res.redirect(`${FRONTEND_URL}/login?error=no_code`);
    return;
  }
  const supabase = makeSupabase(req, res);
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.session) {
    res.redirect(`${FRONTEND_URL}/login?error=auth_failed`);
    return;
  }
  res.cookie('sb-access-token', data.session.access_token, {
    httpOnly: true, secure: true, sameSite: 'lax', maxAge: 60 * 60 * 1000, path: '/',
  });
  res.cookie('sb-refresh-token', data.session.refresh_token, {
    httpOnly: true, secure: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 7 * 1000, path: '/',
  });
  res.redirect(FRONTEND_URL);
});

app.get('/api/auth/user', async (req, res) => {
  const accessToken = (req.cookies as Record<string, string>)?.['sb-access-token'];
  const refreshToken = (req.cookies as Record<string, string>)?.['sb-refresh-token'];

  if (!accessToken) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  const supabase = makeSupabase(req, res);
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
          httpOnly: true, secure: true, sameSite: 'lax', maxAge: 60 * 60 * 1000, path: '/',
        });
        res.cookie('sb-refresh-token', refreshData.session.refresh_token, {
          httpOnly: true, secure: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 7 * 1000, path: '/',
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

app.get('/api/logout', (_req, res) => {
  res.clearCookie('sb-access-token', { path: '/' });
  res.clearCookie('sb-refresh-token', { path: '/' });
  res.redirect(`${FRONTEND_URL}/login`);
});

export default app;
