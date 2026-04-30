'use client'

import { useState } from 'react'

type ReflectionType = 'training' | 'sc' | 'short' | 'long' | 'match'

interface Props {
  type: ReflectionType
  sessionDate: string // YYYY-MM-DD
  label: string
  onClose: () => void
  onSaved: () => void
}

// Training/Match reflection areas (icons match the spec)
const TRAINING_AREAS = [
  { id: 'understanding',    label: 'Understanding',  icon: '🧠' },
  { id: 'learning',         label: 'Learning',       icon: '⚙️' },
  { id: 'challenges',       label: 'Challenges',     icon: '💪' },
  { id: 'self_awareness',   label: 'Self-Awareness', icon: '🔍' },
  { id: 'effort',           label: 'Effort',         icon: '🧩' },
  { id: 'improvement',      label: 'Improvement',    icon: '🧭' },
] as const

const MATCH_AREAS = [
  { id: 'understanding',         label: 'Understanding',     icon: '🧠' },
  { id: 'highlights',            label: 'Performance Highlights', icon: '⚡' },
  { id: 'areas_to_improve',      label: 'Areas to Improve',  icon: '⚠️' },
  { id: 'learning_application',  label: 'Learning & Application', icon: '⚙️' },
  { id: 'effort_mindset',        label: 'Effort & Mindset',  icon: '🧩' },
  { id: 'next_steps',            label: 'Next Steps',        icon: '🧭' },
] as const

const STATUS_COLOURS = [
  { id: 'blue',   colour: '#5BB8E8', label: 'Blue · context'  },
  { id: 'green',  colour: '#2E8B35', label: 'Green · on track'},
  { id: 'yellow', colour: '#C9A84C', label: 'Yellow · attention' },
  { id: 'red',    colour: '#CC2222', label: 'Red · concern'   },
] as const

const PILLARS = ['technical', 'tactical', 'physical', 'psychological', 'lifestyle'] as const

export default function PDPReflectionForm({ type, sessionDate, label, onClose, onSaved }: Props) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Render the appropriate sub-form for the chosen type
  return (
    <div className="fixed inset-0 bg-black/70 flex items-start sm:items-center justify-center z-50 p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-[#0D0D0D] border border-white/10 rounded-sm w-full max-w-2xl my-6" onClick={e => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#0D0D0D]">
          <div>
            <p className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">{label}</p>
            <p className="text-[11px] text-[#555] mt-0.5">{new Date(sessionDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          </div>
          <button onClick={onClose} className="text-[#444] hover:text-white text-xl leading-none">×</button>
        </div>

        <div className="p-5">
          {error && (
            <div className="bg-red-900/30 border border-red-700 text-red-300 text-sm px-4 py-2.5 rounded-sm mb-4">{error}</div>
          )}

          {(type === 'training' || type === 'match') && (
            <SessionAreasForm
              type={type}
              sessionDate={sessionDate}
              areas={type === 'training' ? TRAINING_AREAS : MATCH_AREAS}
              setBusy={setBusy}
              setError={setError}
              busy={busy}
              onSaved={onSaved}
            />
          )}

          {type === 'sc' && (
            <SCForm
              sessionDate={sessionDate}
              setBusy={setBusy}
              setError={setError}
              busy={busy}
              onSaved={onSaved}
            />
          )}

          {(type === 'short' || type === 'long') && (
            <GoalReflectionForm
              type={type}
              sessionDate={sessionDate}
              setBusy={setBusy}
              setError={setError}
              busy={busy}
              onSaved={onSaved}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Training / Match ────────────────────────────────────────────────────────

function SessionAreasForm({
  type,
  sessionDate,
  areas,
  setBusy,
  setError,
  busy,
  onSaved,
}: {
  type: 'training' | 'match'
  sessionDate: string
  areas: ReadonlyArray<{ id: string; label: string; icon: string }>
  setBusy: (b: boolean) => void
  setError: (e: string | null) => void
  busy: boolean
  onSaved: () => void
}) {
  const [ratings, setRatings] = useState<Record<string, number>>({})
  const [notes, setNotes] = useState<Record<string, string>>({})

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    // Build entries — one row per area that has any data
    const entries = areas
      .map(a => ({
        area: a.id,
        rating: ratings[a.id] ?? null,
        note: notes[a.id]?.trim() || null,
      }))
      .filter(e => e.rating != null || e.note)

    if (entries.length === 0) {
      setError('Add a rating or note for at least one area.')
      return
    }

    setBusy(true)
    try {
      const res = await fetch('/api/pdp/reflections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'session',
          reflection_type: type,
          session_date: sessionDate,
          entries,
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

  return (
    <form onSubmit={submit} className="space-y-4">
      {areas.map(a => (
        <div key={a.id} className="bg-[#111] border border-white/5 rounded-sm p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-white">
              <span className="mr-1">{a.icon}</span> {a.label}
            </p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRatings(p => ({ ...p, [a.id]: n }))}
                  className={
                    'w-7 h-7 text-xs rounded-sm border transition-colors ' +
                    (ratings[a.id] === n
                      ? 'bg-[#C9A84C] text-black border-[#C9A84C] font-bold'
                      : 'border-white/[0.08] text-[#666] hover:text-white hover:border-white/20')
                  }
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <textarea
            rows={2}
            value={notes[a.id] ?? ''}
            onChange={e => setNotes(p => ({ ...p, [a.id]: e.target.value }))}
            placeholder={`Notes on ${a.label.toLowerCase()}…`}
            className="w-full bg-[#141414] border border-white/[0.08] text-white rounded-sm px-3 py-2 text-xs placeholder:text-[#333] focus:outline-none focus:border-[#C9A84C]/60"
          />
        </div>
      ))}
      <SubmitRow busy={busy} />
    </form>
  )
}

// ─── S&C ─────────────────────────────────────────────────────────────────────

function SCForm({
  sessionDate,
  setBusy,
  setError,
  busy,
  onSaved,
}: {
  sessionDate: string
  setBusy: (b: boolean) => void
  setError: (e: string | null) => void
  busy: boolean
  onSaved: () => void
}) {
  const [form, setForm] = useState({
    session_type: 'gym',
    duration_mins: '60',
    focus: '',
    rpe: '5',
    sleep_hours: '',
    hydration: '',
    pain_areas: '',
    reflection: '',
    completed: true,
  })

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      const res = await fetch('/api/pdp/reflections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'sc',
          session_date: sessionDate,
          session_type: form.session_type,
          duration_mins: form.duration_mins ? Number(form.duration_mins) : null,
          focus: form.focus.trim() || null,
          completed: form.completed,
          reflection: [
            form.rpe && `RPE: ${form.rpe}/10`,
            form.sleep_hours && `Sleep: ${form.sleep_hours}h`,
            form.hydration && `Hydration: ${form.hydration}`,
            form.pain_areas && `Pain/Tightness: ${form.pain_areas}`,
            form.reflection.trim(),
          ].filter(Boolean).join('\n') || null,
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

  const inputClass = 'w-full bg-[#141414] border border-white/[0.08] text-white rounded-sm px-3 py-2 text-sm placeholder:text-[#333] focus:outline-none focus:border-[#C9A84C]/60'
  const labelClass = 'block text-[10px] text-[#666] mb-1 uppercase tracking-wider'

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Session type</label>
          <select value={form.session_type} onChange={e => setForm(p => ({ ...p, session_type: e.target.value }))} className={inputClass}>
            <option value="gym">Gym</option>
            <option value="conditioning">Conditioning</option>
            <option value="speed">Speed / Agility</option>
            <option value="recovery">Recovery</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Duration (mins)</label>
          <input type="number" value={form.duration_mins} onChange={e => setForm(p => ({ ...p, duration_mins: e.target.value }))} className={inputClass} />
        </div>
      </div>
      <div>
        <label className={labelClass}>Focus</label>
        <input type="text" value={form.focus} onChange={e => setForm(p => ({ ...p, focus: e.target.value }))} placeholder="e.g. lower-body strength + plyo" className={inputClass} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={labelClass}>RPE (1–10)</label>
          <input type="number" min={1} max={10} value={form.rpe} onChange={e => setForm(p => ({ ...p, rpe: e.target.value }))} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Sleep (h)</label>
          <input type="number" step="0.5" value={form.sleep_hours} onChange={e => setForm(p => ({ ...p, sleep_hours: e.target.value }))} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Hydration</label>
          <input type="text" value={form.hydration} onChange={e => setForm(p => ({ ...p, hydration: e.target.value }))} placeholder="e.g. 2.5L" className={inputClass} />
        </div>
      </div>
      <div>
        <label className={labelClass}>Pain / tightness areas</label>
        <input type="text" value={form.pain_areas} onChange={e => setForm(p => ({ ...p, pain_areas: e.target.value }))} placeholder="e.g. left hamstring tight" className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>What went well / needs adjusting</label>
        <textarea rows={3} value={form.reflection} onChange={e => setForm(p => ({ ...p, reflection: e.target.value }))} className={inputClass} />
      </div>
      <SubmitRow busy={busy} />
    </form>
  )
}

// ─── Goals (short / long) ───────────────────────────────────────────────────

function GoalReflectionForm({
  type,
  sessionDate,
  setBusy,
  setError,
  busy,
  onSaved,
}: {
  type: 'short' | 'long'
  sessionDate: string
  setBusy: (b: boolean) => void
  setError: (e: string | null) => void
  busy: boolean
  onSaved: () => void
}) {
  const [form, setForm] = useState({
    area: type === 'short' ? '' : 'technical',
    target: '',
    actions: '',
    evidence: '',
    challenges: '',
    learnings: '',
    next_step: '',
    status_colour: STATUS_COLOURS[1].colour,
  })

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!form.target.trim()) {
      setError('Target is required')
      return
    }
    setBusy(true)
    try {
      const res = await fetch('/api/pdp/reflections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'weekly',
          week_start: sessionDate,
          area: type === 'long' ? `${form.area} (long-term)` : form.area || null,
          target: form.target.trim(),
          actions: form.actions.trim() || null,
          evidence: form.evidence.trim() || null,
          challenges: form.challenges.trim() || null,
          learnings: form.learnings.trim() || null,
          next_step: form.next_step.trim() || null,
          status_colour: form.status_colour,
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

  const inputClass = 'w-full bg-[#141414] border border-white/[0.08] text-white rounded-sm px-3 py-2 text-sm placeholder:text-[#333] focus:outline-none focus:border-[#C9A84C]/60'
  const labelClass = 'block text-[10px] text-[#666] mb-1 uppercase tracking-wider'

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label className={labelClass}>Pillar / Area</label>
        {type === 'long' ? (
          <select value={form.area} onChange={e => setForm(p => ({ ...p, area: e.target.value }))} className={inputClass}>
            {PILLARS.map(p => (
              <option key={p} value={p}>{p[0].toUpperCase() + p.slice(1)}</option>
            ))}
          </select>
        ) : (
          <input type="text" value={form.area} onChange={e => setForm(p => ({ ...p, area: e.target.value }))} placeholder="e.g. Passing under pressure" className={inputClass} />
        )}
      </div>

      <div>
        <label className={labelClass}>Target</label>
        <input type="text" required value={form.target} onChange={e => setForm(p => ({ ...p, target: e.target.value }))} placeholder="What outcome were we working towards?" className={inputClass} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Actions completed</label>
          <textarea rows={2} value={form.actions} onChange={e => setForm(p => ({ ...p, actions: e.target.value }))} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Evidence / proof</label>
          <textarea rows={2} value={form.evidence} onChange={e => setForm(p => ({ ...p, evidence: e.target.value }))} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Challenges</label>
          <textarea rows={2} value={form.challenges} onChange={e => setForm(p => ({ ...p, challenges: e.target.value }))} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Learnings</label>
          <textarea rows={2} value={form.learnings} onChange={e => setForm(p => ({ ...p, learnings: e.target.value }))} className={inputClass} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Next step</label>
        <input type="text" value={form.next_step} onChange={e => setForm(p => ({ ...p, next_step: e.target.value }))} className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>Status</label>
        <div className="flex gap-2 flex-wrap">
          {STATUS_COLOURS.map(s => (
            <button
              key={s.id}
              type="button"
              onClick={() => setForm(p => ({ ...p, status_colour: s.colour }))}
              className={
                'flex items-center gap-2 px-3 py-1.5 rounded-sm border text-[11px] transition-colors ' +
                (form.status_colour === s.colour
                  ? 'border-white/30 bg-white/[0.04] text-white'
                  : 'border-white/[0.08] text-[#888] hover:text-white hover:border-white/[0.15]')
              }
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.colour }} />
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <SubmitRow busy={busy} />
    </form>
  )
}

// ─── Shared ──────────────────────────────────────────────────────────────────

function SubmitRow({ busy }: { busy: boolean }) {
  return (
    <button
      type="submit"
      disabled={busy}
      className="w-full bg-[#C9A84C] hover:bg-[#d4b055] disabled:opacity-40 text-black font-black py-2.5 px-4 rounded-sm text-xs tracking-[0.15em] uppercase transition-colors mt-2"
      style={{ fontFamily: "'Arial Black', sans-serif" }}
    >
      {busy ? 'Saving…' : 'Save Reflection'}
    </button>
  )
}
