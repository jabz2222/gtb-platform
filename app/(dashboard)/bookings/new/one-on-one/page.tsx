import OneOnOneWizard from '@/components/booking/OneOnOneWizard'
import { requireAuth } from '@/lib/auth/requireRole'
import { createClient } from '@/lib/supabase/server'

export default async function OneOnOnePage() {
  const user = await requireAuth()
  const supabase = await createClient()

  const [staffRes, profileRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, role')
      .in('role', ['staff', 'mentor'])
      .is('deleted_at', null)
      .order('full_name'),
    supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single(),
  ])

  const isParent = user.user_metadata?.role === 'client' && !!(await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('parent_guardian_id', user.id)).count

  const onboardingFormSent = false // tracked via metadata if needed
  const clientName = profileRes.data?.full_name ?? user.user_metadata?.full_name

  return (
    <div>
      <div className="mb-8">
        <p className="text-[#C9A84C] text-[11px] tracking-[0.3em] uppercase mb-2">Bookings</p>
        <h1
          className="text-4xl font-black tracking-wider text-white uppercase"
          style={{ fontFamily: "'Arial Black', sans-serif" }}
        >
          Book <span style={{ color: '#C9A84C' }}>1-on-1</span> Session
        </h1>
        <p className="text-[#444] mt-1.5 text-sm">Select a coach and available time slot</p>
      </div>

      <OneOnOneWizard
        staff={staffRes.data ?? []}
        clientId={user.id}
        isParent={isParent}
        onboardingFormSent={onboardingFormSent}
        clientName={clientName}
      />
    </div>
  )
}
