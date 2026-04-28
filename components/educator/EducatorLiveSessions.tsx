'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate, formatTime } from '@/lib/utils/formatters'

interface LiveSession {
  id: string
  title: string
  start_time: string
  end_time: string
  capacity: number
  enrolled_count: number
  min_tier: string | null
}

interface Tier {
  id: string
  name: string
}

export default function EducatorLiveSessions({
  sessions: initial,
  tiers,
  educatorId,
}: {
  sessions: LiveSession[]
  tiers: Tier[]
  educatorId: string
}) {
  const [sessions, setSessions] = useState<LiveSession[]>(initial)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    start_date: '',
    start_time: '',
    duration_mins: '60',
    capacity: '20',
    min_tier: '',
  })

  const supabase = createClient()
  const now = new Date()

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const start = new Date(`${form.start_date}T${form.start_time}:00`)
    const end = new Date(start.getTime() + Number(form.duration_mins) * 60000)

    const { data, error } = await supabase
      .from('group_classes')
      .insert({
        title: form.title,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        capacity: Number(form.capacity),
        enrolled_count: 0,
        min_tier: form.min_tier || null,
        created_by: educatorId,
      })
      .select()
      .single()

    if (!error && data) {
      setSessions(prev => [data, ...prev].sort((a, b) =>
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      ))
      setForm({ title: '', start_date: '', start_time: '', duration_mins: '60', capacity: '20', min_tier: '' })
      setShowForm(false)
    }
    setLoading(false)
  }

  const upcoming = sessions.filter(s => new Date(s.start_time) >= now)
  const past = sessions.filter(s => new Date(s.start_time) < now)

  const inputClass = `w-full bg-[#141414] border border-white/[0.08] text-white rounded-sm px-3 py-2.5 text-sm
                      placeholder:text-[#333] focus:outline-none focus:border-[#C9A84C]/60 transition-colors`
  const labelClass = 'block text-xs text-[#666] mb-1.5 uppercase tracking-wider'

  const minDate = new Date()
  minDate.setDate(minDate.getDate() + 1)

  return (
    <div>
      <div className="flex justify-end mb-5">
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-2 bg-[#CC2222] hover:bg-[#dd2222] text-white font-black
                     px-4 py-2 text-xs tracking-[0.12em] uppercase rounded-sm transition-colors"
          style={{ fontFamily: "'Arial Black', sans-serif" }}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Schedule Session
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-[#0D0D0D] border border-[#CC2222]/30 rounded-sm p-5 mb-5"
        >
          <p className="text-[11px] tracking-[0.3em] uppercase text-[#CC2222] mb-4">New Live Session</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="sm:col-span-2">
              <label className={labelClass}>Session Title</label>
              <input
                required
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Sports Science — Nutrition Fundamentals"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Date</label>
              <input
                type="date"
                required
                min={minDate.toISOString().split('T')[0]}
                value={form.start_date}
                onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Start Time</label>
              <input
                type="time"
                required
                value={form.start_time}
                onChange={e => setForm(p => ({ ...p, start_time: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Duration (minutes)</label>
              <input
                type="number"
                min="15"
                max="240"
                value={form.duration_mins}
                onChange={e => setForm(p => ({ ...p, duration_mins: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Max Capacity</label>
              <input
                type="number"
                min="1"
                max="500"
                value={form.capacity}
                onChange={e => setForm(p => ({ ...p, capacity: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Minimum Tier Access</label>
              <select
                value={form.min_tier}
                onChange={e => setForm(p => ({ ...p, min_tier: e.target.value }))}
                className={`${inputClass} bg-[#141414]`}
              >
                <option value="">Free (all tiers)</option>
                {tiers.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#CC2222] hover:bg-[#dd2222] disabled:opacity-40 text-white font-black
                         px-5 py-2 text-xs tracking-[0.12em] uppercase rounded-sm transition-colors"
              style={{ fontFamily: "'Arial Black', sans-serif" }}
            >
              {loading ? 'Scheduling…' : 'Schedule'}
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

      {/* Upcoming */}
      <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden mb-4">
        <div className="px-5 py-4 border-b border-white/5">
          <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">
            Upcoming Sessions ({upcoming.length})
          </span>
        </div>
        {upcoming.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-[#444] text-sm">No upcoming live sessions</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {upcoming.map(s => (
              <div key={s.id} className="px-5 py-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{s.title}</p>
                  <p className="text-[11px] text-[#444] mt-0.5">
                    {formatDate(s.start_time)} · {formatTime(s.start_time)}–{formatTime(s.end_time)}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-white">{s.enrolled_count}/{s.capacity}</p>
                  <p className="text-[11px] text-[#2E8B35]">{s.capacity - s.enrolled_count} spots left</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past */}
      {past.length > 0 && (
        <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden opacity-60">
          <div className="px-5 py-4 border-b border-white/5">
            <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">Past Sessions</span>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {past.slice(0, 10).map(s => (
              <div key={s.id} className="px-5 py-3.5 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">{s.title}</p>
                  <p className="text-[11px] text-[#444] mt-0.5">
                    {formatDate(s.start_time)} · {formatTime(s.start_time)}
                  </p>
                </div>
                <p className="text-xs text-[#333]">{s.enrolled_count} attended</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
