import { NextResponse } from 'next/server';
import { fetchSubscriptionNodes } from '@/services/subscription';

export const runtime = 'edge';

export async function GET() {
  try {
    const results = await fetchSubscriptionNodes();
    return NextResponse.json(results);
  } catch (error) {
    console.error('Failed to fetch nodes:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch subscription data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
