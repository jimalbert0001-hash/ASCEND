import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema/index.js";

const { Pool } = pg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

const MOCK_USER_ID = "mock-user-1";

const today = new Date();
function d(daysAgo: number): string {
  const dt = new Date(today);
  dt.setDate(dt.getDate() - daysAgo);
  return dt.toISOString().split("T")[0];
}
function ts(daysAgo: number, hour = 10): Date {
  const dt = new Date(today);
  dt.setDate(dt.getDate() - daysAgo);
  dt.setHours(hour, 0, 0, 0);
  return dt;
}

async function seed() {
  console.log("🌱 Seeding database for mock-user-1...");

  await db.insert(schema.users).values({ id: MOCK_USER_ID, email: "alex@example.com" }).onConflictDoNothing();

  await db.insert(schema.profiles).values({
    id: "profile-mock-1",
    userId: MOCK_USER_ID,
    displayName: "Alex Mercer",
    timezone: "Asia/Kolkata",
    boardYear: 2026,
    targetPercentage: "95.00",
    onboardingComplete: true,
    activeDomains: ["academics", "startup", "chess", "guitar"],
  }).onConflictDoNothing();

  // GOALS
  await db.insert(schema.goals).values([
    { id: "goal-phys-1", userId: MOCK_USER_ID, domain: "academics", title: "Score 95%+ in Physics", status: "in_progress", priority: "high", progress: "68.00", targetDate: d(90), tags: ["cbse", "physics"] },
    { id: "goal-boards-1", userId: MOCK_USER_ID, domain: "academics", title: "Overall 92%+ in Board Exams", status: "in_progress", priority: "urgent", progress: "55.00", targetDate: d(120) },
    { id: "goal-startup-1", userId: MOCK_USER_ID, domain: "startup", title: "Launch MVP by July 2026", status: "in_progress", priority: "high", progress: "40.00", targetDate: d(60) },
    { id: "goal-chess-1", userId: MOCK_USER_ID, domain: "chess", title: "Reach 1800 Rapid Rating", status: "in_progress", priority: "medium", progress: "25.00", targetDate: d(180) },
    { id: "goal-guitar-1", userId: MOCK_USER_ID, domain: "guitar", title: "Master Fingerpicking Technique", status: "in_progress", priority: "low", progress: "55.00", targetDate: d(90) },
  ]).onConflictDoNothing();

  // TASKS
  await db.insert(schema.tasks).values([
    { id: "task-1", userId: MOCK_USER_ID, goalId: "goal-phys-1", domain: "academics", title: "Chapter 12: Thermodynamics revision", status: "todo", priority: "high", dueDate: d(1) },
    { id: "task-2", userId: MOCK_USER_ID, goalId: "goal-phys-1", domain: "academics", title: "Solve HC Verma exercises — Waves", status: "todo", priority: "high", dueDate: d(2) },
    { id: "task-3", userId: MOCK_USER_ID, goalId: "goal-startup-1", domain: "startup", title: "Write landing page copy", status: "in_progress", priority: "medium", dueDate: d(2) },
    { id: "task-4", userId: MOCK_USER_ID, goalId: "goal-startup-1", domain: "startup", title: "Set up Stripe payment integration", status: "todo", priority: "high", dueDate: d(5) },
    { id: "task-5", userId: MOCK_USER_ID, goalId: "goal-chess-1", domain: "chess", title: "Solve 30 tactics puzzles", status: "todo", priority: "high", dueDate: d(0) },
    { id: "task-6", userId: MOCK_USER_ID, goalId: "goal-guitar-1", domain: "guitar", title: "Practice F major chord transitions", status: "todo", priority: "low", dueDate: d(0) },
    { id: "task-done-1", userId: MOCK_USER_ID, goalId: "goal-phys-1", domain: "academics", title: "Complete Electromagnetic Induction notes", status: "done", priority: "high", completedAt: ts(1) },
    { id: "task-done-2", userId: MOCK_USER_ID, goalId: "goal-chess-1", domain: "chess", title: "Analyse 3 lost games", status: "done", priority: "medium", completedAt: ts(2) },
  ]).onConflictDoNothing();

  // HABITS
  await db.insert(schema.habits).values([
    { id: "habit-study-1", userId: MOCK_USER_ID, domain: "academics", title: "Study for 3+ hours", frequency: "daily", targetCount: 1, currentStreak: 23, longestStreak: 31, color: "#3b82f6", icon: "BookOpen" },
    { id: "habit-chess-1", userId: MOCK_USER_ID, domain: "chess", title: "Solve 20 tactics puzzles", frequency: "daily", targetCount: 20, unit: "puzzles", currentStreak: 15, longestStreak: 28, color: "#8b5cf6", icon: "Crown" },
    { id: "habit-guitar-1", userId: MOCK_USER_ID, domain: "guitar", title: "30 min guitar practice", frequency: "daily", targetCount: 1, currentStreak: 8, longestStreak: 14, color: "#22c55e", icon: "Music" },
    { id: "habit-review-1", userId: MOCK_USER_ID, domain: "life", title: "Daily review", frequency: "daily", targetCount: 1, currentStreak: 23, longestStreak: 31, color: "#f59e0b", icon: "CheckSquare" },
    { id: "habit-startup-1", userId: MOCK_USER_ID, domain: "startup", title: "1 startup task shipped", frequency: "weekdays", targetCount: 1, currentStreak: 5, longestStreak: 12, color: "#f97316", icon: "Rocket" },
  ]).onConflictDoNothing();

  // HABIT LOGS (last 30 days)
  const habitLogs: (typeof schema.habitLogs.$inferInsert)[] = [];
  for (let i = 0; i < 30; i++) {
    const date = d(i);
    if (i % 7 !== 0 || i < 5) habitLogs.push({ habitId: "habit-study-1", userId: MOCK_USER_ID, loggedDate: date, count: 1 });
    if (i % 2 === 0 || i % 3 === 0) habitLogs.push({ habitId: "habit-chess-1", userId: MOCK_USER_ID, loggedDate: date, count: 20 });
    if (i % 3 === 0) habitLogs.push({ habitId: "habit-guitar-1", userId: MOCK_USER_ID, loggedDate: date, count: 1 });
    if (i % 7 !== 0 || i < 5) habitLogs.push({ habitId: "habit-review-1", userId: MOCK_USER_ID, loggedDate: date, count: 1 });
    const dow = new Date(today.getTime() - i * 86400000).getDay();
    if (dow !== 0 && dow !== 6 && i % 3 !== 2) habitLogs.push({ habitId: "habit-startup-1", userId: MOCK_USER_ID, loggedDate: date, count: 1 });
  }
  await db.insert(schema.habitLogs).values(habitLogs).onConflictDoNothing();

  // SUBJECTS
  await db.insert(schema.subjects).values([
    { id: "sub-phys-1", userId: MOCK_USER_ID, name: "Physics", code: "042", color: "#3b82f6", icon: "Zap", targetMarks: 95 },
    { id: "sub-chem-1", userId: MOCK_USER_ID, name: "Chemistry", code: "043", color: "#22c55e", icon: "FlaskConical", targetMarks: 90 },
    { id: "sub-maths-1", userId: MOCK_USER_ID, name: "Mathematics", code: "041", color: "#f59e0b", icon: "Calculator", targetMarks: 98 },
    { id: "sub-cs-1", userId: MOCK_USER_ID, name: "Computer Science", code: "083", color: "#8b5cf6", icon: "Code", targetMarks: 98 },
    { id: "sub-eng-1", userId: MOCK_USER_ID, name: "English", code: "301", color: "#ec4899", icon: "BookOpen", targetMarks: 90 },
  ]).onConflictDoNothing();

  // CHAPTERS
  await db.insert(schema.chapters).values([
    { id: "ch-ph-1", subjectId: "sub-phys-1", userId: MOCK_USER_ID, name: "Electric Charges and Fields", chapterNumber: 1, isCompleted: true, understandingLevel: 4 },
    { id: "ch-ph-2", subjectId: "sub-phys-1", userId: MOCK_USER_ID, name: "Electrostatic Potential and Capacitance", chapterNumber: 2, isCompleted: true, understandingLevel: 3 },
    { id: "ch-ph-3", subjectId: "sub-phys-1", userId: MOCK_USER_ID, name: "Current Electricity", chapterNumber: 3, isCompleted: true, understandingLevel: 4 },
    { id: "ch-ph-4", subjectId: "sub-phys-1", userId: MOCK_USER_ID, name: "Moving Charges and Magnetism", chapterNumber: 4, isCompleted: true, understandingLevel: 3 },
    { id: "ch-ph-5", subjectId: "sub-phys-1", userId: MOCK_USER_ID, name: "Magnetism and Matter", chapterNumber: 5, isCompleted: false, understandingLevel: 2 },
    { id: "ch-ph-6", subjectId: "sub-phys-1", userId: MOCK_USER_ID, name: "Electromagnetic Induction", chapterNumber: 6, isCompleted: false, understandingLevel: 2 },
    { id: "ch-ph-7", subjectId: "sub-phys-1", userId: MOCK_USER_ID, name: "Alternating Current", chapterNumber: 7, isCompleted: false, understandingLevel: 1 },
    { id: "ch-ph-8", subjectId: "sub-phys-1", userId: MOCK_USER_ID, name: "Electromagnetic Waves", chapterNumber: 8, isCompleted: false, understandingLevel: 2 },
    { id: "ch-ph-9", subjectId: "sub-phys-1", userId: MOCK_USER_ID, name: "Ray Optics", chapterNumber: 9, isCompleted: false, understandingLevel: 3 },
    { id: "ch-ph-10", subjectId: "sub-phys-1", userId: MOCK_USER_ID, name: "Wave Optics", chapterNumber: 10, isCompleted: false, understandingLevel: 2 },
    { id: "ch-ph-11", subjectId: "sub-phys-1", userId: MOCK_USER_ID, name: "Dual Nature of Radiation", chapterNumber: 11, isCompleted: false, understandingLevel: 1 },
    { id: "ch-ph-12", subjectId: "sub-phys-1", userId: MOCK_USER_ID, name: "Atoms", chapterNumber: 12, isCompleted: false, understandingLevel: 2 },
    { id: "ch-ph-13", subjectId: "sub-phys-1", userId: MOCK_USER_ID, name: "Nuclei", chapterNumber: 13, isCompleted: false, understandingLevel: 1 },
  ]).onConflictDoNothing();

  // STUDY SESSIONS
  const sessions: (typeof schema.studySessions.$inferInsert)[] = [
    { id: "ss-1", userId: MOCK_USER_ID, subjectId: "sub-phys-1", startedAt: ts(0, 9), endedAt: ts(0, 12), durationMins: 180, sessionType: "study", focusScore: 4, pomodoros: 7 },
    { id: "ss-2", userId: MOCK_USER_ID, subjectId: "sub-maths-1", startedAt: ts(1, 9), endedAt: ts(1, 13), durationMins: 240, sessionType: "study", focusScore: 5, pomodoros: 9 },
    { id: "ss-3", userId: MOCK_USER_ID, subjectId: "sub-chem-1", startedAt: ts(2, 9), endedAt: ts(2, 11), durationMins: 120, sessionType: "study", focusScore: 3, pomodoros: 4 },
    { id: "ss-4", userId: MOCK_USER_ID, subjectId: "sub-phys-1", startedAt: ts(3, 9), endedAt: ts(3, 12), durationMins: 200, sessionType: "study", focusScore: 4, pomodoros: 8 },
    { id: "ss-5", userId: MOCK_USER_ID, subjectId: "sub-eng-1", startedAt: ts(4, 10), endedAt: ts(4, 12), durationMins: 90, sessionType: "study", focusScore: 3, pomodoros: 3 },
    { id: "ss-6", userId: MOCK_USER_ID, subjectId: "sub-cs-1", startedAt: ts(5, 9), endedAt: ts(5, 13), durationMins: 210, sessionType: "study", focusScore: 5, pomodoros: 8 },
    { id: "ss-7", userId: MOCK_USER_ID, subjectId: "sub-maths-1", startedAt: ts(7, 9), endedAt: ts(7, 12), durationMins: 180, sessionType: "study", focusScore: 4, pomodoros: 7 },
    { id: "ss-8", userId: MOCK_USER_ID, subjectId: "sub-chem-1", startedAt: ts(8, 9), endedAt: ts(8, 12), durationMins: 150, sessionType: "study", focusScore: 3, pomodoros: 6 },
    { id: "ss-9", userId: MOCK_USER_ID, subjectId: "sub-phys-1", startedAt: ts(9, 9), endedAt: ts(9, 13), durationMins: 220, sessionType: "study", focusScore: 4, pomodoros: 8 },
    { id: "ss-10", userId: MOCK_USER_ID, subjectId: "sub-cs-1", startedAt: ts(10, 9), endedAt: ts(10, 12), durationMins: 170, sessionType: "study", focusScore: 5, pomodoros: 6 },
    { id: "ss-11", userId: MOCK_USER_ID, subjectId: "sub-maths-1", startedAt: ts(14, 9), endedAt: ts(14, 13), durationMins: 200, sessionType: "study", focusScore: 4, pomodoros: 8 },
    { id: "ss-12", userId: MOCK_USER_ID, subjectId: "sub-phys-1", startedAt: ts(15, 9), endedAt: ts(15, 12), durationMins: 160, sessionType: "study", focusScore: 3, pomodoros: 6 },
    { id: "ss-13", userId: MOCK_USER_ID, subjectId: "sub-chem-1", startedAt: ts(21, 9), endedAt: ts(21, 12), durationMins: 190, sessionType: "study", focusScore: 4, pomodoros: 7 },
    { id: "ss-14", userId: MOCK_USER_ID, subjectId: "sub-phys-1", startedAt: ts(28, 9), endedAt: ts(28, 13), durationMins: 210, sessionType: "study", focusScore: 5, pomodoros: 8 },
  ];
  await db.insert(schema.studySessions).values(sessions).onConflictDoNothing();

  // MOCK TESTS
  await db.insert(schema.mockTests).values([
    { id: "mt-1", userId: MOCK_USER_ID, subjectId: "sub-phys-1", name: "Physics Mock #1", testDate: d(14), totalMarks: 70, obtainedMarks: "58", weakChapters: ["Alternating Current", "Nuclei"] },
    { id: "mt-2", userId: MOCK_USER_ID, subjectId: "sub-maths-1", name: "Maths Mock #1", testDate: d(10), totalMarks: 80, obtainedMarks: "72" },
    { id: "mt-3", userId: MOCK_USER_ID, subjectId: "sub-chem-1", name: "Chemistry Mock #1", testDate: d(7), totalMarks: 70, obtainedMarks: "55", weakChapters: ["Electrochemistry"] },
    { id: "mt-4", userId: MOCK_USER_ID, subjectId: "sub-phys-1", name: "Physics Mock #2", testDate: d(3), totalMarks: 70, obtainedMarks: "62", weakChapters: ["Alternating Current"] },
    { id: "mt-5", userId: MOCK_USER_ID, name: "Full Syllabus Mock #1", testDate: d(1), totalMarks: 500, obtainedMarks: "421" },
  ]).onConflictDoNothing();

  // STARTUP
  await db.insert(schema.startupProjects).values({
    id: "proj-studyos-1",
    userId: MOCK_USER_ID,
    name: "StudyOS",
    tagline: "The OS for serious students",
    stage: "mvp",
    isActive: true,
    techStack: ["React", "TypeScript", "Supabase", "OpenAI"],
    startedAt: d(90),
  }).onConflictDoNothing();

  await db.insert(schema.startupFeatures).values([
    { id: "feat-1", projectId: "proj-studyos-1", userId: MOCK_USER_ID, title: "AI Study Planner", status: "done", priority: "high", completedAt: ts(30) },
    { id: "feat-2", projectId: "proj-studyos-1", userId: MOCK_USER_ID, title: "Spaced Repetition Engine", status: "done", priority: "high", completedAt: ts(20) },
    { id: "feat-3", projectId: "proj-studyos-1", userId: MOCK_USER_ID, title: "Payment Integration (Stripe)", status: "in_progress", priority: "urgent", startedAt: ts(5) },
    { id: "feat-4", projectId: "proj-studyos-1", userId: MOCK_USER_ID, title: "Landing Page + SEO", status: "in_progress", priority: "high", startedAt: ts(3) },
    { id: "feat-5", projectId: "proj-studyos-1", userId: MOCK_USER_ID, title: "Email Onboarding Sequence", status: "planned", priority: "medium" },
    { id: "feat-6", projectId: "proj-studyos-1", userId: MOCK_USER_ID, title: "Mobile App (React Native)", status: "idea", priority: "low" },
  ]).onConflictDoNothing();

  await db.insert(schema.startupMetrics).values([
    { id: "sm-1", projectId: "proj-studyos-1", userId: MOCK_USER_ID, metricName: "mrr_usd", metricValue: "0", unit: "USD", recordedAt: d(30) },
    { id: "sm-2", projectId: "proj-studyos-1", userId: MOCK_USER_ID, metricName: "mrr_usd", metricValue: "49", unit: "USD", recordedAt: d(0) },
    { id: "sm-3", projectId: "proj-studyos-1", userId: MOCK_USER_ID, metricName: "active_users", metricValue: "0", unit: "users", recordedAt: d(30) },
    { id: "sm-4", projectId: "proj-studyos-1", userId: MOCK_USER_ID, metricName: "active_users", metricValue: "37", unit: "users", recordedAt: d(0) },
    { id: "sm-5", projectId: "proj-studyos-1", userId: MOCK_USER_ID, metricName: "waitlist_signups", metricValue: "0", unit: "signups", recordedAt: d(30) },
    { id: "sm-6", projectId: "proj-studyos-1", userId: MOCK_USER_ID, metricName: "waitlist_signups", metricValue: "213", unit: "signups", recordedAt: d(0) },
  ]).onConflictDoNothing();

  // CHESS RATINGS
  await db.insert(schema.chessRatings).values([
    { id: "cr-1", userId: MOCK_USER_ID, platform: "chess.com", timeControl: "rapid", rating: 1380, recordedAt: d(60) },
    { id: "cr-2", userId: MOCK_USER_ID, platform: "chess.com", timeControl: "rapid", rating: 1410, recordedAt: d(45) },
    { id: "cr-3", userId: MOCK_USER_ID, platform: "chess.com", timeControl: "rapid", rating: 1430, recordedAt: d(30) },
    { id: "cr-4", userId: MOCK_USER_ID, platform: "chess.com", timeControl: "rapid", rating: 1445, recordedAt: d(14) },
    { id: "cr-5", userId: MOCK_USER_ID, platform: "chess.com", timeControl: "rapid", rating: 1450, recordedAt: d(7) },
    { id: "cr-6", userId: MOCK_USER_ID, platform: "chess.com", timeControl: "rapid", rating: 1462, recordedAt: d(0) },
  ]).onConflictDoNothing();

  // CHESS SESSIONS
  await db.insert(schema.chessSessions).values([
    { id: "cs-1", userId: MOCK_USER_ID, sessionDate: d(0), durationMins: 45, sessionType: "tactics", platform: "chess.com", tacticsSolved: 32, accuracy: "71" },
    { id: "cs-2", userId: MOCK_USER_ID, sessionDate: d(1), durationMins: 60, sessionType: "game", platform: "chess.com", timeControl: "rapid", gamesPlayed: 4, wins: 2, losses: 2, draws: 0 },
    { id: "cs-3", userId: MOCK_USER_ID, sessionDate: d(2), durationMins: 30, sessionType: "analysis", platform: "chess.com", accuracy: "68" },
    { id: "cs-4", userId: MOCK_USER_ID, sessionDate: d(3), durationMins: 30, sessionType: "tactics", platform: "chess.com", tacticsSolved: 22, accuracy: "65" },
    { id: "cs-5", userId: MOCK_USER_ID, sessionDate: d(5), durationMins: 90, sessionType: "game", platform: "chess.com", timeControl: "rapid", gamesPlayed: 6, wins: 3, losses: 2, draws: 1 },
    { id: "cs-6", userId: MOCK_USER_ID, sessionDate: d(7), durationMins: 45, sessionType: "openings", platform: "chess.com", focusArea: "Sicilian Defence" },
    { id: "cs-7", userId: MOCK_USER_ID, sessionDate: d(8), durationMins: 30, sessionType: "tactics", platform: "chess.com", tacticsSolved: 28, accuracy: "75" },
    { id: "cs-8", userId: MOCK_USER_ID, sessionDate: d(10), durationMins: 60, sessionType: "game", platform: "chess.com", timeControl: "rapid", gamesPlayed: 4, wins: 1, losses: 2, draws: 1 },
    { id: "cs-9", userId: MOCK_USER_ID, sessionDate: d(14), durationMins: 60, sessionType: "tactics", platform: "chess.com", tacticsSolved: 50, accuracy: "70" },
  ]).onConflictDoNothing();

  // GUITAR SONGS
  await db.insert(schema.guitarSongs).values([
    { id: "gs-1", userId: MOCK_USER_ID, title: "Wonderful Tonight", artist: "Eric Clapton", difficulty: 2, status: "mastered", masteryLevel: 95, startedAt: d(60), masteredAt: d(30) },
    { id: "gs-2", userId: MOCK_USER_ID, title: "Blackbird", artist: "The Beatles", difficulty: 3, status: "polishing", masteryLevel: 75, startedAt: d(45) },
    { id: "gs-3", userId: MOCK_USER_ID, title: "Stairway to Heaven (intro)", artist: "Led Zeppelin", difficulty: 4, status: "learning", masteryLevel: 40, startedAt: d(20) },
    { id: "gs-4", userId: MOCK_USER_ID, title: "Nothing Else Matters", artist: "Metallica", difficulty: 3, status: "learning", masteryLevel: 25, startedAt: d(10) },
  ]).onConflictDoNothing();

  // GUITAR SESSIONS
  await db.insert(schema.guitarSessions).values([
    { id: "gts-1", userId: MOCK_USER_ID, sessionDate: d(0), durationMins: 35, sessionType: "practice", focusAreas: ["fingerpicking", "scales"], bpmTarget: 80, bpmAchieved: 72, qualityScore: 3 },
    { id: "gts-2", userId: MOCK_USER_ID, sessionDate: d(1), durationMins: 45, sessionType: "practice", focusAreas: ["chords", "song-practice"], bpmTarget: 90, bpmAchieved: 85, qualityScore: 4 },
    { id: "gts-3", userId: MOCK_USER_ID, sessionDate: d(3), durationMins: 30, sessionType: "practice", focusAreas: ["fingerpicking", "theory"], bpmTarget: 80, bpmAchieved: 78, qualityScore: 4 },
    { id: "gts-4", userId: MOCK_USER_ID, sessionDate: d(6), durationMins: 40, sessionType: "practice", focusAreas: ["scales", "song-practice"], bpmTarget: 100, bpmAchieved: 88, qualityScore: 3 },
    { id: "gts-5", userId: MOCK_USER_ID, sessionDate: d(9), durationMins: 50, sessionType: "practice", focusAreas: ["chords", "fingerpicking"], bpmTarget: 85, bpmAchieved: 80, qualityScore: 4 },
    { id: "gts-6", userId: MOCK_USER_ID, sessionDate: d(12), durationMins: 30, sessionType: "practice", focusAreas: ["scales"], bpmTarget: 90, bpmAchieved: 82, qualityScore: 3 },
    { id: "gts-7", userId: MOCK_USER_ID, sessionDate: d(15), durationMins: 45, sessionType: "practice", focusAreas: ["song-practice", "fingerpicking"], bpmTarget: 80, bpmAchieved: 75, qualityScore: 5 },
  ]).onConflictDoNothing();

  // ACHIEVEMENTS
  await db.insert(schema.achievements).values([
    { id: "ach-1", userId: MOCK_USER_ID, type: "milestone", title: "First Steps", description: "Complete your first task", icon: "Star", earnedAt: ts(60), isSeen: true },
    { id: "ach-2", userId: MOCK_USER_ID, type: "streak", domain: "academics", title: "On Fire", description: "Reached a 7-day study streak", icon: "Flame", earnedAt: ts(16), isSeen: true },
    { id: "ach-3", userId: MOCK_USER_ID, type: "skill", domain: "academics", title: "Scholar", description: "Logged 50+ hours of study", icon: "GraduationCap", earnedAt: ts(10), isSeen: true },
    { id: "ach-4", userId: MOCK_USER_ID, type: "milestone", domain: "startup", title: "Founder", description: "Launched a project", icon: "Rocket", earnedAt: ts(85), isSeen: true },
    { id: "ach-5", userId: MOCK_USER_ID, type: "skill", domain: "chess", title: "Tactician", description: "Solved 500 chess puzzles", icon: "Crown", earnedAt: ts(20), isSeen: true },
    { id: "ach-6", userId: MOCK_USER_ID, type: "meta", title: "Consistency", description: "Logged activity in all domains in one day", icon: "Trophy", earnedAt: ts(5), isSeen: false },
  ]).onConflictDoNothing();

  // DAILY REVIEWS
  await db.insert(schema.dailyReviews).values([
    { id: "dr-1", userId: MOCK_USER_ID, reviewDate: d(0), energyLevel: 4, moodScore: 4, overallScore: 847, studyMins: 180, chessSessionDone: true, guitarSessionDone: true, startupTaskDone: false, wins: ["Completed Physics revision", "Hit 23-day streak"], blockers: ["AC circuit problems still weak"], tomorrowPriorities: ["Thermodynamics mock test"] },
    { id: "dr-2", userId: MOCK_USER_ID, reviewDate: d(1), energyLevel: 5, moodScore: 5, overallScore: 920, studyMins: 240, chessSessionDone: true, guitarSessionDone: true, startupTaskDone: true },
    { id: "dr-3", userId: MOCK_USER_ID, reviewDate: d(2), energyLevel: 3, moodScore: 3, overallScore: 650, studyMins: 120, chessSessionDone: false, guitarSessionDone: false, startupTaskDone: true },
    { id: "dr-4", userId: MOCK_USER_ID, reviewDate: d(3), energyLevel: 4, moodScore: 4, overallScore: 800, studyMins: 200, chessSessionDone: true, guitarSessionDone: true, startupTaskDone: false },
    { id: "dr-5", userId: MOCK_USER_ID, reviewDate: d(4), energyLevel: 2, moodScore: 3, overallScore: 580, studyMins: 90, chessSessionDone: false, guitarSessionDone: false, startupTaskDone: false },
    { id: "dr-6", userId: MOCK_USER_ID, reviewDate: d(5), energyLevel: 4, moodScore: 4, overallScore: 760, studyMins: 210, chessSessionDone: true, guitarSessionDone: false, startupTaskDone: true },
    { id: "dr-7", userId: MOCK_USER_ID, reviewDate: d(6), energyLevel: 5, moodScore: 5, overallScore: 880, studyMins: 300, chessSessionDone: true, guitarSessionDone: true, startupTaskDone: true },
  ]).onConflictDoNothing();

  console.log("✅ Seed complete!");
  await pool.end();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  pool.end();
  process.exit(1);
});
