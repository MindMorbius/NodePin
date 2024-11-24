import { createClient } from '@supabase/supabase-js';
import { Database } from './types';
import nodeFetch from 'node-fetch';
import { HttpsProxyAgent } from 'https-proxy-agent';

const proxyUrl = process.env.HTTPS_PROXY || 'http://127.0.0.1:7890';
const proxyAgent = process.env.NODE_ENV === 'development' ? new HttpsProxyAgent(proxyUrl) : undefined;

export const supabaseServer = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      fetch: (url, init) => {
        return nodeFetch(url, {
          ...init,
          ...(proxyAgent && { agent: proxyAgent }),
          timeout: 15000,
        });
      }
    },
  }
);