const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

const EXTRA_ORIGINS = (process.env.FRONTEND_URL || '').split(',').map(s => s.trim()).filter(Boolean);

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (origin === 'http://localhost:5173' || origin === 'http://localhost:3000') return true;
  // Allow any vercel.app subdomain that contains "ascend"
  if (/^https:\/\/ascend[a-z0-9-]*\.vercel\.app$/.test(origin)) return true;
  if (EXTRA_ORIGINS.includes(origin)) return true;
  return false;
}

const app = express();

const corsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      console.warn('[cors] blocked origin:', origin);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.options('*', cors(corsOptions));
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function makePlainSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

function getBearerToken(req) {
  const auth = req.headers['authorization'] || '';
  if (auth.startsWith('Bearer ')) return auth.slice(7).trim();
  return null;
}

app.get('/api/healthz', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/login', async (req, res) => {
  console.log('[login] request origin:', req.headers['origin']);

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('[login] Supabase env vars missing');
    res.status(500).json({ error: 'Supabase not configured' });
    return;
  }

  const { email, password } = req.body;
  console.log('[login] email:', email, '| body keys:', Object.keys(req.body));
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  const supabase = makePlainSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    console.error('[login] Supabase error:', error?.message, error?.status);
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  console.log('[login] success for:', email);
  res.json({
    user: {
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.['full_name'] ?? data.user.user_metadata?.['name'] ?? null,
      profileImageUrl: data.user.user_metadata?.['avatar_url'] ?? null,
    },
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  });
});

app.get('/api/auth/user', async (req, res) => {
  const accessToken = getBearerToken(req);

  if (!accessToken) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  const supabase = makePlainSupabase();
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

  res.status(401).json({ error: 'Session expired' });
});

app.post('/api/auth/refresh', async (req, res) => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    res.status(401).json({ error: 'No refresh token' });
    return;
  }

  const supabase = makePlainSupabase();
  const { data, error } = await supabase.auth.refreshSession({ refresh_token });

  if (error || !data.session || !data.user) {
    res.status(401).json({ error: 'Refresh failed' });
    return;
  }

  res.json({
    user: {
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.['full_name'] ?? data.user.user_metadata?.['name'] ?? null,
      profileImageUrl: data.user.user_metadata?.['avatar_url'] ?? null,
    },
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  });
});

app.post('/api/profile', async (req, res) => {
  const accessToken = getBearerToken(req);
  if (!accessToken) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  const { full_name } = req.body;
  if (!full_name || typeof full_name !== 'string' || !full_name.trim()) {
    res.status(400).json({ error: 'full_name is required' });
    return;
  }
  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ data: { full_name: full_name.trim() } }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    res.status(500).json({ error: err.message || 'Failed to update profile' });
    return;
  }
  res.json({ ok: true });
});

app.post('/api/logout', (_req, res) => {
  res.json({ ok: true });
});

module.exports = app;
