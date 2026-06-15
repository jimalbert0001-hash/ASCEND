const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { createClient } = require('@supabase/supabase-js');

const API_URL = process.env.API_URL || 'http://localhost:3000';
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

const allowedOrigins = [
  'https://ascend-ascend.vercel.app',
  'https://ascend-frontend-git-main-ascend-v1.vercel.app',
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

const app = express();

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// OPTIONS must be registered before app.use(cors()) so preflight is handled first
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function makeSupabase(req, res) {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: true,
      detectSessionInUrl: false,
      storage: {
        getItem: (key) => req.cookies?.[key] ?? null,
        setItem: (key, value) => {
          res.cookie(key, value, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 7 * 1000, path: '/' });
        },
        removeItem: (key) => {
          res.clearCookie(key, { path: '/' });
        },
      },
    },
  });
}

app.get('/api/healthz', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/login', async (req, res) => {
  console.log('[login] request origin:', req.headers['origin']);
  console.log('[login] content-type:', req.headers['content-type']);

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('[login] Supabase env vars missing');
    res.status(500).json({ error: 'Supabase not configured' });
    return;
  }
  const { email, password, rememberMe } = req.body;
  console.log('[login] email:', email, '| body keys:', Object.keys(req.body));
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }
  const supabase = makeSupabase(req, res);
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    console.error('[login] Supabase error:', error?.message, error?.status);
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }
  console.log('[login] success for:', email);
  const accessMaxAge = rememberMe
    ? 60 * 60 * 24 * 30 * 1000   // 30 days
    : 60 * 60 * 1000;             // 1 hour
  const refreshMaxAge = rememberMe
    ? 60 * 60 * 24 * 30 * 1000   // 30 days
    : 60 * 60 * 24 * 7 * 1000;   // 7 days
  res.cookie('sb-access-token', data.session.access_token, {
    httpOnly: true, secure: true, sameSite: 'lax', maxAge: accessMaxAge, path: '/',
  });
  res.cookie('sb-refresh-token', data.session.refresh_token, {
    httpOnly: true, secure: true, sameSite: 'lax', maxAge: refreshMaxAge, path: '/',
  });
  res.json({ ok: true });
});

app.get('/api/auth/user', async (req, res) => {
  const accessToken = req.cookies?.['sb-access-token'];
  const refreshToken = req.cookies?.['sb-refresh-token'];

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

app.post('/api/auth/refresh', async (req, res) => {
  const accessToken = req.cookies?.['sb-access-token'];
  const refreshToken = req.cookies?.['sb-refresh-token'];

  if (!refreshToken) {
    res.status(401).json({ error: 'No refresh token' });
    return;
  }

  const supabase = makeSupabase(req, res);
  const { data, error } = await supabase.auth.setSession({
    access_token: accessToken || '',
    refresh_token: refreshToken,
  });

  if (error || !data.session || !data.user) {
    res.clearCookie('sb-access-token', { path: '/' });
    res.clearCookie('sb-refresh-token', { path: '/' });
    res.status(401).json({ error: 'Refresh failed' });
    return;
  }

  res.cookie('sb-access-token', data.session.access_token, {
    httpOnly: true, secure: true, sameSite: 'lax', maxAge: 60 * 60 * 1000, path: '/',
  });
  res.cookie('sb-refresh-token', data.session.refresh_token, {
    httpOnly: true, secure: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 7 * 1000, path: '/',
  });

  res.json({
    id: data.user.id,
    email: data.user.email,
    name: data.user.user_metadata?.['full_name'] ?? data.user.user_metadata?.['name'] ?? null,
    profileImageUrl: data.user.user_metadata?.['avatar_url'] ?? null,
  });
});

app.get('/api/logout', (_req, res) => {
  res.clearCookie('sb-access-token', { path: '/' });
  res.clearCookie('sb-refresh-token', { path: '/' });
  const frontendUrl = process.env.FRONTEND_URL || 'https://ascend-ascend.vercel.app';
  res.redirect(`${frontendUrl}/login`);
});

module.exports = app;
