-- SECURE RLS POLICIES FOR FLIPLY
-- This configuration ensures only the SERVER can write to the database
-- Clients can only READ data (for leaderboards, etc.)

-- Clean up existing policies
DROP POLICY IF EXISTS "Allow public read on users" ON users;
DROP POLICY IF EXISTS "Allow public insert on users" ON users;
DROP POLICY IF EXISTS "Allow public update on users" ON users;
DROP POLICY IF EXISTS "Allow public read on games" ON games;
DROP POLICY IF EXISTS "Allow public insert on games" ON games;
DROP POLICY IF EXISTS "Allow public update on games" ON games;

-- USERS TABLE: Read-only for public (anon key)
-- The server uses service_role key which bypasses RLS
CREATE POLICY "Allow public read on users" 
ON users 
FOR SELECT 
USING (true);

-- GAMES TABLE: Read-only for public (anon key)
-- The server uses service_role key which bypasses RLS
CREATE POLICY "Allow public read on games" 
ON games 
FOR SELECT 
USING (true);

-- Note: No INSERT/UPDATE/DELETE policies for anon key
-- Server uses service_role key which bypasses all RLS policies
-- This is SECURE because:
-- 1. Clients can only read data (leaderboards)
-- 2. All writes go through API endpoints (server-side validation)
-- 3. Server uses service_role key which bypasses RLS
-- 4. service_role key is NEVER exposed to clients (stays on server)
