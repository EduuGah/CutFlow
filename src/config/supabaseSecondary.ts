import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const safeUrl = typeof supabaseUrl === 'string' && supabaseUrl.startsWith('http') ? supabaseUrl : 'https://placeholder.supabase.co';
const safeKey = typeof supabaseAnonKey === 'string' && supabaseAnonKey.length > 0 ? supabaseAnonKey : 'placeholder-anon-key';

// Um cliente secundário sem persistência de sessão.
// Útil para quando um Admin precisa cadastrar um Barbeiro sem sobrescrever a própria sessão.
export const getSecondarySupabase = () => {
  return createClient(safeUrl, safeKey, {
    auth: {
      storage: {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      },
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
};
