import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { adminClient } from '@/lib/supabase/admin'

interface Params { params: Promise<{ id: string }> }

const COACH_ROLES = ['admin', 'staff', 'mentor']

const ALLOWED_SECTIONS = [
  'sc', 'mentorship', 'kpis', 'performance', 'match', 'technical', 'game-intelligence', 'feedback',
]

async function authoriseCoach(playerId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, status: 401, error: 'Unauthorised' }
  const role = user.user_metadata?.role
  if (!COACH_ROLES.includes(role)) return { ok: false as const, status: 403, error: 'Forbidden' }
  if (role === 'admin') return { ok: true as const, supabase, user }
  // mentor/staff need an active assignment
  const { data: assignment } = await supabase
    .from('client_assignments')
    .select('staff_id, client_id')
    .eq('staff_id', user.id)
    .eq('client_id', playerId)
    .eq('is_active', true)
    .maybeSingle()
  if (!assignment) return { ok: false as const, status: 403, error: 'Not assigned to this player' }
  return { ok: true as const, supabase, user }
}

export async function POST(request: Request, { params }: Params) {
  const { id: playerId } = await params
  const auth = await authoriseCoach(playerId)
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  let body: { sections?: string[] }
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const sections = (body.sections ?? []).filter(s => ALLOWED_SECTIONS.includes(s))

  const { error } = await adminClient
    .from('profiles')
    .update({ coach_activated_sections: sections })
    .eq('id', playerId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, sections })
}
