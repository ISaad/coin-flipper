const { supabase } = require('./_utils/supabase');
const { corsHeaders, sendJSON, sendError, getTodayISO } = require('./_utils/helpers');

module.exports = async (req, res) => {
    if (req.method === 'OPTIONS') {
        res.status(200).json({});
        return;
    }

    const today = getTodayISO();

    // Helper to ensure user exists
    async function getOrCreateUser(userId) {
        if (!userId) return null;
        
        // Try to fetch
        let { data: user, error } = await supabase.from('users').select('*').eq('id', userId).single();
        
        if (error && error.code === 'PGRST116') {
            // Not found, try to create it if it's a valid UUID
            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
            if (isUUID) {
                const { data: newUser, error: createError } = await supabase
                    .from('users')
                    .insert([{ id: userId, username: 'Guest', country_code: 'XX' }])
                    .select()
                    .single();
                
                if (!createError) return newUser;
            }
            return null;
        }
        return user;
    }

    // GET: Check status
    if (req.method === 'GET') {
        const { userId } = req.query;
        if (!userId) return sendError(res, 'Missing userId');

        try {
            const user = await getOrCreateUser(userId);
            if (!user) return sendError(res, 'User session invalid', 401);

            const { data: game, error } = await supabase
                .from('games')
                .select('*')
                .eq('user_id', user.id)
                .eq('played_at', today)
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            if (!game) {
                return sendJSON(res, { 
                    can_play: true, 
                    current_streak: 0, 
                    best_today: 0, 
                    lives: 3,
                    history_today: [], 
                    user 
                });
            }

            return sendJSON(res, {
                can_play: game.is_active !== false && (game.lives === undefined || game.lives > 0),
                current_streak: game.current_streak || 0,
                best_today: game.score || 0,
                lives: game.lives ?? 3,
                history_today: [],
                user
            });
        } catch (e) {
            console.error(e);
            return sendError(res, 'Internal Server Error', 500);
        }
    }

    // POST: Flip coin
    if (req.method === 'POST') {
        let { userId, guess } = req.body;

        if (typeof userId === 'string') userId = userId.trim();

        if (!userId || !['HEADS', 'TAILS'].includes(guess)) {
            return sendError(res, 'Invalid input');
        }

        try {
            console.log(`[PLAY_API] START Request - User ID: "${userId}"`);

            const user = await getOrCreateUser(userId);
            if (!user) {
                console.error(`[PLAY_API] User "${userId}" NOT FOUND and could not be created.`);
                return sendError(res, 'User session expired. Please register again.', 401);
            }

            const verifiedUserId = user.id;

            // 1. Get current game state from DB
            let { data: game, error: gameError } = await supabase
                .from('games')
                .select('*')
                .eq('user_id', verifiedUserId)
                .eq('played_at', today)
                .single();

            if (gameError && gameError.code !== 'PGRST116') {
                console.error('[PLAY_API] Game State Lookup Error:', gameError);
                throw gameError;
            }

            // Security Check: Is the game still active?
            if (game && (game.is_active === false || game.lives <= 0)) {
                console.log(`[PLAY_API] User ${user.username} already finished today.`);
                return sendError(res, 'Game already finished for today', 403);
            }

            const currentStreak = game ? Number(game.current_streak || 0) : 0;
            const bestToday = game ? Number(game.score || 0) : 0;
            const currentLives = game ? (game.lives ?? 3) : 3;

            // 2. Determine Fate
            const result = Math.random() < 0.5 ? 'HEADS' : 'TAILS';
            const isWin = result === guess;

            let newCurrent = isWin ? currentStreak + 1 : 0;
            let newLives = isWin ? currentLives : currentLives - 1;
            const newBest = Math.max(bestToday, isWin ? newCurrent : 0); // Only update best if it's a win? No, best is max streak ever.
            const stillActive = newLives > 0;

            // 3. Update DB
            const payload = {
                user_id: verifiedUserId,
                played_at: today,
                score: Math.max(bestToday, newCurrent),
                current_streak: newCurrent,
                lives: newLives,
                is_active: stillActive
            };
            console.log(`[PLAY_API] PAYLOAD for Upsert:`, payload);

            const { data: upsertData, error: upsertError } = await supabase
                .from('games')
                .upsert(payload)
                .select();

            if (upsertError) {
                console.error(`[PLAY_API] UPSERT FAILED for ${user.username}:`, upsertError);
                throw upsertError;
            }

            // 4. Update All-Time Record
            let maxStreakResult = Number(user.max_streak || 0);
            if (newCurrent > maxStreakResult) {
                maxStreakResult = newCurrent;
                await supabase.from('users').update({ max_streak: newCurrent }).eq('id', verifiedUserId);
            }

            return sendJSON(res, {
                result,
                win: isWin,
                streak: newCurrent,
                best_today: Math.max(bestToday, newCurrent),
                lives: newLives,
                max_streak: maxStreakResult,
                game_over: !stillActive
            });

        } catch (e) {
            console.error('[PLAY_API] EXCEPTION caught:', e);
            return sendError(res, 'Flip failed: ' + e.message, 500);
        }
    }

    return sendError(res, 'Method Not Allowed', 405);
};
