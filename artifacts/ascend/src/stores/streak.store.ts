import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ActivityDay {
  date: string;
  score: number;
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

function daysBetween(a: string, b: string): number {
  const msA = new Date(a + 'T00:00:00').getTime();
  const msB = new Date(b + 'T00:00:00').getTime();
  return Math.round(Math.abs(msA - msB) / 86400000);
}

interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  activityLog: ActivityDay[];
  hasLoggedToday: () => boolean;
  recordActivity: (score: number) => void;
  reset: () => void;
}

export const useStreakStore = create<StreakState>()(
  persist(
    (set, get) => ({
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      activityLog: [],

      hasLoggedToday: () => {
        return get().lastActiveDate === todayStr();
      },

      recordActivity: (score: number) => {
        const today = todayStr();
        const { lastActiveDate, currentStreak, longestStreak, activityLog } = get();

        const existing = activityLog.find((d) => d.date === today);
        const newLog = existing
          ? activityLog.map((d) => (d.date === today ? { date: today, score } : d))
          : [...activityLog, { date: today, score }];

        let newStreak: number;
        if (!lastActiveDate) {
          newStreak = 1;
        } else if (lastActiveDate === today) {
          newStreak = currentStreak;
        } else if (daysBetween(lastActiveDate, today) === 1) {
          newStreak = currentStreak + 1;
        } else {
          newStreak = 1;
        }

        set({
          currentStreak: newStreak,
          longestStreak: Math.max(longestStreak, newStreak),
          lastActiveDate: today,
          activityLog: newLog,
        });
      },

      reset: () =>
        set({ currentStreak: 0, longestStreak: 0, lastActiveDate: null, activityLog: [] }),
    }),
    { name: 'ascend-streak-storage' }
  )
);
