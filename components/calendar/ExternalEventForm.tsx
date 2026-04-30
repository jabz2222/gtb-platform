'use client'

import { useState } from 'react'

interface Props {
  onClose: () => void
  onSaved: () => void
  defaultDate?: string // YYYY-MM-DD
}

const EVENT_TYPES = [
  { value: 'training',      label: 'Training',         color: '#5BB8E8' },
  { value: 'gym',           label: 'Gym session',      color: '#2E8B35' },
  { value: 'match',         label: 'Match',            color: '#E8641A' },
  { value: 'team_training', label: 'Team training',    color: '#9B2454' },
  { value: 'recovery',      label: 'Recovery',         color: '#2E9B8A' },
  { value: 'school',        label: 'School',           color: '#888' },
  { value: 'other',         label: 'Other',            color: '#666' },
] as const

export default function ExternalEventForm({ onClose, onSaved, defaultDate }: Props) {
  const today = defaultDate ?? new Date().toISOString().slice(0, 10)
  const [form, setForm] = useState({
    title: '',
    event_type: 'training' as (typeof EVENT_TYPES)[number]['value'],
    date: today,
    start_time: '17:00',
    end_time: '',
    location: '',
    notes: '',
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!form.title.trim()) {
      setError('Title is required')
      return
    }
    setBusy(true)
    try {
      const starts_at = `${form.date}T${form.start_time}:00`
      const ends_at = form.end_time ? `${form.date}T${form.end_time}:00` : null
      const colour = EVENT_TYPES.find(t => t.value === form.event_type)?.color ?? null
      const res = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          event_type: form.event_type,
          starts_at,
          ends_at,
          location: form.location.trim() || null,
          notes: form.notes.trim() || null,
          color_hex: colour,
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(json.error ?? `Save failed (${res.status})`)
        return
      }
      onSaved()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error')
    } finally {
      setBusy(false)
    }
  }

  const inputClass = 'w-full bg-[#141414] border border-white/[0.08] text-white rounded-sm px-3 py-2.5 text-sm placeholder:text-[#333] focus:outline-none focus:border-[#C9A84C]/60 transition-colors'
  const labelClass = 'block text-[10px] text-[#666] mb-1 uppercase tracking-wider'

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-[#0D0D0D] border border-white/10 rounded-sm w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">Add Event</span>
          <button onClick={onClose} className="text-[#444] hover:text-white text-xl leading-none">×</button>
        </div>

        <form onSubmit={submit} className="p-5 space-y-4">
          {error && (
            <div className="bg-red-900/30 border border-red-700 text-red-300 text-sm px-4 py-2.5 rounded-sm">{error}</div>
          )}

          <div>
            <label className={labelClass}>Event type</label>
            <div className="grid grid-cols-2 gap-2">
              {EVENT_TYPES.map(t => {
                const active = form.event_type === t.value
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setForm(p => ({ ...p, event_type: t.value }))}
                    className={
                      'flex items-center gap-2 px-3 py-2 rounded-sm border text-xs transition-colors ' +
                      (active
                        ? 'border-white/30 bg-white/[0.04] text-white'
                        : 'border-white/[0.06] text-[#888] hover:text-white hover:border-white/[0.15]')
                    }
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                    {t.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label htmlFor="ev-title" className={labelClass}>Title</label>
            <input
              id="ev-title"
              type="text"
              required
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Sunday league match v Charlton"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="ev-date" className={labelClass}>Date</label>
            <input
              id="ev-date"
              type="date"
              required
              value={form.date}
              onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="ev-start" className={labelClass}>Start time</label>
              <input
                id="ev-start"
                type="time"
                required
                value={form.start_time}
                onChange={e => setForm(p => ({ ...p, start_time: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="ev-end" className={labelClass}>End time (optional)</label>
              <input
                id="ev-end"
                type="time"
                value={form.end_time}
                onChange={e => setForm(p => ({ ...p, end_time: e.target.value }))}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="ev-location" className={labelClass}>Location (optional)</label>
            <input
              id="ev-location"
              type="text"
              value={form.location}
              onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
              placeholder="e.g. PureGym Lewisham"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="ev-notes" className={labelClass}>Notes (optional)</label>
            <textarea
              id="ev-notes"
              rows={3}
              value={form.notes}
              onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              className={inputClass}
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-xs uppercase tracking-wider rounded-sm border border-white/10 text-[#888] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="flex-1 bg-[#C9A84C] hover:bg-[#d4b055] disabled:opacity-40 text-black font-black py-2.5 px-4 rounded-sm text-xs tracking-[0.15em] uppercase transition-colors"
              style={{ fontFamily: "'Arial Black', sans-serif" }}
            >
              {busy ? 'Saving…' : 'Save Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
