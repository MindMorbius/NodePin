import { NextResponse } from 'next/server';
import { fetchSubscriptionNodes } from '@/services/subscription';

export async function GET() {
  try {
    const results = await fetchSubscriptionNodes();
    return NextResponse.json(results);
  } catch (error) {
    console.error('Failed to fetch nodes:', error);
    return NextResponse.json([], { status: 500 });
  }
}
