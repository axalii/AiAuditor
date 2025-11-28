import { createClient } from '@supabase/supabase-js';

// Access environment variables securely
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'CRITICAL ERROR: Supabase environment variables are missing. ' +
    'Please check your .env file for VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  );
}

// Create a single instance of the Supabase client
export const supabase = createClient(
  supabaseUrl || '', 
  supabaseAnonKey || ''
);

/**
 * Helper to check connection status.
 * Can be used by the UI to show a "System Offline" warning.
 */
export const checkConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('access_pins').select('count', { count: 'exact', head: true });
    return !error;
  } catch (e) {
    return false;
  }
};