import { requireRole } from '@/lib/auth/requireRole'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import WeeklyPlanForm from '@/components/coach/WeeklyPlanForm'

function getWeekStart(date = new Date()): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d.toISOString().split('T')[0]
}

export default async function WeeklyPlanPage() {
  const { user } = await requireRole(['admin', 'staff', 'mentor', 'educator'])
  const supabase = await createClient()
  const weekStart = getWeekStart()

  const { data: existing } = await supabase
    .from('coach_weekly_plans')
    .select('*')
    .eq('coach_id', user.id)
    .eq('week_start', weekStart)
    .maybeSingle()

  const weekLabel = new Date(weekStart).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div className="max-w-2xl">
      <Link href="/staff/cdp" className="text-xs text-[#444] hover:text-white uppercase tracking-wider mb-6 inline-block transition-colors">
        ← Coach Portfolio
      </Link>

      <div className="mb-8">
        <p className="text-[#9B2454] text-[11px] tracking-[0.3em] uppercase mb-2">Week of {weekLabel}</p>
        <h1
          className="text-3xl font-black tracking-wider text-white uppercase"
          style={{ fontFamily: "'Arial Black', sans-serif" }}
        >
          Weekly <span style={{ color: '#9B2454' }}>Session Plan</span>
        </h1>
        <p className="text-[#444] mt-1.5 text-sm">
          Set your intentions for the week — focus areas, coaching behaviours, and practice design.
        </p>
      </div>

      <WeeklyPlanForm
        coachId={user.id}
        weekStart={weekStart}
        existing={existing}
      />
    </div>
  )
}
