import { NextResponse } from 'next/server';
import { fetchSubscriptionNodes } from '@/services/subscription';
import { getSubscribeUrls } from '@/utils/env';

export const runtime = 'edge';

export async function GET(
  request: Request,
  { env }: { env: any }
) {
  try {
    const subscriptions = await getSubscribeUrls(env);
    const urls = subscriptions.map(sub => sub.url);
    const results = await fetchSubscriptionNodes(urls);
    
    const resultsWithNames = results.map(result => {
      const subscription = subscriptions.find(sub => sub.url === result.url);
      return {
        ...result,
        name: subscription?.name || ''
      };
    });
    
    return NextResponse.json(resultsWithNames);
  } catch (error) {
    console.error('Failed to fetch nodes:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch subscription data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
