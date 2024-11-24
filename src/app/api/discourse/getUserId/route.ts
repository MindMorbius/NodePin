import { supabasePublic } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const discourseId = searchParams.get('discourseId')

  if (!discourseId) {
    return NextResponse.json({ error: 'Missing discourseId' }, { status: 400 })
  }

  try {
    const { data, error } = await supabasePublic
      .from('discourse_users')
      .select('id')
      .eq('discourse_id', discourseId)
      .single()

    if (error) throw error

    return NextResponse.json({ id: data?.id })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 