import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';

/**
 * Creates a Supabase client for use in browser (Client Components).
 * Reads credentials from NEXT_PUBLIC_* env vars.
 *
 * Usage:
 *   const supabase = createClient();
 *   const { data } = await supabase.from('profiles').select('*');
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
