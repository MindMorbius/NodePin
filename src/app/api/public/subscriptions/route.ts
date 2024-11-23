import { NextResponse } from 'next/server';
import { getSubscribeUrls, fetchSubscriptionNodes } from '@/services/subscription-store';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cursor = parseInt(searchParams.get('cursor') || '0');
    const subscriptions = await getSubscribeUrls();
    
    return NextResponse.json({
      success: true,
      data: {
        total: subscriptions.length,
        items: subscriptions.slice(cursor).map((sub, idx) => ({
          id: cursor + idx + 1,
          name: sub.name,
          info: { total: 0, upload: 0, download: 0, expire: 0 },
          nodeCount: 0,
          status: 'loading'
        }))
      }
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch data' 
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { id } = await request.json();
    const subscriptions = await getSubscribeUrls();
    const subscription = subscriptions[id - 1]; // 因为id是从1开始的
    
    if (!subscription) {
      return NextResponse.json({ 
        success: false, 
        error: 'Subscription not found' 
      }, { status: 404 });
    }

    const result = await fetchSubscriptionNodes([subscription.url]);
    if (!result.length) {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch subscription' 
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        info: result[0].info,
        nodeCount: result[0].nodes.length
      }
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch data' 
    }, { status: 500 });
  }
} 