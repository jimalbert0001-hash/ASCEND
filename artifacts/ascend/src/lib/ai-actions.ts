import { createStudySession, updateChapterCompletion } from './academics-supabase';
import { createTrainingSession, addRatingEntry } from './chess-supabase';
import { createPracticeSession } from './guitar-supabase';
import { computeNextRevision } from './academics-data';
import { useAcademicsStore } from '@/stores/academics.store';
import { apiFetch } from './api-fetch';
import type { StudySession } from './academics-data';
import type { TrainingSession } from './chess-data';
import type { PracticeSession } from './guitar-data';

export interface AIAction {
  type?: string;
  action?: string;
  [key: string]: unknown;
}

function getActionType(action: AIAction): string {
  return (action.type ?? action.action ?? '').toString();
}

// Parse <ACTION>{...}</ACTION> format (new) OR %%ACTION_START%%...%%ACTION_END%% (legacy)
export function parseActionBlock(content: string): AIAction | null {
  const newFmt = content.match(/<ACTION>([\s\S]*?)<\/ACTION>/);
  if (newFmt) {
    try { return JSON.parse(newFmt[1].trim()) as AIAction; } catch { return null; }
  }
  const legacyFmt = content.match(/%%ACTION_START%%([\s\S]*?)%%ACTION_END%%/);
  if (legacyFmt) {
    try { return JSON.parse(legacyFmt[1].trim()) as AIAction; } catch { return null; }
  }
  return null;
}

export function stripActionBlock(content: string): string {
  return content
    .replace(/<ACTION>[\s\S]*?<\/ACTION>/g, '')
    .replace(/%%ACTION_START%%[\s\S]*?%%ACTION_END%%/g, '')
    .trim();
}

export async function executeAction(action: AIAction, userId: string): Promise<string> {
  const today = new Date().toISOString().slice(0, 10);
  const type = getActionType(action);

  switch (type) {
    case 'log_study_session': {
      // Try backend action endpoint first (writes to real DB regardless of frontend Supabase config)
      try {
        const res = await apiFetch('/api/actions/log-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subjectId: action.subjectId,
            subjectName: action.subjectName,
            durationMins: Number(action.durationMins ?? 60),
            sessionType: action.sessionType ?? 'study',
            notes: action.notes,
          }),
        });
        if (res.ok) {
          const data = await res.json() as { message?: string };
          return data.message ?? `✓ Logged ${action.durationMins} min ${action.sessionType ?? 'study'} session for ${action.subjectName ?? action.subjectId}`;
        }
      } catch { /* fall through to direct Supabase */ }
      // Fallback: write directly via Supabase client
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
      try {
        const res = await apiFetch('/api/actions/log-chess', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            durationMins: Number(action.durationMins ?? 60),
            focus: action.focus,
            notes: action.notes,
          }),
        });
        if (res.ok) {
          const data = await res.json() as { message?: string };
          return data.message ?? `✓ Logged ${action.durationMins} min chess ${action.focus ?? 'training'} session`;
        }
      } catch { /* fall through */ }
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
      const durationMins = Number(action.durationMins ?? action.minutes ?? 30);
      try {
        const res = await apiFetch('/api/actions/log-guitar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ durationMins, focus: action.focus, notes: action.notes }),
        });
        if (res.ok) {
          const data = await res.json() as { message?: string };
          return data.message ?? `✓ Logged ${durationMins} min guitar practice`;
        }
      } catch { /* fall through */ }
      const session: Omit<PracticeSession, 'id'> = {
        date: today,
        durationMins,
        focus: (action.focus as PracticeSession['focus']) ?? 'technique',
        notes: String(action.notes ?? 'Logged by AI Mentor'),
        intensity: 'focused',
      };
      await createPracticeSession(userId, session);
      return `✓ Logged ${durationMins} min guitar practice (${action.focus ?? 'general'})`;
    }

    case 'mark_chapter_complete': {
      const targetName = String(action.chapterName ?? '').toLowerCase();
      // Try backend first (finds chapter in DB)
      try {
        const res = await apiFetch('/api/actions/mark-chapter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chapterName: action.chapterName, subjectId: action.subjectId }),
        });
        if (res.ok) {
          const data = await res.json() as { message?: string };
          return data.message ?? `✓ Marked "${action.chapterName}" as complete`;
        }
      } catch { /* fall through */ }
      // Fallback: search live store subjects then write via Supabase
      const storeSubjects = useAcademicsStore.getState().subjects;
      for (const subject of storeSubjects) {
        if (action.subjectId && subject.id !== action.subjectId) continue;
        for (const chapter of subject.chapters) {
          const fullName = chapter.name.toLowerCase();
          const shortName = fullName.includes(' — ') ? fullName.split(' — ').pop() ?? fullName : fullName;
          if (fullName.includes(targetName) || targetName.includes(shortName)) {
            const nextRevision = computeNextRevision(chapter.revisionCount);
            const newRevisionCount = chapter.revisionCount + 1;
            await updateChapterCompletion(chapter.id, true, 3, nextRevision, newRevisionCount);
            return `✓ Marked "${chapter.name}" as complete`;
          }
        }
      }
      return `⚠ Chapter not found: "${action.chapterName}" — please mark it manually`;
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

    case 'log_startup_progress': {
      try {
        const res = await apiFetch('/api/actions/update-metric', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectName: action.projectName,
            metric: action.metric,
            value: action.value,
          }),
        });
        if (res.ok) {
          const data = await res.json() as { message?: string };
          return data.message ?? `✓ Updated ${action.metric} to ${action.value}`;
        }
      } catch { /* ignore */ }
      return `✓ Startup metric logged (${action.metric}: ${action.value})`;
    }

    default:
      return `⚠ Unknown action type: ${type}`;
  }
}
