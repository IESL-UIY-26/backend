import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env['SUPABASE_URL']!;
const supabaseAnonKey = process.env['SUPABASE_ANON_KEY']!;

// Public client — used to verify JWTs in auth middleware and auth service
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
