# 🔒 Fliply - Security Configuration Guide

## IMPORTANT: Secure Database Setup

Your app now uses a **secure architecture** where:
- ✅ **Clients** can only READ data (leaderboards)
- ✅ **Server** has full write access using service_role key
- ✅ **RLS policies** prevent direct database manipulation from clients

---

## Step 1: Apply Secure RLS Policies

1. Go to https://supabase.com/dashboard
2. Select your Fliply project
3. Click **"SQL Editor"**
4. Run this SQL:

```sql
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
```

---

## Step 2: Get Your Service Role Key

1. In Supabase Dashboard, go to **Settings** → **API**
2. Scroll down to **Project API keys**
3. Find **`service_role` (secret)** key
4. Click the eye icon to reveal it
5. **⚠️ IMPORTANT:** This key gives FULL database access - keep it secret!

---

## Step 3: Update .env File

Add the `SUPABASE_SERVICE_ROLE_KEY` to your `.env` file:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**⚠️ CRITICAL:**
- **NEVER commit** `.env` to Git (it's in `.gitignore`)
- **NEVER expose** service_role key to clients
- Only use service_role key on the server

---

## Step 4: Update Vercel Environment Variables

For production deployment:

1. Go to Vercel dashboard
2. Select your Fliply project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:
   - `SUPABASE_URL` = (your Supabase URL)
   - `SUPABASE_ANON_KEY` = (your anon key - safe to expose to clients)
   - `SUPABASE_SERVICE_ROLE_KEY` = (your service_role key - **NEVER** expose to clients)

---

## How It Works (Security Architecture)

### Old (Insecure) Approach ❌
```
Client (Browser)
    ↓ (uses anon key)
    ↓ (direct database access)
Supabase Database
    ↑ (RLS allows INSERT/UPDATE)
    ↑ (client can manipulate data)
```

### New (Secure) Approach ✅
```
Client (Browser)
    ↓ (calls API endpoints)
API Server
    ↓ (uses service_role key)
    ↓ (full database access)
Supabase Database
    ↑ (RLS blocks anon key writes)
    ↑ (only server can write)
```

---

## Security Benefits

### ✅ What This Protects Against:

1. **Direct Database Manipulation**
   - Clients can't insert fake scores
   - Clients can't modify other users' data
   - Clients can't delete records

2. **Cheating Prevention**
   - All game logic runs on server
   - Coin flip is random on server (can't be predicted)
   - Score validation happens server-side

3. **Data Integrity**
   - Only validated data enters database
   - Business logic enforced server-side
   - Input sanitization on server

### ✅ What Clients Can Do:

1. **Read Leaderboards**
   - Today's top scores
   - All-time rankings
   - User profiles (public data)

2. **Play Through API**
   - POST to `/api/user` for registration
   - POST to `/api/play` for coin flips
   - GET from `/api/leaderboard` for rankings

---

## Testing After Configuration

### 1. Test Database Access

Run the test suite:
```bash
node test-complete.js
```

Expected output:
```
🎉 ALL TESTS PASSED!
🚀 App is ready for production!
```

### 2. Test Server APIs

Start the dev server:
```bash
npm run dev
```

Test in browser:
- http://localhost:3000
- Register a user
- Play the game
- Check leaderboards

### 3. Verify RLS Policies

In Supabase SQL Editor, run:
```sql
SELECT * FROM pg_policies WHERE tablename IN ('users', 'games');
```

You should see:
- 2 policies total (both SELECT only)
- No INSERT/UPDATE/DELETE policies for anon role

---

## Common Issues & Solutions

### Issue: Tests still fail with "permission denied"

**Solution:** Make sure you:
1. Added `SUPABASE_SERVICE_ROLE_KEY` to `.env`
2. Restarted the dev server after updating `.env`
3. Applied the new SQL policies in Supabase dashboard

### Issue: "service_role key not found"

**Solution:** 
1. Check your `.env` file has all 3 keys
2. Get service_role key from Supabase → Settings → API
3. Make sure there are no typos in the key

### Issue: App works locally but fails in production

**Solution:**
1. Check Vercel environment variables are set
2. Make sure `SUPABASE_SERVICE_ROLE_KEY` is added to Vercel
3. Redeploy after updating environment variables

---

## Security Checklist

Before deploying to production:

- [ ] Applied secure RLS policies (read-only for anon key)
- [ ] Added service_role key to `.env`
- [ ] Added service_role key to Vercel environment variables
- [ ] Verified `.env` is in `.gitignore`
- [ ] Tested with `node test-complete.js` (all tests pass)
- [ ] Tested in browser (registration, gameplay, leaderboards)
- [ ] Confirmed RLS policies in Supabase dashboard (only SELECT)
- [ ] Verified service_role key is never exposed to client

---

## Key Files Updated

| File | What Changed |
|------|--------------|
| `api/_utils/supabase.js` | Now uses service_role key |
| `supabase_schema.sql` | Updated to secure RLS policies |
| `update_rls_policies_secure.sql` | **NEW** - Secure migration script |
| `.env.example` | Added SERVICE_ROLE_KEY |
| `test-complete.js` | Now uses service_role key |

---

## Summary

**Before:** ❌ Clients could write directly to database (insecure)  
**After:** ✅ Only server can write, clients read-only (secure)

**Security Level:** 🔒 **Production-grade security**

Your app is now protected against:
- Score manipulation
- Data tampering
- Unauthorized access
- Cheating

🚀 **Ready for viral launch with proper security!**
