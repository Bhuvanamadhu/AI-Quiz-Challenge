-- AI Quiz Challenge Database Schema Setup for Supabase PostgreSQL
-- Enforces relational links, triggers for user registration, and Row Level Security (RLS) policies

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. BASE TABLE DEFINITIONS
-- ==========================================

-- Profiles Table (stores basic user details, linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  profile_pic TEXT,
  bio TEXT,
  fav_category TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Questions Table (stores the seeded technical trivia questions)
CREATE TABLE IF NOT EXISTS public.questions (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_option TEXT NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
  explanation TEXT,
  hint TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Quiz Attempts Table (logs history of scores per user)
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  attempted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  accuracy INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  wrong_answers INTEGER NOT NULL,
  time_taken INTEGER NOT NULL,
  xp_earned INTEGER NOT NULL,
  coins_earned INTEGER NOT NULL,
  certificate_status TEXT DEFAULT 'Not Claimed' NOT NULL
);

-- Quiz Progress / Stats Table (accumulates player stats, streaks, level, and wallet)
CREATE TABLE IF NOT EXISTS public.quiz_progress (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_xp INTEGER DEFAULT 0 NOT NULL,
  quizzes_completed INTEGER DEFAULT 0 NOT NULL,
  perfect_quizzes INTEGER DEFAULT 0 NOT NULL,
  daily_streak INTEGER DEFAULT 0 NOT NULL,
  last_active TEXT,
  total_coins INTEGER DEFAULT 100 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Settings Table (user UI custom preferences)
CREATE TABLE IF NOT EXISTS public.settings (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  selected_theme TEXT DEFAULT 'dark' NOT NULL,
  avatar TEXT DEFAULT '👤' NOT NULL,
  avatar_frame TEXT DEFAULT 'none' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Leaderboard Table (cached leaderboard data for quick ordering)
CREATE TABLE IF NOT EXISTS public.leaderboard (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  username TEXT NOT NULL,
  total_xp INTEGER DEFAULT 0 NOT NULL,
  quizzes_completed INTEGER DEFAULT 0 NOT NULL,
  perfect_quizzes INTEGER DEFAULT 0 NOT NULL,
  daily_streak INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Achievements Table (unlocked medals/badges for user progress milestones)
CREATE TABLE IF NOT EXISTS public.achievements (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  badge_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT uq_achievements UNIQUE(user_id, badge_id)
);

-- Bookmarks Table (user saved questions for practice mode)
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  question_id INTEGER REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT uq_bookmarks UNIQUE(user_id, question_id)
);

-- Reported Questions Table (user flags questions for reviews)
CREATE TABLE IF NOT EXISTS public.reported_questions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  username TEXT,
  question_id INTEGER REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL,
  comments TEXT,
  reported_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Quiz Feedback Table (reviews and stars)
CREATE TABLE IF NOT EXISTS public.quiz_feedback (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  username TEXT,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comments TEXT,
  submitted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Notifications Table (in-app notifications drawer)
CREATE TABLE IF NOT EXISTS public.notifications (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  is_read INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Purchases Table (cosmetics bought from reward shop)
CREATE TABLE IF NOT EXISTS public.purchases (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  item_id TEXT NOT NULL,
  item_name TEXT NOT NULL,
  cost INTEGER NOT NULL,
  purchased_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Certificates Table (claimed user certificates qualifications >= 80% accuracy)
CREATE TABLE IF NOT EXISTS public.certificates (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  username TEXT NOT NULL,
  category TEXT NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  certificate_style TEXT DEFAULT 'classic' NOT NULL,
  claimed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS public.login_history (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  logged_in_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- OTP verification codes table (stores recovery OTP codes)
CREATE TABLE IF NOT EXISTS public.otp_codes (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);


-- ==========================================
-- 2. AUTOMATIC PROFILE INITIALIZATION TRIGGERS
-- ==========================================

-- Trigger to automatically create profile, progress, settings, and leaderboard on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_username TEXT;
  v_role TEXT := 'user';
BEGIN
  -- Extract username from raw user metadata (fallback to email prefix)
  v_username := COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1));
  
  -- Ensure username is unique to avoid unique constraint violations
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = v_username) LOOP
    v_username := v_username || floor(random() * 10)::text;
  END LOOP;

  -- First registered user becomes the admin
  IF NOT EXISTS (SELECT 1 FROM public.profiles) THEN
    v_role := 'admin';
  END IF;

  -- 1. Create public profile
  INSERT INTO public.profiles (id, username, email, role)
  VALUES (new.id, v_username, new.email, v_role);

  -- 2. Initialize default progress stats
  INSERT INTO public.quiz_progress (user_id, total_xp, total_coins, quizzes_completed, perfect_quizzes, daily_streak)
  VALUES (new.id, 0, 100, 0, 0, 0);

  -- 3. Initialize default settings preferences
  INSERT INTO public.settings (user_id, selected_theme, avatar, avatar_frame)
  VALUES (new.id, 'dark', '👤', 'none');

  -- 4. Initialize default leaderboard cache
  INSERT INTO public.leaderboard (user_id, username, total_xp, quizzes_completed, perfect_quizzes, daily_streak)
  VALUES (new.id, v_username, 0, 0, 0, 0);

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind trigger to auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ==========================================
-- 3. HELPER FUNCTIONS & RPC WRAPPERS
-- ==========================================

-- Check if active requesting user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC wrapper to fetch random questions for game
CREATE OR REPLACE FUNCTION public.get_random_questions(p_category TEXT, p_difficulty TEXT, p_limit INT)
RETURNS SETOF public.questions AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.questions
  WHERE LOWER(category) = LOWER(p_category)
    AND LOWER(difficulty) = LOWER(p_difficulty)
  ORDER BY random()
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ==========================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reported_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_history ENABLE ROW LEVEL SECURITY;

-- ** profiles policies **
CREATE POLICY "Allow public SELECT for user profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow user to update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- ** questions policies **
CREATE POLICY "Allow authenticated users to read questions" ON public.questions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admin to insert questions" ON public.questions FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Allow admin to update questions" ON public.questions FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "Allow admin to delete questions" ON public.questions FOR DELETE TO authenticated USING (public.is_admin());

-- ** quiz_attempts policies **
CREATE POLICY "Allow user to manage own attempts" ON public.quiz_attempts FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Allow admin to view all attempts" ON public.quiz_attempts FOR SELECT TO authenticated USING (public.is_admin());

-- ** quiz_progress policies **
CREATE POLICY "Allow user to manage own progress" ON public.quiz_progress FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Allow authenticated users to read progress (leaderboard)" ON public.quiz_progress FOR SELECT TO authenticated USING (true);

-- ** settings policies **
CREATE POLICY "Allow user to manage own settings" ON public.settings FOR ALL TO authenticated USING (auth.uid() = user_id);

-- ** leaderboard policies **
CREATE POLICY "Allow authenticated users to read leaderboard" ON public.leaderboard FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow user to update own leaderboard stats" ON public.leaderboard FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- ** achievements policies **
CREATE POLICY "Allow user to manage own achievements" ON public.achievements FOR ALL TO authenticated USING (auth.uid() = user_id);

-- ** bookmarks policies **
CREATE POLICY "Allow user to manage own bookmarks" ON public.bookmarks FOR ALL TO authenticated USING (auth.uid() = user_id);

-- ** reported_questions policies **
CREATE POLICY "Allow user to create reported questions" ON public.reported_questions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow admin to view/manage reports" ON public.reported_questions FOR ALL TO authenticated USING (public.is_admin());

-- ** quiz_feedback policies **
CREATE POLICY "Allow user to submit feedback" ON public.quiz_feedback FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow admin to view feedback" ON public.quiz_feedback FOR SELECT TO authenticated USING (public.is_admin());

-- ** notifications policies **
CREATE POLICY "Allow user to view/update own notifications" ON public.notifications FOR ALL TO authenticated USING (auth.uid() = user_id);

-- ** purchases policies **
CREATE POLICY "Allow user to view/insert own purchases" ON public.purchases FOR ALL TO authenticated USING (auth.uid() = user_id);

-- ** certificates policies **
CREATE POLICY "Allow public read access for certificates" ON public.certificates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow user to insert own certificates" ON public.certificates FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- ** login_history policies **
CREATE POLICY "Allow user to view own login history" ON public.login_history FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Allow user/server to log logins" ON public.login_history FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
