import { getSubjects, getStudySessions, getMockTests } from './academics-supabase';
import { getOpenings, getEndgameStudies } from './chess-supabase';
import { getPracticeSessions, getSongs } from './guitar-supabase';
import { getProjects } from './startup-supabase';
import { getSubjectStats } from './academics-data';

export async function buildContextSnapshot(userId: string): Promise<string> {
  try {
    const [subjects, recentSessions, mockTests, openings, endgames, guitarSessions, songs, projects] =
      await Promise.all([
        getSubjects(userId),
        getStudySessions(userId, 10),
        getMockTests(userId),
        getOpenings(userId),
        getEndgameStudies(userId),
        getPracticeSessions(userId),
        getSongs(userId),
        getProjects(userId),
      ]);

    const academics = {
      subjects: subjects.map(s => {
        const stats = getSubjectStats(s);
        return {
          id: s.id,
          name: s.name,
          code: s.code,
          totalChapters: stats.total,
          completed: stats.completed,
          completionPct: stats.completionPct,
          hoursStudied: Math.round(stats.totalHours * 10) / 10,
          dueRevisions: stats.dueRevisions,
          incompleteChapters: s.chapters
            .filter(c => !c.isCompleted)
            .map(c => c.name)
            .slice(0, 6),
        };
      }),
      recentSessions: recentSessions.slice(0, 6).map(s => ({
        subjectId: s.subjectId,
        durationMins: s.durationMins,
        type: s.sessionType,
        date: s.date,
        notes: s.notes,
      })),
      mockTests: mockTests.slice(0, 5).map(t => ({
        name: t.name,
        score: `${t.obtainedMarks}/${t.totalMarks}`,
        pct: Math.round((t.obtainedMarks / t.totalMarks) * 100),
        date: t.date,
        weakTopics: t.weakTopics,
      })),
    };

    const chess = {
      openings: openings.map(o => ({
        name: o.name,
        eco: o.eco,
        color: o.color,
        status: o.status,
        winRate: o.winRate,
        gamesPlayed: o.gamesPlayed,
      })),
      endgames: endgames.map(e => ({ title: e.title, status: e.status })),
    };

    const guitarTotalMins = guitarSessions.reduce((s, p) => s + p.durationMins, 0);
    const guitar = {
      totalPracticeHours: Math.round((guitarTotalMins / 60) * 10) / 10,
      recentSessions: guitarSessions.slice(0, 5).map(s => ({
        focus: s.focus,
        durationMins: s.durationMins,
        date: s.date,
        notes: s.notes,
      })),
      songs: {
        learning: songs.filter(s => s.status === 'learning').map(s => s.title),
        repertoire: songs.filter(s => s.status === 'repertoire').map(s => s.title),
        polished: songs.filter(s => s.status === 'polished').map(s => s.title),
        wishList: songs.filter(s => s.status === 'wish_list').map(s => s.title).slice(0, 3),
      },
    };

    const startup = {
      projects: projects.map(p => ({
        name: (p as any).name ?? 'Unknown',
        stage: (p as any).stage ?? 'idea',
        mrr: (p as any).mrr ?? 0,
        users: (p as any).users ?? 0,
        description: ((p as any).description ?? '').toString().slice(0, 120),
      })),
    };

    return JSON.stringify({ academics, chess, guitar, startup }, null, 2);
  } catch {
    return '{"error":"Could not load user data"}';
  }
}
