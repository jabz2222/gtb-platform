import { requireAuth } from '@/lib/auth/requireRole'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import WeeklyReflectionsForm from '@/components/pdp/WeeklyReflectionsForm'

function getWeekStart(date = new Date()): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d.toISOString().split('T')[0]
}

export default async function ReflectionsPage() {
  const user = await requireAuth()
  const supabase = await createClient()
  const weekStart = getWeekStart()

  const { data: reflections } = await supabase
    .from('pdp_reflections')
    .select('*')
    .eq('player_id', user.id)
    .eq('week_start', weekStart)

  const { data: history } = await supabase
    .from('pdp_reflections')
    .select('week_start')
    .eq('player_id', user.id)
    .order('week_start', { ascending: false })
    .limit(10)

  const weeks = [...new Set((history ?? []).map(r => r.week_start))]

  return (
    <div>
      <Link href="/pdp" className="text-xs text-[#444] hover:text-white uppercase tracking-wider mb-6 inline-block transition-colors">
        ← Development Plan
      </Link>
      <div className="mb-8">
        <p className="text-[#2E8B35] text-[11px] tracking-[0.3em] uppercase mb-2">PDP Section 4</p>
        <h1
          className="text-3xl font-black tracking-wider text-white uppercase"
          style={{ fontFamily: "'Arial Black', sans-serif" }}
        >
          Weekly <span style={{ color: '#2E8B35' }}>Reflections</span>
        </h1>
        <p className="text-[#444] mt-1.5 text-sm">
          Week of {new Date(weekStart).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>
      <WeeklyReflectionsForm
        userId={user.id}
        weekStart={weekStart}
        existing={reflections ?? []}
        pastWeeks={weeks}
      />
    </div>
  )
}
