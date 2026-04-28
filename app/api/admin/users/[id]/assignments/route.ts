import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { adminClient } from '@/lib/supabase/admin'

interface Params { params: Promise<{ id: string }> }

async function authoriseAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, status: 401, error: 'Unauthorised' }
  if (user.user_metadata?.role !== 'admin') return { ok: false as const, status: 403, error: 'Forbidden' }
  return { ok: true as const, user }
}

const COACH_ROLES = ['admin', 'staff', 'mentor'] as const

export async function POST(request: Request, { params }: Params) {
  const auth = await authoriseAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { id: staffId } = await params
  let body: { client_id?: string; division_id?: string | null }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const { client_id, division_id } = body
  if (!client_id) return NextResponse.json({ error: 'client_id is required' }, { status: 400 })

  // Verify staff is a coach role.
  const { data: staff } = await adminClient
    .from('profiles')
    .select('id, role')
    .eq('id', staffId)
    .single()
  if (!staff) return NextResponse.json({ error: 'Staff profile not found' }, { status: 404 })
  if (!COACH_ROLES.includes(staff.role as (typeof COACH_ROLES)[number])) {
    return NextResponse.json({ error: 'Target user is not a coach role' }, { status: 400 })
  }

  // Verify client is a player.
  const { data: client } = await adminClient
    .from('profiles')
    .select('id, role')
    .eq('id', client_id)
    .single()
  if (!client) return NextResponse.json({ error: 'Client profile not found' }, { status: 404 })
  if (client.role !== 'client' && client.role !== 'minor') {
    return NextResponse.json({ error: 'Target user is not a player' }, { status: 400 })
  }

  // Upsert: re-activate an existing inactive row, or insert a new one.
  const { data: existing } = await adminClient
    .from('client_assignments')
    .select('staff_id, client_id, is_active')
    .eq('staff_id', staffId)
    .eq('client_id', client_id)
    .maybeSingle()

  if (existing) {
    if (existing.is_active) {
      return NextResponse.json({ error: 'Already assigned' }, { status: 409 })
    }
    const { error } = await adminClient
      .from('client_assignments')
      .update({ is_active: true, division_id: division_id ?? null, assigned_at: new Date().toISOString() })
      .eq('staff_id', staffId)
      .eq('client_id', client_id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, reactivated: true })
  }

  const { error } = await adminClient.from('client_assignments').insert({
    staff_id: staffId,
    client_id,
    division_id: division_id ?? null,
    is_active: true,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request, { params }: Params) {
  const auth = await authoriseAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { id: staffId } = await params
  const { searchParams } = new URL(request.url)
  const clientId = searchParams.get('client_id')
  if (!clientId) return NextResponse.json({ error: 'client_id is required' }, { status: 400 })

  // Soft remove by flipping is_active=false (preserves audit history).
  const { error } = await adminClient
    .from('client_assignments')
    .update({ is_active: false })
    .eq('staff_id', staffId)
    .eq('client_id', clientId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
