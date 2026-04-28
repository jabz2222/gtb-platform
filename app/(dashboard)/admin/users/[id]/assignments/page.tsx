import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireRole } from '@/lib/auth/requireRole'
import { createClient } from '@/lib/supabase/server'
import AssignmentManager from '@/components/admin/AssignmentManager'

export const metadata: Metadata = { title: 'Manage assignments · Admin' }

interface Props { params: Promise<{ id: string }> }

const COACH_ROLES = ['admin', 'staff', 'mentor']

export default async function ManageAssignmentsPage({ params }: Props) {
  await requireRole(['admin'])
  const { id: staffId } = await params

  const supabase = await createClient()

  const { data: staff } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, head_coach_for_division_id')
    .eq('id', staffId)
    .single()

  if (!staff || !COACH_ROLES.includes(staff.role)) notFound()

  const [{ data: assigned }, { data: candidates }, { data: divisions }] = await Promise.all([
    // Active assignments for this staff member.
    supabase
      .from('client_assignments')
      .select(`
        staff_id, client_id, division_id, assigned_at, is_active,
        client:profiles!client_assignments_client_id_fkey(id, full_name, email, role),
        division:divisions(id, name, color_hex)
      `)
      .eq('staff_id', staffId)
      .eq('is_active', true),
    // All player profiles (we filter on the client).
    supabase
      .from('profiles')
      .select('id, full_name, email, role')
      .in('role', ['client', 'minor'])
      .is('deleted_at', null)
      .order('full_name')
      .limit(200),
    supabase
      .from('divisions')
      .select('id, slug, name, color_hex')
      .eq('is_active', true)
      .order('name'),
  ])

  // Normalise: assigned[i].client/division come back as either {} or [{}] depending on FK shape.
  const assignedNormalised = (assigned ?? []).map(a => ({
    client_id: a.client_id,
    division_id: a.division_id,
    assigned_at: a.assigned_at,
    client: Array.isArray(a.client) ? a.client[0] : a.client,
    division: Array.isArray(a.division) ? a.division[0] : a.division,
  }))

  const assignedClientIds = new Set(assignedNormalised.map(a => a.client_id))
  const candidatesFiltered = (candidates ?? []).filter(c => !assignedClientIds.has(c.id))

  return (
    <div>
      <div className="mb-8">
        <p className="text-[#C9A84C] text-[11px] tracking-[0.3em] uppercase mb-2">Admin · Assignments</p>
        <h1
          className="text-4xl font-black tracking-wider text-white uppercase"
          style={{ fontFamily: "'Arial Black', sans-serif" }}
        >
          <span style={{ color: '#C9A84C' }}>{staff.full_name?.split(' ')[0] ?? staff.role}</span>&apos;s Participants
        </h1>
        <p className="text-[#444] mt-1.5 text-sm">
          {staff.full_name} · {staff.email} · <span className="capitalize">{staff.role}</span>
        </p>
        <Link
          href={`/admin/users/${staffId}`}
          className="inline-block mt-3 text-xs text-[#C9A84C] hover:underline tracking-wider uppercase"
        >
          ← Back to user
        </Link>
      </div>

      <AssignmentManager
        staffId={staffId}
        assigned={assignedNormalised as Parameters<typeof AssignmentManager>[0]['assigned']}
        candidates={candidatesFiltered}
        divisions={divisions ?? []}
      />
    </div>
  )
}
