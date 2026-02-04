const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function inspect() {
    console.log('--- Inspecting Users ---');
    const { data: users, error: uErr } = await supabase.from('users').select('*').limit(5);
    console.log('Users:', users);
    if (uErr) console.error('Users Error:', uErr);

    console.log('--- Inspecting Games ---');
    const { data: games, error: gErr } = await supabase.from('games').select('*').limit(5);
    console.log('Games:', games);
    if (gErr) console.error('Games Error:', gErr);
}

inspect();
