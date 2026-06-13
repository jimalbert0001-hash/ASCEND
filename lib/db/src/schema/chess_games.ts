import {
  pgTable,
  text,
  smallint,
  timestamp,
  date,
  boolean,
  integer,
  unique,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const chessAccounts = pgTable("chess_accounts", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  chesscomUsername: text("chesscom_username"),
  lichessUsername: text("lichess_username"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const chessGames = pgTable(
  "chess_games",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    platform: text("platform").notNull(),
    externalId: text("external_id").notNull(),

    pgn: text("pgn"),
    fen: text("fen"),

    result: text("result").notNull(),
    playerColor: text("player_color").notNull(),
    playerRating: smallint("player_rating"),
    opponentUsername: text("opponent_username"),
    opponentRating: smallint("opponent_rating"),

    openingName: text("opening_name"),
    openingEco: text("opening_eco"),

    timeControl: text("time_control"),
    gameDurationSecs: integer("game_duration_secs"),
    gameDate: timestamp("game_date").notNull(),
    movesCount: smallint("moves_count"),

    isAnalyzed: boolean("is_analyzed").notNull().default(false),
    accuracy: smallint("accuracy"),
    bestMove: text("best_move"),
    worstMove: text("worst_move"),
    analysisNotes: text("analysis_notes"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [unique().on(t.userId, t.platform, t.externalId)]
);

export type ChessAccount = typeof chessAccounts.$inferSelect;
export type NewChessAccount = typeof chessAccounts.$inferInsert;
export type ChessGame = typeof chessGames.$inferSelect;
export type NewChessGame = typeof chessGames.$inferInsert;
