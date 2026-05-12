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

// Training reflection areas — verbatim prompts from GTB-WEB-002 v1.0 §3.3
const TRAINING_AREAS = [
  {
    id: 'understanding',
    label: 'Understanding the Session',
    icon: '🧠',
    prompts: [
      'What was today’s main focus?',
      'Why is it important for my development / position?',
      'How does it link to match performance?',
      'Which part felt most like real gameplay?',
    ],
  },
  {
    id: 'learning',
    label: 'Learning & Application',
    icon: '⚙️',
    prompts: [
      'Two key things I learned?',
      'How will I apply them in games?',
      'Habits to remember / repeat?',
      'Which technique or decision improved?',
    ],
  },
  {
    id: 'challenges',
    label: 'Challenges & Growth',
    icon: '💪',
    prompts: [
      'Two hardest parts?',
      'Why were they challenging?',
      'How did I respond?',
      'Strategies or mindset to overcome them?',
      'How can I improve next time?',
    ],
  },
  {
    id: 'self_awareness',
    label: 'Self-Awareness & Performance',
    icon: '🔍',
    prompts: [
      'When did I feel most confident?',
      'What helped me feel confident?',
      'When did I feel least confident?',
      'How did mindset / body language affect me?',
      'How did I communicate or connect with my coach?',
    ],
  },
  {
    id: 'effort',
    label: 'Effort & Mindset',
    icon: '🧩',
    prompts: [
      'Focus / effort rating (1–10)?',
      'What kept me motivated?',
      'How did I respond to feedback?',
      'Attitude to carry forward?',
      'One thing I’m proud of?',
    ],
  },
  {
    id: 'improvement',
    label: 'Improvement & Next Steps',
    icon: '🧭',
    prompts: [
      'What could have made this session better?',
      'Which part of my game to improve?',
      'How to continue working outside session?',
      'Small action before next session?',
      'Next goal for the session / week?',
    ],
  },
] as const

// Match reflection areas — verbatim prompts from GTB-WEB-002 v1.0 §3.4
const MATCH_AREAS = [
  {
    id: 'understanding',
    label: 'Understanding the Match',
    icon: '🧠',
    prompts: [
      'What was the main focus or tactical plan?',
      'How did my role contribute to the team strategy?',
      'Did the team implement the game plan?',
      'What part of the match felt most like my usual style?',
    ],
  },
  {
    id: 'highlights',
    label: 'Performance Highlights',
    icon: '⚡',
    prompts: [
      'Two specific things I did well (be specific).',
      'How did these contribute to the team or my development?',
      'What made these actions successful?',
    ],
  },
  {
    id: 'areas_to_improve',
    label: 'Areas to Improve / Mistakes',
    icon: '⚠️',
    prompts: [
      'Two specific mistakes or areas to improve.',
      'Why were they challenging? (technical, tactical, mental, physical)',
      'How could I have handled these differently?',
    ],
  },
  {
    id: 'learning_application',
    label: 'Learning & Application',
    icon: '⚙️',
    prompts: [
      'One key thing I learned from this match.',
      'How can I apply this in future matches or training?',
      'Which habits or preparation helped or hindered?',
    ],
  },
  {
    id: 'effort_mindset',
    label: 'Effort & Mindset',
    icon: '🧩',
    prompts: [
      'How much focus and effort did I give (1–10)?',
      'How did I respond to pressure, mistakes, setbacks?',
      'How did mindset / body language affect performance?',
      'Attitude to carry to next match?',
    ],
  },
  {
    id: 'next_steps',
    label: 'Next Steps / Goals',
    icon: '🧭',
    prompts: [
      'One thing to improve before next match?',
      'Small action to take?',
      'Team or individual habits to continue / adjust?',
      'One concrete goal for next match.',
    ],
  },
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
  areas: ReadonlyArray<{ id: string; label: string; icon: string; prompts: readonly string[] }>
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
          {/* Verbatim prompts from GTB Player Development Plan Guide (Brief §3.3/§3.4) */}
          <ul className="mb-2 space-y-0.5 list-disc list-inside marker:text-[#C9A84C]/60">
            {a.prompts.map((p, i) => (
              <li key={i} className="text-[11px] text-[#888] leading-snug">{p}</li>
            ))}
          </ul>
          <textarea
            rows={3}
            value={notes[a.id] ?? ''}
            onChange={e => setNotes(p => ({ ...p, [a.id]: e.target.value }))}
            placeholder="Your answer…"
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

// 5-pillar weekly/phase reflection table per Brief §3.2.
// Player fills target/actions/evidence/challenges/learnings/next_step per pillar
// and selects a RAG status (Blue/Green/Yellow/Red). All non-empty rows are
// submitted in a single batch insert.
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
  type Row = {
    target: string
    actions: string
    evidence: string
    challenges: string
    learnings: string
    next_step: string
    status_colour: string
  }
  const blankRow = (): Row => ({
    target: '', actions: '', evidence: '', challenges: '',
    learnings: '', next_step: '', status_colour: STATUS_COLOURS[1].colour,
  })

  const [rows, setRows] = useState<Record<string, Row>>(
    Object.fromEntries(PILLARS.map(p => [p, blankRow()]))
  )

  function update(pillar: string, field: keyof Row, value: string) {
    setRows(prev => ({ ...prev, [pillar]: { ...prev[pillar], [field]: value } }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const tagSuffix = type === 'long' ? ' (long-term)' : ''
    const payload = PILLARS.map(pillar => {
      const r = rows[pillar]
      return {
        area: pillar.charAt(0).toUpperCase() + pillar.slice(1) + tagSuffix,
        target: r.target.trim(),
        actions: r.actions.trim() || null,
        evidence: r.evidence.trim() || null,
        challenges: r.challenges.trim() || null,
        learnings: r.learnings.trim() || null,
        next_step: r.next_step.trim() || null,
        status_colour: r.status_colour,
      }
    }).filter(r => r.target)

    if (payload.length === 0) {
      setError('Add a target for at least one pillar.')
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
          rows: payload,
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

  const inputClass = 'w-full bg-[#141414] border border-white/[0.08] text-white rounded-sm px-2.5 py-1.5 text-xs placeholder:text-[#333] focus:outline-none focus:border-[#C9A84C]/60'
  const cellLabel = 'block text-[9px] text-[#666] mb-0.5 uppercase tracking-wider'

  const PILLAR_COLOURS: Record<string, string> = {
    technical:     '#5BB8E8',
    tactical:      '#2E9B8A',
    physical:      '#2E8B35',
    psychological: '#9B2454',
    lifestyle:     '#C9A84C',
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <p className="text-[11px] text-[#888]">
        {type === 'long'
          ? 'Long-term goals (6+ weeks). Fill in any pillars you want to reflect on; leave the rest blank.'
          : 'Short-term goals (this week / 1–6 weeks). Fill in any pillars you want to reflect on; leave the rest blank.'}
      </p>

      <div className="space-y-3">
        {PILLARS.map(pillar => {
          const r = rows[pillar]
          const colour = PILLAR_COLOURS[pillar]
          return (
            <div
              key={pillar}
              className="bg-[#111] border border-white/5 rounded-sm p-3 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: colour }} />
              <div className="flex items-center justify-between mb-2">
                <p
                  className="text-xs font-black uppercase tracking-wider"
                  style={{ color: colour, fontFamily: "'Arial Black', sans-serif" }}
                >
                  {pillar}
                </p>
                <div className="flex gap-1">
                  {STATUS_COLOURS.map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => update(pillar, 'status_colour', s.colour)}
                      title={s.label}
                      className={
                        'w-5 h-5 rounded-full border-2 transition-all ' +
                        (r.status_colour === s.colour ? 'border-white scale-110' : 'border-white/[0.08] hover:border-white/30')
                      }
                      style={{ backgroundColor: s.colour }}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="sm:col-span-2">
                  <label className={cellLabel}>{type === 'long' ? 'Target (long-term)' : 'Target this week'}</label>
                  <input
                    type="text"
                    value={r.target}
                    onChange={e => update(pillar, 'target', e.target.value)}
                    placeholder={`${pillar.charAt(0).toUpperCase() + pillar.slice(1)} goal…`}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={cellLabel}>Actions this week</label>
                  <textarea rows={2} value={r.actions} onChange={e => update(pillar, 'actions', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={cellLabel}>Evidence / proof</label>
                  <textarea rows={2} value={r.evidence} onChange={e => update(pillar, 'evidence', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={cellLabel}>Challenges</label>
                  <textarea rows={2} value={r.challenges} onChange={e => update(pillar, 'challenges', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={cellLabel}>Learnings</label>
                  <textarea rows={2} value={r.learnings} onChange={e => update(pillar, 'learnings', e.target.value)} className={inputClass} />
                </div>
                <div className="sm:col-span-2">
                  <label className={cellLabel}>Next step</label>
                  <input
                    type="text"
                    value={r.next_step}
                    onChange={e => update(pillar, 'next_step', e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          )
        })}
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
