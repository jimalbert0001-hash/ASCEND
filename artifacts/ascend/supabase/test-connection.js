async function testConnection() {
  const url = 'https://gkqhhudoiibopzhqfixj.supabase.co';
  const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrcWhodWRvaWlib3B6aHFmaXhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzMjkzNTcsImV4cCI6MjA5NjkwNTM1N30.-HqbFzs-AO3ETLnVXwGrRq6kGnKYxBBgDclc4Q-Qv1s';

  const res = await fetch(`${url}/rest/v1/subjects?limit=1`, {
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
    },
  });

  const status = res.status;
  const body = await res.json().catch(() => null);

  console.log('Status:', status);
  console.log('Body:', body);

  if (status === 400 && body?.message === 'Failed to parse params') {
    console.log('Table exists but response is unusual - probably schema is not set up yet');
  } else if (status === 404 && body?.code === '42P01') {
    console.log('Schema not found. Please run the SQL migration in Supabase SQL Editor.');
    console.log('File: artifacts/ascend/supabase/migrations/001_initial_schema.sql');
    console.log('Go to: https://supabase.com/dashboard/project/gkqhhudoiibopzhqfixj/sql-editor');
  } else if (status === 403) {
    console.log('RLS policy is blocking access. Make sure to run the SQL migration with RLS policies.');
  } else {
    console.log('Response:', JSON.stringify(body, null, 2));
  }
}

testConnection().catch(e => {
  console.error('Error:', e);
  process.exit(1);
});
