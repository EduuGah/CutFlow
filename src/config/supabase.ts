import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

if (!hasSupabaseConfig) {
  console.warn(
    'Credenciais do Supabase ausentes. Copie .env.example para .env e preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.'
  );
}

// Placeholders mantêm o cliente construível: sem eles o createClient lança e a
// aplicação nem chega a pintar a tela que explica o problema.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);
