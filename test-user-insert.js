require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testUserInsert() {
    const uid = crypto.randomUUID();
    console.log(`Attempting to insert user with ID: ${uid}`);

    const { data, error } = await supabase
        .from('users')
        .insert({ id: uid, username: 'TestUser' })
        .select();

    if (error) {
        console.error('User Insert Error:', error);
    } else {
        console.log('User Insert Success:', data);
    }
}

testUserInsert();
