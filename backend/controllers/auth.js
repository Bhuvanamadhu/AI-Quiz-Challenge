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
    let { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, username, email, role')
      .eq('id', data.user.id)
      .maybeSingle();

    if (!profile && data.user.email) {
      // Fallback: match by email in profiles table
      const { data: profByEmail } = await supabaseAdmin
        .from('profiles')
        .select('id, username, email, role')
        .ilike('email', data.user.email)
        .maybeSingle();
      if (profByEmail) {
        profile = profByEmail;
      }
    }

    const detectedRole = (profile && profile.role) ? String(profile.role).toLowerCase().trim() : 'user';
    const detectedUsername = (profile && profile.username) ? profile.username : (data.user.user_metadata?.username || (data.user.email ? data.user.email.split('@')[0] : 'User'));

    // Attach user profile info to req
    req.user = {
      id: data.user.id,
      username: detectedUsername,
      email: data.user.email,
      role: detectedRole
    };

    next();
  } catch (ex) {
    res.status(401).json({ error: 'Invalid token session: ' + ex.message });
  }
}

// Middleware to verify Admin role
async function verifyAdmin(req, res, next) {
  await verifyToken(req, res, () => {
    if (req.user && String(req.user.role).toLowerCase().trim() === 'admin') {
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

  // Validate username syntax (alphanumeric or underscores only, 3-20 chars)
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  if (!usernameRegex.test(username)) {
    return res.status(400).json({ error: 'Username must be 3-20 characters long and contain only letters, numbers, or underscores.' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  // Validate password length
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
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

    // Call Supabase admin.createUser to bypass email confirmation requirement
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        username: username
      }
    });

    if (error) {
      return res.status(400).json({ error: 'Registration failed: ' + error.message });
    }

    res.status(201).json({ 
      message: 'User registered successfully with auto-confirmed email.', 
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
    const rawInput = String(username).trim();
    const cleanUser = rawInput.toLowerCase();
    const noSpaceUser = cleanUser.replace(/[\s_.-]+/g, '');
    let resolvedEmail = null;
    let preMatchedProfile = null;

    // Case 1: Input contains '@' -> It is an email address
    if (rawInput.includes('@')) {
      const { data: emailMatches } = await supabaseAdmin
        .from('profiles')
        .select('id, username, email, role')
        .ilike('email', rawInput.trim());

      if (emailMatches && emailMatches.length > 0) {
        preMatchedProfile = emailMatches.find(p => String(p.role).toLowerCase() === 'admin') || emailMatches[0];
        resolvedEmail = preMatchedProfile.email.toLowerCase();
      } else {
        resolvedEmail = rawInput.trim().toLowerCase();
      }
    } else {
      // Case 2: Generic Admin Aliases (e.g. 'admin', 'administrator', 'sysadmin', 'root')
      const adminAliases = ['admin', 'administrator', 'sysadmin', 'root'];
      if (adminAliases.includes(cleanUser)) {
        const { data: adminProfiles } = await supabaseAdmin
          .from('profiles')
          .select('id, username, email, role')
          .ilike('role', 'admin');

        if (adminProfiles && adminProfiles.length > 0) {
          preMatchedProfile = adminProfiles[0];
          resolvedEmail = adminProfiles[0].email.toLowerCase();
        }
      }

      // Case 3: Direct case-insensitive match on username
      if (!resolvedEmail) {
        const { data: directMatches } = await supabaseAdmin
          .from('profiles')
          .select('id, username, email, role')
          .ilike('username', rawInput.trim());

        if (directMatches && directMatches.length > 0) {
          preMatchedProfile = directMatches.find(p => String(p.role).toLowerCase() === 'admin') || directMatches[0];
          resolvedEmail = preMatchedProfile.email.toLowerCase();
        }
      }

      // Case 4: No-space / punctuation-removed match (e.g. 'bhuvana madhu' -> 'bhuvanamadhu')
      if (!resolvedEmail) {
        const { data: noSpaceMatches } = await supabaseAdmin
          .from('profiles')
          .select('id, username, email, role')
          .ilike('username', noSpaceUser);

        if (noSpaceMatches && noSpaceMatches.length > 0) {
          preMatchedProfile = noSpaceMatches.find(p => String(p.role).toLowerCase() === 'admin') || noSpaceMatches[0];
          resolvedEmail = preMatchedProfile.email.toLowerCase();
        }
      }

      // Case 5: Match against email username prefix (e.g. 'bhuvanamadhu' -> 'bhuvanamadhu@gmail.com')
      if (!resolvedEmail) {
        const { data: prefixMatches } = await supabaseAdmin
          .from('profiles')
          .select('id, username, email, role')
          .ilike('email', `${noSpaceUser}@%`);

        if (prefixMatches && prefixMatches.length > 0) {
          preMatchedProfile = prefixMatches.find(p => String(p.role).toLowerCase() === 'admin') || prefixMatches[0];
          resolvedEmail = preMatchedProfile.email.toLowerCase();
        }
      }

      // Case 6: Word tokens match (e.g. 'bhuvana' from 'bhuvana madhu')
      if (!resolvedEmail) {
        const parts = rawInput.trim().split(/\s+/);
        if (parts.length > 1) {
          for (const word of parts) {
            if (word.length >= 3) {
              const { data: wordMatches } = await supabaseAdmin
                .from('profiles')
                .select('id, username, email, role')
                .ilike('username', word);

              if (wordMatches && wordMatches.length > 0) {
                preMatchedProfile = wordMatches.find(p => String(p.role).toLowerCase() === 'admin') || wordMatches[0];
                resolvedEmail = preMatchedProfile.email.toLowerCase();
                break;
              }
            }
          }
        }
      }

      // Case 7: Partial substring match (strictly prioritizing admin if multiple)
      if (!resolvedEmail) {
        const { data: partialMatches } = await supabaseAdmin
          .from('profiles')
          .select('id, username, email, role')
          .ilike('email', `%${noSpaceUser}%`);

        if (partialMatches && partialMatches.length > 0) {
          preMatchedProfile = partialMatches.find(p => String(p.role).toLowerCase() === 'admin') || partialMatches[0];
          resolvedEmail = preMatchedProfile.email.toLowerCase();
        }
      }
    }

    if (!resolvedEmail) {
      return res.status(400).json({ error: 'Invalid username or password.' });
    }

    // Call Supabase sign in with resolved email and password
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email: resolvedEmail,
      password: String(password).trim()
    });

    if (error || !data || !data.user || !data.session) {
      return res.status(400).json({ error: error ? error.message : 'Invalid username or password.' });
    }

    // Fetch user details from public profiles table
    let { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();

    if (!profile && data.user.email) {
      // Fallback: match by email in profiles table
      const { data: profByEmail } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .ilike('email', data.user.email)
        .maybeSingle();
      if (profByEmail) {
        profile = profByEmail;
      }
    }

    // Log the login activity
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown Device';
    
    try {
      await supabaseAdmin
        .from('login_history')
        .insert({
          user_id: data.user.id,
          ip_address: ip,
          user_agent: userAgent
        });
    } catch (logErr) {
      console.warn('Failed to insert login history:', logErr.message);
    }

    const detectedRole = (profile && profile.role)
      ? String(profile.role).toLowerCase().trim()
      : (preMatchedProfile && preMatchedProfile.role ? String(preMatchedProfile.role).toLowerCase().trim() : 'user');

    const detectedUsername = profile
      ? profile.username
      : (data.user.user_metadata?.username || (preMatchedProfile ? preMatchedProfile.username : username));

    res.json({
      message: 'Login successful.',
      token: data.session.access_token,
      user: {
        id: data.user.id,
        username: detectedUsername,
        email: data.user.email,
        role: detectedRole
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
    let { data: user, error: userError } = await supabaseAdmin
      .from('profiles')
      .select('id, username, email, role, profile_pic, bio, fav_category, created_at')
      .eq('id', userId)
      .maybeSingle();

    if (!user && req.user.email) {
      // Fallback query by email
      const { data: userByEmail } = await supabaseAdmin
        .from('profiles')
        .select('id, username, email, role, profile_pic, bio, fav_category, created_at')
        .ilike('email', req.user.email)
        .maybeSingle();
      if (userByEmail) {
        user = userByEmail;
      } else {
        user = {
          id: userId,
          username: req.user.username || 'User',
          email: req.user.email,
          role: req.user.role || 'user',
          profile_pic: '',
          bio: '',
          fav_category: 'AI',
          created_at: new Date().toISOString()
        };
      }
    }

    // Ensure role is normalized to lowercase
    user.role = String(user.role || req.user.role || 'user').toLowerCase().trim();

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
