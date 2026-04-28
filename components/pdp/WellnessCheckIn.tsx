'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils/formatters'

interface WellnessEntry {
  id: string
  recorded_at: string
  energy: number
  sleep_hours: number
  soreness: number
  mood: number
}

const METRICS = [
  {
    key: 'energy',
    label: 'Energy Level',
    min: 1,
    max: 5,
    description: '1 = Exhausted · 5 = Fully charged',
    color: '#C9A84C',
  },
  {
    key: 'soreness',
    label: 'Muscle Soreness',
    min: 1,
    max: 5,
    description: '1 = No soreness · 5 = Very sore',
    color: '#E8641A',
  },
  {
    key: 'mood',
    label: 'Mood',
    min: 1,
    max: 5,
    description: '1 = Low · 5 = Excellent',
    color: '#5BB8E8',
  },
]

export default function WellnessCheckIn({ userId, sessionId }: { userId: string; sessionId?: string }) {
  const [history, setHistory] = useState<WellnessEntry[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ energy: 3, sleep_hours: 8, soreness: 2, mood: 3 })

  const supabase = createClient()

  useEffect(() => {
    supabase
      .from('wellness_entries' as 'performance_entries')
      .select('*')
      .eq('player_id', userId)
      .order('recorded_at', { ascending: false })
      .limit(7)
      .then(({ data }) => {
        if (data) setHistory(data as unknown as WellnessEntry[])
      })
  }, [userId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    // In production: insert into wellness_entries table
    // For now, simulate success
    await new Promise(r => setTimeout(r, 800))
    setSubmitted(true)
    setLoading(false)
  }

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Check-in card */}
      <div className="lg:col-span-2">
        <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">
              {sessionId ? 'Pre-Session Readiness' : "Today's Check-In"}
            </span>
            <span className="text-[11px] text-[#333] uppercase tracking-wider">{today}</span>
          </div>

          {submitted ? (
            <div className="p-10 text-center">
              <div className="w-12 h-12 rounded-sm bg-[#2E8B35]/15 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-[#2E8B35]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p
                className="text-lg font-black text-white uppercase mb-2"
                style={{ fontFamily: "'Arial Black', sans-serif" }}
              >
                Check-In Logged
              </p>
              <p className="text-sm text-[#444]">Your wellness data has been recorded. See you tomorrow.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-5 space-y-6">
              {/* Slider metrics */}
              {METRICS.map(metric => (
                <div key={metric.key}>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-white uppercase tracking-wider">
                      {metric.label}
                    </label>
                    <span
                      className="text-xl font-black"
                      style={{ color: metric.color, fontFamily: "'Arial Black', sans-serif" }}
                    >
                      {form[metric.key as keyof typeof form]}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={metric.min}
                    max={metric.max}
                    value={form[metric.key as keyof typeof form]}
                    onChange={e =>
                      setForm(p => ({ ...p, [metric.key]: Number(e.target.value) }))
                    }
                    className="w-full accent-[#C9A84C] h-1 rounded-full bg-[#1A1A1A] appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-[#333]">{metric.min}</span>
                    <span className="text-[10px] text-[#444]">{metric.description}</span>
                    <span className="text-[10px] text-[#333]">{metric.max}</span>
                  </div>
                </div>
              ))}

              {/* Sleep hours */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-white uppercase tracking-wider">
                    Sleep Hours
                  </label>
                  <span
                    className="text-xl font-black text-[#2E8B35]"
                    style={{ fontFamily: "'Arial Black', sans-serif" }}
                  >
                    {form.sleep_hours}h
                  </span>
                </div>
                <input
                  type="range"
                  min={3}
                  max={12}
                  step={0.5}
                  value={form.sleep_hours}
                  onChange={e => setForm(p => ({ ...p, sleep_hours: Number(e.target.value) }))}
                  className="w-full accent-[#2E8B35] h-1 rounded-full bg-[#1A1A1A] appearance-none cursor-pointer"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-[#333]">3h</span>
                  <span className="text-[10px] text-[#444]">Hours of sleep last night</span>
                  <span className="text-[10px] text-[#333]">12h</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#C9A84C] hover:bg-[#d4b055] disabled:opacity-40 text-black font-black
                           py-3 px-4 rounded-sm text-xs tracking-[0.15em] uppercase transition-colors"
                style={{ fontFamily: "'Arial Black', sans-serif" }}
              >
                {loading ? 'Logging…' : 'Submit Check-In'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* 7-day history */}
      <div className="space-y-4">
        <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">7-Day History</span>
          </div>
          {history.length === 0 ? (
            <div className="p-5">
              <div className="flex gap-1.5 mb-4">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 h-8 rounded-sm bg-[#141414] border border-white/[0.04]"
                  />
                ))}
              </div>
              <p className="text-[11px] text-[#333] text-center">No check-ins yet</p>
            </div>
          ) : (
            <div className="p-5">
              {/* Energy strip */}
              <p className="text-[10px] text-[#444] uppercase tracking-wider mb-2">Energy</p>
              <div className="flex gap-1.5 mb-4">
                {history.slice(0, 7).reverse().map(entry => (
                  <div key={entry.id} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-sm transition-all"
                      style={{
                        height: `${(entry.energy / 5) * 32}px`,
                        backgroundColor: `rgba(201,168,76,${entry.energy / 5})`,
                        minHeight: '4px',
                      }}
                    />
                    <span className="text-[9px] text-[#333]">
                      {formatDate(entry.recorded_at).slice(0, 5)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="divide-y divide-white/[0.04]">
                {history.slice(0, 7).map(entry => (
                  <div key={entry.id} className="py-3">
                    <p className="text-[11px] text-[#555] mb-1.5">
                      {formatDate(entry.recorded_at)}
                    </p>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-[#444]">Energy</span>
                        <span className="text-white">{entry.energy}/5</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-[#444]">Sleep</span>
                        <span className="text-white">{entry.sleep_hours}h</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-[#444]">Soreness</span>
                        <span className="text-white">{entry.soreness}/5</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-[#444]">Mood</span>
                        <span className="text-white">{entry.mood}/5</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tip card */}
        <div className="bg-[#0D0D0D] border border-white/5 rounded-sm p-5">
          <p className="text-[11px] text-[#C9A84C] uppercase tracking-wider mb-2">Recovery Tip</p>
          <p className="text-xs text-[#444] leading-relaxed">
            Consistent sleep (7–9 hours) is the single biggest performance lever. Track it daily to
            spot patterns.
          </p>
        </div>
      </div>
    </div>
  )
}
