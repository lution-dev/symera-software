import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;
let initPromise: Promise<SupabaseClient> | null = null;

async function initSupabase(): Promise<SupabaseClient> {
  if (supabaseInstance) return supabaseInstance;
  
  if (initPromise) return initPromise;
  
  initPromise = (async () => {
    try {
      const response = await fetch('/api/supabase-config');
      const config = await response.json();
      
      console.log('[Supabase] Config received:', { 
        hasUrl: !!config.url, 
        hasKey: !!config.anonKey,
        urlStart: config.url?.substring(0, 20)
      });
      
      if (!config.url || !config.anonKey) {
        throw new Error('Supabase configuration not available');
      }
      
      if (!config.url.startsWith('http')) {
        throw new Error('Invalid Supabase URL');
      }
      
      supabaseInstance = createClient(config.url, config.anonKey, {
        auth: {
          persistSession: true,
          detectSessionInUrl: true,
          flowType: 'pkce',
          autoRefreshToken: true,
        }
      });
      return supabaseInstance;
    } catch (error) {
      console.error('Failed to initialize Supabase:', error);
      throw error;
    }
  })();
  
  return initPromise;
}

export async function getSupabase(): Promise<SupabaseClient> {
  return initSupabase();
}

export { supabaseInstance as supabase };
