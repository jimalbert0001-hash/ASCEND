import {
  pgTable,
  text,
  smallint,
  integer,
  boolean,
  numeric,
  date,
  timestamp,
  jsonb,
  unique,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const dailyReviews = pgTable(
  "daily_reviews",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    reviewDate: date("review_date").notNull(),

    energyLevel: smallint("energy_level"),
    moodScore: smallint("mood_score"),
    overallScore: integer("overall_score"),

    wins: text("wins").array().notNull().default([]),
    blockers: text("blockers").array().notNull().default([]),
    tomorrowPriorities: text("tomorrow_priorities").array().notNull().default([]),

    studyMins: integer("study_mins").notNull().default(0),
    chessSessionDone: boolean("chess_session_done").notNull().default(false),
    guitarSessionDone: boolean("guitar_session_done").notNull().default(false),
    startupTaskDone: boolean("startup_task_done").notNull().default(false),

    notes: text("notes"),
    aiSummary: text("ai_summary"),
    aiMetadata: jsonb("ai_metadata").notNull().default({}),

    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [unique().on(t.userId, t.reviewDate)]
);

export const weeklyReviews = pgTable(
  "weekly_reviews",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    weekStart: date("week_start").notNull(),
    weekEnd: date("week_end").notNull(),

    avgDailyScore: numeric("avg_daily_score", { precision: 5, scale: 2 }),
    totalStudyMins: integer("total_study_mins").notNull().default(0),
    habitsCompletionRate: numeric("habits_completion_rate", { precision: 5, scale: 2 }),

    biggestWin: text("biggest_win"),
    biggestChallenge: text("biggest_challenge"),
    lessonsLearned: text("lessons_learned").array().notNull().default([]),
    nextWeekFocus: text("next_week_focus").array().notNull().default([]),

    aiDigest: text("ai_digest"),
    aiMetadata: jsonb("ai_metadata").notNull().default({}),

    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [unique().on(t.userId, t.weekStart)]
);

export type DailyReview = typeof dailyReviews.$inferSelect;
export type NewDailyReview = typeof dailyReviews.$inferInsert;
export type WeeklyReview = typeof weeklyReviews.$inferSelect;
