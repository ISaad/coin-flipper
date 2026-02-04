require('dotenv').config();
const { supabase } = require('./api/_utils/supabase');

async function checkConnection() {
    console.log('Testing Supabase Connection...');
    console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing');
    // Sanitize Key for log
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    console.log('Key:', key ? (key.substring(0, 5) + '...') : 'Missing');

    // Timeout promise
    const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out after 5s')), 5000)
    );

    try {
        console.log('Sending request to Supabase...');
        // Using Promise.race to enforce timeout
        const { data, error } = await Promise.race([
            supabase.from('games').select('count').limit(1), // Use 'games' since we know it's used in api/play.js
            timeout
        ]);

        if (error) {
            console.log('Response received with Error:', error.message);
            console.log('Code:', error.code);
            // If code is "PGRST204" (no content) or similar, it means it connected.
            // If 401/403, it means connected but auth failed.
            // If ENOTFOUND, it means network/URL failed.
        } else {
            console.log('Connection Successful! Data:', data);
        }
    } catch (e) {
        console.error('Connection Failed or Script Error:', e.message);
        if (e.cause) console.error('Cause:', e.cause);
    }
}

checkConnection();
