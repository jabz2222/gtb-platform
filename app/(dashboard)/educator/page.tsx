import { requireRole } from '@/lib/auth/requireRole'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatDate, formatTime } from '@/lib/utils/formatters'

export default async function EducatorHomePage() {
  const { user } = await requireRole(['admin', 'educator'])
  const supabase = await createClient()

  const now = new Date()

  const [contentRes, progressRes, liveRes] = await Promise.all([
    supabase
      .from('education_content')
      .select('id, title, tier_id, content_type')
      .eq('created_by', user.id),
    supabase
      .from('education_progress')
      .select('id, completed_at')
      .not('completed_at', 'is', null),
    supabase
      .from('bookings')
      .select('id, starts_at, ends_at, booking_type')
      .eq('staff_id', user.id)
      .eq('booking_type', 'group_public')
      .gte('starts_at', now.toISOString())
      .order('starts_at', { ascending: true })
      .limit(3),
  ])

  const content = contentRes.data ?? []
  const completions = progressRes.data ?? []
  const liveSessions = liveRes.data ?? []
  const name = user.user_metadata?.full_name ?? 'Educator'

  return (
    <div>
      <div className="mb-8">
        <p className="text-[#CC2222] text-[11px] tracking-[0.3em] uppercase mb-2">Educator</p>
        <h1
          className="text-4xl font-black tracking-wider text-white uppercase"
          style={{ fontFamily: "'Arial Black', sans-serif" }}
        >
          Welcome, <span style={{ color: '#CC2222' }}>{name.split(' ')[0]}</span>
        </h1>
        <p className="text-[#444] mt-1.5 text-sm">Your educator dashboard</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Content Modules', value: content.length, color: '#CC2222' },
          { label: 'Total Completions', value: completions.length, color: '#C9A84C' },
          { label: 'Live Sessions', value: liveSessions.length, color: '#2E8B35' },
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
        {/* Content overview */}
        <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">My Content</span>
            <Link href="/educator/content" className="text-[11px] text-[#444] hover:text-[#C9A84C] transition-colors uppercase tracking-wider">
              Manage →
            </Link>
          </div>
          {content.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-[#444] text-sm mb-2">No content uploaded yet</p>
              <Link href="/educator/content" className="text-[11px] text-[#C9A84C] hover:underline uppercase tracking-wider">
                Upload first module →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {content.slice(0, 5).map((c: { id: string; title: string; tier_id: string; content_type: string }) => (
                <div key={c.id} className="px-5 py-3.5 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{c.title}</p>
                    <p className="text-[11px] text-[#444] capitalize mt-0.5">
                      {c.content_type} · Tier {c.tier_id ?? '—'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming live sessions */}
        <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">Upcoming Live Sessions</span>
            <Link href="/educator/live-sessions" className="text-[11px] text-[#444] hover:text-[#C9A84C] transition-colors uppercase tracking-wider">
              View all →
            </Link>
          </div>
          {liveSessions.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-[#444] text-sm mb-2">No upcoming live sessions</p>
              <Link href="/educator/live-sessions" className="text-[11px] text-[#C9A84C] hover:underline uppercase tracking-wider">
                Schedule a session →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {liveSessions.map((s: { id: string; starts_at: string; ends_at: string }) => (
                <div key={s.id} className="px-5 py-3.5">
                  <p className="text-sm text-white">Live Education Session</p>
                  <p className="text-[11px] text-[#444] mt-0.5">
                    {formatDate(s.starts_at)} · {formatTime(s.starts_at)}–{formatTime(s.ends_at)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
