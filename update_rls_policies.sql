-- DROP EXISTING POLICIES (to avoid conflicts if re-running)
DROP POLICY IF EXISTS "Allow public read on users" ON users;
DROP POLICY IF EXISTS "Allow public insert on users" ON users;
DROP POLICY IF EXISTS "Allow public update on users" ON users;
DROP POLICY IF EXISTS "Allow public read on games" ON games;
DROP POLICY IF EXISTS "Allow public insert on games" ON games;
DROP POLICY IF EXISTS "Allow public update on games" ON games;

-- CREATE NEW POLICIES
-- Users table policies
CREATE POLICY "Allow public read on users" ON users FOR SELECT USING (true);
CREATE POLICY "Allow public insert on users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on users" ON users FOR UPDATE USING (true) WITH CHECK (true);

-- Games table policies  
CREATE POLICY "Allow public read on games" ON games FOR SELECT USING (true);
CREATE POLICY "Allow public insert on games" ON games FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on games" ON games FOR UPDATE USING (true) WITH CHECK (true);
