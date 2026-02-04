# Coin Flipper - Daily Streak Challenge

A Wordle-inspired daily game where you guess coin flips and build your streak!

## 🚀 Quick Start

### Development Mode

```bash
npm run dev
```

Then open your browser to: **http://localhost:3000**

### How to Play

1. Enter your name or click "Random" to generate a fun username
2. Click "Start Playing"
3. Choose **HEADS** or **TAILS**
4. Watch the coin flip animation
5. If you guess correctly, your streak increases and you keep playing!
6. If you miss, your game ends for the day
7. Come back tomorrow for a new streak

## 📁 Project Structure

```
coin-flipper/
├── api/                    # Serverless API functions
│   ├── flip.js            # Coin flip logic
│   ├── rankings.js        # Leaderboard data
│   └── lib/
│       └── db.js          # Database layer (currently mocked)
├── public/                # Static frontend files
│   ├── index.html         # Main HTML
│   ├── style.css          # Styles and animations
│   └── script.js          # Client-side logic
├── dev-server.js          # Local development server
└── vercel.json            # Vercel deployment config
```

## 🌐 Deployment

This project is configured for Vercel deployment:

```bash
vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.

## 🔧 MongoDB Integration

The database is currently mocked. To connect to MongoDB:

1. Get your MongoDB connection string
2. Update `api/lib/db.js` with the MongoDB driver
3. Replace mock functions with real database operations

## ✨ Features

- ✅ Server-side coin flip (prevents cheating)
- ✅ Daily play limit enforcement
- ✅ Random name generation
- ✅ Smooth 3D coin flip animation
- ✅ Share functionality (Web Share API)
- ✅ Daily and all-time leaderboards
- ✅ Responsive design
- ✅ Local storage for session persistence

## 🎨 Tech Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript
- **Backend**: Node.js (Vercel Serverless Functions)
- **Database**: MongoDB (mocked for now)
- **Deployment**: Vercel

---

Made with ❤️ for daily coin flip enthusiasts!
