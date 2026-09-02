const { supabaseAdmin } = require('../backend/db');

async function inspectProfiles() {
  const { data: profiles, error } = await supabaseAdmin
    .from('profiles')
    .select('id, username, email, role, created_at');

  if (error) {
    console.error('Error fetching profiles:', error);
    return;
  }

  console.log('Profiles in Supabase DB:');
  console.table(profiles);
}

inspectProfiles();
