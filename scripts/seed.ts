#!/usr/bin/env node
/**
 * Seed script — populates the DB with realistic data for the mock user.
 * Run: npx tsx scripts/seed.ts
 */
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../lib/db/src/schema/index.ts";

const { Pool } = pg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

const MOCK_USER_ID = "mock-user-1";
const today = new Date();
const d = (daysAgo: number) => {
  const dt = new Date(today);
  dt.setDate(dt.getDate() - daysAgo);
  return dt.toISOString().split("T")[0];
};
const ts = (daysAgo: number, hour = 10) => {
  const dt = new Date(today);
  dt.setDate(dt.getDate() - daysAgo);
  dt.setHours(hour, 0, 0, 0);
  return dt;
};

async function seed() {
  console.log("🌱 Seeding database for mock-user-1...");

  // ── USER ──────────────────────────────────────────────────────────────
  await db
    .insert(schema.users)
    .values({ id: MOCK_USER_ID, email: "alex@example.com" })
    .onConflictDoNothing();

  await db
    .insert(schema.profiles)
    .values({
      id: "profile-mock-1",
      userId: MOCK_USER_ID,
      displayName: "Alex Mercer",
      timezone: "Asia/Kolkata",
      boardYear: 2026,
      targetPercentage: "95.00",
      onboardingComplete: true,
      activeDomains: ["academics", "startup", "chess", "guitar"],
    })
    .onConflictDoNothing();

  // ── GOALS ─────────────────────────────────────────────────────────────
  const goalIds = {
    physics: "goal-phys-1",
    startup: "goal-startup-1",
    chess: "goal-chess-1",
    guitar: "goal-guitar-1",
    boards: "goal-boards-1",
  };

  await db
    .insert(schema.goals)
    .values([
      {
        id: goalIds.physics,
        userId: MOCK_USER_ID,
        domain: "academics",
        title: "Score 95%+ in Physics",
        description: "Master all CBSE Class 12 Physics chapters",
        status: "in_progress",
        priority: "high",
        progress: "68.00",
        targetDate: d(-90),
        tags: ["cbse", "physics", "boards"],
      },
      {
        id: goalIds.boards,
        userId: MOCK_USER_ID,
        domain: "academics",
        title: "Overall 92%+ in Board Exams",
        status: "in_progress",
        priority: "urgent",
        progress: "55.00",
        targetDate: d(-120),
        tags: ["cbse", "boards"],
      },
      {
        id: goalIds.startup,
        userId: MOCK_USER_ID,
        domain: "startup",
        title: "Launch MVP by July 2026",
        description: "Ship a working product with paying users",
        status: "in_progress",
        priority: "high",
        progress: "40.00",
        targetDate: d(-60),
        tags: ["mvp", "launch"],
      },
      {
        id: goalIds.chess,
        userId: MOCK_USER_ID,
        domain: "chess",
        title: "Reach 1800 Rapid Rating",
        description: "Improve from 1450 to 1800 on Chess.com",
        status: "in_progress",
        priority: "medium",
        progress: "25.00",
        targetDate: d(-180),
        tags: ["rating", "rapid"],
      },
      {
        id: goalIds.guitar,
        userId: MOCK_USER_ID,
        domain: "guitar",
        title: "Master Fingerpicking Technique",
        description: "Learn Travis picking and apply to 5 songs",
        status: "in_progress",
        priority: "low",
        progress: "55.00",
        targetDate: d(-90),
        tags: ["fingerpicking", "technique"],
      },
    ])
    .onConflictDoNothing();

  // ── TASKS ─────────────────────────────────────────────────────────────
  await db
    .insert(schema.tasks)
    .values([
      {
        id: "task-1",
        userId: MOCK_USER_ID,
        goalId: goalIds.physics,
        domain: "academics",
        title: "Chapter 12: Thermodynamics revision",
        status: "todo",
        priority: "high",
        dueDate: d(-1),
      },
      {
        id: "task-2",
        userId: MOCK_USER_ID,
        goalId: goalIds.physics,
        domain: "academics",
        title: "Solve HC Verma exercises — Waves",
        status: "todo",
        priority: "high",
        dueDate: d(-2),
      },
      {
        id: "task-3",
        userId: MOCK_USER_ID,
        goalId: goalIds.startup,
        domain: "startup",
        title: "Write landing page copy",
        status: "in_progress",
        priority: "medium",
        dueDate: d(-2),
      },
      {
        id: "task-4",
        userId: MOCK_USER_ID,
        goalId: goalIds.startup,
        domain: "startup",
        title: "Set up Stripe payment integration",
        status: "todo",
        priority: "high",
        dueDate: d(-5),
      },
      {
        id: "task-5",
        userId: MOCK_USER_ID,
        goalId: goalIds.chess,
        domain: "chess",
        title: "Solve 30 tactics puzzles",
        status: "todo",
        priority: "high",
        dueDate: d(0),
      },
      {
        id: "task-6",
        userId: MOCK_USER_ID,
        goalId: goalIds.guitar,
        domain: "guitar",
        title: "Practice F major chord transitions",
        status: "todo",
        priority: "low",
        dueDate: d(0),
      },
      {
        id: "task-7",
        userId: MOCK_USER_ID,
        domain: "life",
        title: "Daily review",
        status: "todo",
        priority: "medium",
        dueDate: d(0),
      },
      {
        id: "task-done-1",
        userId: MOCK_USER_ID,
        goalId: goalIds.physics,
        domain: "academics",
        title: "Complete Electromagnetic Induction notes",
        status: "done",
        priority: "high",
        completedAt: ts(1),
      },
      {
        id: "task-done-2",
        userId: MOCK_USER_ID,
        goalId: goalIds.chess,
        domain: "chess",
        title: "Analyse 3 lost games",
        status: "done",
        priority: "medium",
        completedAt: ts(2),
      },
    ])
    .onConflictDoNothing();

  // ── HABITS ────────────────────────────────────────────────────────────
  const habitIds = {
    study: "habit-study-1",
    chess: "habit-chess-1",
    guitar: "habit-guitar-1",
    review: "habit-review-1",
    startup: "habit-startup-1",
  };

  await db
    .insert(schema.habits)
    .values([
      {
        id: habitIds.study,
        userId: MOCK_USER_ID,
        domain: "academics",
        title: "Study for 3+ hours",
        frequency: "daily",
        targetCount: 1,
        unit: "hours",
        currentStreak: 23,
        longestStreak: 31,
        isActive: true,
        color: "#3b82f6",
        icon: "BookOpen",
      },
      {
        id: habitIds.chess,
        userId: MOCK_USER_ID,
        domain: "chess",
        title: "Solve 20 tactics puzzles",
        frequency: "daily",
        targetCount: 20,
        unit: "puzzles",
        currentStreak: 15,
        longestStreak: 28,
        isActive: true,
        color: "#8b5cf6",
        icon: "Crown",
      },
      {
        id: habitIds.guitar,
        userId: MOCK_USER_ID,
        domain: "guitar",
        title: "30 min guitar practice",
        frequency: "daily",
        targetCount: 1,
        unit: "sessions",
        currentStreak: 8,
        longestStreak: 14,
        isActive: true,
        color: "#22c55e",
        icon: "Music",
      },
      {
        id: habitIds.review,
        userId: MOCK_USER_ID,
        domain: "life",
        title: "Daily review",
        frequency: "daily",
        targetCount: 1,
        unit: "reviews",
        currentStreak: 23,
        longestStreak: 31,
        isActive: true,
        color: "#f59e0b",
        icon: "CheckSquare",
      },
      {
        id: habitIds.startup,
        userId: MOCK_USER_ID,
        domain: "startup",
        title: "1 startup task shipped",
        frequency: "weekdays",
        targetCount: 1,
        unit: "tasks",
        currentStreak: 5,
        longestStreak: 12,
        isActive: true,
        color: "#f97316",
        icon: "Rocket",
      },
    ])
    .onConflictDoNothing();

  // Habit logs — last 30 days
  const habitLogValues: schema.NewHabitLog[] = [];
  for (let i = 0; i < 30; i++) {
    const date = d(i);
    // Study: done most days
    if (i % 7 !== 0 || i < 5) {
      habitLogValues.push({ habitId: habitIds.study, userId: MOCK_USER_ID, loggedDate: date, count: 1 });
    }
    // Chess: done ~4 days/week
    if (i % 2 === 0 || i % 3 === 0) {
      habitLogValues.push({ habitId: habitIds.chess, userId: MOCK_USER_ID, loggedDate: date, count: 20 });
    }
    // Guitar: done ~3 days/week
    if (i % 3 === 0) {
      habitLogValues.push({ habitId: habitIds.guitar, userId: MOCK_USER_ID, loggedDate: date, count: 1 });
    }
    // Review: done most days
    if (i % 7 !== 0 || i < 5) {
      habitLogValues.push({ habitId: habitIds.review, userId: MOCK_USER_ID, loggedDate: date, count: 1 });
    }
    // Startup: weekdays only
    const dayOfWeek = new Date(today.getTime() - i * 86400000).getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && i % 3 !== 2) {
      habitLogValues.push({ habitId: habitIds.startup, userId: MOCK_USER_ID, loggedDate: date, count: 1 });
    }
  }
  await db.insert(schema.habitLogs).values(habitLogValues).onConflictDoNothing();

  // ── SUBJECTS ──────────────────────────────────────────────────────────
  const subjectIds = {
    physics: "sub-phys-1",
    chemistry: "sub-chem-1",
    maths: "sub-maths-1",
    cs: "sub-cs-1",
    english: "sub-eng-1",
  };

  await db
    .insert(schema.subjects)
    .values([
      { id: subjectIds.physics, userId: MOCK_USER_ID, name: "Physics", code: "042", color: "#3b82f6", icon: "Zap", targetMarks: 95, weightage: "20.00" },
      { id: subjectIds.chemistry, userId: MOCK_USER_ID, name: "Chemistry", code: "043", color: "#22c55e", icon: "FlaskConical", targetMarks: 90, weightage: "20.00" },
      { id: subjectIds.maths, userId: MOCK_USER_ID, name: "Mathematics", code: "041", color: "#f59e0b", icon: "Calculator", targetMarks: 98, weightage: "20.00" },
      { id: subjectIds.cs, userId: MOCK_USER_ID, name: "Computer Science", code: "083", color: "#8b5cf6", icon: "Code", targetMarks: 98, weightage: "20.00" },
      { id: subjectIds.english, userId: MOCK_USER_ID, name: "English", code: "301", color: "#ec4899", icon: "BookOpen", targetMarks: 90, weightage: "20.00" },
    ])
    .onConflictDoNothing();

  // ── CHAPTERS ──────────────────────────────────────────────────────────
  const physicsChapters = [
    { id: "ch-ph-1", name: "Electric Charges and Fields", chapterNumber: 1, isCompleted: true, understandingLevel: 4 },
    { id: "ch-ph-2", name: "Electrostatic Potential and Capacitance", chapterNumber: 2, isCompleted: true, understandingLevel: 3 },
    { id: "ch-ph-3", name: "Current Electricity", chapterNumber: 3, isCompleted: true, understandingLevel: 4 },
    { id: "ch-ph-4", name: "Moving Charges and Magnetism", chapterNumber: 4, isCompleted: true, understandingLevel: 3 },
    { id: "ch-ph-5", name: "Magnetism and Matter", chapterNumber: 5, isCompleted: false, understandingLevel: 2 },
    { id: "ch-ph-6", name: "Electromagnetic Induction", chapterNumber: 6, isCompleted: false, understandingLevel: 2 },
    { id: "ch-ph-7", name: "Alternating Current", chapterNumber: 7, isCompleted: false, understandingLevel: 1 },
    { id: "ch-ph-8", name: "Electromagnetic Waves", chapterNumber: 8, isCompleted: false, understandingLevel: 2 },
    { id: "ch-ph-9", name: "Ray Optics and Optical Instruments", chapterNumber: 9, isCompleted: false, understandingLevel: 3 },
    { id: "ch-ph-10", name: "Wave Optics", chapterNumber: 10, isCompleted: false, understandingLevel: 2 },
    { id: "ch-ph-11", name: "Dual Nature of Radiation", chapterNumber: 11, isCompleted: false, understandingLevel: 1 },
    { id: "ch-ph-12", name: "Atoms", chapterNumber: 12, isCompleted: false, understandingLevel: 2 },
    { id: "ch-ph-13", name: "Nuclei", chapterNumber: 13, isCompleted: false, understandingLevel: 1 },
    { id: "ch-ph-14", name: "Semiconductor Electronics", chapterNumber: 14, isCompleted: false, understandingLevel: 2 },
  ];

  await db
    .insert(schema.chapters)
    .values(
      physicsChapters.map((c) => ({
        ...c,
        subjectId: subjectIds.physics,
        userId: MOCK_USER_ID,
      }))
    )
    .onConflictDoNothing();

  // ── STUDY SESSIONS ────────────────────────────────────────────────────
  const studySessionValues: schema.NewStudySession[] = [];
  const studyData = [
    { daysAgo: 0, mins: 180, subjectId: subjectIds.physics, focus: 4 },
    { daysAgo: 1, mins: 240, subjectId: subjectIds.maths, focus: 5 },
    { daysAgo: 2, mins: 120, subjectId: subjectIds.chemistry, focus: 3 },
    { daysAgo: 3, mins: 200, subjectId: subjectIds.physics, focus: 4 },
    { daysAgo: 4, mins: 90, subjectId: subjectIds.english, focus: 3 },
    { daysAgo: 5, mins: 210, subjectId: subjectIds.cs, focus: 5 },
    { daysAgo: 7, mins: 180, subjectId: subjectIds.maths, focus: 4 },
    { daysAgo: 8, mins: 150, subjectId: subjectIds.chemistry, focus: 3 },
    { daysAgo: 9, mins: 220, subjectId: subjectIds.physics, focus: 4 },
    { daysAgo: 10, mins: 170, subjectId: subjectIds.cs, focus: 5 },
    { daysAgo: 14, mins: 200, subjectId: subjectIds.maths, focus: 4 },
    { daysAgo: 15, mins: 160, subjectId: subjectIds.physics, focus: 3 },
    { daysAgo: 21, mins: 190, subjectId: subjectIds.chemistry, focus: 4 },
    { daysAgo: 28, mins: 210, subjectId: subjectIds.physics, focus: 5 },
  ];

  studySessionValues.push(
    ...studyData.map((s, i) => ({
      id: `ss-${i + 1}`,
      userId: MOCK_USER_ID,
      subjectId: s.subjectId,
      startedAt: ts(s.daysAgo, 9),
      endedAt: ts(s.daysAgo, 9 + Math.ceil(s.mins / 60)),
      durationMins: s.mins,
      sessionType: "study" as const,
      focusScore: s.focus as unknown as number,
      pomodoros: Math.floor(s.mins / 25),
      breaksTaken: Math.floor(s.mins / 30),
    }))
  );
  await db.insert(schema.studySessions).values(studySessionValues as Parameters<typeof db.insert>[1] extends infer T ? T extends Array<infer R> ? R[] : never : never).onConflictDoNothing();

  // ── MOCK TESTS ────────────────────────────────────────────────────────
  await db
    .insert(schema.mockTests)
    .values([
      { id: "mt-1", userId: MOCK_USER_ID, subjectId: subjectIds.physics, name: "Physics Mock #1", testDate: d(14), totalMarks: 70, obtainedMarks: "58", weakChapters: ["ch-ph-7", "ch-ph-11", "ch-ph-13"] },
      { id: "mt-2", userId: MOCK_USER_ID, subjectId: subjectIds.maths, name: "Maths Mock #1", testDate: d(10), totalMarks: 80, obtainedMarks: "72", weakChapters: [] },
      { id: "mt-3", userId: MOCK_USER_ID, subjectId: subjectIds.chemistry, name: "Chemistry Mock #1", testDate: d(7), totalMarks: 70, obtainedMarks: "55", weakChapters: [] },
      { id: "mt-4", userId: MOCK_USER_ID, subjectId: subjectIds.physics, name: "Physics Mock #2", testDate: d(3), totalMarks: 70, obtainedMarks: "62", weakChapters: ["ch-ph-7", "ch-ph-13"] },
      { id: "mt-5", userId: MOCK_USER_ID, name: "Full Syllabus Mock #1", testDate: d(1), totalMarks: 500, obtainedMarks: "421", weakChapters: [] },
    ])
    .onConflictDoNothing();

  // ── STARTUP ───────────────────────────────────────────────────────────
  const projectId = "proj-ascend-app-1";
  await db
    .insert(schema.startupProjects)
    .values({
      id: projectId,
      userId: MOCK_USER_ID,
      name: "StudyOS",
      tagline: "The operating system for serious students",
      description: "An AI-powered study planner for CBSE Class 12 students",
      stage: "mvp",
      isActive: true,
      techStack: ["React", "TypeScript", "Supabase", "OpenAI"],
      tags: ["edtech", "ai", "saas"],
      startedAt: d(90),
    })
    .onConflictDoNothing();

  await db
    .insert(schema.startupFeatures)
    .values([
      { id: "feat-1", projectId, userId: MOCK_USER_ID, title: "AI Study Planner", status: "done", priority: "high", impactEstimate: "high", completedAt: ts(30) },
      { id: "feat-2", projectId, userId: MOCK_USER_ID, title: "Spaced Repetition Engine", status: "done", priority: "high", impactEstimate: "high", completedAt: ts(20) },
      { id: "feat-3", projectId, userId: MOCK_USER_ID, title: "Payment Integration (Stripe)", status: "in_progress", priority: "urgent", impactEstimate: "high", startedAt: ts(5) },
      { id: "feat-4", projectId, userId: MOCK_USER_ID, title: "Landing Page + SEO", status: "in_progress", priority: "high", impactEstimate: "high", startedAt: ts(3) },
      { id: "feat-5", projectId, userId: MOCK_USER_ID, title: "Email Onboarding Sequence", status: "planned", priority: "medium", impactEstimate: "medium" },
      { id: "feat-6", projectId, userId: MOCK_USER_ID, title: "Mobile App (React Native)", status: "idea", priority: "low", impactEstimate: "high" },
      { id: "feat-7", projectId, userId: MOCK_USER_ID, title: "Analytics Dashboard", status: "idea", priority: "medium", impactEstimate: "medium" },
    ])
    .onConflictDoNothing();

  await db
    .insert(schema.startupMetrics)
    .values([
      { id: "sm-1", projectId, userId: MOCK_USER_ID, metricName: "mrr_usd", metricValue: "0", unit: "USD", recordedAt: d(30) },
      { id: "sm-2", projectId, userId: MOCK_USER_ID, metricName: "mrr_usd", metricValue: "0", unit: "USD", recordedAt: d(14) },
      { id: "sm-3", projectId, userId: MOCK_USER_ID, metricName: "mrr_usd", metricValue: "49", unit: "USD", recordedAt: d(0) },
      { id: "sm-4", projectId, userId: MOCK_USER_ID, metricName: "active_users", metricValue: "0", unit: "users", recordedAt: d(30) },
      { id: "sm-5", projectId, userId: MOCK_USER_ID, metricName: "active_users", metricValue: "12", unit: "users", recordedAt: d(14) },
      { id: "sm-6", projectId, userId: MOCK_USER_ID, metricName: "active_users", metricValue: "37", unit: "users", recordedAt: d(0) },
      { id: "sm-7", projectId, userId: MOCK_USER_ID, metricName: "waitlist_signups", metricValue: "0", unit: "signups", recordedAt: d(30) },
      { id: "sm-8", projectId, userId: MOCK_USER_ID, metricName: "waitlist_signups", metricValue: "89", unit: "signups", recordedAt: d(14) },
      { id: "sm-9", projectId, userId: MOCK_USER_ID, metricName: "waitlist_signups", metricValue: "213", unit: "signups", recordedAt: d(0) },
    ])
    .onConflictDoNothing();

  // ── CHESS ─────────────────────────────────────────────────────────────
  const chessRatingData = [
    { daysAgo: 60, rating: 1380 },
    { daysAgo: 45, rating: 1410 },
    { daysAgo: 30, rating: 1430 },
    { daysAgo: 14, rating: 1445 },
    { daysAgo: 7, rating: 1450 },
    { daysAgo: 0, rating: 1462 },
  ];

  await db
    .insert(schema.chessRatings)
    .values(
      chessRatingData.map((r, i) => ({
        id: `cr-${i + 1}`,
        userId: MOCK_USER_ID,
        platform: "chess.com",
        timeControl: "rapid",
        rating: r.rating,
        recordedAt: d(r.daysAgo),
      }))
    )
    .onConflictDoNothing();

  const chessSessionData = [
    { daysAgo: 0, type: "tactics", duration: 45, tactics: 32, accuracy: 71 },
    { daysAgo: 1, type: "game", duration: 60, games: 4, wins: 2, losses: 2, draws: 0 },
    { daysAgo: 2, type: "analysis", duration: 30, accuracy: 68 },
    { daysAgo: 3, type: "tactics", duration: 30, tactics: 22, accuracy: 65 },
    { daysAgo: 5, type: "game", duration: 90, games: 6, wins: 3, losses: 2, draws: 1 },
    { daysAgo: 7, type: "openings", duration: 45, focusArea: "Sicilian Defence" },
    { daysAgo: 8, type: "tactics", duration: 30, tactics: 28, accuracy: 75 },
    { daysAgo: 10, type: "game", duration: 60, games: 4, wins: 1, losses: 2, draws: 1 },
    { daysAgo: 14, type: "tactics", duration: 60, tactics: 50, accuracy: 70 },
  ];

  await db
    .insert(schema.chessSessions)
    .values(
      chessSessionData.map((s, i) => ({
        id: `cs-${i + 1}`,
        userId: MOCK_USER_ID,
        sessionDate: d(s.daysAgo),
        durationMins: s.duration,
        sessionType: s.type,
        platform: "chess.com",
        timeControl: s.type === "game" ? "rapid" : undefined,
        gamesPlayed: s.games ?? 0,
        wins: s.wins ?? 0,
        losses: s.losses ?? 0,
        draws: s.draws ?? 0,
        tacticsSolved: s.tactics,
        accuracy: s.accuracy?.toString(),
        focusArea: s.focusArea,
      }))
    )
    .onConflictDoNothing();

  // ── GUITAR ────────────────────────────────────────────────────────────
  await db
    .insert(schema.guitarSongs)
    .values([
      { id: "gs-1", userId: MOCK_USER_ID, title: "Wonderful Tonight", artist: "Eric Clapton", difficulty: 2, status: "mastered", masteryLevel: 95, startedAt: d(60), masteredAt: d(30) },
      { id: "gs-2", userId: MOCK_USER_ID, title: "Blackbird", artist: "The Beatles", difficulty: 3, status: "polishing", masteryLevel: 75, startedAt: d(45) },
      { id: "gs-3", userId: MOCK_USER_ID, title: "Stairway to Heaven (intro)", artist: "Led Zeppelin", difficulty: 4, status: "learning", masteryLevel: 40, startedAt: d(20) },
      { id: "gs-4", userId: MOCK_USER_ID, title: "Nothing Else Matters", artist: "Metallica", difficulty: 3, status: "learning", masteryLevel: 25, startedAt: d(10) },
      { id: "gs-5", userId: MOCK_USER_ID, title: "Classical Gas", artist: "Mason Williams", difficulty: 5, status: "wishlist", masteryLevel: 0 },
    ])
    .onConflictDoNothing();

  const guitarSessionData = [
    { daysAgo: 0, mins: 35, areas: ["fingerpicking", "scales"], bpmTarget: 80, bpmAchieved: 72, quality: 3 },
    { daysAgo: 1, mins: 45, areas: ["chords", "song-practice"], bpmTarget: 90, bpmAchieved: 85, quality: 4 },
    { daysAgo: 3, mins: 30, areas: ["fingerpicking", "theory"], bpmTarget: 80, bpmAchieved: 78, quality: 4 },
    { daysAgo: 6, mins: 40, areas: ["scales", "song-practice"], bpmTarget: 100, bpmAchieved: 88, quality: 3 },
    { daysAgo: 9, mins: 50, areas: ["chords", "fingerpicking"], bpmTarget: 85, bpmAchieved: 80, quality: 4 },
    { daysAgo: 12, mins: 30, areas: ["scales"], bpmTarget: 90, bpmAchieved: 82, quality: 3 },
    { daysAgo: 15, mins: 45, areas: ["song-practice", "fingerpicking"], bpmTarget: 80, bpmAchieved: 75, quality: 5 },
  ];

  await db
    .insert(schema.guitarSessions)
    .values(
      guitarSessionData.map((s, i) => ({
        id: `gts-${i + 1}`,
        userId: MOCK_USER_ID,
        sessionDate: d(s.daysAgo),
        durationMins: s.mins,
        sessionType: "practice",
        focusAreas: s.areas,
        bpmTarget: s.bpmTarget,
        bpmAchieved: s.bpmAchieved,
        qualityScore: s.quality,
      }))
    )
    .onConflictDoNothing();

  // ── ACHIEVEMENTS ──────────────────────────────────────────────────────
  await db
    .insert(schema.achievements)
    .values([
      { id: "ach-1", userId: MOCK_USER_ID, type: "milestone", title: "First Steps", description: "Complete your first task", icon: "Star", earnedAt: ts(60), isSeen: true },
      { id: "ach-2", userId: MOCK_USER_ID, type: "streak", domain: "academics", title: "On Fire", description: "Reached a 7-day study streak", icon: "Flame", earnedAt: ts(16), isSeen: true },
      { id: "ach-3", userId: MOCK_USER_ID, type: "skill", domain: "academics", title: "Scholar", description: "Logged 50+ hours of study", icon: "GraduationCap", triggerEntity: "study_hours", triggerValue: "50", earnedAt: ts(10), isSeen: true },
      { id: "ach-4", userId: MOCK_USER_ID, type: "milestone", domain: "startup", title: "Founder", description: "Launched a project", icon: "Rocket", earnedAt: ts(85), isSeen: true },
      { id: "ach-5", userId: MOCK_USER_ID, type: "skill", domain: "chess", title: "Tactician", description: "Solved 500 chess puzzles", icon: "Crown", triggerEntity: "tactics_count", triggerValue: "500", earnedAt: ts(20), isSeen: true },
      { id: "ach-6", userId: MOCK_USER_ID, type: "meta", title: "Consistency", description: "Logged activity in all domains in one day", icon: "Trophy", earnedAt: ts(5), isSeen: false },
    ])
    .onConflictDoNothing();

  // ── DAILY REVIEWS ─────────────────────────────────────────────────────
  const dailyReviewData = [
    { daysAgo: 0, energy: 4, mood: 4, score: 847, studyMins: 180, chess: true, guitar: true, startup: false },
    { daysAgo: 1, energy: 5, mood: 5, score: 920, studyMins: 240, chess: true, guitar: true, startup: true },
    { daysAgo: 2, energy: 3, mood: 3, score: 650, studyMins: 120, chess: false, guitar: false, startup: true },
    { daysAgo: 3, energy: 4, mood: 4, score: 800, studyMins: 200, chess: true, guitar: true, startup: false },
    { daysAgo: 4, energy: 2, mood: 3, score: 580, studyMins: 90, chess: false, guitar: false, startup: false },
    { daysAgo: 5, energy: 4, mood: 4, score: 760, studyMins: 210, chess: true, guitar: false, startup: true },
    { daysAgo: 6, energy: 5, mood: 5, score: 880, studyMins: 300, chess: true, guitar: true, startup: true },
  ];

  await db
    .insert(schema.dailyReviews)
    .values(
      dailyReviewData.map((r, i) => ({
        id: `dr-${i + 1}`,
        userId: MOCK_USER_ID,
        reviewDate: d(r.daysAgo),
        energyLevel: r.energy,
        moodScore: r.mood,
        overallScore: r.score,
        studyMins: r.studyMins,
        chessSessionDone: r.chess,
        guitarSessionDone: r.guitar,
        startupTaskDone: r.startup,
        wins: i === 0 ? ["Completed Physics revision", "Hit 23-day streak"] : [],
        blockers: i === 0 ? ["AC circuit problems still weak"] : [],
        tomorrowPriorities: i === 0 ? ["Thermodynamics mock test", "Write landing page copy"] : [],
      }))
    )
    .onConflictDoNothing();

  console.log("✅ Seed complete!");
  await pool.end();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
