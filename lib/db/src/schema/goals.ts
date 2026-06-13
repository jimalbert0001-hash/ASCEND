import {
  pgTable,
  text,
  numeric,
  date,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import { domainTypeEnum, goalStatusEnum, taskPriorityEnum } from "./enums";
import { users } from "./users";

export const goals = pgTable("goals", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  parentId: text("parent_id"),

  domain: domainTypeEnum("domain").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  status: goalStatusEnum("status").notNull().default("not_started"),
  priority: taskPriorityEnum("priority").notNull().default("medium"),

  targetDate: date("target_date"),
  completedAt: timestamp("completed_at"),

  progress: numeric("progress", { precision: 5, scale: 2 }).notNull().default("0"),

  tags: text("tags").array().notNull().default([]),
  aiMetadata: jsonb("ai_metadata").notNull().default({}),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Goal = typeof goals.$inferSelect;
export type NewGoal = typeof goals.$inferInsert;
