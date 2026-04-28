import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { adminClient } from '@/lib/supabase/admin'

interface Params { params: Promise<{ id: string }> }

const COACH_ROLES = ['admin', 'staff', 'mentor']

export async function POST(request: Request, { params }: Params) {
  const { id: playerId } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const role = user.user_metadata?.role
  if (!COACH_ROLES.includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // admin: allowed; others must have active assignment OR head-coach division
  if (role !== 'admin') {
    const { data: assignment } = await supabase
      .from('client_assignments')
      .select('staff_id, client_id')
      .eq('staff_id', user.id)
      .eq('client_id', playerId)
      .eq('is_active', true)
      .maybeSingle()
    if (!assignment) {
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
          if (!shares) {
            return NextResponse.json({ error: 'Not assigned to this player' }, { status: 403 })
          }
        } else {
          return NextResponse.json({ error: 'Not assigned to this player' }, { status: 403 })
        }
      } else {
        return NextResponse.json({ error: 'Not assigned to this player' }, { status: 403 })
      }
    }
  }

  let body: {
    week_start?: string
    area?: string
    target?: string
    actions?: string
    evidence?: string
    challenges?: string
    learnings?: string
    next_step?: string
    status_colour?: string
  }
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  if (!body.target && !body.actions && !body.evidence && !body.learnings && !body.next_step) {
    return NextResponse.json(
      { error: 'At least one of target/actions/evidence/learnings/next_step is required' },
      { status: 400 }
    )
  }

  // pdp_reflections RLS only permits the player themselves to insert. Coach
  // authorisation has already been validated above, so write via the
  // service-role admin client. (RLS will be properly extended for coach/parent
  // visibility in the division-RLS migration milestone.)
  const { data, error } = await adminClient
    .from('pdp_reflections')
    .insert({
      player_id: playerId,
      week_start: body.week_start ?? new Date().toISOString().slice(0, 10),
      area: body.area ?? null,
      target: body.target ?? null,
      actions: body.actions ?? null,
      evidence: body.evidence ?? null,
      challenges: body.challenges ?? null,
      learnings: body.learnings ?? null,
      next_step: body.next_step ?? null,
      status_colour: body.status_colour ?? null,
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, id: data?.id })
}
