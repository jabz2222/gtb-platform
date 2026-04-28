import { requireRole } from '@/lib/auth/requireRole'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import CPDLogForm from '@/components/coach/CPDLogForm'

const ACTIVITY_COLORS: Record<string, string> = {
  course:      '#CC2222',
  shadowing:   '#9B2454',
  webinar:     '#5BB8E8',
  workshop:    '#C9A84C',
  reading:     '#2E8B35',
  peer_review: '#E8641A',
  other:       '#444',
}

export default async function CPDLogPage() {
  const { user } = await requireRole(['admin', 'staff', 'mentor', 'educator'])
  const supabase = await createClient()

  const { data: entries } = await supabase
    .from('cpd_log')
    .select('*')
    .eq('coach_id', user.id)
    .order('activity_date', { ascending: false })

  const totalHours = (entries ?? []).reduce((sum, e) => sum + Number(e.hours), 0)

  // Group by type for summary
  const byType: Record<string, number> = {}
  for (const e of (entries ?? [])) {
    byType[e.activity_type] = (byType[e.activity_type] ?? 0) + Number(e.hours)
  }

  return (
    <div>
      <Link href="/staff/cdp" className="text-xs text-[#444] hover:text-white uppercase tracking-wider mb-6 inline-block transition-colors">
        ← Coach Portfolio
      </Link>

      <div className="mb-8">
        <p className="text-[#9B2454] text-[11px] tracking-[0.3em] uppercase mb-2">Continuing Professional Development</p>
        <h1
          className="text-4xl font-black tracking-wider text-white uppercase"
          style={{ fontFamily: "'Arial Black', sans-serif" }}
        >
          CPD <span style={{ color: '#9B2454' }}>Log</span>
        </h1>
        <p className="text-[#444] mt-1.5 text-sm">Record and track your professional development activities</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#0D0D0D] border border-white/5 rounded-sm p-5">
          <p className="text-[11px] tracking-[0.3em] uppercase text-[#444] mb-2">Total Hours</p>
          <p className="text-3xl font-black text-[#9B2454]" style={{ fontFamily: "'Arial Black', sans-serif" }}>
            {totalHours.toFixed(1)}
          </p>
        </div>
        <div className="bg-[#0D0D0D] border border-white/5 rounded-sm p-5">
          <p className="text-[11px] tracking-[0.3em] uppercase text-[#444] mb-2">Activities</p>
          <p className="text-3xl font-black text-white" style={{ fontFamily: "'Arial Black', sans-serif" }}>
            {(entries ?? []).length}
          </p>
        </div>
        <div className="bg-[#0D0D0D] border border-white/5 rounded-sm p-5">
          <p className="text-[11px] tracking-[0.3em] uppercase text-[#444] mb-2">Verified</p>
          <p className="text-3xl font-black text-[#2E8B35]" style={{ fontFamily: "'Arial Black', sans-serif" }}>
            {(entries ?? []).filter(e => e.verified_at).length}
          </p>
        </div>
        <div className="bg-[#0D0D0D] border border-white/5 rounded-sm p-5">
          <p className="text-[11px] tracking-[0.3em] uppercase text-[#444] mb-2">This Year</p>
          <p className="text-3xl font-black text-white" style={{ fontFamily: "'Arial Black', sans-serif" }}>
            {(entries ?? []).filter(e => new Date(e.activity_date).getFullYear() === new Date().getFullYear()).reduce((s, e) => s + Number(e.hours), 0).toFixed(1)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Log form */}
        <div className="lg:col-span-2">
          <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5">
              <span className="text-[11px] tracking-[0.3em] uppercase text-[#9B2454]">Log New Activity</span>
            </div>
            <div className="p-5">
              <CPDLogForm coachId={user.id} />
            </div>
          </div>
        </div>

        {/* Hours by type */}
        <div className="space-y-4">
          <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5">
              <span className="text-[11px] tracking-[0.3em] uppercase text-[#9B2454]">Hours by Type</span>
            </div>
            <div className="p-4 space-y-3">
              {Object.entries(byType).sort((a, b) => b[1] - a[1]).map(([type, hrs]) => (
                <div key={type}>
                  <div className="flex justify-between mb-1">
                    <span className="text-[11px] text-[#555] capitalize">{type.replace(/_/g, ' ')}</span>
                    <span className="text-[11px] text-white">{hrs.toFixed(1)}h</span>
                  </div>
                  <div className="w-full bg-[#1A1A1A] rounded-full h-1">
                    <div
                      className="h-1 rounded-full"
                      style={{
                        width: `${(hrs / totalHours) * 100}%`,
                        backgroundColor: ACTIVITY_COLORS[type] ?? '#444',
                      }}
                    />
                  </div>
                </div>
              ))}
              {Object.keys(byType).length === 0 && (
                <p className="text-[#333] text-xs text-center py-4">No activities yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent entries */}
      {(entries ?? []).length > 0 && (
        <div className="mt-6 bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <span className="text-[11px] tracking-[0.3em] uppercase text-[#9B2454]">Activity History</span>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {(entries ?? []).slice(0, 20).map(entry => (
              <div key={entry.id} className="px-5 py-4 flex items-start gap-4">
                <div
                  className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                  style={{ backgroundColor: ACTIVITY_COLORS[entry.activity_type] ?? '#444' }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">{entry.title}</p>
                  <p className="text-[11px] text-[#444] mt-0.5 capitalize">
                    {entry.activity_type.replace(/_/g, ' ')}
                    {entry.provider ? ` · ${entry.provider}` : ''}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm text-[#9B2454] font-medium">{Number(entry.hours).toFixed(1)}h</p>
                  <p className="text-[10px] text-[#333] mt-0.5">
                    {new Date(entry.activity_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </p>
                  {entry.verified_at && (
                    <p className="text-[10px] text-[#2E8B35] mt-0.5">Verified ✓</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
