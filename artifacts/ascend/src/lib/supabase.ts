import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.SUPABASE_URL;
const key = import.meta.env.SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!(url && key);

export const supabase = isSupabaseConfigured
  ? createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : (null as any);
