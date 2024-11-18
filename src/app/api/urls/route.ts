import { NextResponse } from 'next/server';
import { getSubscribeUrls } from '@/utils/env';

export async function GET() {
  const urls = getSubscribeUrls();
  return NextResponse.json(urls);
} 