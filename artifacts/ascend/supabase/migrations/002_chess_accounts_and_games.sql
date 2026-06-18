-- Migration 002: Add chess_accounts and chess_games tables
-- Run this in the Supabase SQL Editor after 001_initial_schema.sql

-- ─── Chess Accounts ───────────────────────────────────────────────────────────
-- Stores per-user Chess.com / Lichess usernames (one row per user)

CREATE TABLE IF NOT EXISTS chess_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  chesscom_username TEXT NOT NULL DEFAULT '',
  lichess_username TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE chess_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY chess_accounts_own ON chess_accounts
  FOR ALL USING (user_id = auth.uid());

-- ─── Chess Games ──────────────────────────────────────────────────────────────
-- Stores individual games fetched from Chess.com / Lichess APIs

CREATE TABLE IF NOT EXISTS chess_games (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  external_id TEXT,
  pgn TEXT,
  fen TEXT,
  result TEXT NOT NULL,
  player_color TEXT NOT NULL,
  player_rating INTEGER,
  opponent_username TEXT,
  opponent_rating INTEGER,
  opening_name TEXT,
  opening_eco TEXT,
  time_control TEXT,
  game_duration_secs INTEGER,
  game_date TIMESTAMPTZ NOT NULL,
  moves_count INTEGER,
  is_analyzed BOOLEAN NOT NULL DEFAULT FALSE,
  accuracy NUMERIC(5, 2),
  best_move TEXT,
  worst_move TEXT,
  analysis_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS chess_games_user_date_idx ON chess_games (user_id, game_date DESC);
CREATE INDEX IF NOT EXISTS chess_games_platform_idx ON chess_games (user_id, platform);

ALTER TABLE chess_games ENABLE ROW LEVEL SECURITY;

CREATE POLICY chess_games_own ON chess_games
  FOR ALL USING (user_id = auth.uid());
