# Fliply - Deployment & Testing Guide

## 🚨 CRITICAL: Database Setup Required First!

Before the app will work, you **MUST** update the Supabase RLS policies.

### Step 1: Update Database Policies

1. Open your Supabase dashboard: https://supabase.com/dashboard
2. Select your Fliply project
3. Navigate to **SQL Editor** (left sidebar)
4. Copy the contents of `update_rls_policies.sql` (shown below)
5. Paste into SQL Editor
6. Click **RUN**

```sql
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
```

✅ **After running these commands, all "permission denied" errors will be fixed!**

---

## Step 2: Run Automated Tests

Test the database and game mechanics:

```bash
node test-complete.js
```

This will:
- ✅ Create a test user
- ✅ Simulate a full game (wins and losses)
- ✅ Verify streak tracking
- ✅ Verify lives system
- ✅ Verify record preservation
- ✅ Test leaderboard queries
- ✅ Clean up test data

**Expected output:**
```
🎉 ALL TESTS PASSED! 🎉
🚀 App is ready for production!
```

---

## Step 3: Manual Testing Checklist

### Local Development
```bash
npm run dev
```

Then open http://localhost:3000

### Test Scenarios

#### ✅ New User Registration
- [ ] Open app in incognito/private browsing
- [ ] Registration modal appears automatically
- [ ] Enter username "TestPlayer"
- [ ] Select country
- [ ] Click "LET'S FLIP"
- [ ] Modal closes, game interface appears
- [ ] Verify: Streak = 0, Lives = ❤️❤️❤️

#### ✅ Winning Streak
- [ ] Click "HEADS" or "TAILS"
- [ ] Watch coin flip animation (3 seconds)
- [ ] If win: Streak increases by +1
- [ ] If win: Toast shows "STREAK INCREASED! +1"
- [ ] If win: Lives stay the same

#### ✅ Losing and Streak Reset
- [ ] Continue flipping until you lose
- [ ] Verify: Current streak resets to 0
- [ ] Verify: Lives decrease by 1 (❤️❤️🖤)
- [ ] Verify: "TODAY'S BEST" still shows highest streak reached
- [ ] Toast shows "WRONG! X lives left"

#### ✅ Game Over (All Lives Lost)
- [ ] Lose all 3 lives
- [ ] Verify: Game buttons disappear
- [ ] Verify: "FINAL SCORE" message appears
- [ ] Verify: "SHARE STREAK" button appears
- [ ] Verify: Can no longer play

#### ✅ Leaderboard
- [ ] Click trophy icon (🏆)
- [ ] Check "TODAY" tab
  - [ ] Shows today's best scores
  - [ ] Your score appears if you played
- [ ] Check "ALL TIME" tab
  - [ ] Shows all-time best streaks
  - [ ] Your max streak appears
- [ ] Close modal

#### ✅ Settings
- [ ] Click settings icon (⚙️)
- [ ] Change username
- [ ] Click "Update"
- [ ] Verify toast: "Name updated!"
- [ ] Toggle theme (dark/light)
- [ ] Close settings

#### ✅ Share Feature
- [ ] Click "SHARE STREAK"
- [ ] On mobile: Native share sheet appears
- [ ] On desktop: Toast shows "Copied to clipboard!"
- [ ] Paste clipboard content
- [ ] Verify format:
  ```
  Fliply Streak: 5
  🪙🪙🪙🪙🪙
  Can you beat me?
  ```

#### ✅ Daily Reset (Next Day)
- [ ] Play until game over
- [ ] Wait until next day (or manually change system date for testing)
- [ ] Refresh page
- [ ] Verify: Lives reset to 3
- [ ] Verify: Can play again
- [ ] Verify: Previous day's score is preserved in leaderboard

---

## Step 4: Verify Database State

After testing, check your Supabase tables:

### Users Table
```sql
SELECT * FROM users ORDER BY created_at DESC LIMIT 5;
```

Should show:
- Recent test users
- Correct usernames
- Country codes
- Max streaks updated

### Games Table
```sql
SELECT * FROM games ORDER BY played_at DESC LIMIT 10;
```

Should show:
- One record per user per day
- Correct scores (best streak of the day)
- Lives = 0 for completed games
- is_active = false for finished games

### Today's Leaderboard
```sql
SELECT 
  users.username,
  users.country_code,
  games.score
FROM games
JOIN users ON games.user_id = users.id
WHERE games.played_at = CURRENT_DATE
ORDER BY games.score DESC
LIMIT 10;
```

### All-Time Leaderboard
```sql
SELECT 
  username,
  country_code,
  max_streak
FROM users
ORDER BY max_streak DESC
LIMIT 10;
```

---

## Step 5: Performance & Security Checks

### Database Indexes
Verify indexes are created:
```sql
-- Check indexes
SELECT * FROM pg_indexes WHERE tablename IN ('users', 'games');
```

Expected indexes:
- `idx_games_user_date` on `games(user_id, played_at)`
- `idx_games_score` on `games(score DESC)`
- `idx_users_streak` on `users(max_streak DESC)`

### RLS Policies
Verify policies are active:
```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename IN ('users', 'games');
```

Expected: 6 policies total (3 for users, 3 for games)

---

## Step 6: Production Deployment

### Vercel Deployment

1. Ensure `.env` variables are set in Vercel:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_anon_key
   ```

2. Deploy:
   ```bash
   vercel --prod
   ```

3. Test production URL with same checklist above

### Environment Variables

Required variables:
- `SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_ANON_KEY` or `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Common Issues & Fixes

### Issue: "Permission denied for table users"
**Fix:** Run the SQL commands from Step 1 above

### Issue: Registration modal doesn't appear
**Fix:** Clear localStorage and refresh:
```javascript
localStorage.clear();
location.reload();
```

### Issue: Game doesn't respond to clicks
**Fix:** Check console for errors. Ensure dev server is running properly.

### Issue: Leaderboard is empty
**Fix:** Play at least one game. Check that database has game records.

---

## Success Criteria

✅ All automated tests pass  
✅ Can register new users  
✅ Can play full game (win/lose)  
✅ Streak tracking works correctly  
✅ Lives system works (3 lives per day)  
✅ Records are preserved (today's best, all-time best)  
✅ Leaderboards populate correctly  
✅ Share functionality works  
✅ Theme toggle persists  
✅ Daily reset works  
✅ No console errors  

---

## 🎉 Ready for Viral Launch!

Once all tests pass, your app is ready to go viral! 🚀

**Share link format:**
```
https://fliply.vercel.app
```

**Marketing copy:**
```
🪙 Can you beat my Fliply streak? 
I got X in a row! 
Only 3 chances per day - how lucky are you?

Play now: [your-url]
```

---

## Support & Maintenance

### Daily Monitoring
- Check leaderboards for any anomalies
- Monitor Supabase dashboard for usage spikes
- Watch for any error patterns

### Weekly Tasks
- Review top players for legitimacy
- Check database size
- Analyze user retention metrics

### Monthly Tasks
- Backup database
- Review and optimize queries if needed
- Plan feature updates based on user feedback

Happy flipping! 🪙
