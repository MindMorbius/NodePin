import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { accessToken } = await request.json();

    if (!accessToken) {
      return NextResponse.json({ valid: false }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin.rpc(
      'is_session_valid_by_token',
      { p_access_token: accessToken }
    );

    if (error) throw error;

    return NextResponse.json({ valid: data });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 


