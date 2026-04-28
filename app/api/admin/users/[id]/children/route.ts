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

export async function POST(request: Request, { params }: Params) {
  const auth = await authoriseAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { id: parentId } = await params
  let body: { child_id?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const childId = body.child_id
  if (!childId) return NextResponse.json({ error: 'child_id is required' }, { status: 400 })

  // Verify the target parent exists and has the right role.
  const { data: parent } = await adminClient
    .from('profiles')
    .select('id, role')
    .eq('id', parentId)
    .single()
  if (!parent) return NextResponse.json({ error: 'Parent profile not found' }, { status: 404 })
  if (parent.role !== 'parent') {
    return NextResponse.json({ error: 'Target user is not a parent' }, { status: 400 })
  }

  // Verify the child exists and is a player (client/minor).
  const { data: child } = await adminClient
    .from('profiles')
    .select('id, role, parent_guardian_id')
    .eq('id', childId)
    .single()
  if (!child) return NextResponse.json({ error: 'Child profile not found' }, { status: 404 })
  if (child.role !== 'client' && child.role !== 'minor') {
    return NextResponse.json({ error: 'Target user is not a player' }, { status: 400 })
  }
  if (child.parent_guardian_id && child.parent_guardian_id !== parentId) {
    return NextResponse.json(
      { error: 'Child is already linked to a different parent. Unlink first.' },
      { status: 409 }
    )
  }

  const { error } = await adminClient
    .from('profiles')
    .update({ parent_guardian_id: parentId })
    .eq('id', childId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, parent_id: parentId, child_id: childId })
}

export async function DELETE(request: Request, { params }: Params) {
  const auth = await authoriseAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { id: parentId } = await params
  const { searchParams } = new URL(request.url)
  const childId = searchParams.get('child_id')
  if (!childId) return NextResponse.json({ error: 'child_id is required' }, { status: 400 })

  // Only unlink if the link matches — defence in depth.
  const { error } = await adminClient
    .from('profiles')
    .update({ parent_guardian_id: null })
    .eq('id', childId)
    .eq('parent_guardian_id', parentId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
