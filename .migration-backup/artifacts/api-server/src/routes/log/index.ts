import { Router } from 'express';
import { db } from '@workspace/db';
import {
  studySessions, chessSessions, chessRatings, guitarSessions, tasks, dailyReviews,
} from '@workspace/db';
import { eq, and } from 'drizzle-orm';
import { logger } from '../../lib/logger.js';

const router = Router();

router.post('/study', async (req, res) => {
  const { userId, subjectId, chapterId, durationMins, sessionType, focusScore, notes } = req.body;
  if (!userId) { res.status(400).json({ error: 'userId required' }); return; }
  try {
    const now = new Date();
    const started = new Date(now.getTime() - (durationMins ?? 60) * 60000);
    const [row] = await db.insert(studySessions).values({
      userId,
      subjectId: subjectId ?? null,
      chapterId: chapterId ?? null,
      startedAt: started,
      endedAt: now,
      durationMins: durationMins ?? 60,
      sessionType: sessionType ?? 'study',
      focusScore: focusScore ?? 4,
      notes: notes ?? '',
    }).returning();
    res.json({ ok: true, session: row });
  } catch (err) {
    logger.error({ err }, 'Failed to log study session');
    res.status(500).json({ error: 'DB error' });
  }
});

router.post('/chess', async (req, res) => {
  const {
    userId, sessionType, platform, timeControl, durationMins,
    gamesPlayed, wins, losses, draws, tacticsSolved, accuracy,
    focusArea, notes, newRating,
  } = req.body;
  if (!userId) { res.status(400).json({ error: 'userId required' }); return; }
  try {
    const today = new Date().toISOString().split('T')[0];
    const [row] = await db.insert(chessSessions).values({
      userId,
      sessionDate: today,
      durationMins: durationMins ?? null,
      sessionType: sessionType ?? 'game',
      platform: platform ?? 'lichess',
      timeControl: timeControl ?? null,
      gamesPlayed: gamesPlayed ?? 0,
      wins: wins ?? 0,
      losses: losses ?? 0,
      draws: draws ?? 0,
      tacticsSolved: tacticsSolved ?? null,
      accuracy: accuracy != null ? String(accuracy) : null,
      focusArea: focusArea ?? null,
      notes: notes ?? '',
    }).returning();

    if (newRating != null) {
      await db.insert(chessRatings).values({
        userId,
        platform: platform ?? 'lichess',
        timeControl: timeControl ?? 'rapid',
        rating: newRating,
        recordedAt: today,
      }).onConflictDoNothing();
    }

    res.json({ ok: true, session: row });
  } catch (err) {
    logger.error({ err }, 'Failed to log chess session');
    res.status(500).json({ error: 'DB error' });
  }
});

router.post('/guitar', async (req, res) => {
  const { userId, durationMins, focusAreas, bpmTarget, bpmAchieved, qualityScore, notes } = req.body;
  if (!userId) { res.status(400).json({ error: 'userId required' }); return; }
  try {
    const today = new Date().toISOString().split('T')[0];
    const [row] = await db.insert(guitarSessions).values({
      userId,
      sessionDate: today,
      durationMins: durationMins ?? 30,
      focusAreas: Array.isArray(focusAreas) ? focusAreas : [focusAreas ?? 'practice'],
      bpmTarget: bpmTarget ?? null,
      bpmAchieved: bpmAchieved ?? null,
      qualityScore: qualityScore ?? null,
      notes: notes ?? '',
    }).returning();
    res.json({ ok: true, session: row });
  } catch (err) {
    logger.error({ err }, 'Failed to log guitar session');
    res.status(500).json({ error: 'DB error' });
  }
});

router.post('/task', async (req, res) => {
  const { userId, taskId, complete } = req.body;
  if (!userId || !taskId) { res.status(400).json({ error: 'userId and taskId required' }); return; }
  try {
    const [row] = await db.update(tasks)
      .set({
        status: complete ? 'done' : 'todo',
        completedAt: complete ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
      .returning();
    res.json({ ok: true, task: row });
  } catch (err) {
    logger.error({ err }, 'Failed to update task');
    res.status(500).json({ error: 'DB error' });
  }
});

router.post('/review', async (req, res) => {
  const {
    userId, moodScore, energyLevel, wins, blockers, tomorrowPriorities,
    studyMins, chessSessionDone, guitarSessionDone, startupTaskDone, notes, overallScore,
  } = req.body;
  if (!userId) { res.status(400).json({ error: 'userId required' }); return; }
  try {
    const today = new Date().toISOString().split('T')[0];
    const [row] = await db.insert(dailyReviews).values({
      userId,
      reviewDate: today,
      moodScore: moodScore ?? null,
      energyLevel: energyLevel ?? null,
      overallScore: overallScore ?? null,
      wins: wins ?? [],
      blockers: blockers ?? [],
      tomorrowPriorities: tomorrowPriorities ?? [],
      studyMins: studyMins ?? 0,
      chessSessionDone: chessSessionDone ?? false,
      guitarSessionDone: guitarSessionDone ?? false,
      startupTaskDone: startupTaskDone ?? false,
      notes: notes ?? '',
    }).onConflictDoUpdate({
      target: [dailyReviews.userId, dailyReviews.reviewDate],
      set: {
        moodScore: moodScore ?? null,
        energyLevel: energyLevel ?? null,
        overallScore: overallScore ?? null,
        wins: wins ?? [],
        blockers: blockers ?? [],
        tomorrowPriorities: tomorrowPriorities ?? [],
        studyMins: studyMins ?? 0,
        chessSessionDone: chessSessionDone ?? false,
        guitarSessionDone: guitarSessionDone ?? false,
        startupTaskDone: startupTaskDone ?? false,
        notes: notes ?? '',
      },
    }).returning();
    res.json({ ok: true, review: row });
  } catch (err) {
    logger.error({ err }, 'Failed to log review');
    res.status(500).json({ error: 'DB error' });
  }
});

export default router;
