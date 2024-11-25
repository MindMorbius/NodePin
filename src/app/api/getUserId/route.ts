import { supabasePublic, supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const discourseId = searchParams.get('discourseId')

  if (!discourseId) {
    return NextResponse.json({ error: 'Missing discourse ID' }, { status: 400 }) 
  }

  try {
    // 先从 discourse_users 表获取
    const { data: discourseUser, error: discourseError } = await supabasePublic
      .from('discourse_users')
      .select('id')
      .eq('discourse_id', discourseId)
      .single()

    if (discourseError) throw discourseError

    if (!discourseUser) {
      return NextResponse.json({ error: 'Discourse user not found' }, { status: 404 })
    }

    // 再从 profiles 表获取
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('discourse_id', (discourseUser as unknown as { id: string }).id)
      .single()

    if (profileError) throw profileError

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json({ id: (profile as unknown as { id: string }).id })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 