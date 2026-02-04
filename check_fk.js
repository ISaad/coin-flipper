const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkFK() {
    console.log('--- Checking Foreign Keys with Score ---');
    const fakeId = '00000000-0000-0000-0000-000000000000';
    const { error } = await supabase.from('games').insert({
        user_id: fakeId,
        played_at: '2020-01-01',
        score: 0,
        current_streak: 0
    });
    console.log('Error for fake ID:', error);
}

checkFK();
