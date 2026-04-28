import { requireAuth } from '@/lib/auth/requireRole'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import HabitsTracker from '@/components/pdp/HabitsTracker'

function getWeekStart(date = new Date()): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d.toISOString().split('T')[0]
}

export default async function HabitsPage() {
  const user = await requireAuth()
  const supabase = await createClient()
  const weekStart = getWeekStart()

  const [habitsRes, pointsRes] = await Promise.all([
    supabase
      .from('pdp_habit_entries')
      .select('*')
      .eq('player_id', user.id)
      .eq('week_start', weekStart),
    supabase
      .from('player_points')
      .select('points, reason, created_at')
      .eq('player_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  const totalPoints = (pointsRes.data ?? []).reduce((s, p) => s + (p.points ?? 0), 0)

  return (
    <div>
      <Link href="/pdp" className="text-xs text-[#444] hover:text-white uppercase tracking-wider mb-6 inline-block transition-colors">
        ← Development Plan
      </Link>
      <div className="mb-8">
        <p className="text-[#C9A84C] text-[11px] tracking-[0.3em] uppercase mb-2">PDP Section 7</p>
        <h1
          className="text-3xl font-black tracking-wider text-white uppercase"
          style={{ fontFamily: "'Arial Black', sans-serif" }}
        >
          Habits <span style={{ color: '#C9A84C' }}>&amp; Consistency</span>
        </h1>
        <p className="text-[#444] mt-1.5 text-sm">Build championship habits. Every check earns points.</p>
      </div>
      <HabitsTracker
        userId={user.id}
        weekStart={weekStart}
        existingHabits={habitsRes.data ?? []}
        totalPoints={totalPoints}
      />
    </div>
  )
}
