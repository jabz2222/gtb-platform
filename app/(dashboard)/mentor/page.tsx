import { requireRole } from '@/lib/auth/requireRole'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatDate, formatTime } from '@/lib/utils/formatters'

export default async function MentorHomePage() {
  const { user } = await requireRole(['admin', 'mentor'])
  const supabase = await createClient()

  const now = new Date()

  const [assignmentsRes, sessionsRes] = await Promise.all([
    supabase
      .from('client_assignments')
      .select('*, profiles!client_id(id, full_name, email)')
      .eq('staff_id', user.id),
    supabase
      .from('bookings')
      .select('id, starts_at, ends_at, profiles!bookings_client_id_fkey(full_name)')
      .eq('staff_id', user.id)
      .gte('starts_at', now.toISOString())
      .order('starts_at', { ascending: true })
      .limit(5),
  ])

  const mentees = (assignmentsRes.data ?? []).map((a: {
    profiles: { id: string; full_name: string; email: string } | null
  }) => a.profiles).filter(Boolean)
  const upcomingSessions = sessionsRes.data ?? []
  const name = user.user_metadata?.full_name ?? 'Mentor'

  return (
    <div>
      <div className="mb-8">
        <p className="text-[#9B2454] text-[11px] tracking-[0.3em] uppercase mb-2">Mentor</p>
        <h1
          className="text-4xl font-black tracking-wider text-white uppercase"
          style={{ fontFamily: "'Arial Black', sans-serif" }}
        >
          Welcome, <span style={{ color: '#9B2454' }}>{name.split(' ')[0]}</span>
        </h1>
        <p className="text-[#444] mt-1.5 text-sm">Your mentoring dashboard</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {[
          { label: 'Mentees', value: mentees.length, color: '#9B2454' },
          { label: 'Upcoming Sessions', value: upcomingSessions.length, color: '#C9A84C' },
        ].map(s => (
          <div key={s.label} className="bg-[#0D0D0D] border border-white/5 rounded-sm p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: s.color }} />
            <p className="text-[11px] text-[#444] uppercase tracking-wider mb-1">{s.label}</p>
            <p
              className="text-3xl font-black text-white"
              style={{ fontFamily: "'Arial Black', sans-serif" }}
            >
              {s.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming sessions */}
        <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">Upcoming Sessions</span>
            <Link href="/mentor/sessions" className="text-[11px] text-[#444] hover:text-[#C9A84C] transition-colors uppercase tracking-wider">
              View all →
            </Link>
          </div>
          {upcomingSessions.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-[#444] text-sm">No upcoming sessions</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {(upcomingSessions as unknown as { id: string; starts_at: string; ends_at: string; profiles: { full_name: string } | { full_name: string }[] | null }[]).map(s => {
                const prof = Array.isArray(s.profiles) ? s.profiles[0] : s.profiles
                return (
                  <div key={s.id} className="px-5 py-3.5">
                    <p className="text-sm font-medium text-white">{prof?.full_name ?? 'Unknown'}</p>
                    <p className="text-[11px] text-[#444] mt-0.5">
                      {formatDate(s.starts_at)} · {formatTime(s.starts_at)}–{formatTime(s.ends_at)}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Mentees quick list */}
        <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">Your Mentees</span>
            <Link href="/mentor/mentees" className="text-[11px] text-[#444] hover:text-[#C9A84C] transition-colors uppercase tracking-wider">
              View all →
            </Link>
          </div>
          {mentees.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-[#444] text-sm">No mentees assigned yet</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {mentees.slice(0, 5).map(m => {
                if (!m) return null
                return (
                  <div key={m.id} className="px-5 py-3.5 flex items-center gap-3">
                    <div
                      className="w-7 h-7 rounded-sm flex items-center justify-center text-[10px] font-black flex-shrink-0"
                      style={{ backgroundColor: '#9B245420', color: '#9B2454', fontFamily: "'Arial Black', sans-serif" }}
                    >
                      {m.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white">{m.full_name}</p>
                      <p className="text-[11px] text-[#444]">{m.email}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
