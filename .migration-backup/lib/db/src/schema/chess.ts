import {
  pgTable,
  text,
  smallint,
  numeric,
  date,
  timestamp,
  jsonb,
  unique,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const chessSessions = pgTable("chess_sessions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  sessionDate: date("session_date").notNull(),
  durationMins: smallint("duration_mins"),
  sessionType: text("session_type").notNull().default("game"),

  platform: text("platform"),
  timeControl: text("time_control"),

  gamesPlayed: smallint("games_played").notNull().default(0),
  wins: smallint("wins").notNull().default(0),
  losses: smallint("losses").notNull().default(0),
  draws: smallint("draws").notNull().default(0),

  tacticsSolved: smallint("tactics_solved"),
  accuracy: numeric("accuracy", { precision: 5, scale: 2 }),

  openingsStudied: text("openings_studied").array(),
  focusArea: text("focus_area"),

  notes: text("notes"),
  gamePgn: text("game_pgn"),
  aiMetadata: jsonb("ai_metadata").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const chessRatings = pgTable(
  "chess_ratings",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    platform: text("platform").notNull(),
    timeControl: text("time_control").notNull(),
    rating: smallint("rating").notNull(),
    rd: numeric("rd", { precision: 6, scale: 2 }),
    recordedAt: date("recorded_at").notNull(),

    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [unique().on(t.userId, t.platform, t.timeControl, t.recordedAt)]
);

export type ChessSession = typeof chessSessions.$inferSelect;
export type NewChessSession = typeof chessSessions.$inferInsert;
export type ChessRating = typeof chessRatings.$inferSelect;
export type NewChessRating = typeof chessRatings.$inferInsert;
