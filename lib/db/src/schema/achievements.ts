import {
  pgTable,
  text,
  boolean,
  numeric,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import { achievementTypeEnum, domainTypeEnum } from "./enums";
import { users } from "./users";

export const achievements = pgTable("achievements", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  type: achievementTypeEnum("type").notNull(),
  domain: domainTypeEnum("domain"),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon"),
  badgeUrl: text("badge_url"),

  triggerEntity: text("trigger_entity"),
  triggerValue: numeric("trigger_value"),

  earnedAt: timestamp("earned_at").notNull().defaultNow(),
  isSeen: boolean("is_seen").notNull().default(false),

  aiMetadata: jsonb("ai_metadata").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Achievement = typeof achievements.$inferSelect;
export type NewAchievement = typeof achievements.$inferInsert;
