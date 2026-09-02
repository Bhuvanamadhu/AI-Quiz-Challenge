const { supabaseAdmin } = require('../backend/db');

async function testAdminLookups() {
  console.log('--- Testing Lookups for various Admin inputs ---');
  const testInputs = [
    'Bhuvana',
    'bhuvana',
    'BHUVANA',
    'bhuvanamadhu',
    'Bhuvanamadhu',
    'bhuvana madhu',
    'Bhuvana Madhu',
    'bhuvanamadhu@gmail.com',
    'BHUVANAMADHU@GMAIL.COM',
    'admin',
    'Admin',
    'ADMIN',
    'admin@quiz.com',
    'bablu',
    'bhuvanamadhu06@gmail.com'
  ];

  for (const input of testInputs) {
    const rawInput = String(input).trim();
    let email = rawInput.toLowerCase();
    let matchedProfile = null;

    if (!rawInput.includes('@')) {
      const cleanUser = rawInput;
      const noSpaceUser = cleanUser.replace(/\s+/g, '');
      
      // 1. Direct case-insensitive match on username
      let { data: directMatches, error: e1 } = await supabaseAdmin
        .from('profiles')
        .select('id, username, email, role')
        .ilike('username', cleanUser);

      if (directMatches && directMatches.length > 0) {
        // If multiple matches, prioritize admin
        matchedProfile = directMatches.find(p => p.role === 'admin') || directMatches[0];
      }

      // 2. space-removed match
      if (!matchedProfile) {
        let { data: noSpaceMatches } = await supabaseAdmin
          .from('profiles')
          .select('id, username, email, role')
          .ilike('username', noSpaceUser);
        if (noSpaceMatches && noSpaceMatches.length > 0) {
          matchedProfile = noSpaceMatches.find(p => p.role === 'admin') || noSpaceMatches[0];
        }
      }

      // 3. Match against email username
      if (!matchedProfile) {
        let { data: emailMatches } = await supabaseAdmin
          .from('profiles')
          .select('id, username, email, role')
          .ilike('email', noSpaceUser + '@%');
        if (emailMatches && emailMatches.length > 0) {
          matchedProfile = emailMatches.find(p => p.role === 'admin') || emailMatches[0];
        }
      }

      // 4. Substring or partial
      if (!matchedProfile) {
        let { data: partialMatches } = await supabaseAdmin
          .from('profiles')
          .select('id, username, email, role')
          .ilike('email', '%' + noSpaceUser + '%');
        if (partialMatches && partialMatches.length > 0) {
          matchedProfile = partialMatches.find(p => p.role === 'admin') || partialMatches[0];
        }
      }

      if (matchedProfile) {
        email = matchedProfile.email.toLowerCase();
      }
    } else {
      // If rawInput includes @, let's see what profiles match this email
      let { data: emailMatches } = await supabaseAdmin
        .from('profiles')
        .select('id, username, email, role')
        .ilike('email', email);
      if (emailMatches && emailMatches.length > 0) {
        matchedProfile = emailMatches[0];
      }
    }

    console.log(`Input: "${input}" -> Resolved Email: "${email}" | Matched Profile:`, matchedProfile ? { username: matchedProfile.username, email: matchedProfile.email, role: matchedProfile.role } : 'NONE');
  }
}

testAdminLookups();
