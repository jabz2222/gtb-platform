import { requireRole } from '@/lib/auth/requireRole'
import { createClient } from '@/lib/supabase/server'
import { formatDate, formatTime } from '@/lib/utils/formatters'
import StatusBadge from '@/components/ui/StatusBadge'

export default async function MentorSessionsPage() {
  const { user } = await requireRole(['admin', 'mentor'])
  const supabase = await createClient()

  const { data: sessions } = await supabase
    .from('bookings')
    .select('*, profiles!client_id(full_name, email)')
    .eq('staff_id', user.id)
    .order('starts_at', { ascending: false })
    .limit(50)

  const now = new Date()
  const upcoming = (sessions ?? []).filter((s: { starts_at: string }) => new Date(s.starts_at) >= now)
  const past = (sessions ?? []).filter((s: { starts_at: string }) => new Date(s.starts_at) < now)

  function SessionRow({ s, dim = false }: {
    s: { id: string; starts_at: string; ends_at: string; status: string; profiles: { full_name: string } | null }
    dim?: boolean
  }) {
    return (
      <div className={`px-5 py-4 flex items-center gap-4 ${dim ? 'opacity-60' : ''}`}>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white">{s.profiles?.full_name ?? 'Unknown'}</p>
          <p className="text-[11px] text-[#444] mt-0.5">
            {formatDate(s.starts_at)} · {formatTime(s.starts_at)}–{formatTime(s.ends_at)}
          </p>
        </div>
        <StatusBadge variant={s.status} />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-[#9B2454] text-[11px] tracking-[0.3em] uppercase mb-2">Mentor</p>
        <h1
          className="text-4xl font-black tracking-wider text-white uppercase"
          style={{ fontFamily: "'Arial Black', sans-serif" }}
        >
          My <span style={{ color: '#9B2454' }}>Sessions</span>
        </h1>
        <p className="text-[#444] mt-1.5 text-sm">
          {upcoming.length} upcoming · {past.length} past
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">Upcoming</span>
          </div>
          {upcoming.length === 0 ? (
            <div className="p-8 text-center"><p className="text-[#444] text-sm">No upcoming sessions</p></div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {upcoming.map(s => <SessionRow key={s.id} s={s} />)}
            </div>
          )}
        </div>

        <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">Past</span>
          </div>
          {past.length === 0 ? (
            <div className="p-8 text-center"><p className="text-[#444] text-sm">No past sessions</p></div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {past.slice(0, 20).map(s => <SessionRow key={s.id} s={s} dim />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
