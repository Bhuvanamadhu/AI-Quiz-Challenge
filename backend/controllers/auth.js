const { supabaseAdmin, getSupabaseClient } = require('../db');

// Middleware to verify JWT token
async function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1]; // "Bearer <token>"
  if (!token) {
    return res.status(401).json({ error: 'Access denied. Invalid token format.' });
  }

  try {
    const supabase = getSupabaseClient(req);
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data || !data.user) {
      return res.status(401).json({ error: 'Invalid or expired session token.' });
    }

    // Fetch user details from public profiles table
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .select('username, role')
      .eq('id', data.user.id)
      .single();

    if (profileErr || !profile) {
      return res.status(401).json({ error: 'User profile not found.' });
    }

    // Attach user profile info to req
    req.user = {
      id: data.user.id,
      username: profile.username,
      email: data.user.email,
      role: profile.role
    };

    next();
  } catch (ex) {
    res.status(401).json({ error: 'Invalid token session: ' + ex.message });
  }
}

// Middleware to verify Admin role
async function verifyAdmin(req, res, next) {
  await verifyToken(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ error: 'Access denied. Admins only.' });
    }
  });
}

// Register User
async function register(req, res) {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    // Check if username is already taken in the public profiles table
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('username', username)
      .maybeSingle();

    if (existingUser) {
      return res.status(400).json({ error: 'Username already registered.' });
    }

    // Call Supabase signup
    const { data, error } = await supabaseAdmin.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username
        }
      }
    });

    if (error) {
      return res.status(400).json({ error: 'Registration failed: ' + error.message });
    }

    res.status(201).json({ 
      message: 'User registered successfully. Check email for verification if enabled.', 
      userId: data.user ? data.user.id : null 
    });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed: ' + err.message });
  }
}

// Login User
async function login(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  try {
    let email = username;

    // Check if input is a username (does not contain @)
    if (!username.includes('@')) {
      const { data: profile, error: profileErr } = await supabaseAdmin
        .from('profiles')
        .select('email')
        .eq('username', username)
        .maybeSingle();

      if (profileErr || !profile) {
        return res.status(400).json({ error: 'Invalid username or password.' });
      }
      email = profile.email;
    }

    // Call Supabase sign in
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password
    });

    if (error || !data || !data.user || !data.session) {
      return res.status(400).json({ error: error ? error.message : 'Invalid username or password.' });
    }

    // Fetch user details from public profiles table
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    // Log the login activity
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown Device';
    
    await supabaseAdmin
      .from('login_history')
      .insert({
        user_id: data.user.id,
        ip_address: ip,
        user_agent: userAgent
      });

    res.json({
      message: 'Login successful.',
      token: data.session.access_token,
      user: {
        id: data.user.id,
        username: profile ? profile.username : username,
        email: data.user.email,
        role: profile ? profile.role : 'user'
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Login failed: ' + err.message });
  }
}

// Get Logged-in User Profile Stats
async function getProfile(req, res) {
  try {
    const userId = req.user.id;

    // Query profiles
    const { data: user, error: userError } = await supabaseAdmin
      .from('profiles')
      .select('id, username, email, role, profile_pic, bio, fav_category, created_at')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    // Query progress
    const { data: progress } = await supabaseAdmin
      .from('quiz_progress')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    // Query achievements
    const { data: achievements } = await supabaseAdmin
      .from('achievements')
      .select('badge_id, unlocked_at')
      .eq('user_id', userId);

    // Query settings
    const { data: settings } = await supabaseAdmin
      .from('settings')
      .select('selected_theme, avatar, avatar_frame')
      .eq('user_id', userId)
      .maybeSingle();

    // Query attempts (history) - ordered by attempted_at DESC
    const { data: history } = await supabaseAdmin
      .from('quiz_attempts')
      .select('*')
      .eq('user_id', userId)
      .order('attempted_at', { ascending: false })
      .limit(10);

    const progressObj = progress || { total_xp: 0, quizzes_completed: 0, perfect_quizzes: 0, daily_streak: 0, total_coins: 100 };
    
    // Add settings variables to progressObj for compatibility with the existing frontend
    progressObj.selected_theme = settings ? settings.selected_theme : 'dark';
    progressObj.avatar = settings ? settings.avatar : '👤';
    progressObj.avatar_frame = settings ? settings.avatar_frame : 'none';

    res.json({
      user,
      progress: progressObj,
      achievements: achievements || [],
      history: history || []
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve profile: ' + err.message });
  }
}

module.exports = {
  verifyToken,
  verifyAdmin,
  register,
  login,
  getProfile
};
