// =============================================================
// ASCEND — Domain TypeScript Types
// These are the mapped application types derived from DB rows.
// The actual Supabase-generated types live in src/types/database.ts
// (generated via: npx supabase gen types typescript --local)
// =============================================================

// ─── Enums ───────────────────────────────────────────────────
export type Domain = 'academics' | 'startup' | 'chess' | 'guitar' | 'life';
export type GoalStatus = 'not_started' | 'in_progress' | 'completed' | 'abandoned';
export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type HabitFrequency = 'daily' | 'weekdays' | 'weekends' | 'weekly';
export type RevisionStage = 'first' | 'second' | 'third' | 'mastered';
export type FeatureStatus = 'idea' | 'planned' | 'in_progress' | 'done' | 'dropped';
export type AchievementType = 'milestone' | 'streak' | 'skill' | 'meta';
export type NotificationType = 'reminder' | 'achievement' | 'review_prompt' | 'ai_insight';
export type AIRole = 'user' | 'assistant' | 'system';

// ─── Core ────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface Profile {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  timezone: string;
  onboardingComplete: boolean;
  activeDomains: Domain[];
  theme: 'dark' | 'light' | 'system';
  dailyReviewTime: string | null;
  weeklyReviewDay: number;
  boardYear: number | null;
  targetPercentage: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  parentId: string | null;
  domain: Domain;
  title: string;
  description: string | null;
  status: GoalStatus;
  priority: TaskPriority;
  targetDate: string | null;
  completedAt: string | null;
  progress: number;           // 0–100
  tags: string[];
  createdAt: string;
  updatedAt: string;
  // Relations (eager-loaded)
  children?: Goal[];
  tasks?: Task[];
}

export interface Task {
  id: string;
  userId: string;
  goalId: string | null;
  domain: Domain;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  entityType: string | null;
  entityId: string | null;
  dueDate: string | null;
  completedAt: string | null;
  estimatedMins: number | null;
  actualMins: number | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Habit {
  id: string;
  userId: string;
  domain: Domain;
  title: string;
  description: string | null;
  frequency: HabitFrequency;
  targetDays: number[] | null;
  targetCount: number;
  unit: string | null;
  isActive: boolean;
  color: string | null;
  icon: string | null;
  currentStreak: number;
  longestStreak: number;
  lastCheckedAt: string | null;
  createdAt: string;
  updatedAt: string;
  // Relations
  todayLog?: HabitLog | null;
}

export interface HabitLog {
  id: string;
  habitId: string;
  userId: string;
  loggedDate: string;
  count: number;
  note: string | null;
  createdAt: string;
}

// ─── Academics ───────────────────────────────────────────────
export interface Subject {
  id: string;
  userId: string;
  name: string;
  code: string | null;
  color: string | null;
  icon: string | null;
  isActive: boolean;
  targetMarks: number | null;
  weightage: number | null;
  createdAt: string;
  updatedAt: string;
  // Relations
  chapters?: Chapter[];
}

export interface Chapter {
  id: string;
  subjectId: string;
  userId: string;
  name: string;
  chapterNumber: number | null;
  description: string | null;
  isCompleted: boolean;
  understandingLevel: 1 | 2 | 3 | 4 | 5 | null;
  estimatedHours: number | null;
  actualHours: number | null;
  firstStudiedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  // Relations
  revisions?: Revision[];
  nextRevision?: Revision | null;
}

export interface Revision {
  id: string;
  chapterId: string;
  userId: string;
  stage: RevisionStage;
  scheduledDate: string;
  completedAt: string | null;
  quality: 0 | 1 | 2 | 3 | 4 | 5 | null;
  easeFactor: number;
  intervalDays: number;
  nextDueDate: string | null;
  notes: string | null;
  createdAt: string;
  // Relations
  chapter?: Pick<Chapter, 'id' | 'name' | 'subjectId'>;
}

export interface StudySession {
  id: string;
  userId: string;
  subjectId: string | null;
  chapterId: string | null;
  startedAt: string;
  endedAt: string | null;
  durationMins: number | null;
  sessionType: 'study' | 'revision' | 'mock_prep';
  focusScore: 1 | 2 | 3 | 4 | 5 | null;
  notes: string | null;
  pomodoros: number;
  breaksTaken: number;
  createdAt: string;
}

export interface MockTest {
  id: string;
  userId: string;
  subjectId: string | null;
  name: string;
  testDate: string;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;          // Computed column
  durationMins: number | null;
  timeTakenMins: number | null;
  weakChapters: string[];
  strongChapters: string[];
  paperUrl: string | null;
  solutionUrl: string | null;
  notes: string | null;
  createdAt: string;
}

// ─── Startup ─────────────────────────────────────────────────
export interface StartupProject {
  id: string;
  userId: string;
  name: string;
  tagline: string | null;
  description: string | null;
  logoUrl: string | null;
  stage: 'idea' | 'mvp' | 'launch' | 'growth';
  isActive: boolean;
  websiteUrl: string | null;
  githubUrl: string | null;
  notionUrl: string | null;
  startedAt: string | null;
  launchedAt: string | null;
  techStack: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  // Relations
  features?: StartupFeature[];
  recentMetrics?: StartupMetric[];
}

export interface StartupFeature {
  id: string;
  projectId: string;
  userId: string;
  title: string;
  description: string | null;
  status: FeatureStatus;
  priority: TaskPriority;
  effortEstimate: 'xs' | 's' | 'm' | 'l' | 'xl' | null;
  impactEstimate: 'low' | 'medium' | 'high' | null;
  startedAt: string | null;
  completedAt: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface StartupMetric {
  id: string;
  projectId: string;
  userId: string;
  metricName: string;
  metricValue: number;
  unit: string | null;
  recordedAt: string;
  notes: string | null;
  createdAt: string;
}

// ─── Chess ───────────────────────────────────────────────────
export interface ChessSession {
  id: string;
  userId: string;
  sessionDate: string;
  durationMins: number | null;
  sessionType: 'game' | 'tactics' | 'openings' | 'endgame' | 'analysis';
  platform: string | null;
  timeControl: string | null;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  tacticsSolved: number | null;
  accuracy: number | null;
  openingsStudied: string[];
  focusArea: string | null;
  notes: string | null;
  gamePgn: string | null;
  createdAt: string;
}

export interface ChessRating {
  id: string;
  userId: string;
  platform: string;
  timeControl: string;
  rating: number;
  rd: number | null;
  recordedAt: string;
  createdAt: string;
}

// ─── Guitar ──────────────────────────────────────────────────
export interface GuitarSession {
  id: string;
  userId: string;
  sessionDate: string;
  durationMins: number;
  sessionType: 'practice' | 'performance' | 'lesson' | 'jam';
  focusAreas: string[];
  songsPracticed: string[];    // guitar_song IDs
  bpmTarget: number | null;
  bpmAchieved: number | null;
  qualityScore: 1 | 2 | 3 | 4 | 5 | null;
  notes: string | null;
  recordingUrl: string | null;
  createdAt: string;
}

export interface GuitarSong {
  id: string;
  userId: string;
  title: string;
  artist: string | null;
  genre: string | null;
  difficulty: 1 | 2 | 3 | 4 | 5 | null;
  status: 'wishlist' | 'learning' | 'polishing' | 'mastered';
  masteryLevel: number | null;   // 0–100
  tabUrl: string | null;
  youtubeUrl: string | null;
  startedAt: string | null;
  masteredAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Reviews ─────────────────────────────────────────────────
export interface DailyReview {
  id: string;
  userId: string;
  reviewDate: string;
  energyLevel: 1 | 2 | 3 | 4 | 5 | null;
  mood: 1 | 2 | 3 | 4 | 5 | null;
  productivity: 1 | 2 | 3 | 4 | 5 | null;
  studyHours: number | null;
  wins: string[];
  blockers: string[];
  gratitude: string | null;
  notes: string | null;
  topPriorities: string[];
  domainsCovered: Domain[];
  aiSummary: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyReview {
  id: string;
  userId: string;
  weekStart: string;
  weekEnd: string;
  avgEnergy: number | null;
  avgMood: number | null;
  avgProductivity: number | null;
  totalStudyHours: number | null;
  domainSummaries: Record<Domain, { hours?: number; sessions?: number; [key: string]: unknown }>;
  biggestWin: string | null;
  biggestLesson: string | null;
  nextWeekFocus: string | null;
  domainsToPush: Domain[];
  goalProgress: Record<string, number>;   // goalId → progress %
  aiSummary: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Achievements ────────────────────────────────────────────
export interface Achievement {
  id: string;
  userId: string;
  type: AchievementType;
  domain: Domain | null;
  title: string;
  description: string;
  icon: string | null;
  badgeUrl: string | null;
  triggerEntity: string | null;
  triggerValue: number | null;
  earnedAt: string;
  isSeen: boolean;
  createdAt: string;
}

// ─── Notifications ───────────────────────────────────────────
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string | null;
  icon: string | null;
  actionUrl: string | null;
  actionLabel: string | null;
  isRead: boolean;
  readAt: string | null;
  deliverAt: string;
  delivered: boolean;
  metadata: Record<string, unknown>;
  createdAt: string;
}

// ─── AI ──────────────────────────────────────────────────────
export interface AIConversation {
  id: string;
  userId: string;
  conversationId: string;
  domain: Domain | null;
  role: AIRole;
  content: string;
  context: Record<string, unknown>;
  tokensUsed: number | null;
  model: string | null;
  createdAt: string;
}

// ─── UI / Store types ────────────────────────────────────────
export interface TimerState {
  isRunning: boolean;
  startedAt: number | null;     // Unix ms
  elapsed: number;              // seconds
  mode: 'pomodoro' | 'free';
  pomodoroLength: number;       // minutes
  breakLength: number;          // minutes
  domain: Domain | null;
  entityId: string | null;      // chapter/session/song ID
}

export interface UIState {
  sidebarOpen: boolean;
  activeDomain: Domain | 'dashboard';
  commandPaletteOpen: boolean;
  theme: 'dark' | 'light' | 'system';
}

export interface AnalyticsEvent {
  eventName: string;
  domain?: Domain;
  properties?: Record<string, unknown>;
}

// ─── API Response Wrappers ───────────────────────────────────
export interface PaginatedResult<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
}

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';
