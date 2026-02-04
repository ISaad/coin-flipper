require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL; // .co is in .env now
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Testing connection to:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testGamesWrite() {
    try {
        console.log('1. Creating a test user...');
        const userId = crypto.randomUUID();
        const { error: uErr } = await supabase.from('users').insert({
            id: userId,
            username: 'GameTester'
        });

        if (uErr) {
            console.error('User Create Failed:', uErr);
            return;
        }
        console.log('User created:', userId);

        console.log('2. Inserting a game...');
        const { data, error } = await supabase
            .from('games')
            .insert({
                user_id: userId,
                current_streak: 1,
                is_active: true,
                played_at: new Date().toISOString().split('T')[0]
            })
            .select()
            .single();

        if (error) {
            console.error('Game Insert FAILED:', error);
        } else {
            console.log('Game Insert SUCCESS:', data);
        }

    } catch (e) {
        console.error('Catch Error:', e);
    }
}

testGamesWrite();
