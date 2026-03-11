import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env['SUPABASE_URL']!;
const supabaseAnonKey = process.env['SUPABASE_ANON_KEY']!;
const supabaseServiceRoleKey = process.env['SUPABASE_SERVICE_ROLE_KEY']!;

// Public client — used to verify JWTs in auth middleware
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client — used server-side only (register, manage users)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
