import { requireRole } from '@/lib/auth/requireRole'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatDate, formatTime } from '@/lib/utils/formatters'
import StatusBadge from '@/components/ui/StatusBadge'

export default async function StaffSessionsPage() {
  const { user } = await requireRole(['admin', 'staff'])
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

  return (
    <div>
      <div className="mb-8">
        <p className="text-[#C9A84C] text-[11px] tracking-[0.3em] uppercase mb-2">Staff</p>
        <h1
          className="text-4xl font-black tracking-wider text-white uppercase"
          style={{ fontFamily: "'Arial Black', sans-serif" }}
        >
          My <span style={{ color: '#C9A84C' }}>Sessions</span>
        </h1>
        <p className="text-[#444] mt-1.5 text-sm">
          {upcoming.length} upcoming · {past.length} past
        </p>
      </div>

      {/* Upcoming */}
      <div className="mb-6">
        <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">Upcoming Sessions</span>
          </div>
          {upcoming.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-[#444] text-sm">No upcoming sessions</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {upcoming.map((session: {
                id: string
                starts_at: string
                ends_at: string
                booking_type: string
                status: string
                profiles: { full_name: string; email: string } | null
              }) => (
                <Link
                  key={session.id}
                  href={`/staff/sessions/${session.id}`}
                  className="px-5 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">
                      {session.profiles?.full_name ?? 'Unknown Client'}
                    </p>
                    <p className="text-[11px] text-[#444] mt-0.5">
                      {formatDate(session.starts_at)} · {formatTime(session.starts_at)}–{formatTime(session.ends_at)}
                    </p>
                    <p className="text-[11px] text-[#333] mt-0.5 capitalize">
                      {session.booking_type.replace(/_/g, ' ')}
                    </p>
                  </div>
                  <StatusBadge variant={session.status} />
                  <svg className="w-4 h-4 text-[#333] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Past */}
      <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5">
          <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">Past Sessions</span>
        </div>
        {past.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-[#444] text-sm">No past sessions</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {past.slice(0, 20).map((session: {
              id: string
              starts_at: string
              ends_at: string
              booking_type: string
              status: string
              profiles: { full_name: string } | null
            }) => (
              <Link
                key={session.id}
                href={`/staff/sessions/${session.id}`}
                className="px-5 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors opacity-60"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">{session.profiles?.full_name ?? 'Unknown Client'}</p>
                  <p className="text-[11px] text-[#444] mt-0.5">
                    {formatDate(session.starts_at)} · {formatTime(session.starts_at)}
                  </p>
                </div>
                <StatusBadge variant={session.status} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
