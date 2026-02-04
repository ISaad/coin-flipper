/**
 * Script to update Supabase RLS policies
 * Run this to fix the "permission denied" errors
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('\n🔐 UPDATING SUPABASE RLS POLICIES...\n');

console.log('⚠️  IMPORTANT INSTRUCTIONS:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('This script cannot directly update RLS policies using the anon key.');
console.log('You need to run the SQL commands manually in Supabase:\n');
console.log('1. Go to https://supabase.com/dashboard');
console.log('2. Select your project');
console.log('3. Go to "SQL Editor" in the left sidebar');
console.log('4. Copy and paste the contents of "update_rls_policies.sql"');
console.log('5. Click "RUN" to execute\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('📄 SQL FILE LOCATION:');
console.log('   c:\\Users\\Isma\\Documents\\VS Studio projects\\coin-flipper\\update_rls_policies.sql\n');

console.log('SQL COMMANDS TO RUN:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const sqlCommands = `
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
`;

console.log(sqlCommands);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('✅ AFTER RUNNING THE SQL COMMANDS:');
console.log('   1. Run: npm run dev');
console.log('   2. Run: node test-complete.js');
console.log('   3. Access http://localhost:3000 in your browser\n');

console.log('🚀 Your app will be fully functional!\n');
