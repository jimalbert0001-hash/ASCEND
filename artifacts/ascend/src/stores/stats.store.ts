import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { sampleData } from '@/lib/sample-data';

// ─── Types ───────────────────────────────────────────────────────────

export type Goal = {
  id: string;
  title: string;
  domain: string;
  progress: number;
  label?: string;
};

export type Task = {
  id: string;
  title: string;
  domain: string;
  due: string;
  priority: string;
  completed: boolean;
};

export type ChessStats = {
  currentRating: number;
  ratingChange: number;
  ratingGoal: number;
  totalPuzzles: number;
  avgAccuracy: number;
  trainingHours: number;
  trainingDays: number;
  winRate: number;
  totalGames: number;
};

export type GuitarStats = {
  totalHours: number;
  thisMonthHours: number;
  thisMonthMins: number;
  songsLearned: number;
  songsRepertoire: number;
  chordsMastered: number;
  totalChords: number;
  currentLevel: number;
};

export type StartupStats = {
  totalUsers: number;
  totalMrr: number;
  activeProjects: number;
  openBugs: number;
  userGrowth: number;
  mrrGrowth: number;
};

export type UserProfile = {
  name: string;
  email: string;
  initials: string;
  studyHours: number;
  chessRating: number;
  habitStreak: number;
  joinedDate: string;
  activeDomains: string[];
};

interface StatsState {
  // Streak
  currentStreak: number;
  longestStreak: number;
  // Daily score
  dailyScore: number;
  // Weekly scores
  weeklyScores: number[];
  // Goals
  goals: Goal[];
  // Tasks
  tasks: Task[];
  // Chess
  chessStats: ChessStats;
  // Guitar
  guitarStats: GuitarStats;
  // Startup
  startupStats: StartupStats;
  // Profile
  profile: UserProfile;

  // Actions
  setCurrentStreak: (v: number) => void;
  setLongestStreak: (v: number) => void;
  setDailyScore: (v: number) => void;
  setWeeklyScores: (scores: number[]) => void;
  setWeeklyScore: (index: number, score: number) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  setGoals: (goals: Goal[]) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  toggleTask: (id: string) => void;
  setTasks: (tasks: Task[]) => void;
  setChessStats: (stats: ChessStats) => void;
  updateChessStat: (key: keyof ChessStats, value: number) => void;
  setGuitarStats: (stats: GuitarStats) => void;
  updateGuitarStat: (key: keyof GuitarStats, value: number) => void;
  setStartupStats: (stats: StartupStats) => void;
  updateStartupStat: (key: keyof StartupStats, value: number) => void;
  setProfile: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  resetAll: () => void;
}

const initialState: Omit<StatsState, keyof {
  setCurrentStreak: unknown; setLongestStreak: unknown; setDailyScore: unknown;
  setWeeklyScores: unknown; setWeeklyScore: unknown; updateGoal: unknown;
  setGoals: unknown; updateTask: unknown; toggleTask: unknown; setTasks: unknown;
  setChessStats: unknown; updateChessStat: unknown; setGuitarStats: unknown;
  updateGuitarStat: unknown; setStartupStats: unknown; updateStartupStat: unknown;
  setProfile: unknown; updateProfile: unknown; resetAll: unknown;
}> = {
  currentStreak: sampleData.streak.current,
  longestStreak: sampleData.streak.longest,
  dailyScore: sampleData.dailyScore,
  weeklyScores: [...sampleData.weeklyScores],
  goals: sampleData.goals.map(g => ({ ...g })),
  tasks: sampleData.tasks.map(t => ({ ...t })),
  chessStats: {
    currentRating: 1450,
    ratingChange: -39,
    ratingGoal: 1800,
    totalPuzzles: 247,
    avgAccuracy: 73,
    trainingHours: 10,
    trainingDays: 8,
    winRate: 40,
    totalGames: 5,
  },
  guitarStats: {
    totalHours: 17,
    thisMonthHours: 7,
    thisMonthMins: 55,
    songsLearned: 6,
    songsRepertoire: 3,
    chordsMastered: 10,
    totalChords: 14,
    currentLevel: 4,
  },
  startupStats: {
    totalUsers: 342,
    totalMrr: 420,
    activeProjects: 1,
    openBugs: 3,
    userGrowth: 12,
    mrrGrowth: 8,
  },
  profile: {
    name: sampleData.user.name,
    email: sampleData.user.email,
    initials: sampleData.user.initials,
    studyHours: sampleData.user.stats.studyHours,
    chessRating: sampleData.user.stats.chessRating,
    habitStreak: sampleData.user.stats.habitStreak,
    joinedDate: sampleData.user.joinedDate,
    activeDomains: [...sampleData.user.activeDomains],
  },
};

export const useStatsStore = create<StatsState>()(
  persist(
    (set) => ({
      ...initialState,

      setCurrentStreak: (v) => set({ currentStreak: v }),
      setLongestStreak: (v) => set({ longestStreak: v }),
      setDailyScore: (v) => set({ dailyScore: v }),
      setWeeklyScores: (scores) => set({ weeklyScores: scores }),
      setWeeklyScore: (index, score) =>
        set((s) => {
          const next = [...s.weeklyScores];
          next[index] = score;
          return { weeklyScores: next };
        }),

      updateGoal: (id, updates) =>
        set((s) => ({
          goals: s.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
        })),
      setGoals: (goals) => set({ goals }),

      updateTask: (id, updates) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),
      toggleTask: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
        })),
      setTasks: (tasks) => set({ tasks }),

      setChessStats: (stats) => set({ chessStats: stats }),
      updateChessStat: (key, value) =>
        set((s) => ({
          chessStats: { ...s.chessStats, [key]: value },
        })),

      setGuitarStats: (stats) => set({ guitarStats: stats }),
      updateGuitarStat: (key, value) =>
        set((s) => ({
          guitarStats: { ...s.guitarStats, [key]: value },
        })),

      setStartupStats: (stats) => set({ startupStats: stats }),
      updateStartupStat: (key, value) =>
        set((s) => ({
          startupStats: { ...s.startupStats, [key]: value },
        })),

      setProfile: (profile) => set({ profile }),
      updateProfile: (updates) =>
        set((s) => ({
          profile: { ...s.profile, ...updates },
        })),

      resetAll: () => set({ ...initialState }),
    }),
    {
      name: 'ascend-stats-storage',
      partialize: (s) => ({
        currentStreak: s.currentStreak,
        longestStreak: s.longestStreak,
        dailyScore: s.dailyScore,
        weeklyScores: s.weeklyScores,
        goals: s.goals,
        tasks: s.tasks,
        chessStats: s.chessStats,
        guitarStats: s.guitarStats,
        startupStats: s.startupStats,
        profile: s.profile,
      }),
    }
  )
);
