import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { fetchGoals } from '@/lib/goals-api';

// ─── Types ───────────────────────────────────────────────────────────

export type Goal = {
  id: string;
  title: string;
  domain: string;
  progress: number;
  label?: string;
  targetValue?: number;
  description?: string;
  status?: string;
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
  loadGoalsFromServer: (goals: Goal[]) => void;
  saveGoalsToServer: () => Promise<void>;
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
  setGoals: unknown; loadGoalsFromServer: unknown; saveGoalsToServer: unknown;
  updateTask: unknown; toggleTask: unknown; setTasks: unknown;
  setChessStats: unknown; updateChessStat: unknown; setGuitarStats: unknown;
  updateGuitarStat: unknown; setStartupStats: unknown; updateStartupStat: unknown;
  setProfile: unknown; updateProfile: unknown; resetAll: unknown;
}> = {
  currentStreak: 0,
  longestStreak: 0,
  dailyScore: 0,
  weeklyScores: [0, 0, 0, 0, 0, 0, 0],
  goals: [],
  tasks: [],
  chessStats: {
    currentRating: 0,
    ratingChange: 0,
    ratingGoal: 0,
    totalPuzzles: 0,
    avgAccuracy: 0,
    trainingHours: 0,
    trainingDays: 0,
    winRate: 0,
    totalGames: 0,
  },
  guitarStats: {
    totalHours: 0,
    thisMonthHours: 0,
    thisMonthMins: 0,
    songsLearned: 0,
    songsRepertoire: 0,
    chordsMastered: 0,
    totalChords: 0,
    currentLevel: 0,
  },
  startupStats: {
    totalUsers: 0,
    totalMrr: 0,
    activeProjects: 0,
    openBugs: 0,
    userGrowth: 0,
    mrrGrowth: 0,
  },
  profile: {
    name: '',
    email: '',
    initials: '',
    studyHours: 0,
    chessRating: 0,
    habitStreak: 0,
    joinedDate: '',
    activeDomains: [],
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
      loadGoalsFromServer: (serverGoals) =>
        set(() => ({
          goals: serverGoals.map((g) => ({
            id: g.id,
            title: g.title,
            domain: g.domain,
            progress: g.progress,
            targetValue: g.targetValue,
            description: g.description,
            status: g.status,
            label: g.targetValue !== undefined ? String(g.targetValue) : undefined,
          })),
        })),
      saveGoalsToServer: async () => {
        // No-op: saved explicitly by the UI
      },

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
