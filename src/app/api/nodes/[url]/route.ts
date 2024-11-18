import { NextResponse } from 'next/server';
import { parseSubscription } from '@/utils/clash';
import { fetchSubscriptionNodes } from '@/services/subscription';

export async function GET(
  request: Request,
  { params }: { params: { url: string } }
) {
  try {
    const url = decodeURIComponent(params.url);
    const results = await fetchSubscriptionNodes([url]);
    return NextResponse.json(results[0]);
  } catch (error) {
    console.error(`Failed to fetch nodes for ${params.url}:`, error);
    return NextResponse.json({
      url: params.url,
      info: {
        upload: 0,
        download: 0,
        total: 0,
        expire: 0,
        nodeCount: 0
      },
      nodes: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 