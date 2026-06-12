import {
  pgTable,
  text,
  smallint,
  boolean,
  numeric,
  integer,
  date,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import { revisionStageEnum } from "./enums";
import { users } from "./users";

export const subjects = pgTable("subjects", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  name: text("name").notNull(),
  code: text("code"),
  color: text("color"),
  icon: text("icon"),
  isActive: boolean("is_active").notNull().default(true),

  targetMarks: smallint("target_marks"),
  weightage: numeric("weightage", { precision: 4, scale: 2 }),

  aiMetadata: jsonb("ai_metadata").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const chapters = pgTable("chapters", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  subjectId: text("subject_id")
    .notNull()
    .references(() => subjects.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  name: text("name").notNull(),
  chapterNumber: smallint("chapter_number"),
  description: text("description"),

  isCompleted: boolean("is_completed").notNull().default(false),
  understandingLevel: smallint("understanding_level"),
  estimatedHours: numeric("estimated_hours", { precision: 4, scale: 1 }),
  actualHours: numeric("actual_hours", { precision: 4, scale: 1 }),

  firstStudiedAt: date("first_studied_at"),
  completedAt: date("completed_at"),

  aiMetadata: jsonb("ai_metadata").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const revisions = pgTable("revisions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  chapterId: text("chapter_id")
    .notNull()
    .references(() => chapters.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  stage: revisionStageEnum("stage").notNull().default("first"),
  scheduledDate: date("scheduled_date").notNull(),
  completedAt: timestamp("completed_at"),
  quality: smallint("quality"),

  easeFactor: numeric("ease_factor", { precision: 4, scale: 2 }).notNull().default("2.5"),
  intervalDays: integer("interval_days").notNull().default(1),
  nextDueDate: date("next_due_date"),

  notes: text("notes"),
  aiMetadata: jsonb("ai_metadata").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const studySessions = pgTable("study_sessions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  subjectId: text("subject_id").references(() => subjects.id, { onDelete: "set null" }),
  chapterId: text("chapter_id").references(() => chapters.id, { onDelete: "set null" }),

  startedAt: timestamp("started_at").notNull(),
  endedAt: timestamp("ended_at"),
  durationMins: integer("duration_mins"),

  sessionType: text("session_type").notNull().default("study"),
  focusScore: smallint("focus_score"),
  notes: text("notes"),

  pomodoros: smallint("pomodoros").notNull().default(0),
  breaksTaken: smallint("breaks_taken").notNull().default(0),

  aiMetadata: jsonb("ai_metadata").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const mockTests = pgTable("mock_tests", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  subjectId: text("subject_id").references(() => subjects.id, { onDelete: "set null" }),

  name: text("name").notNull(),
  testDate: date("test_date").notNull(),
  totalMarks: smallint("total_marks").notNull(),
  obtainedMarks: numeric("obtained_marks", { precision: 5, scale: 2 }).notNull(),

  durationMins: smallint("duration_mins"),
  timeTakenMins: smallint("time_taken_mins"),

  weakChapters: text("weak_chapters").array(),
  strongChapters: text("strong_chapters").array(),

  notes: text("notes"),
  aiMetadata: jsonb("ai_metadata").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Subject = typeof subjects.$inferSelect;
export type NewSubject = typeof subjects.$inferInsert;
export type Chapter = typeof chapters.$inferSelect;
export type NewChapter = typeof chapters.$inferInsert;
export type Revision = typeof revisions.$inferSelect;
export type StudySession = typeof studySessions.$inferSelect;
export type NewStudySession = typeof studySessions.$inferInsert;
export type MockTest = typeof mockTests.$inferSelect;
export type NewMockTest = typeof mockTests.$inferInsert;
