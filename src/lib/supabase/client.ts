import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

// 前端使用，使用 anon key
export const supabaseClient = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    global: {
      fetch: (url, init) => {
        return fetch(url, {
          ...init,
        });
      }
    },
  }
);