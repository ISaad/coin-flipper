const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function repro() {
    const userId = require('crypto').randomUUID();
    console.log(`1. Creating user: ${userId}`);

    const { data: user, error: uErr } = await supabase
        .from('users')
        .insert({ id: userId, username: 'ReproUser' })
        .select()
        .single();

    if (uErr) {
        console.error('User Insert Failed:', uErr);
        return;
    }
    console.log('User created successfully.');

    console.log('2. Verifying user exists...');
    const { data: identity, error: iErr } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();

    if (iErr || !identity) {
        console.error('Verification failed:', iErr);
        return;
    }
    console.log('Verification Success.');

    console.log('3. Attempting upsert to games...');
    const today = new Date().toISOString().split('T')[0];
    const { data: game, error: gErr } = await supabase
        .from('games')
        .upsert({
            user_id: userId,
            played_at: today,
            score: 0,
            current_streak: 0,
            is_active: true
        }, { onConflict: 'user_id, played_at' })
        .select();

    if (gErr) {
        console.error('UPSERT FAILED:', gErr);
    } else {
        console.log('UPSERT SUCCESS:', game);
    }
}

repro();
