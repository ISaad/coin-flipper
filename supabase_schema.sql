-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT,
  country_code CHAR(2),
  max_streak INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Games Table
-- This table stores the streak status for the day
CREATE TABLE games (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  score INT DEFAULT 0,          -- Best streak of the day
  current_streak INT DEFAULT 0,  -- Current active streak
  lives INT DEFAULT 3,           -- Remaining lives for the day
  is_active BOOLEAN DEFAULT TRUE, -- Whether the user can still play today
  played_at DATE DEFAULT CURRENT_DATE,
  PRIMARY KEY (user_id, played_at)
);

-- Indexes for performance
CREATE INDEX idx_games_user_date ON games(user_id, played_at);
CREATE INDEX idx_games_score ON games(score DESC);
CREATE INDEX idx_users_streak ON users(max_streak DESC);

-- RLS Policies (SECURE Configuration)
-- Clients (anon key) can only READ data
-- Server (service_role key) can write (bypasses RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- Users table: Read-only for public
CREATE POLICY "Allow public read on users" ON users FOR SELECT USING (true);

-- Games table: Read-only for public
CREATE POLICY "Allow public read on games" ON games FOR SELECT USING (true);

-- Note: No INSERT/UPDATE/DELETE policies for anon key
-- Server uses service_role key which bypasses all RLS
-- This is SECURE: only server can modify data
