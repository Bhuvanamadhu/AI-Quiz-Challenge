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
  const { id } = req.params;

  try {
    const { data: user, error: userError } = await supabaseAdmin
      .from('profiles')
      .select('id, role')
      .eq('id', id)
      .maybeSingle();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ error: 'Cannot delete an Admin account.' });
    }

    // Delete user from Auth (which cascades deletes in profile/stats tables)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (deleteError) throw deleteError;

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

module.exports = {
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getAllUsers,
  deleteUser,
  searchQuestions
};
