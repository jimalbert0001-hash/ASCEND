import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type TimerMode = 'study' | 'revision' | 'mock_prep';

interface TimerState {
  isRunning: boolean;
  elapsedSeconds: number;
  subjectId: string | undefined;
  chapterId: string | undefined;
  mode: TimerMode;
  startTime: number | null;

  startTimer: (subjectId?: string, chapterId?: string, mode?: TimerMode) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => { elapsedSeconds: number; subjectId: string | undefined; chapterId: string | undefined; mode: TimerMode };
  resetTimer: () => void;
  tick: () => void;
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      isRunning: false,
      elapsedSeconds: 0,
      subjectId: undefined,
      chapterId: undefined,
      mode: 'study',
      startTime: null,

      startTimer: (subjectId = undefined, chapterId = undefined, mode = 'study') => set({
        isRunning: true,
        subjectId,
        chapterId,
        mode,
        startTime: Date.now(),
        elapsedSeconds: 0
      }),

      pauseTimer: () => set({ isRunning: false }),
      
      resumeTimer: () => set({ isRunning: true, startTime: Date.now() }),

      stopTimer: () => {
        const state = get();
        set({ isRunning: false, elapsedSeconds: 0, startTime: null });
        return {
          elapsedSeconds: state.elapsedSeconds,
          subjectId: state.subjectId,
          chapterId: state.chapterId,
          mode: state.mode
        };
      },

      resetTimer: () => set({
        isRunning: false,
        elapsedSeconds: 0,
        subjectId: undefined,
        chapterId: undefined,
        startTime: null
      }),

      tick: () => {
        if (get().isRunning) {
          set((state) => ({ elapsedSeconds: state.elapsedSeconds + 1 }));
        }
      }
    }),
    {
      name: 'ascend-timer-storage',
    }
  )
);
