import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

// Prevent build-time crashes when env vars are missing. UI code should check
// `isSupabaseConfigured` before making queries and show a clear message.
const fallbackSupabaseUrl = 'https://example.supabase.co';
const fallbackSupabaseKey = 'public-anon-key';

export const supabase = createClient(
	supabaseUrl || fallbackSupabaseUrl,
	supabaseKey || fallbackSupabaseKey
);
