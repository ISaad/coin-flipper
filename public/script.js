const API_BASE = '/api';

const state = {
    userId: localStorage.getItem('fliply_id'),
    streak: 0,
    bestToday: 0,
    maxStreak: 0,
    lives: 3,
    canPlay: false,
    gameResults: [],
    user: null
};

const els = {
    streakVal: document.getElementById('streakDisplay'),
    livesVal: document.getElementById('livesDisplay'),
    bestTodayVal: document.getElementById('bestTodayDisplay'),
    dailyRankBadge: document.getElementById('dailyRankDisplay'),
    coin: document.getElementById('coin'),
    controls: document.getElementById('gameControls'),
    resultMsg: document.getElementById('resultMessage'),
    shareBtn: document.getElementById('shareBtn'),
    leaderboardModal: document.getElementById('leaderboardModal'),
    userModal: document.getElementById('userModal'),
    rankingsList: document.getElementById('rankingsList')
};

// Init
async function init() {
    if (!state.userId) {
        // New User - Force modal to show
        els.userModal.classList.remove('hidden');
        els.userModal.style.display = 'flex'; // Explicit display
    } else {
        // Existing User - Sync
        await syncState();
    }

    setupListeners();
}

async function syncState() {
    try {
        const res = await fetch(`${API_BASE}/play?userId=${state.userId}`);

        if (res.status === 401) {
            // User not found in DB anymore
            console.warn('User not found in DB, resetting session...');
            localStorage.removeItem('fliply_id');
            state.userId = null;
            els.userModal.classList.remove('hidden');
            return;
        }

        const data = await res.json();

        state.streak = data.current_streak;
        state.bestToday = data.best_today || 0;
        state.maxStreak = data.max_streak || (data.user?.max_streak || 0);
        state.lives = data.lives ?? 3;
        state.canPlay = data.can_play;
        state.user = data.user;

        // Update UI
        updateUI();

        if (!state.canPlay) {
            endGameLocal(false);
        } else {
            // Ensure controls are visible if they can play
            els.controls.classList.remove('hidden');
            els.resultMsg.classList.add('hidden');
            els.shareBtn.classList.add('hidden');
            els.streakVal.style.color = 'var(--gold)';
        }
    } catch (e) {
        console.error('Sync failed', e);
    }
}

function updateUI() {
    // Current Streak
    els.streakVal.textContent = state.streak;
    els.streakVal.classList.remove('hidden-value');

    // Lives
    if (els.livesVal) {
        const hearts = '❤️'.repeat(Math.max(0, state.lives)) + '🖤'.repeat(Math.max(0, 3 - state.lives));
        els.livesVal.textContent = hearts;
    }

    // Best Stats with celebration effects
    if (els.bestTodayVal) {
        const oldBest = parseInt(els.bestTodayVal.textContent) || 0;
        els.bestTodayVal.textContent = state.bestToday;

        // Celebrate if new daily record
        if (state.bestToday > oldBest && oldBest > 0) {
            els.bestTodayVal.classList.add('celebrate');
            setTimeout(() => els.bestTodayVal.classList.remove('celebrate'), 500);
        }
    }


    // Update daily rank
    if (state.bestToday > 0) {
        fetchDailyRank();
    }
}

// Fetch and display daily leaderboard rank
async function fetchDailyRank() {
    try {
        const res = await fetch(`${API_BASE}/leaderboard`);
        const data = await res.json();

        if (data.daily && Array.isArray(data.daily)) {
            // Find user's rank
            const userRank = data.daily.findIndex(entry => {
                const entryUserId = entry.user_id || entry.users?.id;
                return entryUserId === state.userId;
            }) + 1; // +1 because findIndex is 0-based

            if (userRank > 0 && els.dailyRankBadge) {
                // Update badge text
                els.dailyRankBadge.textContent = `🏆 #${userRank}`;

                // Remove all rank classes
                els.dailyRankBadge.classList.remove('top-1', 'top-3', 'top-10');

                // Add appropriate class based on rank
                if (userRank === 1) {
                    els.dailyRankBadge.classList.add('top-1');
                } else if (userRank <= 3) {
                    els.dailyRankBadge.classList.add('top-3');
                } else if (userRank <= 10) {
                    els.dailyRankBadge.classList.add('top-10');
                }

                // Show the badge
                els.dailyRankBadge.classList.remove('hidden');
            }
        }
    } catch (e) {
        console.error('Failed to fetch daily rank:', e);
    }
}

async function handleRegister(inputId = 'usernameInput') {
    const username = document.getElementById(inputId).value || 'Anonymous';

    const res = await fetch(`${API_BASE}/user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
    });

    const data = await res.json();
    if (data.user) {
        state.userId = data.user.id;
        state.user = data.user;
        localStorage.setItem('fliply_id', state.userId);
        els.userModal.classList.add('hidden');
        syncState();
    } else if (data.error) {
        showToast(data.error, 'error');
    }
}

async function handleFlip(choice) {
    if (!state.canPlay) return;

    // UI Feedback
    els.controls.style.opacity = '0.5';
    document.querySelectorAll('.choice-btn').forEach(b => b.disabled = true);

    // API Call
    try {
        const res = await fetch(`${API_BASE}/play`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: state.userId, guess: choice })
        });

        if (res.status === 401) {
            showToast('Session expired. Please register again.', 'error');
            localStorage.removeItem('fliply_id');
            state.userId = null;
            state.user = null;
            els.userModal.classList.remove('hidden');
            resetControls();
            return;
        }

        const data = await res.json();

        if (data.error) {
            showToast(data.error, 'error');
            resetControls();
            return;
        }

        // Animate
        animateFlip(data.result, () => {
            // Update State
            state.streak = data.streak;
            state.bestToday = data.best_today;
            state.maxStreak = data.max_streak;
            state.lives = data.lives;
            state.canPlay = !data.game_over;

            // Update UI
            updateUI();

            if (data.win) {
                resetControls();
                showToast('STREAK INCREASED! +1', 'success');
            } else {
                if (data.game_over) {
                    endGameLocal(true);
                } else {
                    resetControls();
                    showToast(`WRONG! ${state.lives} lives left`, 'error');
                }
            }
        });

    } catch (e) {
        console.error(e);
        resetControls();
    }
}

// Keep track of rotation to ensure it always spins forward
let currentRotation = 0;

function animateFlip(result, callback) {
    els.coin.classList.remove('show-heads', 'show-tails'); // Remove old class dependency

    // Calculate target rotation
    // 5 full spins (1800) minimum
    const spins = 5 * 360;

    // Current mod 360 tells us where we are (0=Heads, 180=Tails)
    // We want to land on 0 for Heads, 180 for Tails.

    // Simply add spins + adjustment
    currentRotation += spins;

    const remainder = currentRotation % 360;

    if (result === 'HEADS') {
        // We want remainder 0.
        // If we are at 180, add 180. If at 0, add 0 (but we added spins already so it moves)
        if (remainder !== 0) {
            currentRotation += (360 - remainder);
        }
    } else {
        // TAILS: We want remainder 180
        if (remainder !== 180) {
            currentRotation += (180 + 360 - remainder) % 360;
        }
    }

    // Apply transform directly
    els.coin.style.transition = 'transform 3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    els.coin.style.transform = `rotateY(${currentRotation}deg)`;

    // Wait for transition (3s)
    setTimeout(callback, 3000);
}

function resetControls() {
    els.controls.style.opacity = '1';
    document.querySelectorAll('.choice-btn').forEach(b => b.disabled = false);

    // Reset coin visually after a delay? Or keep it showing result.
    // We keep it showing result until next flip.
}

function endGameLocal(justLost) {
    state.canPlay = false;
    els.controls.classList.add('hidden');
    els.resultMsg.classList.remove('hidden');
    els.shareBtn.classList.remove('hidden');

    // Change coloring
    els.streakVal.style.color = 'var(--danger)';

    if (justLost) {
        els.resultMsg.textContent = `FINAL SCORE: ${state.bestToday}`;
        els.resultMsg.className = "result-message loss";
    } else {
        els.resultMsg.textContent = `TODAY'S SCORE: ${state.bestToday}`;
        els.resultMsg.className = "result-message";
        els.streakVal.style.color = 'var(--text-muted)';
    }
}

function shareStreak() {
    const bestScore = state.bestToday || state.streak;
    // Wordle style visualization
    const coins = '🪙'.repeat(Math.min(bestScore, 15)) + (bestScore > 15 ? '...' : '');
    const status = state.canPlay ? '💪' : '💀';

    // Catchy message
    const text = `I got a streak of ${bestScore} on Fliply today! ${status}\n${coins}\n\nTry to beat my score! 🎯\n${window.location.href}`;

    if (navigator.share) {
        navigator.share({
            title: 'Fliply - Beat My Score!',
            text: text
        });
    } else {
        navigator.clipboard.writeText(text);
        showToast('Copied to clipboard!', 'info');
    }
}

async function loadLeaderboard() {
    els.leaderboardModal.classList.remove('hidden');
    const res = await fetch(`${API_BASE}/leaderboard`);
    const data = await res.json();

    renderLeaderboard(data.daily); // Default

    // Tab switching logic would go here
    document.querySelectorAll('.tab').forEach(t => {
        t.onclick = (e) => {
            document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
            e.target.classList.add('active');
            renderLeaderboard(e.target.dataset.tab === 'daily' ? data.daily : data.allTime);
        };
    });
}

function renderLeaderboard(list) {
    if (!list || !Array.isArray(list)) {
        els.rankingsList.innerHTML = '<div class="loading">No data yet.</div>';
        return;
    }
    els.rankingsList.innerHTML = list.map((item, i) => {
        const username = item.username || item.users?.username || 'Anon';
        const country = item.country_code || item.users?.country_code || item.country || 'XX';
        const score = item.score !== undefined ? item.score : (item.max_streak !== undefined ? item.max_streak : 0);
        const rank = i + 1;
        const topClass = rank <= 3 ? `top-${rank}` : '';

        return `
            <div class="ranking-row ${topClass}">
                <div class="rank">#${rank}</div>
                <div class="user-info">
                    <span class="flag">${getFlag(country)}</span>
                    <span class="name">${username}</span>
                </div>
                <div class="score">${score}</div>
            </div>
        `;
    }).join('');
}

function getFlag(cc) {
    if (!cc || cc === 'XX') return '🌍';
    return cc.toUpperCase().replace(/./g, char => String.fromCodePoint(char.charCodeAt(0) + 127397));
}

function setupListeners() {
    document.querySelectorAll('.choice-btn').forEach(btn => {
        btn.addEventListener('click', () => handleFlip(btn.dataset.choice));
    });

    document.getElementById('saveUserBtn').addEventListener('click', () => handleRegister('usernameInput', 'countryInput'));
    document.getElementById('randomNameBtn').addEventListener('click', () => {
        document.getElementById('usernameInput').value = getRandomName();
    });

    els.shareBtn.addEventListener('click', shareStreak);

    document.getElementById('leaderboardBtn').addEventListener('click', loadLeaderboard);
    document.querySelector('#leaderboardModal .close-modal').addEventListener('click', () => els.leaderboardModal.classList.add('hidden'));

    document.getElementById('settingsBtn').addEventListener('click', () => {
        document.getElementById('settingsModal').classList.remove('hidden');
        if (state.user) {
            document.getElementById('editUsernameInput').value = state.user.username;
        }
    });

    document.getElementById('closeSettings').addEventListener('click', () => {
        document.getElementById('settingsModal').classList.add('hidden');
    });

    document.getElementById('themeToggleBtn').addEventListener('click', toggleTheme);
    document.getElementById('updateNameBtn').addEventListener('click', handleUpdateName);
}

function getRandomName() {
    const adjectives = ['Cool', 'Swift', 'Bold', 'Golden', 'Lucky', 'Epic', 'Magic', 'Shadow'];
    const nouns = ['Flipper', 'Whale', 'Ninja', 'Shark', 'Falcon', 'Tiger', 'Lion', 'Falcon'];
    const num = Math.floor(Math.random() * 999);
    return `${adjectives[Math.floor(Math.random() * adjectives.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}${num}`;
}

async function handleUpdateName() {
    const username = document.getElementById('editUsernameInput').value;
    if (!username) return;

    try {
        const res = await fetch(`${API_BASE}/user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: state.userId, username })
        });

        if (res.status === 401) {
            showToast('Session expired. Please register again.', 'error');
            localStorage.removeItem('fliply_id');
            location.reload(); // Hard reset to clear state
            return;
        }

        const data = await res.json();
        if (data.user) {
            state.user = data.user;
            showToast('Name updated!', 'success');
            document.getElementById('settingsModal').classList.add('hidden');
        } else {
            showToast(data.error || 'Failed to update name', 'error');
        }
    } catch (e) {
        showToast('Update failed', 'error');
    }
}

function toggleTheme() {
    const isLight = document.body.classList.toggle('light-theme');
    localStorage.setItem('fliply_theme', isLight ? 'light' : 'dark');
    showToast(`${isLight ? 'Light' : 'Dark'} Mode Enabled`, 'info');
}

function applyTheme() {
    const saved = localStorage.getItem('fliply_theme');
    if (saved === 'light') {
        document.body.classList.add('light-theme');
    }
}

function showToast(msg, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = msg;

    // Add toast styles dynamically if not in CSS, or assume CSS handles .toast
    // Let's ensure it's visible. Container?
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    container.appendChild(toast);

    // Remove after 3s
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// Start
applyTheme();
init();
