const { supabaseAdmin, getSupabaseClient } = require('../db');

// Get questions by category, difficulty, limit
async function getQuestions(req, res) {
  let { category, difficulty, limit = 10 } = req.query;

  if (!category || !difficulty) {
    return res.status(400).json({ error: 'Category and difficulty parameters are required.' });
  }

  // Handle C++ encoding parser issues
  if (category.trim() === 'C' && req.originalUrl && (req.originalUrl.includes('C++') || req.originalUrl.includes('C%2B%2B'))) {
    category = 'C++';
  }

  try {
    const supabase = getSupabaseClient(req);
    
    // Call the Postgres RPC function to get random questions
    const { data: questions, error } = await supabase.rpc('get_random_questions', {
      p_category: category,
      p_difficulty: difficulty.toLowerCase(),
      p_limit: parseInt(limit)
    });

    if (error) {
      throw new Error(error.message);
    }

    res.json(questions || []);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch questions: ' + err.message });
  }
}

// In-memory active quiz sessions registry for real-time in-progress tracking
const activeSessions = new Map();

function getActiveSessions() {
  const now = Date.now();
  // Clear any sessions older than 2 hours to avoid stale records
  for (const [key, val] of activeSessions.entries()) {
    if (val.timestamp && (now - val.timestamp > 2 * 60 * 60 * 1000)) {
      activeSessions.delete(key);
    }
  }
  return Array.from(activeSessions.values());
}

function registerActiveSession(sessionData) {
  activeSessions.set(sessionData.userId, {
    ...sessionData,
    timestamp: Date.now()
  });
}

function clearActiveSession(userId) {
  activeSessions.delete(userId);
}

// Start in-progress quiz session
async function startQuizSession(req, res) {
  try {
    const userId = req.user.id;
    const username = req.user.username;
    const { category, difficulty, game_mode, gameMode, totalQuestions, startedAt } = req.body;

    const total = parseInt(totalQuestions) || 10;
    const start = startedAt || new Date().toISOString();
    const resolvedMode = game_mode || gameMode || 'classic';

    registerActiveSession({
      userId,
      username,
      category: category || 'AI',
      difficulty: difficulty || 'easy',
      game_mode: resolvedMode,
      gameMode: resolvedMode,
      totalQuestions: total,
      startedAt: start,
      status: 'In-Progress'
    });

    res.json({ message: 'Active quiz session started.', userId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to start quiz session: ' + err.message });
  }
}

// Submit quiz answers and update statistics & achievements
async function submitQuiz(req, res) {
  const userId = req.user.id;
  const { category, difficulty, score, game_mode, gameMode, lifelines_used, time_taken, accuracy, correct_answers, wrong_answers, startedAt, completedAt, answersLog, unanswered, completion_status } = req.body;
  const totalQuestions = req.body.totalQuestions || req.body.total;

  // Clear in-progress session on submission
  clearActiveSession(userId);

  if (score === undefined || !totalQuestions || !category || !difficulty) {
    return res.status(400).json({ error: 'Invalid submission data.' });
  }

  // Type and range validation checks
  const parsedScore = parseInt(score);
  const parsedTotal = parseInt(totalQuestions);
  if (isNaN(parsedScore) || isNaN(parsedTotal) || parsedScore < 0 || parsedTotal <= 0 || parsedScore > parsedTotal) {
    return res.status(400).json({ error: 'Invalid score or total questions format.' });
  }

  const validDifficulties = ['easy', 'medium', 'hard'];
  if (!validDifficulties.includes(difficulty.toLowerCase())) {
    return res.status(400).json({ error: 'Invalid difficulty parameter.' });
  }

  const validModes = ['classic', 'speed', 'survival', 'marathon', 'daily', 'practice', 'super run', 'speed run'];
  const mode = (game_mode || gameMode || 'classic').toLowerCase();
  if (!validModes.includes(mode)) {
    return res.status(400).json({ error: 'Invalid game mode parameter.' });
  }

  try {
    const supabase = getSupabaseClient(req);

    // 1. Retrieve existing progress
    let { data: progress, error: progressErr } = await supabaseAdmin
      .from('quiz_progress')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (!progress) {
      // Create progress if missing
      const { data: newProg, error: createErr } = await supabaseAdmin
        .from('quiz_progress')
        .insert({ user_id: userId, total_xp: 0, total_coins: 100, quizzes_completed: 0, perfect_quizzes: 0, daily_streak: 0 })
        .select()
        .single();
      
      if (createErr) throw createErr;
      progress = newProg;
    }

    // 2. Calculate XP
    let xpMultiplier = 10;
    if (difficulty.toLowerCase() === 'easy') xpMultiplier = 5;
    if (difficulty.toLowerCase() === 'hard') xpMultiplier = 15;

    let xpEarned = score * xpMultiplier;
    let isPerfect = score === totalQuestions;

    if (isPerfect) xpEarned += 50; // Perfect score bonus

    if (mode === 'speed') xpEarned = Math.round(xpEarned * 1.3);
    if (mode === 'survival') xpEarned = Math.round(xpEarned * 1.5);
    if (mode === 'marathon') xpEarned = Math.round(xpEarned * 1.2);

    xpEarned += 10; // Participation bonus

    // 3. Update Daily Streak
    const todayStr = new Date().toISOString().split('T')[0];
    let newStreak = progress.daily_streak || 0;

    if (progress.last_active) {
      const lastActiveDate = new Date(progress.last_active);
      const todayDate = new Date(todayStr);
      const diffTime = Math.abs(todayDate - lastActiveDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }

    // Streak multiplier
    if (newStreak >= 14) xpEarned = Math.round(xpEarned * 1.5);
    else if (newStreak >= 7) xpEarned = Math.round(xpEarned * 1.3);
    else if (newStreak >= 3) xpEarned = Math.round(xpEarned * 1.15);

    const newXp = (progress.total_xp || 0) + xpEarned;
    const currentCoins = progress.total_coins !== undefined ? progress.total_coins : 100;
    const newCoins = currentCoins + xpEarned;
    const newQuizzesCompleted = (progress.quizzes_completed || 0) + 1;
    const newPerfectQuizzes = (progress.perfect_quizzes || 0) + (isPerfect ? 1 : 0);

    // Update progress in DB
    const { error: updateProgErr } = await supabaseAdmin
      .from('quiz_progress')
      .update({
        total_xp: newXp,
        total_coins: newCoins,
        quizzes_completed: newQuizzesCompleted,
        perfect_quizzes: newPerfectQuizzes,
        daily_streak: newStreak,
        last_active: todayStr,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateProgErr) throw updateProgErr;

    // Update Leaderboard cache resolving conflicts on unique user_id
    try {
      const { data: updatedLb } = await supabaseAdmin
        .from('leaderboard')
        .update({
          username: req.user.username,
          total_xp: newXp,
          quizzes_completed: newQuizzesCompleted,
          perfect_quizzes: newPerfectQuizzes,
          daily_streak: newStreak,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select();

      if (!updatedLb || updatedLb.length === 0) {
        await supabaseAdmin
          .from('leaderboard')
          .insert({
            user_id: userId,
            username: req.user.username,
            total_xp: newXp,
            quizzes_completed: newQuizzesCompleted,
            perfect_quizzes: newPerfectQuizzes,
            daily_streak: newStreak
          });
      }
    } catch (lbEx) {
      console.warn('⚠️ Leaderboard cache update note:', lbEx.message);
    }

    // 4. Record the attempt details
    const parsedTotal = totalQuestions ? parseInt(totalQuestions) : 10;
    const rawLog = Array.isArray(answersLog) ? answersLog : [];
    
    let logCorrect = 0;
    let logWrong = 0;
    let logUnanswered = 0;
    
    if (rawLog.length > 0) {
      rawLog.forEach(q => {
        const isUnanswered = !q.selected || q.selected === 'None' || String(q.selected).includes('None') || String(q.selected).includes('Timed Out') || String(q.selected).includes('Skipped');
        if (isUnanswered) {
          logUnanswered += 1;
        } else if (q.isCorrect) {
          logCorrect += 1;
        } else {
          logWrong += 1;
        }
      });
      logUnanswered += Math.max(0, parsedTotal - rawLog.length);
    }

    const computedCorrect = correct_answers !== undefined ? parseInt(correct_answers) : (rawLog.length > 0 ? logCorrect : parseInt(score));
    const computedWrong = wrong_answers !== undefined 
      ? parseInt(wrong_answers) 
      : (rawLog.length > 0 ? logWrong : Math.max(0, parsedTotal - computedCorrect - (unanswered !== undefined ? parseInt(unanswered) : 0)));
    const computedAttempted = req.body.questionsAttempted !== undefined 
      ? parseInt(req.body.questionsAttempted) 
      : (req.body.attempted !== undefined ? parseInt(req.body.attempted) : (computedCorrect + computedWrong));
    const computedUnanswered = unanswered !== undefined 
      ? parseInt(unanswered) 
      : (rawLog.length > 0 ? logUnanswered : Math.max(0, parsedTotal - computedAttempted));

    const computedAccuracy = accuracy !== undefined ? accuracy : Math.round((computedCorrect / parsedTotal) * 100);
    const computedTime = time_taken || 0;
    const computedStatus = completion_status || (mode === 'survival' && score < parsedTotal ? 'Game Over' : 'Completed');

    // Build rich attempt metadata bundle (preserves dynamic questions, answersLog, timing, and status)
    const attemptMetadata = JSON.stringify({
      cert: 'Not Claimed',
      startedAt: startedAt || new Date().toISOString(),
      completedAt: completedAt || new Date().toISOString(),
      status: computedStatus,
      game_mode: game_mode || gameMode || mode,
      gameMode: game_mode || gameMode || mode,
      unanswered: computedUnanswered,
      attempted: computedAttempted,
      correct: computedCorrect,
      wrong: computedWrong,
      questions: rawLog
    });

    const dbClient = getSupabaseClient(req) || supabaseAdmin;
    let { error: insertAttemptErr } = await dbClient
      .from('quiz_attempts')
      .insert({
        user_id: userId,
        category,
        difficulty,
        score,
        total_questions: totalQuestions,
        accuracy: computedAccuracy,
        correct_answers: computedCorrect,
        wrong_answers: computedWrong,
        time_taken: computedTime,
        xp_earned: xpEarned,
        coins_earned: xpEarned,
        certificate_status: attemptMetadata
      });

    if (insertAttemptErr) {
      const { error: adminRetryErr } = await supabaseAdmin
        .from('quiz_attempts')
        .insert({
          user_id: userId,
          category,
          difficulty,
          score,
          total_questions: totalQuestions,
          accuracy: computedAccuracy,
          correct_answers: computedCorrect,
          wrong_answers: computedWrong,
          time_taken: computedTime,
          xp_earned: xpEarned,
          coins_earned: xpEarned,
          certificate_status: attemptMetadata
        });
      insertAttemptErr = adminRetryErr;
    }

    if (insertAttemptErr) throw insertAttemptErr;

    // 5. Evaluate and unlock achievements/badges
    const unlockedBadges = [];
    const { data: achievements } = await supabaseAdmin
      .from('achievements')
      .select('badge_id')
      .eq('user_id', userId);
    
    const existingBadges = (achievements || []).map(b => b.badge_id);

    const checkBadge = async (badgeId) => {
      if (!existingBadges.includes(badgeId)) {
        const { error: badgeErr } = await supabaseAdmin
          .from('achievements')
          .insert({ user_id: userId, badge_id: badgeId });
        
        if (!badgeErr) {
          unlockedBadges.push(badgeId);
        }
      }
    };

    // Badge triggers logic
    if (newQuizzesCompleted >= 1) await checkBadge('first_step');
    if (newPerfectQuizzes >= 1) await checkBadge('perfectionist');
    if (newQuizzesCompleted >= 10) await checkBadge('quiz_master');
    if (isPerfect && difficulty.toLowerCase() === 'hard') await checkBadge('legendary_brain');
    if (newStreak >= 3) await checkBadge('dedicated_scholar');
    if (isPerfect && category === 'AI') await checkBadge('ai_guru');

    if (newStreak >= 5) await checkBadge('quiz_streak_5');
    if (newPerfectQuizzes >= 10) await checkBadge('perfect_10');
    if (newQuizzesCompleted >= 25) await checkBadge('completed_25');
    if (newXp >= 1000) await checkBadge('xp_1000');

    if (mode === 'speed') await checkBadge('speed_demon');
    if (mode === 'survival' && score >= 20) await checkBadge('survivor');
    if (mode === 'marathon') await checkBadge('marathon_runner');
    if (newQuizzesCompleted >= 50) await checkBadge('half_century');
    if (newQuizzesCompleted >= 100) await checkBadge('century_club');
    if (newStreak >= 7) await checkBadge('streak_king');
    if (newStreak >= 14) await checkBadge('unstoppable');
    if (newPerfectQuizzes >= 5) await checkBadge('perfectionist_elite');
    if (isPerfect && difficulty.toLowerCase() === 'hard' && (!lifelines_used || lifelines_used === 0)) {
      await checkBadge('no_lifeline');
    }

    const currentHour = new Date().getHours();
    if (currentHour >= 0 && currentHour < 5) await checkBadge('night_owl');
    if (currentHour >= 5 && currentHour < 7) await checkBadge('early_bird');

    // Fetch distinct categories attempted
    const { data: attemptsCount } = await supabaseAdmin
      .from('quiz_attempts')
      .select('category')
      .eq('user_id', userId);

    const distinctCats = [...new Set((attemptsCount || []).map(a => a.category))];
    if (distinctCats.length >= 10) await checkBadge('jack_of_all_trades');

    // Perfect in distinct categories
    const perfectAttempts = (attemptsCount || []).filter(a => {
      // Re-fetch score matches total questions if needed, or query it
      return false; // simpler fallback or let it match below
    });

    const { data: perfectAttemptsData } = await supabaseAdmin
      .from('quiz_attempts')
      .select('category')
      .eq('user_id', userId)
      .filter('score', 'eq', 'total_questions'); // note: postgrest doesn't support comparing 2 cols directly, so we filter programmatically
    
    // Better programmatic filter for perfect cats
    const { data: allUserAttempts } = await supabaseAdmin
      .from('quiz_attempts')
      .select('category, score, total_questions')
      .eq('user_id', userId);
    
    const perfectCatsList = [...new Set((allUserAttempts || [])
      .filter(a => a.score === a.total_questions)
      .map(a => a.category))];

    if (perfectCatsList.length >= 5) await checkBadge('category_master');

    res.json({
      xpEarned,
      newTotalXp: newXp,
      newCoins,
      streak: newStreak,
      streakMultiplier: newStreak >= 14 ? '2x' : newStreak >= 7 ? '1.5x' : newStreak >= 3 ? '1.25x' : '1x',
      isPerfect,
      unlockedBadges
    });
  } catch (err) {
    res.status(500).json({ error: 'Quiz submission failed: ' + err.message });
  }
}

// Get Leaderboard with period filter
async function getLeaderboard(req, res) {
  const { period = 'all' } = req.query;
  try {
    if (period === 'weekly' || period === 'monthly') {
      const days = period === 'weekly' ? 7 : 30;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      // Fetch attempts since cutoffDate, joining profiles to get usernames
      const { data: attempts, error } = await supabaseAdmin
        .from('quiz_attempts')
        .select(`
          user_id,
          score,
          total_questions,
          attempted_at,
          started_at,
          completed_at,
          profiles ( username )
        `)
        .gte('attempted_at', cutoffDate.toISOString());

      if (error) throw error;

      // Fetch progress list to get active streaks
      const { data: progressList } = await supabaseAdmin
        .from('quiz_progress')
        .select('user_id, daily_streak');
      
      const streakMap = {};
      (progressList || []).forEach(p => {
        streakMap[p.user_id] = p.daily_streak;
      });

      // Group and aggregate attempts client-side
      const userMap = {};
      (attempts || []).forEach(att => {
        const uid = att.user_id;
        const username = att.profiles ? att.profiles.username : 'Guest Player';
        const streak = streakMap[uid] || 0;

        if (!userMap[uid]) {
          userMap[uid] = {
            user_id: uid,
            username,
            period_score: 0,
            quizzes_completed: 0,
            perfect_quizzes: 0,
            daily_streak: streak,
            started_at: null,
            completed_at: null,
            _latest_attempted_at: null
          };
        }
        userMap[uid].period_score += att.score;
        userMap[uid].quizzes_completed += 1;
        if (att.score === att.total_questions) {
          userMap[uid].perfect_quizzes += 1;
        }

        // Track the latest attempt's started_at and completed_at
        if (!userMap[uid]._latest_attempted_at || new Date(att.attempted_at) > new Date(userMap[uid]._latest_attempted_at)) {
          userMap[uid]._latest_attempted_at = att.attempted_at;
          userMap[uid].started_at = att.started_at;
          userMap[uid].completed_at = att.completed_at;
        }
      });

      let leaderboardList = Object.values(userMap)
        .sort((a, b) => b.period_score - a.period_score)
        .slice(0, 20);

      // Map field names for frontend compatibility
      leaderboardList = leaderboardList.map(r => ({ ...r, total_xp: r.period_score }));
      res.json(leaderboardList);
    } else {
      // All-time global leaderboard from cached table
      const { data: leaderboard, error } = await supabaseAdmin
        .from('leaderboard')
        .select('*')
        .order('total_xp', { ascending: false })
        .limit(20);

      if (error) throw error;
      res.json(leaderboard || []);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve leaderboard: ' + err.message });
  }
}

// Get Daily Challenge (10 fixed questions changing daily)
async function getDailyChallenge(req, res) {
  try {
    const dateStr = new Date().toISOString().split('T')[0];
    let seed = 0;
    for (let i = 0; i < dateStr.length; i++) {
      seed += dateStr.charCodeAt(i);
    }

    // Retrieve all questions IDs
    const { data: allQuestions, error } = await supabaseAdmin
      .from('questions')
      .select('id');

    if (error) throw error;
    if (!allQuestions || allQuestions.length === 0) {
      return res.status(404).json({ error: 'No questions available for daily challenge.' });
    }

    // Deterministic random selection
    const chosenIds = [];
    const totalQCount = allQuestions.length;
    const questionsCountToPick = Math.min(10, totalQCount);

    for (let i = 0; i < questionsCountToPick; i++) {
      let index = (seed + i * 17) % totalQCount;
      let qId = allQuestions[index].id;
      if (!chosenIds.includes(qId)) {
        chosenIds.push(qId);
      } else {
        let offset = 1;
        while (chosenIds.includes(allQuestions[(index + offset) % totalQCount].id)) {
          offset++;
        }
        chosenIds.push(allQuestions[(index + offset) % totalQCount].id);
      }
    }

    const { data: dailyQuestions, error: questionsErr } = await supabaseAdmin
      .from('questions')
      .select('*')
      .in('id', chosenIds);

    if (questionsErr) throw questionsErr;

    res.json({
      date: dateStr,
      questions: dailyQuestions || []
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve daily challenge: ' + err.message });
  }
}

// Reset leaderboard score
async function deleteLeaderboardScore(req, res) {
  const userId = req.params.userId;
  const requesterId = req.user.id;
  const requesterRole = req.user.role;

  if (requesterRole !== 'admin' && requesterId !== userId) {
    return res.status(403).json({ error: 'You are only allowed to delete your own score.' });
  }

  try {
    // Reset progress
    const { error: resetProgErr } = await supabaseAdmin
      .from('quiz_progress')
      .update({ total_xp: 0, quizzes_completed: 0, perfect_quizzes: 0, daily_streak: 0, total_coins: 100, updated_at: new Date().toISOString() })
      .eq('user_id', userId);

    if (resetProgErr) throw resetProgErr;

    // Reset leaderboard cache
    const { error: resetLdErr } = await supabaseAdmin
      .from('leaderboard')
      .update({ total_xp: 0, quizzes_completed: 0, perfect_quizzes: 0, daily_streak: 0, updated_at: new Date().toISOString() })
      .eq('user_id', userId);

    if (resetLdErr) throw resetLdErr;

    // Delete attempts
    const { error: deleteAttemptsErr } = await supabaseAdmin
      .from('quiz_attempts')
      .delete()
      .eq('user_id', userId);

    if (deleteAttemptsErr) throw deleteAttemptsErr;

    // Delete achievements
    const { error: deleteAchievementsErr } = await supabaseAdmin
      .from('achievements')
      .delete()
      .eq('user_id', userId);

    if (deleteAchievementsErr) throw deleteAchievementsErr;

    res.json({ message: 'Leaderboard score reset successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete score: ' + err.message });
  }
}

module.exports = {
  getQuestions,
  submitQuiz,
  getLeaderboard,
  getDailyChallenge,
  deleteLeaderboardScore,
  startQuizSession,
  getActiveSessions,
  registerActiveSession,
  clearActiveSession
};
