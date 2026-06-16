import { createStudySession, updateChapterCompletion } from './academics-supabase';
import { createTrainingSession, addRatingEntry } from './chess-supabase';
import { createPracticeSession } from './guitar-supabase';
import { subjectsData } from './academics-data';
import type { StudySession } from './academics-data';
import type { TrainingSession } from './chess-data';
import type { PracticeSession } from './guitar-data';

export interface AIAction {
  action: string;
  [key: string]: unknown;
}

export function parseActionBlock(content: string): AIAction | null {
  const match = content.match(/%%ACTION_START%%([\s\S]*?)%%ACTION_END%%/);
  if (!match) return null;
  try {
    return JSON.parse(match[1].trim()) as AIAction;
  } catch {
    return null;
  }
}

export function stripActionBlock(content: string): string {
  return content.replace(/%%ACTION_START%%[\s\S]*?%%ACTION_END%%/, '').trim();
}

export async function executeAction(action: AIAction, userId: string): Promise<string> {
  const today = new Date().toISOString().slice(0, 10);

  switch (action.action) {
    case 'log_study_session': {
      const session: Omit<StudySession, 'id'> = {
        subjectId: String(action.subjectId ?? ''),
        chapterId: null,
        date: today,
        durationMins: Number(action.durationMins ?? 60),
        sessionType: (action.sessionType as StudySession['sessionType']) ?? 'study',
        focusScore: 4,
        notes: String(action.notes ?? 'Logged by AI Mentor'),
      };
      await createStudySession(userId, session);
      return `✓ Logged ${action.durationMins} min ${action.sessionType ?? 'study'} session for ${action.subjectName ?? action.subjectId}`;
    }

    case 'log_chess_session': {
      const session: Omit<TrainingSession, 'id'> = {
        date: today,
        durationMins: Number(action.durationMins ?? 60),
        focus: (action.focus as TrainingSession['focus']) ?? 'tactics',
        notes: String(action.notes ?? 'Logged by AI Mentor'),
        intensity: 'medium',
      };
      await createTrainingSession(userId, session);
      return `✓ Logged ${action.durationMins} min chess ${action.focus ?? 'training'} session`;
    }

    case 'log_guitar_session': {
      const session: Omit<PracticeSession, 'id'> = {
        date: today,
        durationMins: Number(action.durationMins ?? 30),
        focus: (action.focus as PracticeSession['focus']) ?? 'technique',
        notes: String(action.notes ?? 'Logged by AI Mentor'),
        intensity: 'focused',
      };
      await createPracticeSession(userId, session);
      return `✓ Logged ${action.durationMins} min guitar practice (${action.focus ?? 'general'})`;
    }

    case 'mark_chapter_complete': {
      const targetName = String(action.chapterName ?? '').toLowerCase();
      let found = false;
      for (const subject of subjectsData) {
        if (action.subjectId && subject.id !== action.subjectId) continue;
        for (const chapter of subject.chapters) {
          const fullName = chapter.name.toLowerCase();
          const shortName = fullName.includes(' — ') ? fullName.split(' — ').pop() ?? fullName : fullName;
          if (fullName.includes(targetName) || targetName.includes(shortName)) {
            await updateChapterCompletion(chapter.id, true, 3);
            found = true;
            return `✓ Marked "${chapter.name}" as complete`;
          }
        }
      }
      if (!found) return `⚠ Chapter not found: "${action.chapterName}" — please mark it manually`;
      return '';
    }

    case 'add_chess_rating': {
      await addRatingEntry(userId, {
        date: today,
        rating: Number(action.rating),
        platform: (action.platform as 'lichess' | 'chess.com' | 'otb') ?? 'lichess',
        change: 0,
      });
      return `✓ Updated chess rating to ${action.rating} on ${action.platform ?? 'lichess'}`;
    }

    default:
      return `⚠ Unknown action type: ${action.action}`;
  }
}
