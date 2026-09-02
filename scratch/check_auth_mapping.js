const { supabaseAdmin } = require('../backend/db');

async function checkAuthAndProfiles() {
  const { data: { users }, error: authErr } = await supabaseAdmin.auth.admin.listUsers();
  if (authErr) {
    console.error('Auth error:', authErr);
    return;
  }

  const { data: profiles, error: profErr } = await supabaseAdmin
    .from('profiles')
    .select('*');

  if (profErr) {
    console.error('Profiles error:', profErr);
    return;
  }

  console.log('--- SUPABASE AUTH USERS ---');
  users.forEach(u => {
    const prof = profiles.find(p => p.id === u.id);
    console.log(`Auth ID: ${u.id} | Email: ${u.email} | Confirmed: ${!!u.email_confirmed_at} | Profile: ${prof ? `Username=${prof.username}, Role=${prof.role}` : 'NO PROFILE'}`);
  });

  console.log('\n--- PROFILES WITHOUT AUTH OR MISMATCHED ---');
  profiles.forEach(p => {
    const u = users.find(user => user.id === p.id);
    if (!u) {
      console.log(`Orphan Profile ID: ${p.id} | Username: ${p.username} | Email: ${p.email} | Role: ${p.role}`);
    }
  });
}

checkAuthAndProfiles();
