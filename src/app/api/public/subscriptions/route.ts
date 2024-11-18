import { NextResponse } from 'next/server';
import { getSubscribeUrls } from '@/services/subscription-store';
import { fetchSubscriptionNodes } from '@/services/subscription';
import type { D1Database } from '@cloudflare/workers-types';

export const runtime = 'edge';

interface Env {
  DB: D1Database;
}

export async function GET(
  request: Request,
  { env }: { env: Env }
) {
  try {
    const subscriptions = await getSubscribeUrls(env);
    const urls = subscriptions.map(sub => sub.url);
    const results = await fetchSubscriptionNodes(urls);
    
    // 使用序号替代 URL
    const sanitizedResults = results.map((result, index) => ({
      id: index + 1,  // 使用序号作为 id
      name: result.name || `订阅 ${index + 1}`,
      info: result.info,
      nodeCount: result.nodes.length,
    }));
    
    return NextResponse.json(sanitizedResults);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
} 