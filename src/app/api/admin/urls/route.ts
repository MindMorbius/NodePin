import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(
  request: Request,
  { env }: { env: any }
) {
  try {
    const { name, url } = await request.json();
    
    await env.DB
      .prepare('INSERT INTO subscriptions (name, url) VALUES (?, ?)')
      .bind(name, url)
      .run();
      
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { env }: { env: any }
) {
  try {
    const { oldUrl, name, url } = await request.json();
    
    await env.DB
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

export async function DELETE(
  request: Request,
  { env }: { env: any }
) {
  try {
    const { url } = await request.json();
    
    await env.DB
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