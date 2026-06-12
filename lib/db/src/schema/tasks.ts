import {
  pgTable,
  text,
  smallint,
  date,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import { domainTypeEnum, taskStatusEnum, taskPriorityEnum } from "./enums";
import { users } from "./users";

export const tasks = pgTable("tasks", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  goalId: text("goal_id"),

  domain: domainTypeEnum("domain").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  status: taskStatusEnum("status").notNull().default("todo"),
  priority: taskPriorityEnum("priority").notNull().default("medium"),

  entityType: text("entity_type"),
  entityId: text("entity_id"),

  dueDate: date("due_date"),
  completedAt: timestamp("completed_at"),
  estimatedMins: smallint("estimated_mins"),
  actualMins: smallint("actual_mins"),

  tags: text("tags").array().notNull().default([]),
  aiMetadata: jsonb("ai_metadata").notNull().default({}),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
