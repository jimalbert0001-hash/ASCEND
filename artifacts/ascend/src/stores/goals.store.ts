import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type GoalCategory = 'academics' | 'startup' | 'chess' | 'guitar';

export interface UserGoal {
  id: string;
  category: GoalCategory;
  subcategory: string;
  targetValue: number;
  unit: string;
  deadline: string;
  description: string;
  createdAt: string;
}

export const SUBCATEGORIES: Record<GoalCategory, string[]> = {
  academics: ['Physics', 'Chemistry', 'Mathematics', 'English', 'Computer Science', 'Overall'],
  startup:   ['Revenue (MRR)', 'Users', 'Projects', 'Overall'],
  chess:     ['Rating', 'Win Rate', 'Training Hours', 'Overall'],
  guitar:    ['Skill Level', 'Practice Hours', 'Songs Mastered', 'Overall'],
};

export const UNITS: Record<string, string> = {
  'Physics':           '% score',
  'Chemistry':         '% score',
  'Mathematics':       '% score',
  'English':           '% score',
  'Computer Science':  '% score',
  'Revenue (MRR)':     '$ MRR',
  'Users':             'users',
  'Projects':          'projects',
  'Rating':            'rating pts',
  'Win Rate':          '% win rate',
  'Training Hours':    'hours',
  'Skill Level':       '/ 10',
  'Practice Hours':    'hours',
  'Songs Mastered':    'songs',
  'Overall':           '% complete',
};

interface GoalsState {
  goals: UserGoal[];
  addGoal: (goal: Omit<UserGoal, 'id' | 'createdAt'>) => void;
  deleteGoal: (id: string) => void;
}

export const useGoalsStore = create<GoalsState>()(
  persist(
    (set) => ({
      goals: [],
      addGoal: (goal) =>
        set((s) => ({
          goals: [
            ...s.goals,
            { ...goal, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
          ],
        })),
      deleteGoal: (id) =>
        set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),
    }),
    { name: 'ascend-goals-storage' }
  )
);
