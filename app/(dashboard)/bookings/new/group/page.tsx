import { requireAuth } from '@/lib/auth/requireRole'
import { createClient } from '@/lib/supabase/server'
import GroupBookingWizard from '@/components/booking/GroupBookingWizard'

export default async function GroupBookingPage() {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: classes } = await supabase
    .from('group_classes')
    .select('*, divisions(name, slug)')
    .gte('starts_at', new Date().toISOString())
    .order('starts_at', { ascending: true })
    .limit(30)

  return (
    <div>
      <div className="mb-8">
        <p className="text-[#C9A84C] text-[11px] tracking-[0.3em] uppercase mb-2">Bookings</p>
        <h1
          className="text-4xl font-black tracking-wider text-white uppercase"
          style={{ fontFamily: "'Arial Black', sans-serif" }}
        >
          Book <span style={{ color: '#C9A84C' }}>Group Class</span>
        </h1>
        <p className="text-[#444] mt-1.5 text-sm">Browse and join upcoming group sessions</p>
      </div>

      <GroupBookingWizard classes={classes ?? []} clientId={user.id} />
    </div>
  )
}
