const { supabase } = require('./_utils/supabase');
const { sendJSON, sendError } = require('./_utils/helpers');

module.exports = async (req, res) => {
    if (req.method === 'OPTIONS') {
        res.status(200).json({});
        return;
    }

    if (req.method !== 'POST') {
        return sendError(res, 'Method Not Allowed', 405);
    }

    const { username, country_code } = req.body;
    let { userId } = req.body;

    if (username && username.length > 20) {
        return sendError(res, 'Username too long');
    }

    try {
        let data, error;

        if (userId && typeof userId === 'string') {
            userId = userId.trim();
            console.log(`[USER_API] Attempting to update/create user: ${userId}`);

            const payload = { id: userId };
            if (username) payload.username = username;
            if (country_code) payload.country_code = country_code;

            const { data: upserted, error: upsertErr } = await supabase
                .from('users')
                .upsert(payload, { onConflict: 'id' })
                .select();

            if (upsertErr) throw upsertErr;
            data = upserted[0];
        } else {
            const newId = require('crypto').randomUUID();
            console.log(`[USER_API] Creating brand new user: ${newId}`);

            const { data: inserted, error: insertErr } = await supabase
                .from('users')
                .insert([{
                    id: newId,
                    username: username || 'Anonymous',
                    country_code: country_code || 'XX'
                }])
                .select();

            if (insertErr) throw insertErr;
            data = inserted[0];
        }

        sendJSON(res, { user: data });
    } catch (error) {
        console.error('[USER_API] Exception:', error);
        sendError(res, 'Process failed: ' + error.message, 500);
    }
};
