import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const VALID_TYPES = ['training', 'gym', 'match', 'team_training', 'recovery', 'school', 'other']

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  let body: {
    title?: string
    event_type?: string
    starts_at?: string
    ends_at?: string | null
    location?: string | null
    notes?: string | null
    color_hex?: string | null
  }
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  if (!body.title?.trim() || !body.event_type || !body.starts_at) {
    return NextResponse.json({ error: 'title, event_type, and starts_at are required' }, { status: 400 })
  }
  if (!VALID_TYPES.includes(body.event_type)) {
    return NextResponse.json({ error: 'Invalid event_type' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('external_events')
    .insert({
      user_id: user.id,
      title: body.title.trim(),
      event_type: body.event_type,
      starts_at: body.starts_at,
      ends_at: body.ends_at ?? null,
      location: body.location ?? null,
      notes: body.notes ?? null,
      color_hex: body.color_hex ?? null,
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, id: data?.id }, { status: 201 })
}
