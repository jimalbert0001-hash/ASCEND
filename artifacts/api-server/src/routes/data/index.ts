import { Router } from 'express';
import { db } from '@workspace/db';
import {
  studySessions, subjects, mockTests,
  chessSessions, chessRatings,
  guitarSessions, guitarSongs,
  tasks, goals,
} from '@workspace/db';
import { eq, desc, and, gte, sum, count } from 'drizzle-orm';
import { logger } from '../../lib/logger.js';

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

export default router;
