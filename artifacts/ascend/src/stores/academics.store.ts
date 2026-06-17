import { create } from 'zustand';
import { isDataCleared } from '@/lib/data-cleared';
import { subjectsData, getClearedSubjectsData, type Subject } from '@/lib/academics-data';
import { getSubjects, updateChapterCompletion } from '@/lib/academics-supabase';

interface AcademicsState {
  subjects: Subject[];
  initialized: boolean;
  load: (userId: string) => Promise<void>;
  toggleChapter: (chapterId: string, isCompleted: boolean) => Promise<void>;
}

export const useAcademicsStore = create<AcademicsState>((set) => ({
  subjects: isDataCleared() ? getClearedSubjectsData() : subjectsData,
  initialized: false,

  load: async (userId: string) => {
    const subjects = await getSubjects(userId);
    set({ subjects, initialized: true });
  },

  toggleChapter: async (chapterId: string, isCompleted: boolean) => {
    const level = 3;
    set((state) => ({
      subjects: state.subjects.map((subject) => ({
        ...subject,
        chapters: subject.chapters.map((chapter) => {
          if (chapter.id !== chapterId) return chapter;
          const newLevel = isCompleted
            ? (Math.max(chapter.understandingLevel, level) as 1 | 2 | 3 | 4 | 5)
            : chapter.understandingLevel;
          return { ...chapter, isCompleted, understandingLevel: newLevel };
        }),
      })),
    }));
    await updateChapterCompletion(chapterId, isCompleted, level);
  },
}));
