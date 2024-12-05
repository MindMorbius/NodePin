import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { Subscription } from '@/utils/db';
import { headers } from 'next/headers';
import { encrypt, decrypt } from '@/utils/crypto';

export async function POST(req: Request) {
  try {
    const headersList = headers();
    const accessToken = headersList.get('authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscription = await req.json();
    
    const userId = headersList.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let existingRecord;
    if (subscription.user_subscriptions_id) {
      const { data: existing } = await supabaseAdmin
        .from('user_subscriptions')
        .select('*')
        .eq('id', subscription.user_subscriptions_id)
        .single();
      existingRecord = existing;
    }

    if (existingRecord && new Date(existingRecord.updated_at) > new Date(subscription.updated_at)) {
      return NextResponse.json({
        success: true,
        data: existingRecord,
        action: 'kept_db_version'
      });
    }

    const { data: insertedSub, error: insertError } = await supabaseAdmin
      .from('user_subscriptions')
      .upsert({
        id: subscription.user_subscriptions_id,
        name: subscription.name,
        encrypted_url: await encrypt(subscription.url),
        discourse_users_id: userId,
        upload_traffic: subscription.upload_traffic,
        download_traffic: subscription.download_traffic,
        total_traffic: subscription.total_traffic,
        node_count: subscription.node_count,
        expire_time: subscription.expire_time,
        data_update_time: subscription.data_update_time,
        fetch_status: subscription.fetch_status,
        status: subscription.status,
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({
      success: true,
      data: insertedSub,
      action: 'updated_db'
    });

  } catch (error) {
    console.error('Sync error details:', error);
    return NextResponse.json(
      { error: error.message || 'Sync failed' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    // 从请求头获取 access token
    const headersList = headers();
    const accessToken = headersList.get('authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 获取用户ID
    const userId = headersList.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 获取用户所有订阅
    const { data: subs, error: fetchError } = await supabaseAdmin
      .from('user_subscriptions')
      .select('*')
      .eq('discourse_users_id', userId)

    if (fetchError) throw fetchError;

    // 解密订阅地址
    const decryptedSubs = await Promise.all(subs.map(async sub => ({
      ...sub,
      url: await decrypt(sub.encrypted_url)
    })));

    return NextResponse.json({
      success: true,
      data: decryptedSubs
    });

  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}
