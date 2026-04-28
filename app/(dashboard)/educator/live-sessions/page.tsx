import { requireRole } from '@/lib/auth/requireRole'
import { createClient } from '@/lib/supabase/server'
import EducatorLiveSessions from '@/components/educator/EducatorLiveSessions'

export default async function LiveSessionsPage() {
  const { user } = await requireRole(['admin', 'educator'])
  const supabase = await createClient()

  const { data: sessions } = await supabase
    .from('group_classes')
    .select('*')
    .order('starts_at', { ascending: true })

  const { data: tiers } = await supabase
    .from('tiers')
    .select('id, name')
    .order('id')

  return (
    <div>
      <div className="mb-8">
        <p className="text-[#CC2222] text-[11px] tracking-[0.3em] uppercase mb-2">Educator</p>
        <h1
          className="text-4xl font-black tracking-wider text-white uppercase"
          style={{ fontFamily: "'Arial Black', sans-serif" }}
        >
          Live <span style={{ color: '#CC2222' }}>Sessions</span>
        </h1>
        <p className="text-[#444] mt-1.5 text-sm">Schedule and manage live educational sessions</p>
      </div>

      <EducatorLiveSessions sessions={sessions ?? []} tiers={tiers ?? []} educatorId={user.id} />
    </div>
  )
}
