# 🚀 Vercel Deployment Fix Guide

## Issue Found

Your app at **https://coin-flipper-kappa.vercel.app/** is returning:
```
500 Internal Server Error
```

**Root Cause:** Missing Supabase environment variables in Vercel deployment settings.

---

## ✅ Quick Fix (5 minutes)

### **Step 1: Get Your Supabase Credentials**

You already have these in your local `.env` file:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

---

### **Step 2: Add Environment Variables to Vercel**

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Click on your project: `coin-flipper-kappa`

2. **Navigate to Settings:**
   - Click **"Settings"** tab at the top
   - Click **"Environment Variables"** in the left sidebar

3. **Add These 3 Variables:**

   | Name | Value | Environment |
   |------|-------|-------------|
   | `SUPABASE_URL` | Your Supabase URL | Production, Preview, Development |
   | `SUPABASE_ANON_KEY` | Your Anon Key | Production, Preview, Development |
   | `SUPABASE_SERVICE_ROLE_KEY` | Your Service Role Key | Production, Preview, Development |

   **How to add each:**
   - Click **"Add New"**
   - Enter **Name** (e.g., `SUPABASE_URL`)
   - Enter **Value** (copy from your `.env` file)
   - Select all environments: ✅ Production ✅ Preview ✅ Development
   - Click **"Save"**

---

### **Step 3: Redeploy**

After adding all 3 environment variables:

1. Go to **"Deployments"** tab
2. Click on the latest deployment (the top one)
3. Click the **⋮** menu (three dots)
4. Click **"Redeploy"**
5. Confirm the redeploy

**OR** simply push a new commit to trigger auto-deploy:
```bash
git add .
git commit -m "Fix: Add environment variables"
git push
```

---

### **Step 4: Verify It Works**

After redeployment completes (~1-2 minutes):

1. Visit: https://coin-flipper-kappa.vercel.app/
2. You should see the registration modal
3. Enter a username
4. Click "LET'S FLIP"
5. You should be able to play! 🎉

---

## 🔍 What Was Broken

### **Error Messages Seen:**

1. **API Calls Failing:**
   ```
   POST /api/user → 500 Internal Server Error
   GET /api/leaderboard → 500 Internal Server Error
   ```

2. **Console Errors:**
   ```
   SyntaxError: Unexpected token 'A', "A server e"... is not valid JSON
   ```
   This means Vercel returned an HTML error page instead of JSON.

3. **Root Cause:**
   ```javascript
   // In api/_utils/supabase.js
   const supabaseUrl = process.env.SUPABASE_URL;
   const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
   
   if (!supabaseUrl || !supabaseKey) {
       throw new Error('CRITICAL: Supabase credentials missing');
   }
   ```
   Without the environment variables, this throws an error immediately!

---

## 📋 Checklist

Use this checklist to ensure everything is configured:

### **Vercel Environment Variables:**
- [ ] `SUPABASE_URL` added
- [ ] `SUPABASE_ANON_KEY` added  
- [ ] `SUPABASE_SERVICE_ROLE_KEY` added
- [ ] All variables set for **Production** environment
- [ ] Redeployment triggered

### **Supabase Database:**
- [ ] RLS policies applied (from `update_rls_policies_secure.sql`)
- [ ] Tables exist: `users`, `games`
- [ ] Database is accessible from Supabase dashboard

### **Test Deployment:**
- [ ] Site loads: https://coin-flipper-kappa.vercel.app/
- [ ] Registration modal appears
- [ ] Can register a new user
- [ ] Can flip coins
- [ ] Leaderboard button works
- [ ] Rank badge appears (🏆 #X)

---

## 🎯 Alternative: Deploy Using Vercel CLI

If you prefer command line:

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Set environment variables
vercel env add SUPABASE_URL
# (paste your URL when prompted)

vercel env add SUPABASE_ANON_KEY
# (paste your anon key when prompted)

vercel env add SUPABASE_SERVICE_ROLE_KEY
# (paste your service role key when prompted)

# Deploy
vercel --prod
```

---

## 🐛 If Still Not Working

### **Check Vercel Logs:**

1. Go to your project in Vercel Dashboard
2. Click **"Deployments"**
3. Click on the latest deployment
4. Click **"Functions"** tab
5. Click on any function (e.g., `api/user.js`)
6. Check the logs for specific errors

### **Common Issues:**

| Error | Solution |
|-------|----------|
| "Supabase credentials missing" | Add environment variables |
| "PGRST301" (JWT expired) | Check ANON_KEY is correct |
| "relation does not exist" | Run database schema SQL |
| CORS errors | Already configured in API |
| 404 on API calls | Check file structure matches Vercel serverless format |

---

## 📁 File Structure (For Reference)

Your API files should be:
```
coin-flipper/
├── api/
│   ├── _utils/
│   │   ├── supabase.js       ← Uses env vars
│   │   └── helpers.js
│   ├── play.js                ← /api/play
│   ├── user.js                ← /api/user
│   └── leaderboard.js         ← /api/leaderboard
├── public/
│   ├── index.html
│   ├── script.js
│   └── styles.css
└── vercel.json                ← Config file
```

---

## ✅ Expected Result

After fixing environment variables, you should see:

1. **Homepage loads:**
   - Registration modal appears
   - No console errors

2. **Registration works:**
   - Enter username
   - Click "LET'S FLIP"
   - Modal closes
   - Game starts

3. **Game works:**
   - Can click HEADS/TAILS
   - Coin flips (3D animation)
   - Streak updates
   - Lives decrease on wrong guesses
   - Daily rank badge shows (🏆 #X)

4. **Leaderboard works:**
   - Click 🏆 button
   - Modal shows rankings
   - Your score appears

---

## 🎉 That's It!

Once you add the environment variables and redeploy, your app will be live and fully functional!

**Live URL:** https://coin-flipper-kappa.vercel.app/

---

## 📞 Need Help?

If you see different errors after adding the variables, check:
1. Vercel deployment logs
2. Browser console errors
3. Database RLS policies are applied

**Next Steps After It Works:**
- Test on mobile devices
- Share with friends
- Monitor Vercel analytics
- Check Supabase usage

🪙 **Good luck!** 🪙
