import { pgEnum } from "drizzle-orm/pg-core";

export const domainTypeEnum = pgEnum("domain_type", [
  "academics",
  "startup",
  "chess",
  "guitar",
  "life",
]);

export const goalStatusEnum = pgEnum("goal_status", [
  "not_started",
  "in_progress",
  "completed",
  "abandoned",
]);

export const taskStatusEnum = pgEnum("task_status", [
  "todo",
  "in_progress",
  "done",
  "cancelled",
]);

export const taskPriorityEnum = pgEnum("task_priority", [
  "low",
  "medium",
  "high",
  "urgent",
]);

export const habitFrequencyEnum = pgEnum("habit_frequency", [
  "daily",
  "weekdays",
  "weekends",
  "weekly",
]);

export const revisionStageEnum = pgEnum("revision_stage", [
  "first",
  "second",
  "third",
  "mastered",
]);

export const featureStatusEnum = pgEnum("feature_status", [
  "idea",
  "planned",
  "in_progress",
  "done",
  "dropped",
]);

export const achievementTypeEnum = pgEnum("achievement_type", [
  "milestone",
  "streak",
  "skill",
  "meta",
]);
