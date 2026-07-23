const { getSupabaseClient } = require('../db');

// GET /api/analytics/category-breakdown — accuracy per category for a user
async function getCategoryBreakdown(req, res) {
  const userId = req.user.id;
  try {
    const supabase = getSupabaseClient(req);
    const { data: attempts, error } = await supabase
      .from('quiz_attempts')
      .select('category, score, total_questions')
      .eq('user_id', userId);

    if (error) throw error;

    const groupMap = {};
    (attempts || []).forEach(att => {
      const cat = att.category;
      if (!groupMap[cat]) {
        groupMap[cat] = {
          category: cat,
          total_quizzes: 0,
          total_correct: 0,
          total_questions: 0
        };
      }
      groupMap[cat].total_quizzes += 1;
      groupMap[cat].total_correct += att.score;
      groupMap[cat].total_questions += att.total_questions;
    });

    const breakdown = Object.values(groupMap).map(g => {
      const accuracy = g.total_questions > 0 
        ? parseFloat(((g.total_correct / g.total_questions) * 100).toFixed(1)) 
        : 0;
      return {
        category: g.category,
        total_quizzes: g.total_quizzes,
        total_correct: g.total_correct,
        total_questions: g.total_questions,
        accuracy
      };
    }).sort((a, b) => b.accuracy - a.accuracy);

    res.json(breakdown);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch analytics: ' + err.message });
  }
}

// GET /api/analytics/history — paginated full quiz history
async function getFullHistory(req, res) {
  const userId = req.user.id;
  const { page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  try {
    const supabase = getSupabaseClient(req);

    // Get exact count of attempts
    const { count, error: countErr } = await supabase
      .from('quiz_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (countErr) throw countErr;

    // Get paginated attempts
    const { data: rows, error: rowsErr } = await supabase
      .from('quiz_attempts')
      .select('category, difficulty, score, total_questions, attempted_at')
      .eq('user_id', userId)
      .order('attempted_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (rowsErr) throw rowsErr;

    res.json({ total: count || 0, page: parseInt(page), history: rows || [] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history: ' + err.message });
  }
}

// POST /api/bookmarks/:questionId — toggle bookmark
async function toggleBookmark(req, res) {
  const userId = req.user.id;
  const questionId = parseInt(req.params.questionId);
  try {
    const supabase = getSupabaseClient(req);

    const { data: existing, error: fetchErr } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', userId)
      .eq('question_id', questionId)
      .maybeSingle();

    if (fetchErr) throw fetchErr;

    if (existing) {
      const { error: deleteErr } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', existing.id);

      if (deleteErr) throw deleteErr;
      res.json({ bookmarked: false, message: 'Bookmark removed.' });
    } else {
      const { error: insertErr } = await supabase
        .from('bookmarks')
        .insert({ user_id: userId, question_id: questionId });

      if (insertErr) throw insertErr;
      res.json({ bookmarked: true, message: 'Question bookmarked.' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Bookmark toggle failed: ' + err.message });
  }
}

// GET /api/bookmarks — get user's bookmarked questions
async function getBookmarks(req, res) {
  const userId = req.user.id;
  try {
    const supabase = getSupabaseClient(req);

    const { data: bookmarks, error } = await supabase
      .from('bookmarks')
      .select(`
        question_id,
        questions (
          id, category, difficulty, question_text, 
          option_a, option_b, option_c, option_d, 
          correct_option, explanation, hint
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Flatten representation
    const flattened = (bookmarks || [])
      .map(b => b.questions)
      .filter(Boolean);

    res.json(flattened);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookmarks: ' + err.message });
  }
}

// GET /api/bookmarks/ids — get just the IDs
async function getBookmarkIds(req, res) {
  const userId = req.user.id;
  try {
    const supabase = getSupabaseClient(req);

    const { data: bookmarks, error } = await supabase
      .from('bookmarks')
      .select('question_id')
      .eq('user_id', userId);

    if (error) throw error;

    res.json((bookmarks || []).map(b => b.question_id));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookmark IDs: ' + err.message });
  }
}

module.exports = {
  getCategoryBreakdown,
  getFullHistory,
  toggleBookmark,
  getBookmarks,
  getBookmarkIds
};
