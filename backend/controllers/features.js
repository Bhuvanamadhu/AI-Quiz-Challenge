const { supabaseAdmin, getSupabaseClient } = require('../db');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { generateGeminiContent } = require('../utils/gemini');

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
      const orFilters = [];
      if (username) orFilters.push(`username.eq.${username}`);
      if (email) orFilters.push(`email.eq.${email}`);

      const { data: existing } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .or(orFilters.join(','))
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
async function addUserNotification(req, res) {
  const userId = req.user.id;
  const { title, message } = req.body;

  if (!title || !message) {
    return res.status(400).json({ error: 'Title and message are required.' });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        is_read: false
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add notification: ' + err.message });
  }
}

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

async function deleteNotification(req, res) {
  const userId = req.user.id;
  const { id } = req.params;
  try {
    const supabase = getSupabaseClient(req);
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', parseInt(id))
      .eq('user_id', userId);
    if (error) throw error;
    res.json({ message: 'Notification deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete notification: ' + err.message });
  }
}

async function deleteAllNotifications(req, res) {
  const userId = req.user.id;
  try {
    const supabase = getSupabaseClient(req);
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId);
    if (error) throw error;
    res.json({ message: 'All notifications deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete all notifications: ' + err.message });
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

async function askAiTutor(req, res) {
  const { questionText, category, difficulty, optionA, optionB, optionC, optionD, correctOption, chosenOption, explanation, messages, language = 'en' } = req.body;

  if (!questionText || !correctOption) {
    return res.status(400).json({ error: 'Missing question context parameters.' });
  }

  // If Gemini API is not configured, return a meaningful error message
  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({
      error: 'AI Tutor service is unconfigured. To enable AI Tutor explanations, please configure the GEMINI_API_KEY environment variable in the backend .env file.'
    });
  }

  try {
    const optionTexts = { 'A': optionA, 'B': optionB, 'C': optionC, 'D': optionD };
    const correctText = optionTexts[correctOption.toUpperCase()] || 'the specified correct option';
    const chosenText = chosenOption ? (optionTexts[chosenOption.toUpperCase()] || chosenOption) : 'none';

    // System instruction for Gemini Tutor
    const systemInstruction = `You are a supportive, expert AI Tutor in a web developer trivia game.
Your task is to help the user understand technical trivia questions.

Current Question context:
- Category: "${category}" (Difficulty: "${difficulty}")
- Question text: "${questionText}"
- Option A: "${optionA}"
- Option B: "${optionB}"
- Option C: "${optionC}"
- Option D: "${optionD}"
- Correct Option: "${correctOption}" (Text: "${correctText}")
- User's selected option: "${chosenOption || 'None selected'}" (Text: "${chosenText}")
- Base explanation: "${explanation || 'No base explanation provided'}"

Guidelines:
1. Explain clearly why the correct option is the right answer and why the user's selection (if incorrect) is wrong.
2. Provide a concise conceptual breakdown using developer analogies where applicable.
3. Keep the explanation engaging but brief (approx. 2-3 short paragraphs).
4. Use clear Markdown headers, bullet points, and code blocks for readability.
5. If the user asks follow-up questions, maintain context and answer their queries naturally.
6. YOU MUST RESPOND EXCLUSIVELY IN THE FOLLOWING LANGUAGE: ${language === 'ta' ? 'Tamil (தமிழ்)' : language === 'hi' ? 'Hindi (हिंदी)' : 'English'}. Keep code snippets or specific programming keywords in their original syntax (English).`;

    // Map frontend messages history to Gemini API contents format
    const chatHistory = (messages || []).filter(msg => msg.content).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      content: msg.content
    }));

    // If chat history is empty, initialize with a prompt to explain the question
    if (chatHistory.length === 0) {
      chatHistory.push({
        role: 'user',
        content: `Please explain the question and why option ${correctOption} is correct.`
      });
    }

    const aiExplanation = await generateGeminiContent(chatHistory, systemInstruction);
    res.json({ explanation: aiExplanation });
  } catch (err) {
    res.status(500).json({ error: 'AI Tutor service encountered an error: ' + err.message });
  }
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

        // Update leaderboard cache resolving conflicts on unique user_id
        await supabaseAdmin
          .from('leaderboard')
          .upsert({
            user_id: userId,
            username: req.user.username,
            total_xp: newXp,
            quizzes_completed: newCompleted,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });
      }
    }

    res.json({ message: `Successfully synced ${syncedCount} attempts offline data.`, syncedCount, addedXp, addedCoins });
  } catch (err) {
    res.status(500).json({ error: 'Sync failed: ' + err.message });
  }
}

// Send verification email helper
async function sendVerificationEmail(email, code) {
  let transporter;
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  }

  const mailOptions = {
    from: '"AI Quiz Challenge" <noreply@aiquizchallenge.com>',
    to: email,
    subject: 'AI Quiz Challenge - Password Recovery Code',
    text: `Your password recovery verification code is: ${code}. This code is valid for 5 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; background-color: #fafafa;">
        <h2 style="color: #6366f1; border-bottom: 2px solid #6366f1; padding-bottom: 10px;">AI Quiz Challenge</h2>
        <p>Hello,</p>
        <p>You requested a password recovery code for your account. Please use the verification code below:</p>
        <div style="font-size: 28px; font-weight: bold; background: #eeefff; border: 1px dashed #6366f1; color: #6366f1; padding: 15px; margin: 20px 0; text-align: center; letter-spacing: 4px; border-radius: 4px;">
          ${code}
        </div>
        <p>This code is valid for <strong>5 minutes</strong>. If you did not request a password reset, you can safely ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 11px; color: #888;">This is an automated system email. Please do not reply directly.</p>
      </div>
    `
  };

  const info = await transporter.sendMail(mailOptions);
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log(`✉️ Simulated OTP email sent! View preview: ${previewUrl}`);
  } else {
    console.log(`✉️ SMTP Email successfully sent to ${email}`);
  }
  return previewUrl;
}

// OTP codes & recovery using public.otp_codes table
async function sendOtp(req, res) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email address is required.' });

  try {
    // 1. Verify that email exists in the system profiles database
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (profileErr || !profile) {
      return res.status(400).json({ error: 'No user registered with this email address.' });
    }

    // 2. Generate a secure 6-digit OTP code using crypto
    const code = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes expiration

    // 3. Clear existing OTPs for this email first to prevent clutter
    await supabaseAdmin
      .from('otp_codes')
      .delete()
      .eq('email', email);

    // 4. Save the new secure OTP to database
    const { error } = await supabaseAdmin
      .from('otp_codes')
      .insert({ email, code, expires_at: expiresAt });

    if (error) throw error;
    
    // 5. Send actual email with nodemailer
    const previewUrl = await sendVerificationEmail(email, code);

    // Secure response: do NOT return the code in online production mode
    res.json({ 
      message: 'Verification OTP code sent successfully to your email.', 
      previewUrl: previewUrl || undefined 
    });
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
      .eq('code', code.trim())
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

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters.' });
  }

  try {
    // Verify OTP code first
    const { data: row, error } = await supabaseAdmin
      .from('otp_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code.trim())
      .order('id', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !row || new Date() > new Date(row.expires_at)) {
      return res.status(400).json({ error: 'Invalid or expired verification code.' });
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

// AI Future Skill Predictor Chat endpoint
async function askSkillPredictor(req, res) {
  const userId = req.user.id;
  const { messages, language = 'en' } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Missing or invalid chat messages payload.' });
  }

  // If Gemini API is not configured, return a meaningful error message
  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({
      error: 'AI Career Mentor service is unconfigured. To enable AI Career guidance, please configure the GEMINI_API_KEY environment variable in the backend .env file.'
    });
  }

  try {
    // 1. Fetch user attempts history to calculate performance profile
    const { data: attempts, error: attemptsErr } = await supabaseAdmin
      .from('quiz_attempts')
      .select('category, score, total_questions')
      .eq('user_id', userId);

    if (attemptsErr) throw attemptsErr;

    // Calculate score metrics per category
    const catScores = {};
    (attempts || []).forEach(att => {
      if (!catScores[att.category]) {
        catScores[att.category] = { total: 0, score: 0 };
      }
      catScores[att.category].total += att.total_questions;
      catScores[att.category].score += att.score;
    });

    const strong = [];
    const weak = [];
    for (const cat in catScores) {
      const acc = Math.round((catScores[cat].score / catScores[cat].total) * 100);
      if (acc >= 75) {
        strong.push(`${cat} (${acc}% accuracy)`);
      } else {
        weak.push(`${cat} (${acc}% accuracy)`);
      }
    }

    // 2. Build system instruction prompt for career guidance based on performance
    const systemInstruction = `You are a supportive, expert AI Career Mentor and Software Engineering Consultant inside the AI Quiz Challenge game.
Your task is to guide the user in their career path, recommend certifications, suggest skills they should improve, and discuss software development topics.

User Performance Profile:
- Total Quizzes Solved: ${(attempts || []).length}
- Strong subject areas (score >= 75%): ${strong.join(', ') || 'No strong subjects logged yet. Encourage them to play more quizzes!'}
- Subject areas needing improvement (score < 75%): ${weak.join(', ') || 'None detected yet or no quizzes solved.'}

Rules:
1. Provide personalized career recommendations based on the user's strong and weak subject areas.
2. Suggest standard certifications (e.g. AWS Developer, Google Cloud Professional, Scrum Master, Oracle Java, etc.) that match their strengths.
3. Suggest concrete steps to improve in weak subject areas (e.g. practicing in Practice Mode, studying documentation, reading books, etc.).
4. Be inspiring, highly professional, and encouraging.
5. Keep your responses concise (approx. 2-3 structured sections) and formatted with clean Markdown list items, headers, and bold highlights.
6. YOU MUST RESPOND EXCLUSIVELY IN THE FOLLOWING LANGUAGE: ${language === 'ta' ? 'Tamil (தமிழ்)' : language === 'hi' ? 'Hindi (हिंदी)' : 'English'}. Translate general advice and guides, but keep technical terms or programming terminology in their standard form (English).`;

    // Map conversation logs to Gemini format
    const chatHistory = messages.filter(msg => msg.content).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      content: msg.content
    }));

    const aiResponse = await generateGeminiContent(chatHistory, systemInstruction);
    res.json({ response: aiResponse });
  } catch (err) {
    res.status(500).json({ error: 'AI Career Mentor service encountered an error: ' + err.message });
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
  addUserNotification,
  markNotificationsRead,
  deleteNotification,
  deleteAllNotifications,
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
  adminGetLoginLogs,
  askSkillPredictor
};
