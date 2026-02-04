const { createClient } = require('@supabase/supabase-js');

// Server uses SERVICE_ROLE key for full database access (bypasses RLS)
// This is secure because the server is the only one with this key
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Fallback to ANON key if SERVICE_ROLE not available (for backward compatibility)
const supabaseKey = supabaseServiceKey || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('CRITICAL: Supabase credentials missing (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY)');
}

// Create client with service_role key (bypasses RLS for secure server operations)
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = { supabase };
