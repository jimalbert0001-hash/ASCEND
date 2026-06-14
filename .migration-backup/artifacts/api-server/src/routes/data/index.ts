import { Router } from 'express';
import { db } from '@workspace/db';
import {
  studySessions, subjects, mockTests,
  chessSessions, chessRatings,
  guitarSessions, guitarSongs,
  tasks, goals, users,
} from '@workspace/db';
import { eq, desc, and, gte, sum, count } from 'drizzle-orm';
import { logger } from '../../lib/logger.js';

async function ensureUserExists(userId: string): Promise<void> {
  await db.insert(users).values({
    id: userId,
    email: `${userId}@ascend.local`,
  }).onConflictDoNothing();
}

const router = Router();

const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
};

router.get('/academics', async (req, res) => {
  const userId = req.query.userId as string | undefined;
  if (!userId) { res.status(400).json({ error: 'userId required' }); return; }
  try {
    await ensureUserExists(userId);
    const [recentSessions, userSubjects, recentTests] = await Promise.all([
      db.select().from(studySessions)
        .where(eq(studySessions.userId, userId))
        .orderBy(desc(studySessions.startedAt))
        .limit(20),
      db.select().from(subjects)
        .where(eq(subjects.userId, userId)),
      db.select().from(mockTests)
        .where(eq(mockTests.userId, userId))
        .orderBy(desc(mockTests.testDate))
        .limit(10),
    ]);

    const totalMins = recentSessions.reduce((acc, s) => acc + (s.durationMins ?? 0), 0);
    const totalHours = Math.round(totalMins / 6) / 10;

    const subjectHours: Record<string, number> = {};
    for (const s of recentSessions) {
      if (s.subjectId) {
        subjectHours[s.subjectId] = (subjectHours[s.subjectId] ?? 0) + (s.durationMins ?? 0);
      }
    }

    res.json({ sessions: recentSessions, subjects: userSubjects, mockTests: recentTests, totalHours, subjectHours });
  } catch (err) {
    logger.error({ err }, 'Failed to fetch academics data');
    res.status(500).json({ error: 'DB error' });
  }
});

router.get('/chess', async (req, res) => {
  const userId = req.query.userId as string | undefined;
  if (!userId) { res.status(400).json({ error: 'userId required' }); return; }
  try {
    await ensureUserExists(userId);
    const [recentSessions, ratingHistory] = await Promise.all([
      db.select().from(chessSessions)
        .where(eq(chessSessions.userId, userId))
        .orderBy(desc(chessSessions.sessionDate))
        .limit(20),
      db.select().from(chessRatings)
        .where(eq(chessRatings.userId, userId))
        .orderBy(desc(chessRatings.recordedAt))
        .limit(20),
    ]);

    const totalWins = recentSessions.reduce((a, s) => a + (s.wins ?? 0), 0);
    const totalLosses = recentSessions.reduce((a, s) => a + (s.losses ?? 0), 0);
    const totalDraws = recentSessions.reduce((a, s) => a + (s.draws ?? 0), 0);
    const totalGames = totalWins + totalLosses + totalDraws;
    const winRate = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;
    const totalMins = recentSessions.reduce((a, s) => a + (s.durationMins ?? 0), 0);
    const trainingHours = Math.round(totalMins / 6) / 10;
    const currentRating = ratingHistory[0]?.rating ?? 1200;
    const prevRating = ratingHistory[1]?.rating ?? currentRating;

    res.json({
      sessions: recentSessions,
      ratings: ratingHistory.slice().reverse(),
      stats: { currentRating, ratingChange: currentRating - prevRating, winRate, totalGames, totalWins, totalLosses, totalDraws, trainingHours, sessions: recentSessions.length },
    });
  } catch (err) {
    logger.error({ err }, 'Failed to fetch chess data');
    res.status(500).json({ error: 'DB error' });
  }
});

router.get('/guitar', async (req, res) => {
  const userId = req.query.userId as string | undefined;
  if (!userId) { res.status(400).json({ error: 'userId required' }); return; }
  try {
    await ensureUserExists(userId);
    const [recentSessions, songs] = await Promise.all([
      db.select().from(guitarSessions)
        .where(eq(guitarSessions.userId, userId))
        .orderBy(desc(guitarSessions.sessionDate))
        .limit(20),
      db.select().from(guitarSongs)
        .where(eq(guitarSongs.userId, userId))
        .orderBy(desc(guitarSongs.createdAt)),
    ]);

    const totalMins = recentSessions.reduce((a, s) => a + (s.durationMins ?? 0), 0);
    const totalHours = Math.round(totalMins / 6) / 10;
    const learningSongs = songs.filter(s => s.status === 'learning');
    const masteredSongs = songs.filter(s => s.status === 'mastered' || s.status === 'repertoire');

    res.json({ sessions: recentSessions, songs, stats: { totalHours, totalSessions: recentSessions.length, learningSongs: learningSongs.length, masteredSongs: masteredSongs.length } });
  } catch (err) {
    logger.error({ err }, 'Failed to fetch guitar data');
    res.status(500).json({ error: 'DB error' });
  }
});

router.get('/tasks', async (req, res) => {
  const userId = req.query.userId as string | undefined;
  if (!userId) { res.status(400).json({ error: 'userId required' }); return; }
  try {
    await ensureUserExists(userId);
    const [userTasks, userGoals] = await Promise.all([
      db.select().from(tasks)
        .where(eq(tasks.userId, userId))
        .orderBy(desc(tasks.createdAt))
        .limit(50),
      db.select().from(goals)
        .where(eq(goals.userId, userId)),
    ]);
    res.json({ tasks: userTasks, goals: userGoals });
  } catch (err) {
    logger.error({ err }, 'Failed to fetch tasks');
    res.status(500).json({ error: 'DB error' });
  }
});

// ─── Goals ───────────────────────────────────────────────────────────

const DEFAULT_GOALS: Array<{
  id: string;
  domain: 'academics' | 'startup' | 'chess' | 'guitar' | 'life';
  title: string;
  description: string;
  progress: number;
  targetValue: number;
}> = [
  { id: 'goal-chess', domain: 'chess', title: 'Reach 1800 Chess Rating', description: 'Rapid rating target', progress: 72, targetValue: 1800 },
  { id: 'goal-academics', domain: 'academics', title: 'Score 95%+ in Physics', description: 'Academic score target', progress: 68, targetValue: 95 },
  { id: 'goal-guitar', domain: 'guitar', title: 'Master Fingerpicking', description: 'Guitar skill target', progress: 55, targetValue: 100 },
  { id: 'goal-startup', domain: 'startup', title: 'Launch MVP', description: 'Startup milestone', progress: 40, targetValue: 100 },
];

router.get('/goals', async (req, res) => {
  const userId = req.query.userId as string | undefined;
  if (!userId) { res.status(400).json({ error: 'userId required' }); return; }
  try {
    await ensureUserExists(userId);
    const userGoals = await db.select().from(goals)
      .where(eq(goals.userId, userId));

    if (userGoals.length === 0) {
      // Seed default goals
      const now = new Date();
      for (const g of DEFAULT_GOALS) {
        await db.insert(goals).values({
          id: g.id,
          userId,
          domain: g.domain as any,
          title: g.title,
          description: g.description,
          progress: String(g.progress),
          status: 'in_progress' as any,
          priority: 'high' as any,
          aiMetadata: { targetValue: g.targetValue },
          createdAt: now,
          updatedAt: now,
        }).onConflictDoNothing();
      }
      const seeded = await db.select().from(goals).where(eq(goals.userId, userId));
      res.json(seeded);
      return;
    }

    res.json(userGoals);
  } catch (err) {
    logger.error({ err }, 'Failed to fetch goals');
    res.status(500).json({ error: 'DB error' });
  }
});

router.put('/goals', async (req, res) => {
  const userId = req.body.userId as string | undefined;
  const goalsList = req.body.goals as Array<{
    id: string;
    domain?: string;
    title?: string;
    description?: string;
    progress?: number;
    targetValue?: number;
    status?: string;
  }> | undefined;

  if (!userId || !goalsList || !Array.isArray(goalsList)) {
    res.status(400).json({ error: 'userId and goals array required' });
    return;
  }

  try {
    await ensureUserExists(userId);
    const now = new Date();
    for (const g of goalsList) {
      await db.insert(goals)
        .values({
          id: g.id,
          userId,
          domain: (g.domain as any) ?? 'life',
          title: g.title ?? 'Goal',
          description: g.description,
          progress: String(g.progress ?? 0),
          status: (g.status as any) ?? 'in_progress',
          priority: 'high' as any,
          aiMetadata: { targetValue: g.targetValue },
          createdAt: now,
          updatedAt: now,
        } as any)
        .onConflictDoUpdate({
          target: goals.id,
          set: {
            title: g.title ?? undefined,
            description: g.description ?? undefined,
            progress: g.progress !== undefined ? String(g.progress) : undefined,
            domain: (g.domain as any) ?? undefined,
            status: (g.status as any) ?? undefined,
            aiMetadata: g.targetValue !== undefined ? { targetValue: g.targetValue } : undefined,
            updatedAt: now,
          },
        });
    }

    const updated = await db.select().from(goals).where(eq(goals.userId, userId));
    res.json(updated);
  } catch (err) {
    logger.error({ err }, 'Failed to save goals');
    res.status(500).json({ error: 'DB error' });
  }
});

export default router;
