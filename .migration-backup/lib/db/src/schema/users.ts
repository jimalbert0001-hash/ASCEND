import {
  pgTable,
  text,
  boolean,
  smallint,
  numeric,
  time,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";
import { domainTypeEnum } from "./enums";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const profiles = pgTable("profiles", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),

  displayName: text("display_name").notNull(),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  timezone: text("timezone").notNull().default("Asia/Kolkata"),

  onboardingComplete: boolean("onboarding_complete").notNull().default(false),
  activeDomains: domainTypeEnum("active_domains")
    .array()
    .notNull()
    .default(["academics", "startup", "chess", "guitar", "life"]),

  theme: text("theme").notNull().default("dark"),
  dailyReviewTime: time("daily_review_time"),
  weeklyReviewDay: smallint("weekly_review_day").default(0),

  boardYear: smallint("board_year"),
  targetPercentage: numeric("target_percentage", { precision: 5, scale: 2 }),

  aiMetadata: jsonb("ai_metadata").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
