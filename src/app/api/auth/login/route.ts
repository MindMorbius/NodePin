import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

export async function POST(request: Request) {
  const body = await request.json();
  const { username, password } = body;

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    // 设置 cookie，7天过期
    const cookieStore = cookies();
    cookieStore.set('auth', 'true', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return new NextResponse(null, { status: 200 });
  }

  return new NextResponse(null, { status: 401 });
} 