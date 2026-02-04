const { supabase } = require('./_utils/supabase');
const { corsHeaders, sendJSON, sendError, getTodayISO } = require('./_utils/helpers');

module.exports = async (req, res) => {
    if (req.method === 'OPTIONS') {
        res.status(200).json({});
        return;
    }

    if (req.method !== 'GET') return sendError(res, 'Method Not Allowed', 405);

    const today = getTodayISO();

    try {
        // Top 50 Today
        const { data: daily } = await supabase
            .from('games')
            .select('user_id, score, users(username, country_code)')
            .eq('played_at', today)
            .order('score', { ascending: false })
            .limit(50);

        // Top 50 All Time
        const { data: allTime } = await supabase
            .from('users')
            .select('username, country_code, max_streak')
            .order('max_streak', { ascending: false })
            .limit(50);

        sendJSON(res, { daily, allTime });
    } catch (e) {
        console.error(e);
        sendError(res, 'Failed to fetch leaderboards', 500);
    }
};
