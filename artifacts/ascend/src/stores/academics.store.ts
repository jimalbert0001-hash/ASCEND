import { create } from 'zustand';
import { isDataCleared } from '@/lib/data-cleared';
import { subjectsData, getClearedSubjectsData, computeNextRevision, type Subject } from '@/lib/academics-data';
import { getSubjects, updateChapterCompletion } from '@/lib/academics-supabase';

interface AcademicsState {
  subjects: Subject[];
  initialized: boolean;
  load: (userId: string) => Promise<void>;
  toggleChapter: (chapterId: string, isCompleted: boolean) => Promise<void>;
}

export const useAcademicsStore = create<AcademicsState>((set, get) => ({
  subjects: isDataCleared() ? getClearedSubjectsData() : subjectsData,
  initialized: false,

  load: async (userId: string) => {
    const subjects = await getSubjects(userId);
    set({ subjects: subjects ?? subjectsData, initialized: true });
  },

  toggleChapter: async (chapterId: string, isCompleted: boolean) => {
    const level = 3;

    // Grab the current chapter to compute revision schedule before mutating state
    const currentChapter = get().subjects.flatMap(s => s.chapters).find(c => c.id === chapterId);
    const currentRevisionCount = currentChapter?.revisionCount ?? 0;
    const newRevisionCount = isCompleted ? currentRevisionCount + 1 : currentRevisionCount;
    const nextRevision = isCompleted ? computeNextRevision(currentRevisionCount) : null;

    set((state) => ({
      subjects: state.subjects.map((subject) => ({
        ...subject,
        chapters: subject.chapters.map((chapter) => {
          if (chapter.id !== chapterId) return chapter;
          const newLevel = (isCompleted
            ? Math.max(chapter.understandingLevel, level)
            : chapter.understandingLevel) as 1 | 2 | 3 | 4 | 5;
          return { ...chapter, isCompleted, understandingLevel: newLevel, nextRevision, revisionCount: newRevisionCount };
        }),
      })),
    }));

    await updateChapterCompletion(chapterId, isCompleted, level, nextRevision, newRevisionCount);
  },
}));
