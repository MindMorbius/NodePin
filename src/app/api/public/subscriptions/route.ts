import { NextResponse } from 'next/server';
import { getSubscribeUrls } from '@/services/subscription-store';
import { fetchSubscriptionNodes } from '@/services/subscription';

export async function GET() {
  try {
    const subscriptions = await getSubscribeUrls();
    const urls = subscriptions.map(sub => sub.url);
    const results = await fetchSubscriptionNodes(urls);
    
    const sanitizedResults = results.map((result, index) => {
      const subscription = subscriptions.find(sub => sub.url === result.url);
      return {
        id: index + 1,
        name: subscription?.name || `订阅 ${index + 1}`,
        info: result.info,
        nodeCount: result.nodes.length,
      };
    });
    
    return NextResponse.json(sanitizedResults);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
} 