import { db } from "@workspace/db";
import {
  users, profiles, goals, tasks, habits, habitLogs,
  subjects, chapters, studySessions, mockTests,
  startupProjects, startupFeatures, startupMetrics,
  chessSessions, chessRatings,
  guitarSessions, guitarSongs,
  achievements, dailyReviews,
} from "@workspace/db";
import { eq, desc, gte, and, sql } from "drizzle-orm";
import type { UserContext } from "./types.js";
import { logger } from "../logger.js";

const THIRTY_DAYS_AGO = () => {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().split("T")[0];
};

const SEVEN_DAYS_AGO = () => {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d.toISOString().split("T")[0];
};

export async function buildContextFromDB(userId: string): Promise<UserContext> {
  try {
    const [
      profile,
      userGoals,
      userTasks,
      userHabits,
      recentSessions,
      userSubjects,
      recentTests,
      activeProject,
      recentMetrics,
      pendingFeatureCount,
      latestRating,
      recentChessSessions,
      recentGuitarSessions,
      userSongs,
      earnedAchievements,
      recentReviews,
    ] = await Promise.all([
      // Profile
      db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1),

      // Goals
      db.select().from(goals)
        .where(and(eq(goals.userId, userId), sql`${goals.status} != 'abandoned'`))
        .orderBy(desc(goals.createdAt))
        .limit(10),

      // Tasks (pending)
      db.select().from(tasks)
        .where(and(eq(tasks.userId, userId), sql`${tasks.status} != 'cancelled'`))
        .orderBy(desc(tasks.createdAt))
        .limit(20),

      // Habits (active)
      db.select().from(habits)
        .where(and(eq(habits.userId, userId), eq(habits.isActive, true))),

      // Study sessions (last 30 days)
      db.select({ durationMins: studySessions.durationMins, subjectId: studySessions.subjectId, startedAt: studySessions.startedAt, focusScore: studySessions.focusScore })
        .from(studySessions)
        .where(and(eq(studySessions.userId, userId), gte(studySessions.startedAt, new Date(Date.now() - 30 * 86400000))))
        .orderBy(desc(studySessions.startedAt))
        .limit(50),

      // Subjects
      db.select().from(subjects)
        .where(and(eq(subjects.userId, userId), eq(subjects.isActive, true))),

      // Recent mock tests
      db.select().from(mockTests)
        .where(eq(mockTests.userId, userId))
        .orderBy(desc(mockTests.testDate))
        .limit(5),

      // Active startup project
      db.select().from(startupProjects)
        .where(and(eq(startupProjects.userId, userId), eq(startupProjects.isActive, true)))
        .orderBy(desc(startupProjects.updatedAt))
        .limit(1),

      // Recent startup metrics
      db.select().from(startupMetrics)
        .where(and(eq(startupMetrics.userId, userId), gte(startupMetrics.recordedAt, SEVEN_DAYS_AGO())))
        .orderBy(desc(startupMetrics.recordedAt))
        .limit(20),

      // Pending features count
      db.select({ count: sql<number>`count(*)` }).from(startupFeatures)
        .where(and(eq(startupFeatures.userId, userId), sql`${startupFeatures.status} NOT IN ('done', 'dropped')`)),

      // Latest chess rating
      db.select().from(chessRatings)
        .where(eq(chessRatings.userId, userId))
        .orderBy(desc(chessRatings.recordedAt))
        .limit(3),

      // Recent chess sessions
      db.select().from(chessSessions)
        .where(and(eq(chessSessions.userId, userId), gte(chessSessions.sessionDate, THIRTY_DAYS_AGO())))
        .orderBy(desc(chessSessions.sessionDate))
        .limit(10),

      // Recent guitar sessions
      db.select().from(guitarSessions)
        .where(and(eq(guitarSessions.userId, userId), gte(guitarSessions.sessionDate, THIRTY_DAYS_AGO())))
        .orderBy(desc(guitarSessions.sessionDate))
        .limit(10),

      // Guitar songs
      db.select().from(guitarSongs)
        .where(eq(guitarSongs.userId, userId))
        .orderBy(desc(guitarSongs.updatedAt))
        .limit(10),

      // Earned achievements
      db.select().from(achievements)
        .where(eq(achievements.userId, userId))
        .orderBy(desc(achievements.earnedAt))
        .limit(10),

      // Recent daily reviews (7 days)
      db.select().from(dailyReviews)
        .where(and(eq(dailyReviews.userId, userId), gte(dailyReviews.reviewDate, SEVEN_DAYS_AGO())))
        .orderBy(desc(dailyReviews.reviewDate))
        .limit(7),
    ]);

    // ── Derived aggregates ─────────────────────────────────────────────
    const totalStudyMins = recentSessions.reduce((sum, s) => sum + (s.durationMins ?? 0), 0);
    const totalStudyHours = Math.round(totalStudyMins / 60);

    // Study breakdown by subject
    const subjectMap = new Map(userSubjects.map((s) => [s.id, s.name]));
    const studyBySubject = new Map<string, number>();
    for (const s of recentSessions) {
      if (s.subjectId) {
        const name = subjectMap.get(s.subjectId) ?? "Unknown";
        studyBySubject.set(name, (studyBySubject.get(name) ?? 0) + (s.durationMins ?? 0));
      }
    }
    const subjectBreakdown = Array.from(studyBySubject.entries()).map(([name, mins]) => ({
      name,
      hours: Math.round(mins / 60 * 10) / 10,
    }));

    // Weak chapters from recent tests
    const weakChapterIds = recentTests.flatMap((t) => t.weakChapters ?? []);

    // Chess aggregates
    const currentRating = latestRating[0]?.rating ?? 0;
    const ratingGoal = userGoals.find((g) => g.domain === "chess")
      ? parseInt(userGoals.find((g) => g.domain === "chess")!.title.match(/\d{4}/)?.[0] ?? "1800")
      : 1800;

    const chessGames = recentChessSessions.filter((s) => s.sessionType === "game");
    const totalGames = chessGames.reduce((s, c) => s + (c.gamesPlayed ?? 0), 0);
    const totalWins = chessGames.reduce((s, c) => s + (c.wins ?? 0), 0);
    const winRate = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;

    const tacticsSessions = recentChessSessions.filter((s) => s.tacticsSolved);
    const avgAccuracy = tacticsSessions.length > 0
      ? Math.round(tacticsSessions.reduce((s, c) => s + Number(c.accuracy ?? 0), 0) / tacticsSessions.length)
      : 0;

    // Guitar aggregates
    const totalGuitarMins = recentGuitarSessions.reduce((s, gs) => s + (gs.durationMins ?? 0), 0);
    const masteredSongs = userSongs.filter((s) => s.status === "mastered").length;
    const learningSongs = userSongs.filter((s) => s.status === "learning" || s.status === "polishing").length;
    const recentFocusAreas = [...new Set(recentGuitarSessions.flatMap((gs) => gs.focusAreas ?? []))].slice(0, 4);
    const latestBpm = recentGuitarSessions[0]?.bpmAchieved ?? undefined;

    // Startup aggregates
    const project = activeProject[0];
    const latestMetrics = new Map<string, { value: number; unit: string | null }>();
    for (const m of recentMetrics) {
      if (!latestMetrics.has(m.metricName)) {
        latestMetrics.set(m.metricName, { value: Number(m.metricValue), unit: m.unit });
      }
    }

    // Reviews
    const latestReview = recentReviews[0];
    const avgScore = recentReviews.length > 0
      ? Math.round(recentReviews.reduce((s, r) => s + (r.overallScore ?? 0), 0) / recentReviews.length)
      : 0;

    // Longest habit streak
    const maxStreak = userHabits.reduce((max, h) => Math.max(max, h.currentStreak ?? 0), 0);

    // ── Build UserContext ──────────────────────────────────────────────
    const ctx: UserContext = {
      user: {
        name: profile[0]?.displayName ?? "User",
        stats: {
          studyHours: totalStudyHours,
          chessRating: currentRating,
          habitStreak: maxStreak,
        },
        activeDomains: (profile[0]?.activeDomains as string[]) ?? ["academics", "startup", "chess", "guitar"],
      },
      goals: userGoals.map((g) => ({
        id: g.id,
        title: g.title,
        domain: g.domain,
        progress: Number(g.progress),
        status: g.status,
      })),
      tasks: userTasks.map((t) => ({
        id: t.id,
        title: t.title,
        domain: t.domain,
        due: t.dueDate ?? undefined,
        priority: t.priority,
        completed: t.status === "done",
      })),
      achievements: earnedAchievements.map((a) => ({
        title: a.title,
        description: a.description,
        earned: true,
        type: a.type,
      })),
      studyData: {
        totalHours: totalStudyHours,
        subjectBreakdown,
        recentTests: recentTests.map((t) => ({
          name: t.name,
          score: Math.round(Number(t.obtainedMarks) / t.totalMarks * 100),
          date: t.testDate,
        })),
        weakChapters: weakChapterIds.length > 0 ? weakChapterIds : undefined,
      },
      startupData: project ? {
        projects: [{
          name: project.name,
          stage: project.stage,
          mrr: latestMetrics.get("mrr_usd")?.value,
          users: latestMetrics.get("active_users")?.value,
        }],
        topMetrics: Array.from(latestMetrics.entries()).map(([name, { value, unit }]) => ({
          name,
          value,
          unit: unit ?? "",
        })),
        pendingFeatures: pendingFeatureCount[0]?.count ?? 0,
      } : undefined,
      chessData: currentRating > 0 ? {
        currentRating,
        ratingGoal,
        winRate,
        tacticsAccuracy: avgAccuracy || undefined,
        recentSessions: recentChessSessions.slice(0, 5).map((s) => ({
          type: s.sessionType,
          date: s.sessionDate,
          result: s.gamesPlayed ? `${s.wins}W/${s.losses}L/${s.draws}D` : undefined,
        })),
      } : undefined,
      guitarData: {
        totalPracticeHours: Math.round(totalGuitarMins / 60 * 10) / 10,
        songsLearning: learningSongs,
        songsMastered: masteredSongs,
        recentFocusAreas: recentFocusAreas.length > 0 ? recentFocusAreas : undefined,
        currentBpm: latestBpm ?? undefined,
      },
      reviews: {
        lastDailyScore: latestReview?.overallScore ?? undefined,
        weeklyAvgScore: avgScore || undefined,
        streak: maxStreak,
        recentMood: latestReview?.moodScore != null ? `${latestReview.moodScore}/5` : undefined,
      },
    };

    return ctx;
  } catch (err) {
    logger.error(err, `Failed to build context for user ${userId}`);
    // Return a minimal context so AI can still respond
    return {
      user: {
        name: "User",
        stats: { studyHours: 0, chessRating: 0, habitStreak: 0 },
        activeDomains: [],
      },
      goals: [],
      tasks: [],
      achievements: [],
    };
  }
}
