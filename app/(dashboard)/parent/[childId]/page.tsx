import { createClient } from '@/lib/supabase/server'
import { formatDate, formatTime, formatGBP } from '@/lib/utils/formatters'
import StatusBadge from '@/components/ui/StatusBadge'

// Layout already verified the child belongs to this parent and rendered the header + tabs.
// This page just renders the Summary tab content.
export default async function ChildSummaryPage({ params }: { params: Promise<{ childId: string }> }) {
  const { childId } = await params
  const supabase = await createClient()

  const [bookingsRes, goalsRes] = await Promise.all([
    supabase
      .from('bookings')
      .select('*, divisions(name, slug)')
      .eq('client_id', childId)
      .order('starts_at', { ascending: false })
      .limit(10),
    supabase
      .from('goals')
      .select('*')
      .eq('player_id', childId)
      .eq('is_active', true)
      .limit(5),
  ])

  const bookings = bookingsRes.data ?? []
  const goals = goalsRes.data ?? []

  const DIVISION_COLORS: Record<string, string> = {
    football: '#5BB8E8', fitness: '#2E8B35', sports: '#E8641A',
    mentoring: '#9B2454', education: '#CC2222',
  }

  return (
    <>
      <div className="bg-[#0D0D0D] border border-[#C9A84C]/20 rounded-sm p-3 mb-6">
        <p className="text-[11px] text-[#555]">
          Read-only summary of your child&apos;s development. Use the tabs above for PDP, achievements, and calendar detail.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bookings */}
        <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">Recent Sessions</span>
          </div>
          {bookings.length === 0 ? (
            <div className="p-6 text-center"><p className="text-[#444] text-sm">No bookings</p></div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {bookings.slice(0, 5).map(b => {
                const divSlug = (b.divisions as { slug: string } | null)?.slug ?? 'football'
                const color = DIVISION_COLORS[divSlug] ?? '#C9A84C'
                return (
                  <div key={b.id} className="px-5 py-3.5 flex items-center gap-4">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-0.5" style={{ backgroundColor: color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white capitalize">{b.booking_type.replace(/_/g, ' ')}</p>
                      <p className="text-[11px] text-[#444] mt-0.5">
                        {formatDate(b.starts_at)} · {formatTime(b.starts_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-[#555]">{formatGBP(b.deposit_p ?? 0)}</span>
                      <StatusBadge variant={b.status} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Active goals */}
        <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">Active Goals</span>
          </div>
          {goals.length === 0 ? (
            <div className="p-6 text-center"><p className="text-[#444] text-sm">No active goals</p></div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {goals.map(g => {
                const pct = g.target_value
                  ? Math.min(100, Math.round((g.current_value / g.target_value) * 100))
                  : 0
                return (
                  <div key={g.id} className="px-5 py-4">
                    <div className="flex justify-between mb-1">
                      <p className="text-sm text-white">{g.title}</p>
                      <span className="text-[11px] text-[#444] capitalize">{g.category}</span>
                    </div>
                    {g.target_value != null && (
                      <>
                        <div className="w-full bg-[#1A1A1A] rounded-full h-1 mt-2">
                          <div
                            className="h-1 rounded-full bg-[#C9A84C] transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-[#444] mt-1">{pct}% complete</p>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
