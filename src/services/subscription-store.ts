import type { D1Database } from '@cloudflare/workers-types';

interface Subscription {
  name: string;
  url: string;
}

interface Env {
  DB: D1Database;
}

export async function getSubscribeUrls(env?: Env): Promise<Subscription[]> {
  try {
    console.log('[DB] Starting to fetch subscriptions');
    const subs: Subscription[] = [];
    
    // 从环境变量获取
    let index = 1;
    while (true) {
      const url = process.env[`SUB_URL_${index}`];
      if (!url) break;
      console.log(`[ENV] Found SUB_URL_${index}:`, url);
      subs.push({
        name: `订阅 ${index}`,
        url
      });
      index++;
    }

    // 从数据库获取
    if (env?.DB) {
      console.log('[DB] Database connection exists, executing query...');
      const { results, success, error } = await env.DB
        .prepare('SELECT name, url FROM subscriptions ORDER BY created_at DESC')
        .all<Subscription>();
      
      console.log('[DB] Query results:', { success, error, count: results?.length });
      if (results) subs.push(...results);
    } else {
      console.log('[DB] No database connection available');
    }

    const final = [...new Map(subs.map(sub => [sub.url, sub])).values()];
    console.log('[DB] Final subscriptions count:', final.length);
    return final;
  } catch (error) {
    console.error('[DB] Failed to get subscriptions:', error);
    throw error;
  }
}