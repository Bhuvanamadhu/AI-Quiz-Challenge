const { supabaseAdmin } = require('../backend/db');

async function resolveLoginEmail(rawUsernameInput) {
  const rawInput = String(rawUsernameInput || '').trim();
  if (!rawInput) return null;

  const cleanUser = rawInput.toLowerCase();
  const noSpaceUser = cleanUser.replace(/[\s_.-]+/g, '');

  // Case 1: Input contains '@' -> It is an email
  if (rawInput.includes('@')) {
    const { data: emailMatches } = await supabaseAdmin
      .from('profiles')
      .select('id, username, email, role')
      .ilike('email', rawInput.trim());

    if (emailMatches && emailMatches.length > 0) {
      // Prioritize admin if duplicate
      const match = emailMatches.find(p => String(p.role).toLowerCase() === 'admin') || emailMatches[0];
      return { email: match.email.toLowerCase(), profile: match };
    }
    return { email: rawInput.trim().toLowerCase(), profile: null };
  }

  // Case 2: Generic Admin Alias (e.g., 'admin', 'administrator', 'sysadmin')
  const adminAliases = ['admin', 'administrator', 'sysadmin', 'root'];
  if (adminAliases.includes(cleanUser)) {
    const { data: adminProfiles } = await supabaseAdmin
      .from('profiles')
      .select('id, username, email, role')
      .ilike('role', 'admin');

    if (adminProfiles && adminProfiles.length > 0) {
      return { email: adminProfiles[0].email.toLowerCase(), profile: adminProfiles[0] };
    }
  }

  // Case 3: Direct case-insensitive username match
  const { data: directMatches } = await supabaseAdmin
    .from('profiles')
    .select('id, username, email, role')
    .ilike('username', rawInput.trim());

  if (directMatches && directMatches.length > 0) {
    const match = directMatches.find(p => String(p.role).toLowerCase() === 'admin') || directMatches[0];
    return { email: match.email.toLowerCase(), profile: match };
  }

  // Case 4: No-space / punctuation-removed username match (e.g. 'bhuvana madhu' -> 'bhuvanamadhu')
  const { data: noSpaceMatches } = await supabaseAdmin
    .from('profiles')
    .select('id, username, email, role')
    .ilike('username', noSpaceUser);

  if (noSpaceMatches && noSpaceMatches.length > 0) {
    const match = noSpaceMatches.find(p => String(p.role).toLowerCase() === 'admin') || noSpaceMatches[0];
    return { email: match.email.toLowerCase(), profile: match };
  }

  // Case 5: Match against email username prefix (e.g. 'bhuvanamadhu' -> 'bhuvanamadhu@gmail.com')
  const { data: prefixMatches } = await supabaseAdmin
    .from('profiles')
    .select('id, username, email, role')
    .ilike('email', `${noSpaceUser}@%`);

  if (prefixMatches && prefixMatches.length > 0) {
    const match = prefixMatches.find(p => String(p.role).toLowerCase() === 'admin') || prefixMatches[0];
    return { email: match.email.toLowerCase(), profile: match };
  }

  // Case 6: Word tokens match (e.g. 'bhuvana' from 'bhuvana madhu')
  const parts = rawInput.trim().split(/\s+/);
  if (parts.length > 1) {
    for (const word of parts) {
      if (word.length >= 3) {
        const { data: wordMatches } = await supabaseAdmin
          .from('profiles')
          .select('id, username, email, role')
          .ilike('username', word);

        if (wordMatches && wordMatches.length > 0) {
          const match = wordMatches.find(p => String(p.role).toLowerCase() === 'admin') || wordMatches[0];
          return { email: match.email.toLowerCase(), profile: match };
        }
      }
    }
  }

  // Case 7: Partial substring match (strictly prioritizing admin if multiple)
  const { data: partialMatches } = await supabaseAdmin
    .from('profiles')
    .select('id, username, email, role')
    .ilike('email', `%${noSpaceUser}%`);

  if (partialMatches && partialMatches.length > 0) {
    const match = partialMatches.find(p => String(p.role).toLowerCase() === 'admin') || partialMatches[0];
    return { email: match.email.toLowerCase(), profile: match };
  }

  return null;
}

async function testAll() {
  const tests = [
    'admin',
    'Admin',
    'ADMIN',
    'administrator',
    'Bhuvana',
    'bhuvana',
    'BHUVANA',
    'bhuvanamadhu',
    'Bhuvanamadhu',
    'bhuvana madhu',
    'Bhuvana Madhu',
    'bhuvanamadhu@gmail.com',
    'BHUVANAMADHU@GMAIL.COM',
    'bablu',
    'bhuvanamadhu06@gmail.com',
    'google_scholar',
    'scholar@gmail.com',
    'kavi',
    'kavi@gmail.com',
    'Pugal',
    'pugal09@gmail.com',
    'Ashwin',
    'Sneha',
    'Nekki',
    'boovi'
  ];

  for (const t of tests) {
    const res = await resolveLoginEmail(t);
    console.log(`Input: "${t}" -> Email: "${res ? res.email : 'NOT FOUND'}" | Role: "${res && res.profile ? res.profile.role : 'N/A'}" | User: "${res && res.profile ? res.profile.username : 'N/A'}"`);
  }
}

testAll();
