-- =============================================================
-- ASCEND — Supabase PostgreSQL Schema
-- =============================================================
-- Extensions
-- =============================================================
create extension if not exists "uuid-ossp";
create extension if not exists "pgvector";       -- AI embeddings (future)
create extension if not exists "pg_trgm";        -- Full-text search
create extension if not exists "pg_cron";        -- Scheduled jobs

-- =============================================================
-- ENUMS
-- =============================================================
create type domain_type as enum ('academics', 'startup', 'chess', 'guitar', 'life');
create type goal_status as enum ('not_started', 'in_progress', 'completed', 'abandoned');
create type task_status as enum ('todo', 'in_progress', 'done', 'cancelled');
create type task_priority as enum ('low', 'medium', 'high', 'urgent');
create type habit_frequency as enum ('daily', 'weekdays', 'weekends', 'weekly');
create type session_type as enum ('study', 'practice', 'game', 'review');
create type revision_stage as enum ('first', 'second', 'third', 'mastered');
create type feature_status as enum ('idea', 'planned', 'in_progress', 'done', 'dropped');
create type achievement_type as enum ('milestone', 'streak', 'skill', 'meta');
create type notification_type as enum ('reminder', 'achievement', 'review_prompt', 'ai_insight');

-- =============================================================
-- TABLE: users
-- Rationale: Thin wrapper around Supabase Auth. auth.users is
-- managed by Supabase; this table holds app-level metadata only.
-- One row per authenticated user. Synced via Auth trigger.
-- =============================================================
create table public.users (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null unique,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- =============================================================
-- TABLE: profiles
-- Rationale: Separates identity (users) from personality/prefs
-- (profiles). Stores display data, onboarding status, timezone,
-- and domain-level configuration without polluting auth.users.
-- =============================================================
create table public.profiles (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null unique references public.users(id) on delete cascade,

  -- Identity
  display_name        text not null,
  avatar_url          text,
  bio                 text,
  timezone            text not null default 'Asia/Kolkata',

  -- Onboarding
  onboarding_complete boolean not null default false,
  active_domains      domain_type[] not null default '{academics,startup,chess,guitar,life}',

  -- Preferences
  theme               text not null default 'dark',        -- 'dark' | 'light' | 'system'
  daily_review_time   time,                                -- Preferred reminder time
  weekly_review_day   smallint default 0,                  -- 0=Sunday … 6=Saturday

  -- CBSE-specific
  board_year          smallint,                            -- e.g. 2026
  target_percentage   numeric(5,2),

  -- AI metadata (future: embedding of user context)
  ai_metadata         jsonb not null default '{}',

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- =============================================================
-- TABLE: goals
-- Rationale: Top-level intentions across all domains. Goals
-- decompose into tasks. Supports hierarchical goals (parent_id).
-- This is the north-star table — everything else serves goals.
-- =============================================================
create table public.goals (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.users(id) on delete cascade,
  parent_id       uuid references public.goals(id) on delete set null,  -- sub-goals

  domain          domain_type not null,
  title           text not null,
  description     text,
  status          goal_status not null default 'not_started',
  priority        task_priority not null default 'medium',

  target_date     date,
  completed_at    timestamptz,

  progress        numeric(5,2) not null default 0    -- 0–100; auto-computed or manual
    check (progress >= 0 and progress <= 100),

  tags            text[] not null default '{}',
  ai_metadata     jsonb not null default '{}',

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index goals_user_domain on public.goals(user_id, domain);
create index goals_status on public.goals(status);

-- =============================================================
-- TABLE: tasks
-- Rationale: Atomic, actionable items. Can belong to a goal and
-- optionally to a domain entity (e.g. a startup feature, a
-- chapter). entity_type + entity_id is a polymorphic reference.
-- =============================================================
create table public.tasks (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.users(id) on delete cascade,
  goal_id         uuid references public.goals(id) on delete set null,

  domain          domain_type not null,
  title           text not null,
  description     text,
  status          task_status not null default 'todo',
  priority        task_priority not null default 'medium',

  -- Polymorphic entity link (e.g. chapter, project, song)
  entity_type     text,  -- 'chapter' | 'startup_project' | 'guitar_song' | ...
  entity_id       uuid,

  due_date        date,
  completed_at    timestamptz,
  estimated_mins  smallint,
  actual_mins     smallint,

  tags            text[] not null default '{}',
  ai_metadata     jsonb not null default '{}',

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index tasks_user_status on public.tasks(user_id, status);
create index tasks_due_date on public.tasks(user_id, due_date);
create index tasks_entity on public.tasks(entity_type, entity_id);

-- =============================================================
-- TABLE: habits
-- Rationale: Recurring behaviours tracked daily. Separate from
-- tasks because habits have streaks, frequency rules, and
-- completion history as first-class concerns.
-- =============================================================
create table public.habits (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.users(id) on delete cascade,
  domain          domain_type not null,

  title           text not null,
  description     text,
  frequency       habit_frequency not null default 'daily',
  target_days     smallint[] default null,   -- null = use frequency; else [0,1,2] = Sun/Mon/Tue
  target_count    smallint not null default 1,  -- times per period
  unit            text,                       -- 'pages', 'minutes', 'problems'

  is_active       boolean not null default true,
  color           text,                       -- hex for UI
  icon            text,                       -- lucide icon name

  current_streak  integer not null default 0,
  longest_streak  integer not null default 0,
  last_checked_at date,

  ai_metadata     jsonb not null default '{}',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Habit check-ins (one row per day per habit)
create table public.habit_logs (
  id          uuid primary key default uuid_generate_v4(),
  habit_id    uuid not null references public.habits(id) on delete cascade,
  user_id     uuid not null references public.users(id) on delete cascade,
  logged_date date not null,
  count       smallint not null default 1,
  note        text,
  created_at  timestamptz not null default now(),
  unique(habit_id, logged_date)
);

create index habit_logs_habit_date on public.habit_logs(habit_id, logged_date desc);

-- =============================================================
-- ACADEMICS DOMAIN
-- =============================================================

-- TABLE: subjects
-- Rationale: CBSE Class 12 subjects. Fixed set per board year
-- but user can toggle active ones. Foundation for chapters/revision.
create table public.subjects (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.users(id) on delete cascade,

  name            text not null,           -- 'Physics', 'Mathematics', etc.
  code            text,                    -- CBSE subject code
  color           text,                    -- Hex for UI differentiation
  icon            text,                    -- Lucide icon name
  is_active       boolean not null default true,

  target_marks    smallint,                -- Out of 100
  weightage       numeric(4,2),            -- % of final score weight

  ai_metadata     jsonb not null default '{}',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- TABLE: chapters
-- Rationale: Each subject contains chapters. Chapters track
-- completion and understanding independently for spaced repetition.
create table public.chapters (
  id                  uuid primary key default uuid_generate_v4(),
  subject_id          uuid not null references public.subjects(id) on delete cascade,
  user_id             uuid not null references public.users(id) on delete cascade,

  name                text not null,
  chapter_number      smallint,
  description         text,

  is_completed        boolean not null default false,
  understanding_level smallint check (understanding_level between 1 and 5),  -- 1=weak 5=mastered
  estimated_hours     numeric(4,1),
  actual_hours        numeric(4,1),

  first_studied_at    date,
  completed_at        date,

  ai_metadata         jsonb not null default '{}',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index chapters_subject on public.chapters(subject_id);
create index chapters_user on public.chapters(user_id);

-- TABLE: revisions
-- Rationale: Spaced repetition log. Each row is a scheduled or
-- completed revision of a chapter. Edge Function computes next
-- revision date based on SM-2 algorithm.
create table public.revisions (
  id              uuid primary key default uuid_generate_v4(),
  chapter_id      uuid not null references public.chapters(id) on delete cascade,
  user_id         uuid not null references public.users(id) on delete cascade,

  stage           revision_stage not null default 'first',
  scheduled_date  date not null,
  completed_at    timestamptz,
  quality         smallint check (quality between 0 and 5),  -- SM-2: 0=blackout 5=perfect

  -- SM-2 state
  ease_factor     numeric(4,2) not null default 2.5,
  interval_days   integer not null default 1,
  next_due_date   date,

  notes           text,
  ai_metadata     jsonb not null default '{}',
  created_at      timestamptz not null default now()
);

create index revisions_user_due on public.revisions(user_id, scheduled_date);
create index revisions_chapter on public.revisions(chapter_id);

-- TABLE: study_sessions
-- Rationale: Pomodoro/free-form study sessions tied to a subject
-- and optionally a chapter. Drives analytics and time tracking.
create table public.study_sessions (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.users(id) on delete cascade,
  subject_id      uuid references public.subjects(id) on delete set null,
  chapter_id      uuid references public.chapters(id) on delete set null,

  started_at      timestamptz not null,
  ended_at        timestamptz,
  duration_mins   integer,                    -- Computed: ended_at - started_at

  session_type    text not null default 'study',  -- 'study' | 'revision' | 'mock_prep'
  focus_score     smallint check (focus_score between 1 and 5),
  notes           text,

  pomodoros       smallint not null default 0,
  breaks_taken    smallint not null default 0,

  ai_metadata     jsonb not null default '{}',
  created_at      timestamptz not null default now()
);

create index study_sessions_user_date on public.study_sessions(user_id, started_at desc);

-- TABLE: mock_tests
-- Rationale: Full or subject-wise mock tests. Tracks score trends,
-- time taken, and weak areas — critical for CBSE board prep.
create table public.mock_tests (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.users(id) on delete cascade,
  subject_id      uuid references public.subjects(id) on delete set null,

  name            text not null,
  test_date       date not null,
  total_marks     smallint not null,
  obtained_marks  numeric(5,2) not null,
  percentage      numeric(5,2) generated always as (obtained_marks / total_marks * 100) stored,

  duration_mins   smallint,
  time_taken_mins smallint,

  -- Weak areas from this test
  weak_chapters   uuid[],                 -- chapter IDs
  strong_chapters uuid[],

  paper_url       text,                   -- Supabase storage URL
  solution_url    text,

  notes           text,
  ai_metadata     jsonb not null default '{}',
  created_at      timestamptz not null default now()
);

create index mock_tests_user_date on public.mock_tests(user_id, test_date desc);

-- =============================================================
-- STARTUP DOMAIN
-- =============================================================

-- TABLE: startup_projects
-- Rationale: One user can have multiple ventures. This is the
-- root of the startup domain — features and metrics hang off it.
create table public.startup_projects (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.users(id) on delete cascade,

  name            text not null,
  tagline         text,
  description     text,
  logo_url        text,

  stage           text not null default 'idea',  -- 'idea'|'mvp'|'launch'|'growth'
  is_active       boolean not null default true,

  website_url     text,
  github_url      text,
  notion_url      text,

  started_at      date,
  launched_at     date,

  tech_stack      text[] not null default '{}',
  tags            text[] not null default '{}',
  ai_metadata     jsonb not null default '{}',

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- TABLE: startup_features
-- Rationale: Feature backlog and kanban board per project.
-- Tracks ideas from conception through shipping.
create table public.startup_features (
  id              uuid primary key default uuid_generate_v4(),
  project_id      uuid not null references public.startup_projects(id) on delete cascade,
  user_id         uuid not null references public.users(id) on delete cascade,

  title           text not null,
  description     text,
  status          feature_status not null default 'idea',
  priority        task_priority not null default 'medium',

  effort_estimate text,   -- 'xs' | 's' | 'm' | 'l' | 'xl'  (t-shirt sizing)
  impact_estimate text,   -- 'low' | 'medium' | 'high'

  started_at      timestamptz,
  completed_at    timestamptz,

  tags            text[] not null default '{}',
  ai_metadata     jsonb not null default '{}',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index startup_features_project on public.startup_features(project_id, status);

-- TABLE: startup_metrics
-- Rationale: Time-series KPIs for each project. Flexible key-value
-- design allows any metric (MRR, users, DAU, commits/week, etc.)
-- without schema changes.
create table public.startup_metrics (
  id              uuid primary key default uuid_generate_v4(),
  project_id      uuid not null references public.startup_projects(id) on delete cascade,
  user_id         uuid not null references public.users(id) on delete cascade,

  metric_name     text not null,        -- 'mrr_usd', 'active_users', 'github_stars'
  metric_value    numeric not null,
  unit            text,                 -- 'USD', 'users', 'stars'
  recorded_at     date not null,
  notes           text,

  created_at      timestamptz not null default now()
);

create index startup_metrics_project_metric on public.startup_metrics(project_id, metric_name, recorded_at desc);
create unique index startup_metrics_unique_day on public.startup_metrics(project_id, metric_name, recorded_at);

-- =============================================================
-- CHESS DOMAIN
-- =============================================================

-- TABLE: chess_sessions
-- Rationale: Logs of practice/game sessions. Captures platform,
-- time control, and what was worked on (openings, tactics, etc.)
create table public.chess_sessions (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.users(id) on delete cascade,

  session_date    date not null,
  duration_mins   smallint,
  session_type    text not null default 'game',  -- 'game'|'tactics'|'openings'|'endgame'|'analysis'

  platform        text,       -- 'chess.com' | 'lichess' | 'otb'
  time_control    text,       -- '10+0', 'rapid', 'blitz', 'classical'

  games_played    smallint not null default 0,
  wins            smallint not null default 0,
  losses          smallint not null default 0,
  draws           smallint not null default 0,

  tactics_solved  smallint,
  accuracy        numeric(5,2),   -- from chess.com/lichess

  openings_studied text[],
  focus_area      text,           -- free text: "Sicilian defence", "rook endgames"

  notes           text,
  game_pgn        text,           -- PGN for notable game (future: parsed by Edge Function)
  ai_metadata     jsonb not null default '{}',
  created_at      timestamptz not null default now()
);

create index chess_sessions_user_date on public.chess_sessions(user_id, session_date desc);

-- TABLE: chess_ratings
-- Rationale: Separate time-series table for rating snapshots.
-- Different from sessions — one session may not change rating.
-- Enables clean rating charts across platforms and time controls.
create table public.chess_ratings (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.users(id) on delete cascade,

  platform        text not null,       -- 'chess.com' | 'lichess' | 'fide'
  time_control    text not null,       -- 'bullet' | 'blitz' | 'rapid' | 'classical'
  rating          smallint not null,
  rd              numeric(6,2),        -- Rating deviation (Glicko-2)
  recorded_at     date not null,

  created_at      timestamptz not null default now()
);

create index chess_ratings_user on public.chess_ratings(user_id, platform, time_control, recorded_at desc);
create unique index chess_ratings_unique_day on public.chess_ratings(user_id, platform, time_control, recorded_at);

-- =============================================================
-- GUITAR DOMAIN
-- =============================================================

-- TABLE: guitar_sessions
-- Rationale: Practice log. Captures what was practiced (songs,
-- scales, exercises) and practice quality metrics.
create table public.guitar_sessions (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.users(id) on delete cascade,

  session_date    date not null,
  duration_mins   smallint not null,
  session_type    text not null default 'practice',  -- 'practice'|'performance'|'lesson'|'jam'

  focus_areas     text[] not null default '{}',  -- 'scales','chords','fingerpicking','theory'
  songs_practiced uuid[],    -- references guitar_songs.id

  bpm_target      smallint,
  bpm_achieved    smallint,
  quality_score   smallint check (quality_score between 1 and 5),

  notes           text,
  recording_url   text,      -- Supabase storage URL
  ai_metadata     jsonb not null default '{}',
  created_at      timestamptz not null default now()
);

create index guitar_sessions_user_date on public.guitar_sessions(user_id, session_date desc);

-- TABLE: guitar_songs
-- Rationale: Song repertoire with mastery tracking. Songs move
-- through learning stages and can be attached to sessions.
create table public.guitar_songs (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.users(id) on delete cascade,

  title           text not null,
  artist          text,
  genre           text,
  difficulty      smallint check (difficulty between 1 and 5),

  status          text not null default 'learning',  -- 'wishlist'|'learning'|'polishing'|'mastered'
  mastery_level   smallint check (mastery_level between 0 and 100),

  tab_url         text,
  youtube_url     text,

  started_at      date,
  mastered_at     date,

  ai_metadata     jsonb not null default '{}',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- =============================================================
-- ACHIEVEMENTS
-- =============================================================

-- TABLE: achievements
-- Rationale: Gamification layer that works across all domains.
-- Computed by Edge Function on relevant events (streak hit,
-- rating crossed, test score, etc.). Drives motivation loop.
create table public.achievements (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.users(id) on delete cascade,

  type            achievement_type not null,
  domain          domain_type,           -- null = cross-domain achievement
  title           text not null,
  description     text not null,
  icon            text,
  badge_url       text,

  -- What triggered this achievement
  trigger_entity  text,                  -- 'habit_streak' | 'mock_test_score' | 'chess_rating'
  trigger_value   numeric,               -- The value that unlocked it (e.g. 2000 for 2000 Elo)

  earned_at       timestamptz not null default now(),
  is_seen         boolean not null default false,

  ai_metadata     jsonb not null default '{}',
  created_at      timestamptz not null default now()
);

create index achievements_user on public.achievements(user_id, earned_at desc);

-- =============================================================
-- REVIEWS
-- =============================================================

-- TABLE: daily_reviews
-- Rationale: EOD reflection tied to a specific date. Captures
-- energy, mood, wins, blockers, and tomorrow's priorities.
-- Foundation for weekly/monthly pattern analysis.
create table public.daily_reviews (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.users(id) on delete cascade,
  review_date     date not null,

  -- Quantitative
  energy_level    smallint check (energy_level between 1 and 5),
  mood            smallint check (mood between 1 and 5),
  productivity    smallint check (productivity between 1 and 5),
  study_hours     numeric(3,1),

  -- Qualitative
  wins            text[],
  blockers        text[],
  gratitude       text,
  notes           text,

  -- Tomorrow's focus
  top_priorities  text[],
  domains_covered domain_type[],

  ai_summary      text,       -- Generated by AI after completion
  ai_metadata     jsonb not null default '{}',

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique(user_id, review_date)
);

-- TABLE: weekly_reviews
-- Rationale: Higher-level reflection covering a full week.
-- Compares planned vs actual, identifies patterns, resets focus.
create table public.weekly_reviews (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.users(id) on delete cascade,
  week_start      date not null,   -- Always Monday
  week_end        date not null,   -- Always Sunday

  -- Aggregated from daily_reviews
  avg_energy      numeric(3,2),
  avg_mood        numeric(3,2),
  avg_productivity numeric(3,2),
  total_study_hours numeric(4,1),

  -- Domain summaries (JSONB for flexibility)
  domain_summaries jsonb not null default '{}',
  -- e.g. {"academics": {"hours": 12.5, "chapters": 3}, "chess": {"sessions": 5}}

  -- Reflection
  biggest_win     text,
  biggest_lesson  text,
  next_week_focus text,
  domains_to_push domain_type[],

  goal_progress   jsonb not null default '{}',   -- snapshot of goal progress %

  ai_summary      text,
  ai_metadata     jsonb not null default '{}',

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique(user_id, week_start)
);

-- =============================================================
-- NOTIFICATIONS
-- =============================================================

-- TABLE: notifications
-- Rationale: In-app notification system. Edge Functions insert
-- rows; client subscribes via Realtime. Covers reminders,
-- achievement unlocks, AI insights, and review prompts.
create table public.notifications (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.users(id) on delete cascade,

  type            notification_type not null,
  title           text not null,
  body            text,
  icon            text,

  -- Deep link
  action_url      text,         -- e.g. '/chess', '/academics/review'
  action_label    text,

  is_read         boolean not null default false,
  read_at         timestamptz,

  -- Scheduled delivery
  deliver_at      timestamptz not null default now(),
  delivered       boolean not null default false,

  metadata        jsonb not null default '{}',
  created_at      timestamptz not null default now()
);

create index notifications_user_unread on public.notifications(user_id, deliver_at desc) where not is_read;

-- =============================================================
-- ANALYTICS
-- =============================================================

-- TABLE: analytics_events
-- Rationale: Client-side event stream. Captures feature usage,
-- session lengths, navigation patterns. Powers AI insights and
-- usage dashboards. Structured to be cheap to insert (no JOINs).
create table public.analytics_events (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.users(id) on delete cascade,

  event_name      text not null,          -- 'session_started', 'chapter_completed', etc.
  domain          domain_type,
  properties      jsonb not null default '{}',
  session_id      uuid,                   -- Client-generated per browser session
  platform        text not null default 'web',  -- 'web' | 'pwa'

  occurred_at     timestamptz not null default now()
);

create index analytics_events_user on public.analytics_events(user_id, occurred_at desc);
create index analytics_events_name on public.analytics_events(event_name, occurred_at desc);

-- =============================================================
-- AI
-- =============================================================

-- TABLE: ai_conversations
-- Rationale: Persistent conversation history per domain context.
-- Each row is a message. Embeddings enable semantic search over
-- past conversations and personalised AI insights.
create table public.ai_conversations (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.users(id) on delete cascade,

  conversation_id uuid not null,            -- Groups messages in one session
  domain          domain_type,              -- null = cross-domain / general

  role            text not null check (role in ('user', 'assistant', 'system')),
  content         text not null,

  -- For semantic search (pgvector, future)
  embedding       vector(1536),             -- OpenAI text-embedding-3-small dimension

  -- Context snapshot at time of message
  context         jsonb not null default '{}',
  -- e.g. {"active_goal": "...", "chapter": "...", "rating": 1450}

  tokens_used     integer,
  model           text,                     -- 'gpt-4o', 'claude-3-5-sonnet', etc.

  created_at      timestamptz not null default now()
);

create index ai_conversations_user on public.ai_conversations(user_id, conversation_id, created_at);
create index ai_conversations_embedding on public.ai_conversations
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);    -- Approximate nearest-neighbour for semantic search

-- =============================================================
-- ROW-LEVEL SECURITY
-- =============================================================

-- Enable RLS on every table
alter table public.users enable row level security;
alter table public.profiles enable row level security;
alter table public.goals enable row level security;
alter table public.tasks enable row level security;
alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;
alter table public.subjects enable row level security;
alter table public.chapters enable row level security;
alter table public.revisions enable row level security;
alter table public.study_sessions enable row level security;
alter table public.mock_tests enable row level security;
alter table public.startup_projects enable row level security;
alter table public.startup_features enable row level security;
alter table public.startup_metrics enable row level security;
alter table public.chess_sessions enable row level security;
alter table public.chess_ratings enable row level security;
alter table public.guitar_sessions enable row level security;
alter table public.guitar_songs enable row level security;
alter table public.achievements enable row level security;
alter table public.daily_reviews enable row level security;
alter table public.weekly_reviews enable row level security;
alter table public.notifications enable row level security;
alter table public.analytics_events enable row level security;
alter table public.ai_conversations enable row level security;

-- Universal user-scoped policy (applied to every table with user_id)
-- Pattern: user can only see/modify their own rows.
create policy "users: own row only"
  on public.users for all
  using (auth.uid() = id);

create policy "profiles: own row only"
  on public.profiles for all
  using (auth.uid() = user_id);

-- Macro to apply the standard policy — run for each table:
-- (Shown here for a few key tables; apply same pattern to all)
create policy "goals: own rows"
  on public.goals for all
  using (auth.uid() = user_id);

create policy "tasks: own rows"
  on public.tasks for all
  using (auth.uid() = user_id);

create policy "habits: own rows"
  on public.habits for all
  using (auth.uid() = user_id);

create policy "habit_logs: own rows"
  on public.habit_logs for all
  using (auth.uid() = user_id);

create policy "subjects: own rows"
  on public.subjects for all
  using (auth.uid() = user_id);

create policy "chapters: own rows"
  on public.chapters for all
  using (auth.uid() = user_id);

create policy "revisions: own rows"
  on public.revisions for all
  using (auth.uid() = user_id);

create policy "study_sessions: own rows"
  on public.study_sessions for all
  using (auth.uid() = user_id);

create policy "mock_tests: own rows"
  on public.mock_tests for all
  using (auth.uid() = user_id);

create policy "startup_projects: own rows"
  on public.startup_projects for all
  using (auth.uid() = user_id);

create policy "startup_features: own rows"
  on public.startup_features for all
  using (auth.uid() = user_id);

create policy "startup_metrics: own rows"
  on public.startup_metrics for all
  using (auth.uid() = user_id);

create policy "chess_sessions: own rows"
  on public.chess_sessions for all
  using (auth.uid() = user_id);

create policy "chess_ratings: own rows"
  on public.chess_ratings for all
  using (auth.uid() = user_id);

create policy "guitar_sessions: own rows"
  on public.guitar_sessions for all
  using (auth.uid() = user_id);

create policy "guitar_songs: own rows"
  on public.guitar_songs for all
  using (auth.uid() = user_id);

create policy "achievements: own rows"
  on public.achievements for all
  using (auth.uid() = user_id);

create policy "daily_reviews: own rows"
  on public.daily_reviews for all
  using (auth.uid() = user_id);

create policy "weekly_reviews: own rows"
  on public.weekly_reviews for all
  using (auth.uid() = user_id);

create policy "notifications: own rows"
  on public.notifications for all
  using (auth.uid() = user_id);

create policy "analytics_events: own rows"
  on public.analytics_events for all
  using (auth.uid() = user_id);

create policy "ai_conversations: own rows"
  on public.ai_conversations for all
  using (auth.uid() = user_id);

-- =============================================================
-- TRIGGERS
-- =============================================================

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Apply to all tables with updated_at
do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles','goals','tasks','habits','subjects','chapters',
    'startup_projects','startup_features','guitar_songs',
    'daily_reviews','weekly_reviews'
  ] loop
    execute format('
      create trigger trg_%s_updated_at
      before update on public.%s
      for each row execute function public.handle_updated_at();
    ', t, t);
  end loop;
end;
$$;

-- Sync new auth.users row → public.users
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users(id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger trg_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- =============================================================
-- INDEXES (additional performance)
-- =============================================================
create index on public.revisions(user_id, next_due_date) where completed_at is null;
create index on public.notifications(user_id, deliver_at) where not delivered;
create index on public.analytics_events using gin(properties);
create index on public.ai_conversations using gin(context);
