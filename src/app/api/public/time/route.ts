import { supabasePublic } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { data, error } = await supabasePublic.rpc('get_server_time');
    if (error) throw error;
    
    const timestamp = new Date(data + 'Z').getTime();

    return NextResponse.json({ time: timestamp });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}