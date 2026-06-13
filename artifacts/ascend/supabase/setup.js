import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
  global: { fetch: async (input, init) => {
    // Use plain fetch to avoid realtime/websocket initialization
    const u = new URL(input.toString(), url);
    const res = await fetch(u.toString(), { ...init, headers: { ...init?.headers } });
    return res;
  }},
});

async function setup() {
  console.log('Testing Supabase connection...');

  // Try reading from a table to see if schema exists
  const { data, error } = await supabase.from('subjects').select('id').limit(1);
  if (error) {
    console.log('Schema not found. Please run the SQL migration in Supabase SQL Editor.');
    console.log('File: artifacts/ascend/supabase/migrations/001_initial_schema.sql');
    console.log('Go to: https://supabase.com/dashboard/project/gkqhhudoiibopzhqfixj/sql-editor');
    console.log('\nError:', error.message);
  } else {
    console.log('Schema exists! subjects table readable:', data);
  }

  const tables = [
    'goals', 'tasks', 'habits', 'achievements',
    'chess_rating_history', 'chess_puzzle_sessions',
    'guitar_practice_sessions', 'guitar_songs',
    'startup_projects', 'daily_reviews'
  ];

  for (const table of tables) {
    const { error } = await supabase.from(table).select('id').limit(1);
    console.log(`  ${table}: ${error ? 'MISSING' : 'OK'}`);
  }
}

setup().catch(e => {
  console.error('Setup failed:', e);
  process.exit(1);
});
