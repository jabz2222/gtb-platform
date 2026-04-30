import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { adminClient } from '@/lib/supabase/admin'

// Admin can create any role from the panel. Self-signup remains player+parent only.
const ALLOWED_ROLES = ['admin', 'staff', 'mentor', 'educator', 'client', 'minor', 'parent'] as const
type AllowedRole = (typeof ALLOWED_ROLES)[number]

interface CreateUserBody {
  email: string
  password: string
  full_name: string
  role: AllowedRole
  division_ids?: string[]
  head_coach_for_division_id?: string | null
}

export async function POST(request: Request) {
  // Auth: only admins may create staff users
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }
  if (user.user_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Validate body
  let body: CreateUserBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { email, password, full_name, role, division_ids, head_coach_for_division_id } = body

  if (!email || !password || !full_name || !role) {
    return NextResponse.json(
      { error: 'email, password, full_name, and role are required' },
      { status: 400 }
    )
  }
  if (!ALLOWED_ROLES.includes(role)) {
    return NextResponse.json(
      { error: `role must be one of: ${ALLOWED_ROLES.join(', ')}` },
      { status: 400 }
    )
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
  }

  // Create the auth user. email_confirm: true skips the email-verification step
  // because admins are creating these accounts on behalf of staff.
  // The handle_new_user trigger creates the profiles row automatically.
  const { data: created, error: createErr } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name, role },
  })

  if (createErr || !created.user) {
    return NextResponse.json(
      { error: createErr?.message ?? 'Failed to create user' },
      { status: 500 }
    )
  }

  const userId = created.user.id

  // Optional: assign division memberships.
  // Coach roles → staff_divisions ; Player/Parent roles → user_divisions.
  const isCoachRole = role === 'admin' || role === 'staff' || role === 'mentor' || role === 'educator'
  if (division_ids?.length) {
    if (isCoachRole) {
      const rows = division_ids.map((division_id, i) => ({
        staff_id: userId,
        division_id,
        is_primary: i === 0,
      }))
      const { error: divErr } = await adminClient.from('staff_divisions').insert(rows)
      if (divErr) {
        return NextResponse.json(
          { id: userId, warning: `User created, but division assignment failed: ${divErr.message}` },
          { status: 201 }
        )
      }
    } else {
      const rows = division_ids.map(division_id => ({
        user_id: userId,
        division_id,
      }))
      const { error: divErr } = await adminClient.from('user_divisions').insert(rows)
      if (divErr) {
        return NextResponse.json(
          { id: userId, warning: `User created, but division enrolment failed: ${divErr.message}` },
          { status: 201 }
        )
      }
    }
  }

  // Optional: head-coach division-wide access tier.
  if (head_coach_for_division_id) {
    const { error: headErr } = await adminClient
      .from('profiles')
      .update({ head_coach_for_division_id })
      .eq('id', userId)
    if (headErr) {
      return NextResponse.json(
        {
          id: userId,
          warning: `User created, but setting head-coach flag failed: ${headErr.message}`,
        },
        { status: 201 }
      )
    }
  }

  return NextResponse.json({ id: userId, email }, { status: 201 })
}
