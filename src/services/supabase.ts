import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';
import { trackedFetch } from '../lib/connection';

// Set in .env locally and in the Netlify site's environment for production.
// The anon key is public by design: Row Level Security keeps the data private.
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const missingConfig = !url || !anonKey;

if (missingConfig) {
  console.error(
    'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (see .env.example).',
  );
}

export const supabase = createClient<Database>(url || 'http://localhost:54321', anonKey || 'missing-key', {
  global: { fetch: trackedFetch },
});

// Private bucket that holds gallery photos and their thumbnails.
export const photoBucket = () => supabase.storage.from('photos');
