import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { accessToken } = await request.json();

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Invalid token: token is empty' },
        { status: 401 }
      );
    }

    const { data, error } = await supabaseAdmin.rpc(
      'get_discourse_users_id_by_token',
      { p_access_token: accessToken }
    );

    if (error) throw error;

    if (!data) {
      return NextResponse.json(
        { error: 'Unknown error occurred' },
        { status: 500 }
      );
    }

    const result = data[0];

    return NextResponse.json({
      discourse_users_id: result.discourse_users_id,
      message: result.message,
      status: result.status
    });

  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
