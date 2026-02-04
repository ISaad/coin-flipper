require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Testing connection to:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function probeGames() {
    try {
        console.log('Probing GAMES table...');

        // Create temp user
        const uid = crypto.randomUUID();
        const { error: uErr } = await supabase.from('users').insert({ id: uid, username: 'ProbeUser' });
        if (uErr) {
            console.log('User insert failed (might exist):', uErr.message);
        }

        // Insert game with minimal known fields + generated ID if needed?
        // Let's try inserting just user_id and see what keys come back.
        const { data, error } = await supabase
            .from('games')
            .insert({ user_id: uid })
            .select()
            .single();

        if (error) {
            console.error('Games Probe Error:', error);
            // If it fails on constraints, we might need to guess columns.
            // But usually select() returns keys if insert succeeds.
        } else {
            console.log('Games Probe Success! Keys:', Object.keys(data));
        }

    } catch (e) {
        console.error('Catch Error:', e);
    }
}

probeGames();
