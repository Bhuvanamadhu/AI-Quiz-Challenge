const { supabaseAdmin } = require('../db');

// Add a new question
async function createQuestion(req, res) {
  const { category, difficulty, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, hint } = req.body;

  if (!category || !difficulty || !question_text || !option_a || !option_b || !option_c || !option_d || !correct_option) {
    return res.status(400).json({ error: 'Required fields are missing.' });
  }

  const validOptions = ['A', 'B', 'C', 'D'];
  if (!validOptions.includes(correct_option.toUpperCase())) {
    return res.status(400).json({ error: "Correct option must be 'A', 'B', 'C', or 'D'." });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('questions')
      .insert({
        category,
        difficulty: difficulty.toLowerCase(),
        question_text,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_option: correct_option.toUpperCase(),
        explanation,
        hint
      })
      .select('id')
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Question added successfully.', questionId: data.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create question: ' + err.message });
  }
}

// Update an existing question
async function updateQuestion(req, res) {
  const { id } = req.params;
  const { category, difficulty, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, hint } = req.body;

  if (!category || !difficulty || !question_text || !option_a || !option_b || !option_c || !option_d || !correct_option) {
    return res.status(400).json({ error: 'Required fields are missing.' });
  }

  try {
    const { data: question } = await supabaseAdmin
      .from('questions')
      .select('id')
      .eq('id', parseInt(id))
      .maybeSingle();

    if (!question) {
      return res.status(404).json({ error: 'Question not found.' });
    }

    const { error: updateError } = await supabaseAdmin
      .from('questions')
      .update({
        category,
        difficulty: difficulty.toLowerCase(),
        question_text,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_option: correct_option.toUpperCase(),
        explanation,
        hint
      })
      .eq('id', parseInt(id));

    if (updateError) throw updateError;

    res.json({ message: 'Question updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update question: ' + err.message });
  }
}

// Delete a question
async function deleteQuestion(req, res) {
  const { id } = req.params;

  try {
    const { data: question } = await supabaseAdmin
      .from('questions')
      .select('id')
      .eq('id', parseInt(id))
      .maybeSingle();

    if (!question) {
      return res.status(404).json({ error: 'Question not found.' });
    }

    const { error: deleteError } = await supabaseAdmin
      .from('questions')
      .delete()
      .eq('id', parseInt(id));

    if (deleteError) throw deleteError;

    res.json({ message: 'Question deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete question: ' + err.message });
  }
}

// Get all users with progress
async function getAllUsers(req, res) {
  try {
    const { data: users, error } = await supabaseAdmin
      .from('profiles')
      .select(`
        id,
        username,
        email,
        role,
        created_at,
        quiz_progress ( total_xp, quizzes_completed, perfect_quizzes, daily_streak )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const flattened = (users || []).map(u => {
      // Handle the 1-to-1 relation structure
      const prog = Array.isArray(u.quiz_progress) 
        ? u.quiz_progress[0] 
        : u.quiz_progress || { total_xp: 0, quizzes_completed: 0, perfect_quizzes: 0, daily_streak: 0 };
        
      const p = prog || { total_xp: 0, quizzes_completed: 0, perfect_quizzes: 0, daily_streak: 0 };

      return {
        id: u.id,
        username: u.username,
        email: u.email,
        role: u.role,
        created_at: u.created_at,
        total_xp: p.total_xp,
        quizzes_completed: p.quizzes_completed,
        perfect_quizzes: p.perfect_quizzes,
        daily_streak: p.daily_streak
      };
    });

    res.json(flattened);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users list: ' + err.message });
  }
}

// Delete a user account
async function deleteUser(req, res) {
  const id = String(req.params.id || '').trim();

  if (!id) {
    return res.status(400).json({ error: 'User ID is required.' });
  }

  try {
    const { data: user, error: userError } = await supabaseAdmin
      .from('profiles')
      .select('id, role')
      .eq('id', id)
      .maybeSingle();

    if (user && String(user.role).toLowerCase().trim() === 'admin') {
      return res.status(400).json({ error: 'Cannot delete an Admin account.' });
    }

    // Clear active in-progress sessions if any
    try {
      const { clearActiveSession } = require('./quiz');
      if (clearActiveSession) clearActiveSession(id);
    } catch (e) {}

    // Explicitly delete user's quiz attempts and associated data from all tables
    await Promise.allSettled([
      supabaseAdmin.from('quiz_attempts').delete().eq('user_id', id),
      supabaseAdmin.from('quiz_progress').delete().eq('user_id', id),
      supabaseAdmin.from('leaderboard').delete().eq('user_id', id),
      supabaseAdmin.from('bookmarks').delete().eq('user_id', id),
      supabaseAdmin.from('achievements').delete().eq('user_id', id),
      supabaseAdmin.from('settings').delete().eq('user_id', id),
      supabaseAdmin.from('purchases').delete().eq('user_id', id),
      supabaseAdmin.from('notifications').delete().eq('user_id', id),
      supabaseAdmin.from('certificates').delete().eq('user_id', id),
      supabaseAdmin.from('login_history').delete().eq('user_id', id),
      supabaseAdmin.from('reported_questions').delete().eq('user_id', id),
      supabaseAdmin.from('quiz_feedback').delete().eq('user_id', id),
      supabaseAdmin.from('profiles').delete().eq('id', id)
    ]);

    // Delete user from Auth (cascades any remaining relations)
    try {
      await supabaseAdmin.auth.admin.deleteUser(id);
    } catch (authDelErr) {
      console.warn('Note: Auth admin delete notice:', authDelErr.message);
    }

    res.json({ message: 'User deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user: ' + err.message });
  }
}

// Search & Filter Questions (used in admin view)
async function searchQuestions(req, res) {
  const { query = '', category = '', difficulty = '', limit = 100 } = req.query;

  try {
    let queryBuilder = supabaseAdmin.from('questions').select('*');

    if (query) {
      queryBuilder = queryBuilder.ilike('question_text', `%${query}%`);
    }

    if (category) {
      queryBuilder = queryBuilder.eq('category', category);
    }

    if (difficulty) {
      queryBuilder = queryBuilder.eq('difficulty', difficulty.toLowerCase());
    }

    const { data: questions, error } = await queryBuilder
      .order('id', { ascending: false })
      .limit(parseInt(limit));

    if (error) throw error;

    res.json(questions || []);
  } catch (err) {
    res.status(500).json({ error: 'Failed to search questions: ' + err.message });
  }
}

// GET /api/admin/dashboard-overview
async function getDashboardOverview(req, res) {
  try {
    const { getActiveSessions } = require('./quiz');

    // 1. Total Registered Users
    const { count: totalUsers, error: usersErr } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (usersErr) throw usersErr;

    // 2. Total Completed Attempts from database
    const { count: completedAttempts, error: attemptsErr } = await supabaseAdmin
      .from('quiz_attempts')
      .select('*', { count: 'exact', head: true });

    if (attemptsErr) throw attemptsErr;

    // 3. Active in-progress sessions
    const inProgressList = getActiveSessions ? getActiveSessions() : [];
    const inProgressCount = inProgressList.length;

    const totalQuizAttempts = (completedAttempts || 0) + inProgressCount;
    const completedQuizzes = completedAttempts || 0;
    const inProgressQuizzes = inProgressCount;

    res.json({
      totalUsers: totalUsers || 0,
      totalAttempts: totalQuizAttempts,
      completedQuizzes,
      inProgressQuizzes
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dashboard overview: ' + err.message });
  }
}

// Helper to format game mode display names
function formatGameMode(rawMode) {
  if (!rawMode || rawMode === 'Not Available' || rawMode === 'null' || rawMode === 'undefined') {
    return 'Not Available';
  }
  const m = String(rawMode).trim().toLowerCase();
  if (m === 'classic') return 'Classic';
  if (m === 'speed' || m === 'speed run' || m === 'speed_run' || m === 'speedrun' || m === 'super run' || m === 'super_run' || m === 'superrun') return 'Super Run';
  if (m === 'survival') return 'Survival';
  if (m === 'marathon') return 'Marathon';
  if (m === 'daily' || m === 'daily challenge' || m === 'daily_challenge' || m === 'dailychallenge') return 'Daily Challenge';
  if (m === 'practice') return 'Practice';

  return String(rawMode).charAt(0).toUpperCase() + String(rawMode).slice(1);
}

// GET /api/admin/quiz-activity
async function getUserQuizActivity(req, res) {
  const { userId = '', username = '', quiz = '', status = '' } = req.query;

  try {
    const { getActiveSessions } = require('./quiz');

    // 1. Fetch completed attempts and user profiles
    const [attemptsRes, profilesRes] = await Promise.all([
      supabaseAdmin
        .from('quiz_attempts')
        .select(`
          id,
          user_id,
          category,
          difficulty,
          score,
          total_questions,
          accuracy,
          correct_answers,
          wrong_answers,
          time_taken,
          xp_earned,
          coins_earned,
          certificate_status,
          attempted_at,
          profiles (
            id,
            username,
            email
          )
        `)
        .order('attempted_at', { ascending: false }),
      supabaseAdmin
        .from('profiles')
        .select('id, username, email')
    ]);

    if (attemptsRes.error) {
      console.error('Database error fetching quiz_attempts:', attemptsRes.error);
      throw attemptsRes.error;
    }

    const attempts = attemptsRes.data || [];
    const allProfiles = profilesRes.data || [];
    const profileMap = new Map();
    allProfiles.forEach(p => {
      if (p && p.id) {
        profileMap.set(String(p.id).toLowerCase(), p);
      }
    });

    // 2. Fetch active in-progress quiz sessions
    const inProgressSessions = getActiveSessions ? getActiveSessions() : [];

    const activityList = [];

    // Process in-progress sessions first
    inProgressSessions.forEach(sess => {
      const sessTotalQ = parseInt(sess.totalQuestions) || 10;
      const sessUserProf = sess.userId ? profileMap.get(String(sess.userId).toLowerCase()) : null;
      const sessUsername = sess.username || (sessUserProf ? sessUserProf.username : 'Guest Player');
      const sessEmail = sessUserProf ? sessUserProf.email : '';
      const rawSessionMode = sess.game_mode || sess.gameMode || (sess.category === 'Daily Challenge' ? 'Daily Challenge' : 'classic');

      const sessionAttempt = {
        attemptId: `inprogress_${sess.userId}_${new Date(sess.startedAt).getTime()}`,
        userId: sess.userId || 'guest',
        username: sessUsername,
        userEmail: sessEmail,
        gameMode: formatGameMode(rawSessionMode),
        quizName: sess.category || 'AI',
        difficulty: sess.difficulty || 'easy',
        startedAt: sess.startedAt || new Date().toISOString(),
        completedAt: null,
        totalQuestions: sessTotalQ,
        questionsAttempted: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        unanswered: sessTotalQ,
        score: 0,
        timeTaken: 0,
        completionStatus: 'In-Progress',
        accuracy: 0,
        questionResults: []
      };
      activityList.push(sessionAttempt);
    });

    // Process database attempts
    attempts.forEach(att => {
      let meta = null;
      if (att.certificate_status && typeof att.certificate_status === 'string' && att.certificate_status.startsWith('{')) {
        try {
          meta = JSON.parse(att.certificate_status);
        } catch (e) {
          meta = null;
        }
      }

      // Resolve user profile info
      let userProf = att.profiles;
      if (Array.isArray(userProf)) userProf = userProf[0];
      if (!userProf && att.user_id) {
        userProf = profileMap.get(String(att.user_id).toLowerCase());
      }
      const resolvedUsername = (userProf && userProf.username) ? userProf.username : (att.user_id ? `User_${String(att.user_id).substring(0, 8)}` : 'Unknown User');
      const resolvedEmail = (userProf && userProf.email) ? userProf.email : '';

      const totalQ = parseInt(att.total_questions) || (meta && Array.isArray(meta.questions) ? meta.questions.length : 10);
      const scoreVal = parseInt(att.score) || 0;
      const correctA = (att.correct_answers !== undefined && att.correct_answers !== null) ? parseInt(att.correct_answers) : scoreVal;

      let rawQuestions = meta && Array.isArray(meta.questions) ? meta.questions : [];
      let attemptedA, wrongA, unansweredA;

      if (rawQuestions.length > 0) {
        // Detailed questions array present
        let correctCount = 0;
        let wrongCount = 0;
        let unansweredCount = 0;

        rawQuestions.forEach(q => {
          const isUnanswered = !q.selected || q.selected === 'None' || String(q.selected).includes('None') || String(q.selected).includes('Timed Out') || String(q.selected).includes('Skipped');
          if (isUnanswered) {
            unansweredCount += 1;
          } else if (q.isCorrect) {
            correctCount += 1;
          } else {
            wrongCount += 1;
          }
        });

        // Any questions in totalQ not in rawQuestions are unanswered
        unansweredA = unansweredCount + Math.max(0, totalQ - rawQuestions.length);
        attemptedA = Math.max(0, totalQ - unansweredA);
        wrongA = wrongCount;
      } else {
        // Legacy attempt without detailed questions array
        const storedWrong = (att.wrong_answers !== undefined && att.wrong_answers !== null) ? parseInt(att.wrong_answers) : null;
        const storedUnanswered = (meta && meta.unanswered !== undefined) ? parseInt(meta.unanswered) : null;
        const storedAttempted = (meta && meta.attempted !== undefined) ? parseInt(meta.attempted) : null;

        if (storedUnanswered !== null) {
          unansweredA = storedUnanswered;
          attemptedA = storedAttempted !== null ? storedAttempted : Math.max(0, totalQ - unansweredA);
          wrongA = storedWrong !== null ? storedWrong : Math.max(0, attemptedA - correctA);
        } else if (storedAttempted !== null) {
          attemptedA = storedAttempted;
          unansweredA = Math.max(0, totalQ - attemptedA);
          wrongA = storedWrong !== null ? storedWrong : Math.max(0, attemptedA - correctA);
        } else if (storedWrong !== null && (correctA + storedWrong) <= totalQ) {
          wrongA = storedWrong;
          attemptedA = correctA + wrongA;
          unansweredA = Math.max(0, totalQ - attemptedA);
        } else {
          wrongA = Math.max(0, totalQ - correctA);
          attemptedA = totalQ;
          unansweredA = 0;
        }
      }

      const startedTime = att.started_at || (meta && meta.startedAt ? meta.startedAt : att.attempted_at);
      const completedTime = att.completed_at || (meta && meta.completedAt ? meta.completedAt : att.attempted_at);
      const compStatus = meta && meta.status ? meta.status : 'Completed';

      let rawGameMode = null;
      if (meta && (meta.game_mode || meta.gameMode)) {
        rawGameMode = meta.game_mode || meta.gameMode;
      } else if (att.game_mode) {
        rawGameMode = att.game_mode;
      } else if (att.category === 'Daily Challenge' || (meta && meta.category === 'Daily Challenge')) {
        rawGameMode = 'Daily Challenge';
      }
      const resolvedGameMode = formatGameMode(rawGameMode);

      // Ensure questionResults array covers all 1..totalQ for the details modal
      if (rawQuestions.length === 0) {
        rawQuestions = [];
        for (let i = 1; i <= totalQ; i++) {
          if (i <= correctA) {
            rawQuestions.push({
              questionIndex: i,
              question: `Question ${i} (${att.category})`,
              selected: 'Correct Choice',
              correct: 'Correct Choice',
              isCorrect: true,
              explanation: 'Answered correctly during quiz challenge.'
            });
          } else if (i <= (correctA + wrongA)) {
            rawQuestions.push({
              questionIndex: i,
              question: `Question ${i} (${att.category})`,
              selected: 'Incorrect Choice',
              correct: 'Correct Choice',
              isCorrect: false,
              explanation: 'Answered incorrectly during quiz challenge.'
            });
          } else {
            rawQuestions.push({
              questionIndex: i,
              question: `Question ${i} (${att.category})`,
              selected: 'None (Unanswered)',
              correct: 'Correct Choice',
              isCorrect: false,
              explanation: 'Unanswered question.'
            });
          }
        }
      } else {
        const mappedQuestions = rawQuestions.map((q, idx) => ({
          questionIndex: idx + 1,
          question: q.question || `Question ${idx + 1}`,
          selected: q.selected || 'None',
          correct: q.correct || 'Correct Option',
          isCorrect: !!q.isCorrect,
          explanation: q.explanation || 'No explanation provided.'
        }));
        
        // If raw questions recorded was less than totalQ, fill the remaining with unanswered stubs
        for (let i = mappedQuestions.length + 1; i <= totalQ; i++) {
          mappedQuestions.push({
            questionIndex: i,
            question: `Question ${i} (${att.category})`,
            selected: 'None (Unanswered)',
            correct: 'Correct Option',
            isCorrect: false,
            explanation: 'Question was not reached or unanswered.'
          });
        }
        rawQuestions = mappedQuestions;
      }

      activityList.push({
        attemptId: String(att.id),
        userId: att.user_id,
        username: resolvedUsername,
        userEmail: resolvedEmail,
        gameMode: resolvedGameMode,
        quizName: att.category,
        difficulty: att.difficulty || 'normal',
        startedAt: startedTime,
        completedAt: completedTime,
        totalQuestions: totalQ,
        questionsAttempted: attemptedA,
        correctAnswers: correctA,
        wrongAnswers: wrongA,
        unanswered: unansweredA,
        score: scoreVal,
        timeTaken: att.time_taken || 0,
        completionStatus: compStatus,
        accuracy: att.accuracy !== undefined ? att.accuracy : Math.round((correctA / totalQ) * 100),
        questionResults: rawQuestions
      });
    });

    // 3. Apply Filters
    let filtered = activityList;

    // Filter A: User ID search (case-insensitive substring on full UUID)
    if (userId && userId.trim()) {
      const qUser = userId.toLowerCase().trim();
      filtered = filtered.filter(item => item.userId && String(item.userId).toLowerCase().includes(qUser));
    }

    // Filter B: Username search (case-insensitive partial text match, e.g. "bav" -> "bavani")
    if (username && username.trim()) {
      const qName = username.toLowerCase().trim();
      filtered = filtered.filter(item => item.username && String(item.username).toLowerCase().includes(qName));
    }

    // Filter C: Quiz Name filter
    if (quiz && quiz.trim() && quiz.toLowerCase().trim() !== 'all') {
      const qQuiz = quiz.toLowerCase().trim();
      filtered = filtered.filter(item => item.quizName && String(item.quizName).toLowerCase().trim() === qQuiz);
    }

    // Filter D: Completion Status filter (normalized comparison)
    if (status && status.trim() && status.toLowerCase().trim() !== 'all') {
      const normalizeStatus = s => String(s || '').toLowerCase().replace(/[-_\s]/g, '');
      const qStatus = normalizeStatus(status);
      filtered = filtered.filter(item => normalizeStatus(item.completionStatus) === qStatus);
    }

    res.json(filtered);
  } catch (err) {
    console.error('Error fetching admin user quiz activity:', err);
    res.status(500).json({ error: 'Failed to fetch user quiz activity: ' + (err.message || String(err)) });
  }
}

module.exports = {
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getAllUsers,
  deleteUser,
  searchQuestions,
  getDashboardOverview,
  getUserQuizActivity
};
