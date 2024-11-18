import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = cookies();
  const authCookie = cookieStore.get('auth');

  if (authCookie?.value) {
    return new NextResponse(null, { status: 200 });
  }

  return new NextResponse(null, { status: 401 });
} 