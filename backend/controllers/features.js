const { supabaseAdmin, getSupabaseClient } = require('../db');

// Custom Shop Items Configuration (Keep it identical to original)
const SHOP_ITEMS = [
  { id: 'theme_cyberpunk', name: 'Cyberpunk Purple Theme', cost: 300, type: 'theme', visual: '💜' },
  { id: 'theme_forest', name: 'Forest Green Theme', cost: 250, type: 'theme', visual: '💚' },
  { id: 'theme_sunset', name: 'Sunset Orange Theme', cost: 300, type: 'theme', visual: '🧡' },
  { id: 'theme_light', name: 'Premium Light Theme', cost: 100, type: 'theme', visual: '🤍' },
  
  { id: 'avatar_robot', name: 'Robot Companion Avatar', cost: 100, type: 'avatar', visual: '🤖' },
  { id: 'avatar_brain', name: 'AI Overlord Avatar', cost: 200, type: 'avatar', visual: '🧠' },
  { id: 'avatar_ninja', name: 'Code Ninja Avatar', cost: 150, type: 'avatar', visual: '🥷' },
  { id: 'avatar_wizard', name: 'JavaScript Wizard Avatar', cost: 200, type: 'avatar', visual: '🧙‍♂️' },
  
  { id: 'frame_neon', name: 'Neon Glow Profile Frame', cost: 200, type: 'frame', visual: '✨' },
  { id: 'frame_gold', name: 'Gold Royalty Profile Frame', cost: 500, type: 'frame', visual: '👑' },
  { id: 'frame_fire', name: 'Fire Particle Profile Frame', cost: 300, type: 'frame', visual: '🔥' },
  
  { id: 'item_hint_pack', name: 'Extra Hints Pack (+3 Hints)', cost: 50, type: 'powerup', visual: '💡' },
  { id: 'item_shield', name: 'Wrong Answer Shield (1 Life Protection)', cost: 100, type: 'powerup', visual: '🛡️' },
  { id: 'item_double_xp', name: 'Double XP Card (Next Quiz)', cost: 150, type: 'powerup', visual: '⭐' },
  
  { id: 'category_advanced_cs', name: 'Exclusive Category: Advanced CS Theory', cost: 400, type: 'category', visual: '📚' }
];

// Profile Management
async function updateProfile(req, res) {
  const userId = req.user.id;
  const { username, email, bio, fav_category, profile_pic, selected_theme, avatar, avatar_frame } = req.body;

  try {
    // Check username/email uniqueness if changing
    if (username || email) {
      const { data: existing, error: checkError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .or(`username.eq.${username},email.eq.${email}`)
        .neq('id', userId)
        .maybeSingle();

      if (existing) {
        return res.status(400).json({ error: 'Username or email already in use.' });
      }
    }

    // Update profiles table
    if (username || email || profile_pic || bio || fav_category) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const newUsername = username || profile.username;
      const newEmail = email || profile.email;
      const newPic = profile_pic !== undefined ? profile_pic : profile.profile_pic;
      const newBio = bio !== undefined ? bio : profile.bio;
      const newFav = fav_category !== undefined ? fav_category : profile.fav_category;

      const { error: profileUpdateErr } = await supabaseAdmin
        .from('profiles')
        .update({
          username: newUsername,
          email: newEmail,
          profile_pic: newPic,
          bio: newBio,
          fav_category: newFav,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (profileUpdateErr) throw profileUpdateErr;

      // Update username in leaderboard table
      if (username) {
        await supabaseAdmin
          .from('leaderboard')
          .update({ username: newUsername })
          .eq('user_id', userId);
      }

      // If email changed, update in Auth users
      if (email && email !== profile.email) {
        await supabaseAdmin.auth.admin.updateUserById(userId, { email });
      }
    }

    // Update settings table
    if (selected_theme || avatar || avatar_frame) {
      let { data: settings } = await supabaseAdmin
        .from('settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (!settings) {
        const { data: newSet } = await supabaseAdmin
          .from('settings')
          .insert({ user_id: userId, selected_theme: selected_theme || 'dark', avatar: avatar || '👤', avatar_frame: avatar_frame || 'none' })
          .select()
          .single();
        settings = newSet;
      } else {
        const newTheme = selected_theme || settings.selected_theme || 'dark';
        const newAvatar = avatar || settings.avatar || '👤';
        const newFrame = avatar_frame || settings.avatar_frame || 'none';

        const { error: settingsUpdateErr } = await supabaseAdmin
          .from('settings')
          .update({
            selected_theme: newTheme,
            avatar: newAvatar,
            avatar_frame: newFrame,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (settingsUpdateErr) throw settingsUpdateErr;
      }
    }

    res.json({ message: 'Profile updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile: ' + err.message });
  }
}

// Reward Shop Controllers
async function getShopItems(req, res) {
  res.json(SHOP_ITEMS);
}

async function purchaseShopItem(req, res) {
  const userId = req.user.id;
  const { itemId } = req.body;

  const item = SHOP_ITEMS.find(i => i.id === itemId);
  if (!item) {
    return res.status(404).json({ error: 'Item not found in shop.' });
  }

  try {
    // Get progress (check coins balance)
    const { data: progress, error: progErr } = await supabaseAdmin
      .from('quiz_progress')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (progErr) throw progErr;

    const coins = progress ? (progress.total_coins || 0) : 0;
    if (coins < item.cost) {
      return res.status(400).json({ error: 'Insufficient coins balance.' });
    }

    // Non-stackable inventory check (themes, avatars, frames, exclusive categories)
    const isStackable = item.type === 'powerup';
    if (!isStackable) {
      const { data: alreadyOwned } = await supabaseAdmin
        .from('purchases')
        .select('id')
        .eq('user_id', userId)
        .eq('item_id', itemId)
        .maybeSingle();

      if (alreadyOwned) {
        return res.status(400).json({ error: 'You already own this item.' });
      }
    }

    // Record purchase
    const { error: purchaseErr } = await supabaseAdmin
      .from('purchases')
      .insert({
        user_id: userId,
        item_id: itemId,
        item_name: item.name,
        cost: item.cost
      });

    if (purchaseErr) throw purchaseErr;

    // Deduct coins
    const newCoins = coins - item.cost;
    const { error: deductErr } = await supabaseAdmin
      .from('quiz_progress')
      .update({ total_coins: newCoins, updated_at: new Date().toISOString() })
      .eq('user_id', userId);

    if (deductErr) throw deductErr;

    // Send successful purchase notification
    await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: userId,
        title: 'Purchase Successful',
        message: `You unlocked ${item.name}! ${item.visual}`,
        type: 'reward'
      });

    res.json({ message: `Successfully purchased ${item.name}!`, newCoins });
  } catch (err) {
    res.status(500).json({ error: 'Purchase failed: ' + err.message });
  }
}

async function getPurchaseHistory(req, res) {
  const userId = req.user.id;
  try {
    const supabase = getSupabaseClient(req);
    const { data: history, error } = await supabase
      .from('purchases')
      .select('*')
      .eq('user_id', userId)
      .order('purchased_at', { ascending: false });

    if (error) throw error;
    res.json(history || []);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch purchase history: ' + err.message });
  }
}

// Feedback & Reports
async function submitFeedback(req, res) {
  const userId = req.user.id;
  const username = req.user.username;
  const { rating, comments } = req.body;

  if (rating === undefined || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be an integer between 1 and 5.' });
  }

  try {
    const supabase = getSupabaseClient(req);
    const { error } = await supabase
      .from('quiz_feedback')
      .insert({
        user_id: userId,
        username,
        rating,
        comments
      });

    if (error) throw error;
    res.status(201).json({ message: 'Feedback submitted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Feedback submission failed: ' + err.message });
  }
}

async function reportQuestion(req, res) {
  const userId = req.user.id;
  const username = req.user.username;
  const { questionId, reason, comments } = req.body;

  if (!questionId || !reason) {
    return res.status(400).json({ error: 'Question ID and Reason are required.' });
  }

  try {
    const supabase = getSupabaseClient(req);
    const { error } = await supabase
      .from('reported_questions')
      .insert({
        user_id: userId,
        username,
        question_id: parseInt(questionId),
        reason,
        comments
      });

    if (error) throw error;
    res.status(201).json({ message: 'Question reported successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Report submission failed: ' + err.message });
  }
}

// Notifications
async function getNotifications(req, res) {
  const userId = req.user.id;
  try {
    const supabase = getSupabaseClient(req);
    const { data: list, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(list || []);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve notifications: ' + err.message });
  }
}

async function markNotificationsRead(req, res) {
  const userId = req.user.id;
  const { notificationId } = req.body;

  try {
    const supabase = getSupabaseClient(req);

    if (notificationId) {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: 1 })
        .eq('id', parseInt(notificationId))
        .eq('user_id', userId);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: 1 })
        .eq('user_id', userId);
      if (error) throw error;
    }
    res.json({ message: 'Notifications marked as read.' });
  } catch (err) {
    res.status(500).json({ error: 'Operation failed: ' + err.message });
  }
}

// Certificates Registry
async function claimCertificate(req, res) {
  const userId = req.user.id;
  const username = req.user.username;
  const { category, score, totalQuestions, style } = req.body;

  if (!category || score === undefined || !totalQuestions) {
    return res.status(400).json({ error: 'Incomplete parameters.' });
  }

  // Validate qualification (Score >= 80%)
  if (score < totalQuestions * 0.8) {
    return res.status(400).json({ error: 'You need an accuracy of 80% or above to claim a certificate.' });
  }

  try {
    const certId = 'CERT-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
    
    // Insert certificate record
    const { error: certErr } = await supabaseAdmin
      .from('certificates')
      .insert({
        id: certId,
        user_id: userId,
        username,
        category,
        score,
        total_questions: totalQuestions,
        certificate_style: style || 'classic'
      });

    if (certErr) throw certErr;

    // Update attempts history certificate status to "Claimed"
    // Fetch last attempt for this category
    const { data: attempts, error: fetchAttemptsErr } = await supabaseAdmin
      .from('quiz_attempts')
      .select('id')
      .eq('user_id', userId)
      .eq('category', category)
      .order('attempted_at', { ascending: false })
      .limit(1);

    if (!fetchAttemptsErr && attempts && attempts.length > 0) {
      await supabaseAdmin
        .from('quiz_attempts')
        .update({ certificate_status: 'Claimed' })
        .eq('id', attempts[0].id);
    }

    // Create Notification
    await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: userId,
        title: 'Certificate Claimed! 🎓',
        message: `Your certificate for ${category} has been issued successfully. ID: ${certId}`,
        type: 'certificate'
      });

    res.status(201).json({
      message: 'Certificate claimed successfully.',
      certificate: {
        id: certId,
        username,
        category,
        score,
        totalQuestions,
        style: style || 'classic',
        claimed_at: new Date().toISOString()
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Claiming certificate failed: ' + err.message });
  }
}

async function getCertificates(req, res) {
  const userId = req.user.id;
  try {
    const supabase = getSupabaseClient(req);
    const { data: list, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('user_id', userId)
      .order('claimed_at', { ascending: false });

    if (error) throw error;
    res.json(list || []);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve certificates: ' + err.message });
  }
}

// AI Tutor explain endpoint (No DB calls, keeps original logic)
const CONCEPT_DESCRIPTIONS = require('../../definitions.js');

async function askAiTutor(req, res) {
  const { questionText, category, difficulty, optionA, optionB, optionC, optionD, correctOption, explanation, messages } = req.body;

  if (!questionText || !correctOption) {
    return res.status(400).json({ error: 'Missing question context parameters.' });
  }

  let conceptContext = "";
  if (category && difficulty) {
    const catGroup = CONCEPT_DESCRIPTIONS[category] || {};
    const diffGroup = catGroup[difficulty.toLowerCase()] || {};
    for (const [conceptName, desc] of Object.entries(diffGroup)) {
      if (questionText.toLowerCase().includes(conceptName.toLowerCase())) {
        conceptContext = desc;
        break;
      }
    }
  }

  const optionTexts = { 'A': optionA, 'B': optionB, 'C': optionC, 'D': optionD };
  const correctText = optionTexts[correctOption.toUpperCase()] || 'the specified correct option';

  let reply = "";
  if (messages && messages.length > 0) {
    const lastMsg = messages[messages.length - 1].content.toLowerCase();
    
    if (lastMsg.includes('hint')) {
      reply = `### 💡 AI Tutor Hint\nHere is a conceptual clue:\n${conceptContext ? `> "${conceptContext}"` : `Think about how this question applies to standard ${category || 'coding'} practices.`}\nObserve the options and try eliminating choices that don't match this definition!`;
    } else if (lastMsg.includes('concept')) {
      reply = `### 📖 Concept Breakdown\nLet's learn about the core concept in **${category || 'Computer Science'}**:\n- **Subject**: ${category} (${difficulty} level)\n- **Concept Details**: ${conceptContext || 'This represents a core structural specification in software development.'}\n- **Analogy**: Think of it as a set of rules that governs data flow or design structure, ensuring safety and compliance.`;
    } else if (lastMsg.includes('answer') || lastMsg.includes('correct') || lastMsg.includes('reveal')) {
      reply = `### 🔑 Answer Analysis\n- The correct option is **${correctOption}** ("${correctText}").\n- **Why**: ${explanation || 'It represents the standard programming specifications or algorithms for this topic.'}\n- **Incorrect Options**:\n${Object.entries(optionTexts).map(([key, val]) => {
        if (key === correctOption) return '';
        return `- **Option ${key}** ("${val}"): This is incorrect because it does not satisfy the criteria.`;
      }).filter(Boolean).join('\n')}`;
    } else {
      reply = `### 💬 AI Tutor Follow-up\nRegarding your question: *"${messages[messages.length - 1].content}"*\n\n1. **Concept Relation**: This is related to the **${category || 'CS'}** category.\n2. **Reviewing the options**: The correct option **${correctOption}** represents the optimal choice.\n3. **Analogy/Example**:\n\`\`\`javascript\n// Concept Example: ${category || 'General Programming'}\n// Let's assume you are executing this logic in your code:\nconst isTargetMatch = true;\nif (isTargetMatch) {\n  console.log("Success! Correct logic: ${correctText.substring(0, 40)}...");\n}\n\`\`\`\nIs there any specific option you would like to analyze further?`;
    }
  } else {
    reply = `### 🧠 AI Tutor Explanation\n- The correct option is **${correctOption}** ("${correctText}").\n- **Why**: ${explanation || 'It represents the standard programming specifications or algorithms for this topic.'}`;
  }

  res.json({ explanation: reply });
}

// Sync Offline Progress
async function syncOfflineAttempts(req, res) {
  const userId = req.user.id;
  const attempts = req.body.attempts;

  if (!attempts || !Array.isArray(attempts)) {
    return res.status(400).json({ error: 'Invalid attempts payload.' });
  }

  try {
    let addedXp = 0;
    let addedCoins = 0;
    let syncedCount = 0;

    for (const att of attempts) {
      const { category, difficulty, score, total_questions, attempted_at, game_mode } = att;

      // 1. Insert attempt
      const { error: insertErr } = await supabaseAdmin
        .from('quiz_attempts')
        .insert({
          user_id: userId,
          category,
          difficulty,
          score,
          total_questions,
          accuracy: Math.round((score / total_questions) * 100),
          correct_answers: score,
          wrong_answers: total_questions - score,
          time_taken: 0,
          xp_earned: score * 10,
          coins_earned: score * 10,
          attempted_at: attempted_at || new Date().toISOString()
        });

      if (insertErr) continue; // skip duplicates or error attempts

      // 2. Increment stats variables
      let mult = 10;
      if (difficulty === 'easy') mult = 5;
      if (difficulty === 'hard') mult = 15;
      
      let earnedXp = score * mult;
      let isPerfect = score === total_questions;
      if (isPerfect) earnedXp += 50;

      const mode = (game_mode || 'classic').toLowerCase();
      if (mode === 'speed') earnedXp = Math.round(earnedXp * 1.3);
      if (mode === 'survival') earnedXp = Math.round(earnedXp * 1.5);
      if (mode === 'marathon') earnedXp = Math.round(earnedXp * 1.2);
      earnedXp += 10;

      addedXp += earnedXp;
      addedCoins += earnedXp;
      syncedCount += 1;
    }

    // Update progress in DB if attempts were synced
    if (syncedCount > 0) {
      const { data: progress } = await supabaseAdmin
        .from('quiz_progress')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (progress) {
        const newXp = (progress.total_xp || 0) + addedXp;
        const newCoins = (progress.total_coins || 0) + addedCoins;
        const newCompleted = (progress.quizzes_completed || 0) + syncedCount;

        await supabaseAdmin
          .from('quiz_progress')
          .update({
            total_xp: newXp,
            total_coins: newCoins,
            quizzes_completed: newCompleted,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        // Update leaderboard cache
        await supabaseAdmin
          .from('leaderboard')
          .upsert({
            user_id: userId,
            username: req.user.username,
            total_xp: newXp,
            quizzes_completed: newCompleted,
            updated_at: new Date().toISOString()
          });
      }
    }

    res.json({ message: `Successfully synced ${syncedCount} attempts offline data.`, syncedCount, addedXp, addedCoins });
  } catch (err) {
    res.status(500).json({ error: 'Sync failed: ' + err.message });
  }
}

// OTP codes & recovery using public.otp_codes table
async function sendOtp(req, res) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email address is required.' });

  try {
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits code
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes expiration

    const { error } = await supabaseAdmin
      .from('otp_codes')
      .insert({ email, code, expires_at: expiresAt });

    if (error) throw error;
    
    console.log(`✉️ Simulated OTP sent to: ${email} -> CODE: ${code}`);

    res.json({ message: 'Verification OTP code sent successfully (simulated).', code });
  } catch (err) {
    res.status(500).json({ error: 'OTP generation failed: ' + err.message });
  }
}

async function verifyOtp(req, res) {
  const { email, code } = req.body;
  if (!email || !code) return res.status(400).json({ error: 'Email and Code are required.' });

  try {
    const { data: row, error } = await supabaseAdmin
      .from('otp_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .order('id', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !row) return res.status(400).json({ error: 'Invalid verification code.' });

    if (new Date() > new Date(row.expires_at)) {
      return res.status(400).json({ error: 'Verification code has expired.' });
    }

    res.json({ verified: true, message: 'Code verified successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Verification failed: ' + err.message });
  }
}

async function resetPassword(req, res) {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    // Verify OTP code first
    const { data: row, error } = await supabaseAdmin
      .from('otp_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .order('id', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !row || new Date() > new Date(row.expires_at)) {
      return res.status(400).json({ error: 'Invalid or expired code.' });
    }

    // Retrieve user by email
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (profileErr || !profile) {
      return res.status(400).json({ error: 'No user registered with this email.' });
    }

    // Call Supabase Admin API to update password
    const { error: authResetErr } = await supabaseAdmin.auth.admin.updateUserById(profile.id, {
      password: newPassword
    });

    if (authResetErr) throw authResetErr;

    // Clear code
    await supabaseAdmin
      .from('otp_codes')
      .delete()
      .eq('email', email);

    res.json({ message: 'Password reset successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Reset failed: ' + err.message });
  }
}

// Login Device Audit History
async function getLoginHistory(req, res) {
  const userId = req.user.id;
  try {
    const supabase = getSupabaseClient(req);
    const { data: list, error } = await supabase
      .from('login_history')
      .select('ip_address, user_agent, logged_in_at')
      .eq('user_id', userId)
      .order('logged_in_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    // Map device_agent field to keep backend logs mapping intact
    const mapped = (list || []).map(l => ({
      ip_address: l.ip_address,
      device_agent: l.user_agent, // map user_agent to device_agent
      logged_in_at: l.logged_in_at
    }));

    res.json(mapped || []);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve login history: ' + err.message });
  }
}

// Admin Panel controllers
async function adminGetFeedback(req, res) {
  try {
    const { data: list, error } = await supabaseAdmin
      .from('quiz_feedback')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (error) throw error;
    res.json(list || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function adminGetReports(req, res) {
  try {
    const { data: list, error } = await supabaseAdmin
      .from('reported_questions')
      .select('*')
      .order('reported_at', { ascending: false });

    if (error) throw error;
    res.json(list || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function adminGetNotifications(req, res) {
  try {
    const { data: list, error } = await supabaseAdmin
      .from('notifications')
      .select(`
        id, user_id, title, message, type, is_read, created_at,
        profiles ( username )
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    const flattened = (list || []).map(item => ({
      id: item.id,
      user_id: item.user_id,
      title: item.title,
      message: item.message,
      type: item.type,
      is_read: item.is_read,
      created_at: item.created_at,
      username: item.profiles ? item.profiles.username : 'Unknown'
    }));

    res.json(flattened || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function adminSendNotification(req, res) {
  const { userId, title, message, type } = req.body;
  if (!title || !message) return res.status(400).json({ error: 'Title and Message are required.' });

  try {
    if (userId) {
      await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: userId,
          title,
          message,
          type: type || 'event'
        });
    } else {
      // Broadcast to all users
      const { data: players } = await supabaseAdmin
        .from('profiles')
        .select('id');
      
      const inserts = (players || []).map(p => ({
        user_id: p.id,
        title,
        message,
        type: type || 'event'
      }));

      if (inserts.length > 0) {
        await supabaseAdmin.from('notifications').insert(inserts);
      }
    }
    res.json({ message: 'Notification(s) sent successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function adminGetRewards(req, res) {
  try {
    const { data: list, error } = await supabaseAdmin
      .from('purchases')
      .select(`
        id, user_id, item_id, item_name, cost, purchased_at,
        profiles ( username )
      `)
      .order('purchased_at', { ascending: false });

    if (error) throw error;

    const flattened = (list || []).map(item => ({
      id: item.id,
      user_id: item.user_id,
      item_id: item.item_id,
      item_name: item.item_name,
      cost: item.cost,
      purchased_at: item.purchased_at,
      username: item.profiles ? item.profiles.username : 'Unknown'
    }));

    res.json(flattened || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function adminGetCertificates(req, res) {
  try {
    const { data: list, error } = await supabaseAdmin
      .from('certificates')
      .select('*')
      .order('claimed_at', { ascending: false });

    if (error) throw error;
    res.json(list || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function adminGetLoginLogs(req, res) {
  try {
    const { data: list, error } = await supabaseAdmin
      .from('login_history')
      .select(`
        id, user_id, ip_address, user_agent, logged_in_at,
        profiles ( username )
      `)
      .order('logged_in_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    const flattened = (list || []).map(item => ({
      id: item.id,
      user_id: item.user_id,
      ip_address: item.ip_address,
      device_agent: item.user_agent,
      logged_in_at: item.logged_in_at,
      username: item.profiles ? item.profiles.username : 'Unknown'
    }));

    res.json(flattened || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  updateProfile,
  getShopItems,
  purchaseShopItem,
  getPurchaseHistory,
  submitFeedback,
  reportQuestion,
  getNotifications,
  markNotificationsRead,
  claimCertificate,
  getCertificates,
  askAiTutor,
  syncOfflineAttempts,
  sendOtp,
  verifyOtp,
  resetPassword,
  getLoginHistory,
  adminGetFeedback,
  adminGetReports,
  adminGetNotifications,
  adminSendNotification,
  adminGetRewards,
  adminGetCertificates,
  adminGetLoginLogs
};
