import {
  pgTable,
  text,
  smallint,
  date,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const guitarSessions = pgTable("guitar_sessions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  sessionDate: date("session_date").notNull(),
  durationMins: smallint("duration_mins").notNull(),
  sessionType: text("session_type").notNull().default("practice"),

  focusAreas: text("focus_areas").array().notNull().default([]),
  songsPracticed: text("songs_practiced").array(),

  bpmTarget: smallint("bpm_target"),
  bpmAchieved: smallint("bpm_achieved"),
  qualityScore: smallint("quality_score"),

  notes: text("notes"),
  recordingUrl: text("recording_url"),
  aiMetadata: jsonb("ai_metadata").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const guitarSongs = pgTable("guitar_songs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  title: text("title").notNull(),
  artist: text("artist"),
  genre: text("genre"),
  difficulty: smallint("difficulty"),

  status: text("status").notNull().default("learning"),
  masteryLevel: smallint("mastery_level"),

  tabUrl: text("tab_url"),
  youtubeUrl: text("youtube_url"),

  startedAt: date("started_at"),
  masteredAt: date("mastered_at"),

  aiMetadata: jsonb("ai_metadata").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type GuitarSession = typeof guitarSessions.$inferSelect;
export type NewGuitarSession = typeof guitarSessions.$inferInsert;
export type GuitarSong = typeof guitarSongs.$inferSelect;
export type NewGuitarSong = typeof guitarSongs.$inferInsert;
