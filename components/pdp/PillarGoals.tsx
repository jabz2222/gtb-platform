'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Pillar = 'technical' | 'tactical' | 'physical' | 'psychological' | 'lifestyle'
type GoalTerm = 'short' | 'long'
type StatusColour = 'blue' | 'green' | 'yellow' | 'red'

const PILLARS: { key: Pillar; label: string; colour: string }[] = [
  { key: 'technical',    label: 'Technical',    colour: '#5BB8E8' },
  { key: 'tactical',    label: 'Tactical',     colour: '#C9A84C' },
  { key: 'physical',    label: 'Physical',     colour: '#CC2222' },
  { key: 'psychological', label: 'Psychological', colour: '#9B2454' },
  { key: 'lifestyle',   label: 'Lifestyle',    colour: '#2E8B35' },
]

const STATUS_OPTIONS: { value: StatusColour; label: string; colour: string }[] = [
  { value: 'blue',   label: 'Exceeding',      colour: '#5BB8E8' },
  { value: 'green',  label: 'On Track',       colour: '#2E8B35' },
  { value: 'yellow', label: 'Some Challenges', colour: '#C9A84C' },
  { value: 'red',    label: 'Off Track',      colour: '#CC2222' },
]

interface Goal {
  id: string
  title: string
  pillar?: string | null
  goal_term?: string | null
  status?: string | null
  target_date?: string | null
  success_criteria?: string | null
  description?: string | null
}

interface Props {
  userId: string
  goals: Goal[]
}

export default function PillarGoals({ userId, goals }: Props) {
  const [activePillar, setActivePillar] = useState<Pillar>('technical')
  const [showForm, setShowForm] = useState<GoalTerm | null>(null)
  const [title, setTitle] = useState('')
  const [criteria, setCriteria] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [goalStatus, setGoalStatus] = useState<StatusColour>('green')
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const router = useRouter()

  const pillarInfo = PILLARS.find(p => p.key === activePillar)!
  const pillarGoals = goals.filter(g => g.pillar === activePillar)
  const shortGoal = pillarGoals.find(g => g.goal_term === 'short')
  const longGoal = pillarGoals.find(g => g.goal_term === 'long')

  function handleAddGoal(term: GoalTerm) {
    if (!title.trim()) return
    startTransition(async () => {
      const supabase = createClient()
      await supabase.from('goals').insert({
        player_id: userId,
        title: title.trim(),
        pillar: activePillar,
        goal_term: term,
        success_criteria: criteria.trim() || null,
        target_date: targetDate || null,
        status: goalStatus,
        category: activePillar,
        is_active: true,
        current_value: 0,
        target_value: null,
      })
      setTitle(''); setCriteria(''); setTargetDate(''); setGoalStatus('green')
      setShowForm(null)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      router.refresh()
    })
  }

  async function updateStatus(goalId: string, newStatus: string) {
    const supabase = createClient()
    await supabase.from('goals').update({ status: newStatus }).eq('id', goalId)
    router.refresh()
  }

  const inputCls = "w-full bg-[#111] border border-white/10 rounded-sm px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30 transition-colors"
  const labelCls = "block text-[11px] uppercase tracking-[0.2em] text-[#444] mb-1"

  return (
    <div className="space-y-6">
      {/* Pillar tabs */}
      <div className="flex gap-1 border-b border-white/5 pb-0 flex-wrap">
        {PILLARS.map(p => (
          <button
            key={p.key}
            onClick={() => { setActivePillar(p.key); setShowForm(null) }}
            className={`px-4 py-2.5 text-xs tracking-wider uppercase transition-colors border-b-2 -mb-px`}
            style={activePillar === p.key
              ? { color: p.colour, borderColor: p.colour }
              : { color: '#444', borderColor: 'transparent' }
            }
          >
            {p.label}
          </button>
        ))}
      </div>

      {saved && (
        <div className="p-3 bg-[#2E8B35]/15 border border-[#2E8B35]/20 rounded-sm text-[#2E8B35] text-sm">Goal saved ✓</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {(['short', 'long'] as GoalTerm[]).map(term => {
          const goal = term === 'short' ? shortGoal : longGoal
          const statusInfo = STATUS_OPTIONS.find(s => s.value === goal?.status) ?? STATUS_OPTIONS[1]

          return (
            <div key={term} className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
              <div
                className="px-5 py-4 border-b border-white/5 flex items-center justify-between"
                style={{ borderLeftColor: pillarInfo.colour, borderLeftWidth: 2 }}
              >
                <div>
                  <span className="text-[11px] tracking-[0.3em] uppercase" style={{ color: pillarInfo.colour }}>
                    {term === 'short' ? 'Short-Term Goal' : 'Long-Term Goal'}
                  </span>
                  <p className="text-[10px] text-[#333] mt-0.5">
                    {term === 'short' ? 'Next 4–8 weeks' : 'End of season or beyond'}
                  </p>
                </div>
                {goal && (
                  <div className="flex gap-1">
                    {STATUS_OPTIONS.map(s => (
                      <button
                        key={s.value}
                        onClick={() => updateStatus(goal.id, s.value)}
                        title={s.label}
                        className="w-3 h-3 rounded-full border-2 transition-all"
                        style={{
                          backgroundColor: goal.status === s.value ? s.colour : 'transparent',
                          borderColor: s.colour,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="p-5">
                {goal ? (
                  <div>
                    <p className="text-sm font-medium text-white mb-2">{goal.title}</p>
                    {goal.success_criteria && (
                      <p className="text-[11px] text-[#555] mb-2">Success: {goal.success_criteria}</p>
                    )}
                    {goal.target_date && (
                      <p className="text-[11px] text-[#333]">
                        Target: {new Date(goal.target_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    )}
                    <div className="mt-3 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: statusInfo.colour }} />
                      <span className="text-[11px]" style={{ color: statusInfo.colour }}>{statusInfo.label}</span>
                    </div>
                  </div>
                ) : showForm === term ? (
                  <div className="space-y-3">
                    <div>
                      <label className={labelCls}>Goal Title *</label>
                      <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="What do you want to achieve?" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Success Criteria</label>
                      <input type="text" value={criteria} onChange={e => setCriteria(e.target.value)} placeholder="How will you know you've achieved it?" className={inputCls} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>Target Date</label>
                        <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Status</label>
                        <select value={goalStatus} onChange={e => setGoalStatus(e.target.value as StatusColour)} className={inputCls + ' cursor-pointer'}>
                          {STATUS_OPTIONS.map(s => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddGoal(term)}
                        disabled={isPending || !title.trim()}
                        className="px-4 py-2 text-[11px] tracking-wider uppercase rounded-sm text-black disabled:opacity-40 transition-colors"
                        style={{ backgroundColor: pillarInfo.colour }}
                      >
                        {isPending ? 'Saving...' : 'Save Goal'}
                      </button>
                      <button onClick={() => setShowForm(null)} className="px-4 py-2 text-[11px] tracking-wider uppercase rounded-sm border border-white/10 text-[#444] hover:text-white transition-colors">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-[#444] text-sm mb-3">No {term}-term goal set</p>
                    <button
                      onClick={() => setShowForm(term)}
                      className="text-[11px] uppercase tracking-wider px-4 py-2 rounded-sm border transition-colors"
                      style={{ borderColor: `${pillarInfo.colour}40`, color: pillarInfo.colour }}
                    >
                      + Set Goal
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
