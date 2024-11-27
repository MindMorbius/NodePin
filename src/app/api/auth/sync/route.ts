import { supabaseAdmin } from '@/lib/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '../[...nextauth]/route';

// 解析 JWT 获取过期时间
function getExpireTime(token: string) {
  try {
    const base64Payload = token.split('.')[1];
    const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
    return new Date(payload.exp * 1000); // 转换为 JavaScript Date 对象
  } catch (error) {
    console.error('Token parsing error:', error);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { error: userError } = await supabaseAdmin
      .from('discourse_users')
      .upsert({
        discourse_id: session.user.id,
        name: session.user.name,
        username: session.user.username,
        avatar_url: session.user.image,
        trust_level: session.user.trustLevel
      }, {
        onConflict: 'discourse_id'
      });

    if (userError) throw userError;

    // 获取用户ID
    const { data: userData } = await supabaseAdmin
      .from('discourse_users')
      .select('id')
      .eq('discourse_id', session.user.id)
      .single();

    // console.log('获取用户UID:', userData?.id);

    // 保存会话信息
    const { error: sessionError } = await supabaseAdmin
      .from('user_sessions')
      .upsert({
        discourse_users_id: userData?.id,
        discourse_id: session.user.id,
        expire_time: getExpireTime(session.accessToken),
        access_token: session.accessToken.replace(/"/g, '')
      }, {
        onConflict: 'discourse_id'
      });

    if (sessionError) throw sessionError;

    return Response.json({ success: true });
  } catch (error) {
    console.error('Sync error:', error);
    return Response.json({ error: 'Sync failed' }, { status: 500 });
  }
} 