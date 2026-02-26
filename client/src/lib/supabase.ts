import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY env vars');
}

const supabaseInstance: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    detectSessionInUrl: true,
    autoRefreshToken: true,
  }
});

export async function getSupabase(): Promise<SupabaseClient> {
  return supabaseInstance;
}

export function getSupabaseConfig() {
  return { url: supabaseUrl, anonKey: supabaseAnonKey };
}

export { supabaseInstance as supabase };
