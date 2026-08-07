const { supabaseAdmin } = require('../db');

async function confirmAllUsers() {
  console.log('🔍 Fetching users from Supabase...');
  
  let page = 1;
  const perPage = 100;
  
  while (true) {
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers({
      page: page,
      perPage: perPage
    });

    if (error) {
      console.error('❌ Failed to list users:', error.message);
      break;
    }

    if (!users || users.length === 0) {
      console.log('✅ Finished processing all users.');
      break;
    }

    console.log(`Checking ${users.length} users on page ${page}...`);

    for (const user of users) {
      if (!user.email_confirmed_at) {
        console.log(`✉️ Auto-confirming user: ${user.email} (ID: ${user.id})`);
        const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(
          user.id,
          { email_confirm: true }
        );

        if (confirmError) {
          console.error(`❌ Failed to confirm ${user.email}:`, confirmError.message);
        } else {
          console.log(`✅ Successfully confirmed ${user.email}`);
        }
      } else {
        console.log(`ℹ️ User ${user.email} is already confirmed.`);
      }
    }

    if (users.length < perPage) {
      console.log('✅ Finished processing all users.');
      break;
    }
    page++;
  }
}

confirmAllUsers().catch(err => {
  console.error('❌ Script failed:', err);
});
