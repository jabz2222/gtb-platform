import { requireRole } from '@/lib/auth/requireRole'
import { createClient } from '@/lib/supabase/server'
import InquiriesPanel from '@/components/staff/InquiriesPanel'

export default async function StaffInquiriesPage() {
  const { user } = await requireRole(['admin', 'staff'])
  const supabase = await createClient()

  const { data: inquiries } = await supabase
    .from('session_inquiries')
    .select(`
      id, session_type, requested_slot, status, player_notes, created_at, class_id,
      player:profiles!session_inquiries_player_id_fkey(id, full_name, email),
      group_class:group_classes!session_inquiries_class_id_fkey(title, start_time, end_time)
    `)
    .eq('coach_id', user.id)
    .in('status', ['parent_approved', 'pending_coach'])
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8">
      <div>
        <h1
          className="text-2xl font-black text-white uppercase tracking-wide mb-1"
          style={{ fontFamily: "'Arial Black', sans-serif" }}
        >
          Session Inquiries
        </h1>
        <p className="text-sm text-[#444]">
          Parent-approved requests awaiting your confirmation
        </p>
      </div>

      <InquiriesPanel inquiries={inquiries ?? []} coachId={user.id} />
    </div>
  )
}
