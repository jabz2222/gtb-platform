'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Goal {
  id: string
  title: string
  category: string
  current_value: number
  target_value: number | null
  target_date: string | null
  is_active: boolean
  created_at: string
}

const CATEGORIES = ['Technical', 'Physical', 'Mental', 'Academic', 'Lifestyle']
const STATUS_FILTERS = ['All', 'Active', 'Completed']

export default function GoalsList({ goals: initial, userId }: { goals: Goal[]; userId: string }) {
  const [goals, setGoals] = useState<Goal[]>(initial)
  const [filter, setFilter] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    category: 'Technical',
    target_value: '',
    target_date: '',
  })

  const supabase = createClient()

  const filtered = goals.filter(g => {
    if (filter === 'Active') return g.is_active
    if (filter === 'Completed') return !g.is_active
    return true
  })

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { data, error } = await supabase
      .from('goals')
      .insert({
        player_id: userId,
        title: form.title,
        category: form.category.toLowerCase(),
        target_value: form.target_value ? Number(form.target_value) : null,
        target_date: form.target_date || null,
        current_value: 0,
        is_active: true,
      })
      .select()
      .single()

    if (!error && data) {
      setGoals(prev => [data, ...prev])
      setForm({ title: '', category: 'Technical', target_value: '', target_date: '' })
      setShowForm(false)
    }
    setLoading(false)
  }

  async function handleComplete(id: string) {
    await supabase.from('goals').update({ is_active: false }).eq('id', id)
    setGoals(prev => prev.map(g => g.id === id ? { ...g, is_active: false } : g))
  }

  const inputClass = `w-full bg-[#141414] border border-white/[0.08] text-white rounded-sm px-3 py-2.5 text-sm
                      placeholder:text-[#333] focus:outline-none focus:border-[#C9A84C]/60 transition-colors`
  const labelClass = 'block text-xs text-[#666] mb-1.5 uppercase tracking-wider'

  return (
    <div>
      {/* Header + filter + add */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex gap-1">
          {STATUS_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs uppercase tracking-wider rounded-sm transition-colors ${
                filter === f
                  ? 'bg-[#C9A84C] text-black font-black'
                  : 'bg-[#111] border border-white/5 text-[#555] hover:text-white'
              }`}
              style={filter === f ? { fontFamily: "'Arial Black', sans-serif" } : undefined}
            >
              {f}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-2 bg-[#C9A84C] hover:bg-[#d4b055] text-black font-black
                     px-4 py-2 text-xs tracking-[0.12em] uppercase rounded-sm transition-colors"
          style={{ fontFamily: "'Arial Black', sans-serif" }}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Goal
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-[#0D0D0D] border border-[#C9A84C]/30 rounded-sm p-5 mb-5"
        >
          <p className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C] mb-4">New Goal</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="sm:col-span-2">
              <label className={labelClass}>Goal Title</label>
              <input
                required
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Improve weak foot finishing"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Category</label>
              <select
                value={form.category}
                onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                className={`${inputClass} bg-[#141414]`}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Target Value (optional)</label>
              <input
                type="number"
                value={form.target_value}
                onChange={e => setForm(p => ({ ...p, target_value: e.target.value }))}
                placeholder="e.g. 10"
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Target Date (optional)</label>
              <input
                type="date"
                value={form.target_date}
                onChange={e => setForm(p => ({ ...p, target_date: e.target.value }))}
                className={inputClass}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#C9A84C] hover:bg-[#d4b055] disabled:opacity-40 text-black font-black
                         px-5 py-2 text-xs tracking-[0.12em] uppercase rounded-sm transition-colors"
              style={{ fontFamily: "'Arial Black', sans-serif" }}
            >
              {loading ? 'Saving…' : 'Save Goal'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="border border-white/10 text-[#555] hover:text-white px-5 py-2
                         text-xs tracking-wider uppercase rounded-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Goals list */}
      {filtered.length === 0 ? (
        <div className="bg-[#0D0D0D] border border-white/5 rounded-sm p-12 text-center">
          <p className="text-[#444] text-sm mb-3">No goals found</p>
          <button
            onClick={() => setShowForm(true)}
            className="text-[#C9A84C] text-xs uppercase tracking-wider hover:underline"
          >
            Create your first goal →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(goal => {
            const pct = goal.target_value
              ? Math.min(100, Math.round((goal.current_value / goal.target_value) * 100))
              : 0

            return (
              <div
                key={goal.id}
                className="bg-[#0D0D0D] border border-white/5 rounded-sm p-5 relative overflow-hidden"
              >
                {!goal.is_active && (
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#2E8B35]" />
                )}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-white">{goal.title}</span>
                      {!goal.is_active && (
                        <span className="text-[10px] bg-[#2E8B35]/15 text-[#2E8B35] px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                          Completed
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-[#444] mb-3">
                      <span className="capitalize">{goal.category}</span>
                      {goal.target_date && (
                        <>
                          <span>·</span>
                          <span>Due {new Date(goal.target_date).toLocaleDateString('en-GB')}</span>
                        </>
                      )}
                    </div>
                    {goal.target_value != null && (
                      <>
                        <div className="w-full bg-[#1A1A1A] rounded-full h-1">
                          <div
                            className="h-1 rounded-full transition-all"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: goal.is_active ? '#C9A84C' : '#2E8B35',
                            }}
                          />
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-[11px] text-[#444]">{pct}% complete</span>
                          <span className="text-[11px] text-[#444]">
                            {goal.current_value} / {goal.target_value}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                  {goal.is_active && (
                    <button
                      onClick={() => handleComplete(goal.id)}
                      className="flex-shrink-0 text-[#333] hover:text-[#2E8B35] transition-colors"
                      title="Mark complete"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
