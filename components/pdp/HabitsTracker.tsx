'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const HABITS = [
  { key: 'on_time',        label: 'Arrived on time & prepared',         points: 10 },
  { key: 'mental_ready',   label: 'Prepared mentally before session',    points: 10 },
  { key: 'full_effort',    label: 'Gave 100% effort throughout',         points: 15 },
  { key: 'reflected',      label: 'Reflected on session afterwards',     points: 15 },
  { key: 'homework',       label: 'Completed coach / mentor homework',   points: 20 },
]

interface HabitEntry { habit: string; completed: boolean }

interface Props {
  userId: string
  weekStart: string
  existingHabits: HabitEntry[]
  totalPoints: number
}

export default function HabitsTracker({ userId, weekStart, existingHabits, totalPoints }: Props) {
  const [habits, setHabits] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {}
    for (const h of HABITS) {
      const found = existingHabits.find(e => e.habit === h.key)
      init[h.key] = found?.completed ?? false
    }
    return init
  })
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const router = useRouter()

  const weeklyPoints = HABITS.filter(h => habits[h.key]).reduce((s, h) => s + h.points, 0)
  const maxWeekly = HABITS.reduce((s, h) => s + h.points, 0)
  const streak = Math.min(7, Math.floor(totalPoints / 50)) // simplified streak

  function toggle(key: string) {
    setHabits(h => ({ ...h, [key]: !h[key] }))
  }

  function handleSave() {
    startTransition(async () => {
      const supabase = createClient()
      const rows = HABITS.map(h => ({
        player_id: userId,
        week_start: weekStart,
        habit: h.key,
        completed: habits[h.key],
      }))
      await supabase.from('pdp_habit_entries').upsert(rows, { onConflict: 'player_id,week_start,habit' })

      // Award points for newly checked habits
      const newlyChecked = HABITS.filter(h => {
        const wasChecked = existingHabits.find(e => e.habit === h.key)?.completed ?? false
        return habits[h.key] && !wasChecked
      })
      if (newlyChecked.length > 0) {
        await supabase.from('player_points').insert(
          newlyChecked.map(h => ({
            player_id: userId,
            points: h.points,
            reason: `Habit: ${h.label}`,
          }))
        )
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      router.refresh()
    })
  }

  const streakEmoji = streak >= 7 ? '🔥🔥🔥' : streak >= 4 ? '🔥🔥' : streak >= 1 ? '🔥' : '💤'

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#0D0D0D] border border-white/5 rounded-sm p-5 text-center">
          <p className="text-[11px] text-[#444] uppercase tracking-wider mb-2">Total Points</p>
          <p className="text-3xl font-black text-[#C9A84C]" style={{ fontFamily: "'Arial Black', sans-serif" }}>{totalPoints}</p>
        </div>
        <div className="bg-[#0D0D0D] border border-white/5 rounded-sm p-5 text-center">
          <p className="text-[11px] text-[#444] uppercase tracking-wider mb-2">This Week</p>
          <p className="text-3xl font-black text-white" style={{ fontFamily: "'Arial Black', sans-serif" }}>{weeklyPoints}/{maxWeekly}</p>
        </div>
        <div className="bg-[#0D0D0D] border border-white/5 rounded-sm p-5 text-center">
          <p className="text-[11px] text-[#444] uppercase tracking-wider mb-2">Streak</p>
          <p className="text-3xl font-black text-white" style={{ fontFamily: "'Arial Black', sans-serif" }}>{streakEmoji}</p>
        </div>
      </div>

      {/* Weekly checklist */}
      <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5">
          <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">
            Weekly Habits — {new Date(weekStart).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}
          </span>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {HABITS.map(h => (
            <button
              key={h.key}
              onClick={() => toggle(h.key)}
              className="w-full px-5 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors text-left"
            >
              <div className={`w-5 h-5 rounded-sm border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                habits[h.key] ? 'bg-[#C9A84C] border-[#C9A84C]' : 'border-white/20 bg-transparent'
              }`}>
                {habits[h.key] && (
                  <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className={`flex-1 text-sm transition-colors ${habits[h.key] ? 'text-white' : 'text-[#666]'}`}>
                {h.label}
              </span>
              <span className={`text-[11px] font-medium ${habits[h.key] ? 'text-[#C9A84C]' : 'text-[#333]'}`}>
                +{h.points}pts
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between mb-2">
          <span className="text-[11px] text-[#444]">Weekly completion</span>
          <span className="text-[11px] text-[#C9A84C]">{Math.round((weeklyPoints / maxWeekly) * 100)}%</span>
        </div>
        <div className="w-full bg-[#1A1A1A] rounded-full h-2">
          <div
            className="h-2 rounded-full bg-[#C9A84C] transition-all"
            style={{ width: `${(weeklyPoints / maxWeekly) * 100}%` }}
          />
        </div>
      </div>

      {saved && (
        <div className="p-3 bg-[#2E8B35]/15 border border-[#2E8B35]/20 rounded-sm text-[#2E8B35] text-sm">
          Habits saved ✓
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={isPending}
        className="px-6 py-2.5 text-[11px] tracking-[0.25em] uppercase font-medium rounded-sm
                   bg-[#C9A84C] text-black hover:bg-[#C9A84C]/80 disabled:opacity-40 transition-colors"
      >
        {isPending ? 'Saving...' : 'Save This Week'}
      </button>

      {/* Premier League style table placeholder */}
      <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5">
          <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">Division Standings</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-4 py-3 text-left text-[#444] font-normal uppercase tracking-wider">Rank</th>
                <th className="px-4 py-3 text-left text-[#444] font-normal uppercase tracking-wider">Player</th>
                <th className="px-4 py-3 text-center text-[#444] font-normal uppercase tracking-wider">Pts</th>
                <th className="px-4 py-3 text-center text-[#444] font-normal uppercase tracking-wider">Sessions</th>
                <th className="px-4 py-3 text-center text-[#444] font-normal uppercase tracking-wider">Habits</th>
                <th className="px-4 py-3 text-center text-[#444] font-normal uppercase tracking-wider">Streak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              <tr className="bg-[#C9A84C]/5">
                <td className="px-4 py-3 text-[#C9A84C] font-black" style={{ fontFamily: "'Arial Black', sans-serif" }}>1</td>
                <td className="px-4 py-3 text-white font-medium">You</td>
                <td className="px-4 py-3 text-center text-[#C9A84C] font-bold">{totalPoints}</td>
                <td className="px-4 py-3 text-center text-[#666]">—</td>
                <td className="px-4 py-3 text-center text-[#666]">{Object.values(habits).filter(Boolean).length}</td>
                <td className="px-4 py-3 text-center">{streakEmoji}</td>
              </tr>
            </tbody>
          </table>
          <p className="text-[10px] text-[#333] text-center py-3">Full leaderboard unlocks when more players join your division</p>
        </div>
      </div>
    </div>
  )
}
