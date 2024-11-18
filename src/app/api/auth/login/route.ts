import { NextResponse } from 'next/server';
import { ADMIN_USERNAME, ADMIN_PASSWORD } from '@/utils/env';

export async function POST(request: Request) {
  const { username, password } = await request.json();

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const response = NextResponse.json({ success: true });
    response.cookies.set('auth', 'true', { 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });
    return response;
  }

  return NextResponse.json({ success: false }, { status: 401 });
} 