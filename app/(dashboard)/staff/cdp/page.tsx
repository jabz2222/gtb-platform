import { requireRole } from '@/lib/auth/requireRole'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

// Helper: get the Monday of the current week
function getWeekStart(date = new Date()): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d.toISOString().split('T')[0]
}

const STATUS_COLORS: Record<string, string> = {
  exceeding:       '#5BB8E8',
  on_track:        '#2E8B35',
  some_challenges: '#C9A84C',
  off_track:       '#CC2222',
}

function StatusDot({ status }: { status: string | null }) {
  if (!status) return <div className="w-2 h-2 rounded-full bg-[#1A1A1A]" />
  return <div className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[status] ?? '#555' }} />
}

export default async function CoachDPPage() {
  const { user } = await requireRole(['admin', 'staff', 'mentor', 'educator'])
  const supabase = await createClient()
  const weekStart = getWeekStart()

  const [baselineRes, thisWeekPlanRes, thisWeekReflectionRes, recentReflectionsRes, cpdRes, checkinsRes] = await Promise.all([
    // Latest baseline
    supabase
      .from('coach_baselines')
      .select('*')
      .eq('coach_id', user.id)
      .order('assessed_at', { ascending: false })
      .limit(1)
      .maybeSingle(),

    // This week's plan
    supabase
      .from('coach_weekly_plans')
      .select('*')
      .eq('coach_id', user.id)
      .eq('week_start', weekStart)
      .maybeSingle(),

    // This week's reflection
    supabase
      .from('coach_reflections')
      .select('*')
      .eq('coach_id', user.id)
      .eq('week_start', weekStart)
      .maybeSingle(),

    // Last 8 weeks of reflections (for streak/overview)
    supabase
      .from('coach_reflections')
      .select('week_start, overall_status')
      .eq('coach_id', user.id)
      .order('week_start', { ascending: false })
      .limit(8),

    // CPD summary
    supabase
      .from('cpd_log')
      .select('hours')
      .eq('coach_id', user.id),

    // Recent director check-ins
    supabase
      .from('director_checkins')
      .select('checkin_date, overall_status, strengths, targets')
      .eq('coach_id', user.id)
      .order('checkin_date', { ascending: false })
      .limit(3),
  ])

  const baseline = baselineRes.data
  const thisWeekPlan = thisWeekPlanRes.data
  const thisWeekReflection = thisWeekReflectionRes.data
  const recentReflections = recentReflectionsRes.data ?? []
  const totalCPDHours = (cpdRes.data ?? []).reduce((sum, r) => sum + Number(r.hours), 0)
  const checkins = checkinsRes.data ?? []

  const reflectionStreak = recentReflections.filter(r => r.overall_status).length

  // 4D average from baseline
  const fourD = baseline
    ? {
        depth: baseline.depth,
        delivery: baseline.delivery,
        direction: baseline.direction,
        development: baseline.development,
      }
    : null

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="text-[#9B2454] text-[11px] tracking-[0.3em] uppercase mb-2">Coach Development</p>
        <h1
          className="text-4xl font-black tracking-wider text-white uppercase"
          style={{ fontFamily: "'Arial Black', sans-serif" }}
        >
          My <span style={{ color: '#9B2454' }}>Portfolio</span>
        </h1>
        <p className="text-[#444] mt-1.5 text-sm">
          Track your coaching development through the GTB 4D Model and Five Intelligences framework
        </p>
      </div>

      {/* Quick-action cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link href="/staff/cdp/plan" className="bg-[#0D0D0D] border border-white/5 hover:border-white/10 rounded-sm p-4 transition-colors group">
          <p className="text-[11px] tracking-[0.25em] uppercase text-[#444] mb-2 group-hover:text-[#9B2454] transition-colors">This Week</p>
          <p className="text-lg font-black text-white uppercase" style={{ fontFamily: "'Arial Black', sans-serif" }}>
            {thisWeekPlan ? 'Edit Plan' : 'Write Plan'}
          </p>
          {thisWeekPlan
            ? <p className="text-[10px] text-[#2E8B35] mt-1">Plan saved ✓</p>
            : <p className="text-[10px] text-[#444] mt-1">Not yet written</p>
          }
        </Link>

        <Link href="/staff/cdp/reflect" className="bg-[#0D0D0D] border border-white/5 hover:border-white/10 rounded-sm p-4 transition-colors group">
          <p className="text-[11px] tracking-[0.25em] uppercase text-[#444] mb-2 group-hover:text-[#9B2454] transition-colors">Reflection</p>
          <p className="text-lg font-black text-white uppercase" style={{ fontFamily: "'Arial Black', sans-serif" }}>
            {thisWeekReflection ? 'Edit' : 'Reflect'}
          </p>
          {thisWeekReflection
            ? <div className="mt-1 flex items-center gap-1"><StatusDot status={thisWeekReflection.overall_status} /><p className="text-[10px] text-[#555] capitalize">{thisWeekReflection.overall_status?.replace(/_/g, ' ')}</p></div>
            : <p className="text-[10px] text-[#444] mt-1">This week pending</p>
          }
        </Link>

        <Link href="/staff/cdp/cpd" className="bg-[#0D0D0D] border border-white/5 hover:border-white/10 rounded-sm p-4 transition-colors group">
          <p className="text-[11px] tracking-[0.25em] uppercase text-[#444] mb-2 group-hover:text-[#9B2454] transition-colors">CPD Hours</p>
          <p className="text-3xl font-black text-[#9B2454]" style={{ fontFamily: "'Arial Black', sans-serif" }}>
            {totalCPDHours.toFixed(1)}
          </p>
          <p className="text-[10px] text-[#444] mt-1">total logged</p>
        </Link>

        <Link href="/staff/cdp/baseline" className="bg-[#0D0D0D] border border-white/5 hover:border-white/10 rounded-sm p-4 transition-colors group">
          <p className="text-[11px] tracking-[0.25em] uppercase text-[#444] mb-2 group-hover:text-[#9B2454] transition-colors">Baseline</p>
          <p className="text-lg font-black text-white uppercase" style={{ fontFamily: "'Arial Black', sans-serif" }}>
            {baseline ? 'View' : 'Complete'}
          </p>
          {baseline
            ? <p className="text-[10px] text-[#444] mt-1">{new Date(baseline.assessed_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</p>
            : <p className="text-[10px] text-[#CC2222] mt-1">Required</p>
          }
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 4D Snapshot */}
        <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <span className="text-[11px] tracking-[0.3em] uppercase text-[#9B2454]">4D Baseline Snapshot</span>
          </div>
          {fourD ? (
            <div className="p-5 grid grid-cols-2 gap-4">
              {Object.entries(fourD).map(([dim, score]) => (
                <div key={dim}>
                  <div className="flex justify-between mb-1">
                    <p className="text-[11px] text-[#444] capitalize">{dim}</p>
                    <p className="text-[11px] text-white font-medium">{score}/10</p>
                  </div>
                  <div className="w-full bg-[#1A1A1A] rounded-full h-1">
                    <div
                      className="h-1 rounded-full transition-all"
                      style={{ width: `${(score / 10) * 100}%`, backgroundColor: '#9B2454' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-[#444] text-sm">No baseline recorded yet</p>
              <Link href="/staff/cdp/baseline" className="text-[#9B2454] text-xs mt-2 inline-block hover:text-white transition-colors">
                Complete your baseline →
              </Link>
            </div>
          )}
        </div>

        {/* Weekly consistency tracker */}
        <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5 flex justify-between items-center">
            <span className="text-[11px] tracking-[0.3em] uppercase text-[#9B2454]">Weekly Reflections</span>
            <span className="text-[11px] text-[#444]">{reflectionStreak} of last 8 weeks</span>
          </div>
          <div className="p-5">
            <div className="flex gap-2 flex-wrap">
              {Array.from({ length: 8 }, (_, i) => {
                const reflection = recentReflections[7 - i]
                const status = reflection?.overall_status
                return (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-sm flex items-center justify-center text-[10px] font-medium"
                    style={{
                      backgroundColor: status ? STATUS_COLORS[status] + '20' : '#111',
                      color: status ? STATUS_COLORS[status] : '#222',
                    }}
                    title={reflection ? `w/e ${reflection.week_start}: ${status?.replace(/_/g, ' ')}` : 'No reflection'}
                  >
                    {status ? '✓' : '—'}
                  </div>
                )
              })}
            </div>
            <div className="flex gap-4 mt-4 flex-wrap">
              {Object.entries(STATUS_COLORS).map(([key, color]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-[10px] text-[#444] capitalize">{key.replace(/_/g, ' ')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Latest director check-in */}
        <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <span className="text-[11px] tracking-[0.3em] uppercase text-[#9B2454]">Director Check-Ins</span>
          </div>
          {checkins.length === 0 ? (
            <div className="p-6 text-center"><p className="text-[#444] text-sm">No check-ins yet</p></div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {checkins.map((ci, i) => (
                <div key={i} className="px-5 py-4">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-xs text-[#555]">
                      {new Date(ci.checkin_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <StatusDot status={ci.overall_status} />
                      <span className="text-[10px] text-[#444] capitalize">{ci.overall_status?.replace(/_/g, ' ')}</span>
                    </div>
                  </div>
                  {ci.strengths && <p className="text-[11px] text-[#555] mt-1"><span className="text-[#2E8B35]">+</span> {ci.strengths}</p>}
                  {ci.targets && <p className="text-[11px] text-[#555] mt-0.5"><span className="text-[#C9A84C]">→</span> {ci.targets}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Shadowing log link */}
        <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <span className="text-[11px] tracking-[0.3em] uppercase text-[#9B2454]">Portfolio Links</span>
          </div>
          <div className="p-4 space-y-2">
            {[
              { href: '/staff/cdp/plan',      label: 'Weekly Session Plan',    desc: 'Plan your upcoming sessions' },
              { href: '/staff/cdp/reflect',   label: 'Weekly Reflection',      desc: 'Score and reflect on the week' },
              { href: '/staff/cdp/cpd',       label: 'CPD Log',                desc: 'Record professional development hours' },
              { href: '/staff/cdp/shadowing', label: 'Shadowing Log',          desc: 'Document coaching observations' },
              { href: '/staff/cdp/baseline',  label: '4D & Five Intel Baseline', desc: 'Set or update your baseline scores' },
            ].map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between p-3 rounded-sm bg-[#111] hover:bg-[#151515] transition-colors group"
              >
                <div>
                  <p className="text-sm text-white group-hover:text-[#9B2454] transition-colors">{item.label}</p>
                  <p className="text-[11px] text-[#444] mt-0.5">{item.desc}</p>
                </div>
                <span className="text-[#333] group-hover:text-[#9B2454] transition-colors">→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
