import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface Params { params: Promise<{ id: string }> }

const COACH_ROLES = ['admin', 'staff', 'mentor']

async function authoriseCoach(playerId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, status: 401, error: 'Unauthorised' }
  const role = user.user_metadata?.role
  if (!COACH_ROLES.includes(role)) {
    return { ok: false as const, status: 403, error: 'Forbidden' }
  }

  // admin sees all; otherwise verify assignment.
  if (role !== 'admin') {
    const { data: assignment } = await supabase
      .from('client_assignments')
      .select('staff_id, client_id')
      .eq('staff_id', user.id)
      .eq('client_id', playerId)
      .eq('is_active', true)
      .maybeSingle()
    if (!assignment) {
      // Head Coach access via division
      if (role === 'staff') {
        const { data: me } = await supabase
          .from('profiles')
          .select('head_coach_for_division_id')
          .eq('id', user.id)
          .single()
        if (me?.head_coach_for_division_id) {
          const { data: shares } = await supabase
            .from('user_divisions')
            .select('user_id')
            .eq('user_id', playerId)
            .eq('division_id', me.head_coach_for_division_id)
            .maybeSingle()
          if (shares) return { ok: true as const, supabase, user, role }
        }
      }
      return { ok: false as const, status: 403, error: 'Not assigned to this player' }
    }
  }
  return { ok: true as const, supabase, user, role }
}

export async function POST(request: Request, { params }: Params) {
  const { id: playerId } = await params
  const auth = await authoriseCoach(playerId)
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  let body: { division_id?: string | null; metrics?: Record<string, number>; notes?: string | null; booking_id?: string | null }
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const metrics = body.metrics ?? {}
  if (typeof metrics !== 'object' || Array.isArray(metrics)) {
    return NextResponse.json({ error: 'metrics must be an object' }, { status: 400 })
  }

  const { data, error } = await auth.supabase
    .from('performance_entries')
    .insert({
      player_id: playerId,
      booking_id: body.booking_id ?? null,
      division_id: body.division_id ?? null,
      recorded_by: auth.user.id,
      metrics,
      notes: body.notes ?? null,
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, id: data?.id })
}
