import { supabaseServer } from '@/lib/supabase/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../[...nextauth]/route';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabaseServer
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

    if (error) throw error;
    return Response.json({ success: true });
  } catch (error) {
    console.error('Sync error:', error);
    return Response.json({ error: 'Sync failed' }, { status: 500 });
  }
} 