import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  const cookieStore = cookies();
  cookieStore.delete('auth');
  
  return new NextResponse(null, { status: 200 });
} 