import { NextResponse } from 'next/server';
import { getSubscribeUrls } from '@/utils/env';

export const runtime = 'edge';

export async function GET(
  request: Request,
  { env }: { env: any }
) {
  const urls = await getSubscribeUrls(env);
  return NextResponse.json(urls);
} 