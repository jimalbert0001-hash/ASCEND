-- ASCEND Supabase Initial Schema
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Custom Types ─────────────────────────────────────────────────────────────

CREATE TYPE domain_type AS ENUM ('academics', 'startup', 'chess', 'guitar', 'life');
CREATE TYPE goal_status AS ENUM ('not_started', 'in_progress', 'completed', 'abandoned');
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'done', 'cancelled');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE habit_frequency AS ENUM ('daily', 'weekdays', 'weekends', 'weekly');
CREATE TYPE revision_stage AS ENUM ('first', 'second', 'third', 'mastered');
CREATE TYPE feature_status AS ENUM ('idea', 'planned', 'in_progress', 'done', 'dropped');
CREATE TYPE achievement_type AS ENUM ('milestone', 'streak', 'skill', 'meta');

-- ─── Users ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  onboarding_complete BOOLEAN NOT NULL DEFAULT FALSE,
  active_domains domain_type[] NOT NULL DEFAULT ARRAY['academics', 'startup', 'chess', 'guitar', 'life'],
  theme TEXT NOT NULL DEFAULT 'dark',
  daily_review_time TIME,
  weekly_review_day SMALLINT DEFAULT 0,
  board_year SMALLINT,
  target_percentage NUMERIC(5, 2),
  ai_metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Academics ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  color TEXT,
  icon TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  target_marks SMALLINT,
  weightage NUMERIC(4, 2),
  ai_metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  chapter_number SMALLINT,
  description TEXT,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  understanding_level SMALLINT,
  estimated_hours NUMERIC(4, 1),
  actual_hours NUMERIC(4, 1),
  first_studied_at DATE,
  completed_at DATE,
  ai_metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS revisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stage revision_stage NOT NULL DEFAULT 'first',
  scheduled_date DATE NOT NULL,
  completed_at TIMESTAMPTZ,
  quality SMALLINT,
  ease_factor NUMERIC(4, 2) NOT NULL DEFAULT 2.5,
  interval_days INTEGER NOT NULL DEFAULT 1,
  next_due_date DATE,
  notes TEXT,
  ai_metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS study_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  chapter_id UUID REFERENCES chapters(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  duration_mins INTEGER,
  session_type TEXT NOT NULL DEFAULT 'study',
  focus_score SMALLINT,
  notes TEXT,
  pomodoros SMALLINT NOT NULL DEFAULT 0,
  breaks_taken SMALLINT NOT NULL DEFAULT 0,
  ai_metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mock_tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  test_date DATE NOT NULL,
  total_marks SMALLINT NOT NULL,
  obtained_marks NUMERIC(5, 2) NOT NULL,
  duration_mins SMALLINT,
  time_taken_mins SMALLINT,
  weak_chapters TEXT[],
  strong_chapters TEXT[],
  notes TEXT,
  ai_metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS formulas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  formula TEXT NOT NULL,
  description TEXT,
  memorized BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Goals ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id UUID,
  domain domain_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status goal_status NOT NULL DEFAULT 'not_started',
  priority task_priority NOT NULL DEFAULT 'medium',
  target_date DATE,
  completed_at TIMESTAMPTZ,
  progress NUMERIC(5, 2) NOT NULL DEFAULT 0,
  tags TEXT[] NOT NULL DEFAULT '{}',
  ai_metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Tasks ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  goal_id UUID,
  domain domain_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status task_status NOT NULL DEFAULT 'todo',
  priority task_priority NOT NULL DEFAULT 'medium',
  entity_type TEXT,
  entity_id TEXT,
  due_date DATE,
  completed_at TIMESTAMPTZ,
  estimated_mins SMALLINT,
  actual_mins SMALLINT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  ai_metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Habits ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  domain domain_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  frequency habit_frequency NOT NULL DEFAULT 'daily',
  target_days SMALLINT[],
  target_count SMALLINT NOT NULL DEFAULT 1,
  unit TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  color TEXT,
  icon TEXT,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_checked_at DATE,
  ai_metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS habit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  logged_date DATE NOT NULL,
  count SMALLINT NOT NULL DEFAULT 1,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(habit_id, logged_date)
);

-- ─── Chess ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS chess_rating_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  rating INTEGER NOT NULL,
  platform TEXT,
  time_control TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chess_puzzle_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  puzzles_solved INTEGER NOT NULL DEFAULT 0,
  accuracy NUMERIC(5, 2),
  time_spent_mins INTEGER,
  difficulty TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chess_openings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  moves TEXT,
  color TEXT,
  games_played INTEGER NOT NULL DEFAULT 0,
  win_rate NUMERIC(5, 2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chess_endgame_studies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT,
  status TEXT,
  difficulty TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chess_tournaments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  platform TEXT,
  format TEXT,
  result TEXT,
  score NUMERIC(5, 2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chess_training_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type TEXT NOT NULL,
  duration_mins INTEGER,
  focus_areas TEXT[],
  notes TEXT,
  rating INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chess_game_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  opponent TEXT,
  platform TEXT,
  result TEXT,
  moves TEXT,
  notes TEXT,
  rating INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Guitar ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS guitar_practice_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  duration_mins INTEGER NOT NULL,
  exercises TEXT[],
  bpm INTEGER,
  notes TEXT,
  songs TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS guitar_songs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  artist TEXT,
  status TEXT NOT NULL DEFAULT 'learning',
  difficulty TEXT,
  notes TEXT,
  progress INTEGER NOT NULL DEFAULT 0,
  start_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS guitar_chords (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  difficulty TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS guitar_scales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  difficulty TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS guitar_theory_lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  topic TEXT,
  status TEXT,
  notes TEXT,
  difficulty TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS guitar_recordings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  url TEXT,
  notes TEXT,
  duration_mins INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS guitar_skill_areas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  level TEXT,
  notes TEXT,
  progress INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Startup ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS startup_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  logo_url TEXT,
  stage TEXT NOT NULL DEFAULT 'idea',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  website_url TEXT,
  github_url TEXT,
  notion_url TEXT,
  started_at DATE,
  launched_at DATE,
  tech_stack TEXT[] NOT NULL DEFAULT '{}',
  tags TEXT[] NOT NULL DEFAULT '{}',
  ai_metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS startup_ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS startup_roadmap (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES startup_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT,
  priority TEXT,
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS startup_features (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES startup_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT,
  priority TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS startup_bugs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES startup_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT,
  priority TEXT,
  severity TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS startup_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES startup_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT,
  due_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS startup_revenue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES startup_projects(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  amount NUMERIC(10, 2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS startup_user_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES startup_projects(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  users INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Daily Reviews ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS daily_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  review_date DATE NOT NULL,
  energy_level SMALLINT,
  mood_score SMALLINT,
  overall_score INTEGER,
  wins TEXT[] NOT NULL DEFAULT '{}',
  blockers TEXT[] NOT NULL DEFAULT '{}',
  tomorrow_priorities TEXT[] NOT NULL DEFAULT '{}',
  study_mins INTEGER NOT NULL DEFAULT 0,
  chess_session_done BOOLEAN NOT NULL DEFAULT FALSE,
  guitar_session_done BOOLEAN NOT NULL DEFAULT FALSE,
  startup_task_done BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT,
  ai_summary TEXT,
  ai_metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, review_date)
);

CREATE TABLE IF NOT EXISTS weekly_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  avg_daily_score NUMERIC(5, 2),
  total_study_mins INTEGER NOT NULL DEFAULT 0,
  habits_completion_rate NUMERIC(5, 2),
  biggest_win TEXT,
  biggest_challenge TEXT,
  lessons_learned TEXT[] NOT NULL DEFAULT '{}',
  next_week_focus TEXT[] NOT NULL DEFAULT '{}',
  ai_digest TEXT,
  ai_metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, week_start)
);

-- ─── Achievements ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type achievement_type NOT NULL,
  domain domain_type,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  badge_url TEXT,
  trigger_entity TEXT,
  trigger_value NUMERIC(10, 2),
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_seen BOOLEAN NOT NULL DEFAULT FALSE,
  ai_metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Row Level Security ─────────────────────────────────────────────────────────

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE formulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE chess_rating_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE chess_puzzle_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chess_openings ENABLE ROW LEVEL SECURITY;
ALTER TABLE chess_endgame_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE chess_tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE chess_training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chess_game_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE guitar_practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE guitar_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE guitar_chords ENABLE ROW LEVEL SECURITY;
ALTER TABLE guitar_scales ENABLE ROW LEVEL SECURITY;
ALTER TABLE guitar_theory_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE guitar_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE guitar_skill_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE startup_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE startup_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE startup_roadmap ENABLE ROW LEVEL SECURITY;
ALTER TABLE startup_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE startup_bugs ENABLE ROW LEVEL SECURITY;
ALTER TABLE startup_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE startup_revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE startup_user_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- RLS policies: users can only see their own data
CREATE POLICY users_own ON users FOR ALL USING (id = auth.uid());
CREATE POLICY profiles_own ON profiles FOR ALL USING (user_id = auth.uid());
CREATE POLICY subjects_own ON subjects FOR ALL USING (user_id = auth.uid());
CREATE POLICY chapters_own ON chapters FOR ALL USING (user_id = auth.uid());
CREATE POLICY revisions_own ON revisions FOR ALL USING (user_id = auth.uid());
CREATE POLICY study_sessions_own ON study_sessions FOR ALL USING (user_id = auth.uid());
CREATE POLICY mock_tests_own ON mock_tests FOR ALL USING (user_id = auth.uid());
CREATE POLICY formulas_own ON formulas FOR ALL USING (user_id = auth.uid());
CREATE POLICY goals_own ON goals FOR ALL USING (user_id = auth.uid());
CREATE POLICY tasks_own ON tasks FOR ALL USING (user_id = auth.uid());
CREATE POLICY habits_own ON habits FOR ALL USING (user_id = auth.uid());
CREATE POLICY habit_logs_own ON habit_logs FOR ALL USING (user_id = auth.uid());
CREATE POLICY chess_rating_history_own ON chess_rating_history FOR ALL USING (user_id = auth.uid());
CREATE POLICY chess_puzzle_sessions_own ON chess_puzzle_sessions FOR ALL USING (user_id = auth.uid());
CREATE POLICY chess_openings_own ON chess_openings FOR ALL USING (user_id = auth.uid());
CREATE POLICY chess_endgame_studies_own ON chess_endgame_studies FOR ALL USING (user_id = auth.uid());
CREATE POLICY chess_tournaments_own ON chess_tournaments FOR ALL USING (user_id = auth.uid());
CREATE POLICY chess_training_sessions_own ON chess_training_sessions FOR ALL USING (user_id = auth.uid());
CREATE POLICY chess_game_notes_own ON chess_game_notes FOR ALL USING (user_id = auth.uid());
CREATE POLICY guitar_practice_sessions_own ON guitar_practice_sessions FOR ALL USING (user_id = auth.uid());
CREATE POLICY guitar_songs_own ON guitar_songs FOR ALL USING (user_id = auth.uid());
CREATE POLICY guitar_chords_own ON guitar_chords FOR ALL USING (user_id = auth.uid());
CREATE POLICY guitar_scales_own ON guitar_scales FOR ALL USING (user_id = auth.uid());
CREATE POLICY guitar_theory_lessons_own ON guitar_theory_lessons FOR ALL USING (user_id = auth.uid());
CREATE POLICY guitar_recordings_own ON guitar_recordings FOR ALL USING (user_id = auth.uid());
CREATE POLICY guitar_skill_areas_own ON guitar_skill_areas FOR ALL USING (user_id = auth.uid());
CREATE POLICY startup_projects_own ON startup_projects FOR ALL USING (user_id = auth.uid());
CREATE POLICY startup_ideas_own ON startup_ideas FOR ALL USING (user_id = auth.uid());
CREATE POLICY startup_roadmap_own ON startup_roadmap FOR ALL USING (user_id = auth.uid());
CREATE POLICY startup_features_own ON startup_features FOR ALL USING (user_id = auth.uid());
CREATE POLICY startup_bugs_own ON startup_bugs FOR ALL USING (user_id = auth.uid());
CREATE POLICY startup_milestones_own ON startup_milestones FOR ALL USING (user_id = auth.uid());
CREATE POLICY startup_revenue_own ON startup_revenue FOR ALL USING (user_id = auth.uid());
CREATE POLICY startup_user_metrics_own ON startup_user_metrics FOR ALL USING (user_id = auth.uid());
CREATE POLICY daily_reviews_own ON daily_reviews FOR ALL USING (user_id = auth.uid());
CREATE POLICY weekly_reviews_own ON weekly_reviews FOR ALL USING (user_id = auth.uid());
CREATE POLICY achievements_own ON achievements FOR ALL USING (user_id = auth.uid());
