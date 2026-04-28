import { requireRole } from '@/lib/auth/requireRole'
import { createClient } from '@/lib/supabase/server'
import StaffAvailabilityForm from '@/components/staff/StaffAvailabilityForm'

export default async function AvailabilityPage() {
  const { user } = await requireRole(['admin', 'staff'])
  const supabase = await createClient()

  const { data: slots } = await supabase
    .from('staff_availability')
    .select('*')
    .eq('staff_id', user.id)
    .eq('is_active', true)
    .order('day_of_week')

  const weeklySlots = slots?.filter(s => s.day_of_week !== null) ?? []
  const specificSlots = slots?.filter(s => s.specific_date !== null) ?? []

  return (
    <div>
      <div className="mb-10">
        <p className="text-[#C9A84C] text-[11px] tracking-[0.3em] uppercase mb-2">Staff</p>
        <h1 className="text-4xl font-black tracking-wider text-white uppercase"
            style={{ fontFamily: "'Arial Black', sans-serif" }}>
          My <span style={{ color: '#C9A84C' }}>Availability</span>
        </h1>
        <p className="text-[#444] mt-1.5 text-sm">Set when clients can book sessions with you</p>
      </div>

      <StaffAvailabilityForm
        staffId={user.id}
        initialWeeklySlots={weeklySlots}
        initialSpecificSlots={specificSlots}
      />
    </div>
  )
}
