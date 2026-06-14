import {
  pgTable,
  text,
  timestamp,
  serial,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const aiConversations = pgTable("ai_conversations", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  title: text("title").notNull().default("New Chat"),
  role: text("role").notNull().default("achievement"),
  model: text("model"),
  provider: text("provider"),

  summary: text("summary"),
  isPinned: text("is_pinned").notNull().default("false"),
  isArchived: text("is_archived").notNull().default("false"),

  aiMetadata: jsonb("ai_metadata").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const aiMessages = pgTable("ai_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => aiConversations.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  role: text("role").notNull(), // 'user', 'assistant', 'system'
  content: text("content").notNull(),

  model: text("model"),
  provider: text("provider"),

  promptTokens: integer("prompt_tokens"),
  completionTokens: integer("completion_tokens"),
  totalTokens: integer("total_tokens"),

  latencyMs: integer("latency_ms"),
  aiMetadata: jsonb("ai_metadata").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const aiTokenUsage = pgTable("ai_token_usage", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  conversationId: integer("conversation_id").references(() => aiConversations.id, { onDelete: "set null" }),
  messageId: integer("message_id").references(() => aiMessages.id, { onDelete: "set null" }),

  provider: text("provider").notNull(),
  model: text("model").notNull(),
  role: text("role"),

  promptTokens: integer("prompt_tokens").notNull().default(0),
  completionTokens: integer("completion_tokens").notNull().default(0),
  totalTokens: integer("total_tokens").notNull().default(0),

  costUsd: text("cost_usd"),
  latencyMs: integer("latency_ms"),

  aiMetadata: jsonb("ai_metadata").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const userSessions = pgTable("user_sessions", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  sessionToken: text("session_token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  lastActiveAt: timestamp("last_active_at").notNull().defaultNow(),

  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type AIConversation = typeof aiConversations.$inferSelect;
export type NewAIConversation = typeof aiConversations.$inferInsert;
export type AIMessage = typeof aiMessages.$inferSelect;
export type NewAIMessage = typeof aiMessages.$inferInsert;
export type AITokenUsage = typeof aiTokenUsage.$inferSelect;
export type NewAITokenUsage = typeof aiTokenUsage.$inferInsert;
export type UserSession = typeof userSessions.$inferSelect;
export type NewUserSession = typeof userSessions.$inferInsert;
