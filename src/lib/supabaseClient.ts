import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  !supabaseUrl.includes('your-project-id')
);

if (!isSupabaseConfigured) {
  console.warn(
    '[Wish Boyke] Supabase credentials not detected or still using placeholders. ' +
    'The app will run using fallback local mock data. ' +
    'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env or Vercel dashboard to connect to live Supabase.'
  );
}

// Inisialisasi Supabase client (menggunakan dummy URL aman saat belum diisi agar tidak throw error)
export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://dummy-wishboyke.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'dummy-anon-key'
);
