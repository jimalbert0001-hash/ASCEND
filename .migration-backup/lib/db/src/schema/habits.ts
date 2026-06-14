import {
  pgTable,
  text,
  smallint,
  boolean,
  integer,
  date,
  timestamp,
  jsonb,
  unique,
} from "drizzle-orm/pg-core";
import { domainTypeEnum, habitFrequencyEnum } from "./enums";
import { users } from "./users";

export const habits = pgTable("habits", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  domain: domainTypeEnum("domain").notNull(),

  title: text("title").notNull(),
  description: text("description"),
  frequency: habitFrequencyEnum("frequency").notNull().default("daily"),
  targetDays: smallint("target_days").array(),
  targetCount: smallint("target_count").notNull().default(1),
  unit: text("unit"),

  isActive: boolean("is_active").notNull().default(true),
  color: text("color"),
  icon: text("icon"),

  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastCheckedAt: date("last_checked_at"),

  aiMetadata: jsonb("ai_metadata").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const habitLogs = pgTable(
  "habit_logs",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    habitId: text("habit_id")
      .notNull()
      .references(() => habits.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    loggedDate: date("logged_date").notNull(),
    count: smallint("count").notNull().default(1),
    note: text("note"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [unique().on(t.habitId, t.loggedDate)]
);

export type Habit = typeof habits.$inferSelect;
export type NewHabit = typeof habits.$inferInsert;
export type HabitLog = typeof habitLogs.$inferSelect;
export type NewHabitLog = typeof habitLogs.$inferInsert;
