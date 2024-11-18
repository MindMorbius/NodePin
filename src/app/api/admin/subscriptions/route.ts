import { NextResponse } from 'next/server';
import { getSubscribeUrls } from '@/services/subscription-store';
import type { D1Database } from '@cloudflare/workers-types';

interface Env {
  DB: D1Database;
}

export const runtime = 'edge';

// 获取所有订阅
export async function GET(
  request: Request,
  context: { env: Env }
) {
  const urls = await getSubscribeUrls(context.env);
  return NextResponse.json(urls);
}

// 添加订阅
export async function POST(
  request: Request,
  context: { env: Env }
) {
  if (!context.env?.DB) {
    console.error('[DB] Database connection not available');
    return NextResponse.json({ 
      success: false, 
      error: 'Database connection not available'
    }, { status: 500 });
  }

  try {
    const { name, url } = await request.json();
    console.log('[DB] Attempting to insert subscription:', { name, url });
    
    if (!name || !url) {
      console.log('[DB] Missing required fields');
      return NextResponse.json({ 
        success: false, 
        error: 'Name and URL are required'
      }, { status: 400 });
    }

    const result = await context.env.DB
      .prepare('INSERT INTO subscriptions (name, url) VALUES (?, ?)')
      .bind(name, url)
      .run();
    
    console.log('[DB] Insert result:', result);
    return NextResponse.json({ success: result.success });
  } catch (error) {
    console.error('[DB] Insert failed:', error);
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// 更新订阅
export async function PUT(
  request: Request,
  context: { env: Env }
) {
  try {
    const { oldUrl, name, url } = await request.json();
    
    await context.env.DB
      .prepare('UPDATE subscriptions SET name = ?, url = ? WHERE url = ?')
      .bind(name, url, oldUrl)
      .run();
      
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// 删除订阅
export async function DELETE(
  request: Request,
  context: { env: Env }
) {
  try {
    const { url } = await request.json();
    
    await context.env.DB
      .prepare('DELETE FROM subscriptions WHERE url = ?')
      .bind(url)
      .run();
      
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}