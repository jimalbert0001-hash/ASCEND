import {
  pgTable,
  text,
  boolean,
  numeric,
  date,
  timestamp,
  jsonb,
  unique,
} from "drizzle-orm/pg-core";
import { taskPriorityEnum, featureStatusEnum } from "./enums";
import { users } from "./users";

export const startupProjects = pgTable("startup_projects", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  name: text("name").notNull(),
  tagline: text("tagline"),
  description: text("description"),
  logoUrl: text("logo_url"),

  stage: text("stage").notNull().default("idea"),
  isActive: boolean("is_active").notNull().default(true),

  websiteUrl: text("website_url"),
  githubUrl: text("github_url"),
  notionUrl: text("notion_url"),

  startedAt: date("started_at"),
  launchedAt: date("launched_at"),

  techStack: text("tech_stack").array().notNull().default([]),
  tags: text("tags").array().notNull().default([]),
  aiMetadata: jsonb("ai_metadata").notNull().default({}),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const startupFeatures = pgTable("startup_features", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id")
    .notNull()
    .references(() => startupProjects.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  title: text("title").notNull(),
  description: text("description"),
  status: featureStatusEnum("status").notNull().default("idea"),
  priority: taskPriorityEnum("priority").notNull().default("medium"),

  effortEstimate: text("effort_estimate"),
  impactEstimate: text("impact_estimate"),

  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),

  tags: text("tags").array().notNull().default([]),
  aiMetadata: jsonb("ai_metadata").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const startupMetrics = pgTable(
  "startup_metrics",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    projectId: text("project_id")
      .notNull()
      .references(() => startupProjects.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    metricName: text("metric_name").notNull(),
    metricValue: numeric("metric_value").notNull(),
    unit: text("unit"),
    recordedAt: date("recorded_at").notNull(),
    notes: text("notes"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [unique().on(t.projectId, t.metricName, t.recordedAt)]
);

export type StartupProject = typeof startupProjects.$inferSelect;
export type NewStartupProject = typeof startupProjects.$inferInsert;
export type StartupFeature = typeof startupFeatures.$inferSelect;
export type StartupMetric = typeof startupMetrics.$inferSelect;
