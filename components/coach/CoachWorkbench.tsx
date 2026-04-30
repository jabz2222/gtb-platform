'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatDate, formatTime } from '@/lib/utils/formatters'

interface Division {
  id: string
  name: string
  slug: string
  color_hex: string
}

interface PerformanceRow {
  id: string
  recorded_at: string
  metrics: Record<string, unknown>
  notes: string | null
  division: { name: string; color_hex: string } | null
}

interface Props {
  playerId: string
  playerName: string
  divisions: Division[]
  recentPerformance: PerformanceRow[]
  activatedSections?: string[]
}

export default function CoachWorkbench({ playerId, playerName, divisions, recentPerformance, activatedSections }: Props) {
  const router = useRouter()
  const [tab, setTab] = useState<'stats' | 'note' | 'sections'>('stats')

  return (
    <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
      <div className="border-b border-white/5 flex">
        <TabBtn active={tab === 'stats'} onClick={() => setTab('stats')} label="PlayerData (manual)" />
        <TabBtn active={tab === 'note'} onClick={() => setTab('note')} label="Session Note" />
        <TabBtn active={tab === 'sections'} onClick={() => setTab('sections')} label="PDP Sections" />
      </div>

      {tab === 'stats' && (
        <PerformanceForm
          playerId={playerId}
          divisions={divisions}
          recentPerformance={recentPerformance}
          onSaved={() => router.refresh()}
        />
      )}

      {tab === 'note' && (
        <SessionNoteForm playerId={playerId} playerName={playerName} onSaved={() => router.refresh()} />
      )}

      {tab === 'sections' && (
        <SectionActivator
          playerId={playerId}
          activated={activatedSections ?? []}
          onSaved={() => router.refresh()}
        />
      )}
    </div>
  )
}

function SectionActivator({
  playerId,
  activated,
  onSaved,
}: { playerId: string; activated: string[]; onSaved: () => void }) {
  const SECTIONS = [
    { slug: 'sc',                label: 'S&C Training' },
    { slug: 'mentorship',        label: 'Mentorship & Review' },
    { slug: 'kpis',              label: 'Habits & Consistency' },
    { slug: 'performance',       label: 'Training Reflection' },
    { slug: 'match',             label: 'Match Reflection' },
    { slug: 'technical',         label: 'Technical Tracker' },
    { slug: 'game-intelligence', label: 'Game Intelligence' },
    { slug: 'feedback',          label: 'Feedback & Review' },
  ] as const

  const [selected, setSelected] = useState<Set<string>>(new Set(activated))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  function toggle(slug: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      return next
    })
  }

  async function submit() {
    setError(null)
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/users/${playerId}/sections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections: Array.from(selected) }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(json.error ?? `Save failed (${res.status})`)
        return
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      onSaved()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="p-5 space-y-4">
      <p className="text-[11px] text-[#888]">
        Activate optional PDP sections for this player. Sections are visible but greyed-out for the player until activated.
      </p>
      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-300 text-xs px-3 py-2 rounded-sm">{error}</div>
      )}
      {saved && (
        <div className="bg-[#2E8B35]/15 border border-[#2E8B35]/30 text-[#2E8B35] text-xs px-3 py-2 rounded-sm">
          Sections updated.
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {SECTIONS.map(s => {
          const isActive = selected.has(s.slug)
          return (
            <label
              key={s.slug}
              className={
                'flex items-center gap-2.5 px-3 py-2 rounded-sm border cursor-pointer transition-colors ' +
                (isActive
                  ? 'border-[#2E8B35]/40 bg-[#2E8B35]/5'
                  : 'border-white/[0.08] hover:border-white/[0.15]')
              }
            >
              <input
                type="checkbox"
                checked={isActive}
                onChange={() => toggle(s.slug)}
                className="w-3.5 h-3.5 accent-[#2E8B35]"
              />
              <span className="text-xs text-white">{s.label}</span>
            </label>
          )
        })}
      </div>
      <button
        type="button"
        onClick={submit}
        disabled={busy}
        className="w-full bg-[#C9A84C] hover:bg-[#d4b055] disabled:opacity-40 text-black font-black py-2.5 px-4 rounded-sm text-xs tracking-[0.15em] uppercase transition-colors"
        style={{ fontFamily: "'Arial Black', sans-serif" }}
      >
        {busy ? 'Saving…' : 'Save Activated Sections'}
      </button>
    </div>
  )
}

function TabBtn({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'px-5 py-3 text-[11px] tracking-wider uppercase transition-colors border-b-2 -mb-px ' +
        (active
          ? 'text-[#C9A84C] border-[#C9A84C]'
          : 'text-[#666] border-transparent hover:text-white')
      }
    >
      {label}
    </button>
  )
}

function PerformanceForm({
  playerId,
  divisions,
  recentPerformance,
  onSaved,
}: {
  playerId: string
  divisions: Division[]
  recentPerformance: PerformanceRow[]
  onSaved: () => void
}) {
  const [form, setForm] = useState({
    division_id: '',
    distance_km: '',
    top_speed_kmh: '',
    sprint_count: '',
    duration_mins: '',
    heart_rate_avg: '',
    notes: '',
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      const metrics: Record<string, number> = {}
      const num = (v: string) => (v.trim() === '' ? null : Number(v))
      const fields: Array<keyof typeof form> = [
        'distance_km',
        'top_speed_kmh',
        'sprint_count',
        'duration_mins',
        'heart_rate_avg',
      ]
      for (const f of fields) {
        const n = num(form[f] as string)
        if (n != null && !isNaN(n)) metrics[f] = n
      }
      const res = await fetch(`/api/coach/players/${playerId}/performance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          division_id: form.division_id || null,
          metrics,
          notes: form.notes.trim() || null,
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(json.error ?? `Save failed (${res.status})`)
        return
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      setForm({
        division_id: form.division_id, // keep division
        distance_km: '',
        top_speed_kmh: '',
        sprint_count: '',
        duration_mins: '',
        heart_rate_avg: '',
        notes: '',
      })
      onSaved()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error')
    } finally {
      setBusy(false)
    }
  }

  const inputClass =
    'w-full bg-[#141414] border border-white/[0.08] text-white rounded-sm px-3 py-2 text-sm ' +
    'placeholder:text-[#333] focus:outline-none focus:border-[#C9A84C]/60 transition-colors'
  const labelClass = 'block text-[10px] text-[#666] mb-1 uppercase tracking-wider'

  return (
    <div>
      <form onSubmit={submit} className="p-5 space-y-4">
        <div className="bg-[#C9A84C]/8 border border-[#C9A84C]/20 rounded-sm px-3 py-2">
          <p className="text-[11px] text-[#C9A84C] tracking-wider uppercase mb-0.5">Manual Entry</p>
          <p className="text-[11px] text-[#aaa]">
            Enter post-session stats manually until PlayerData GPS API is connected.
          </p>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 text-xs px-3 py-2 rounded-sm">
            {error}
          </div>
        )}
        {saved && (
          <div className="bg-[#2E8B35]/15 border border-[#2E8B35]/30 text-[#2E8B35] text-xs px-3 py-2 rounded-sm">
            Performance entry saved.
          </div>
        )}

        <div>
          <label className={labelClass}>Division</label>
          <select
            value={form.division_id}
            onChange={e => setForm(p => ({ ...p, division_id: e.target.value }))}
            className={inputClass}
          >
            <option value="">— None —</option>
            {divisions.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Distance (km)" placeholder="e.g. 6.4">
            <input
              type="number"
              step="0.01"
              value={form.distance_km}
              onChange={e => setForm(p => ({ ...p, distance_km: e.target.value }))}
              className={inputClass}
            />
          </Field>
          <Field label="Top speed (km/h)" placeholder="e.g. 28.5">
            <input
              type="number"
              step="0.1"
              value={form.top_speed_kmh}
              onChange={e => setForm(p => ({ ...p, top_speed_kmh: e.target.value }))}
              className={inputClass}
            />
          </Field>
          <Field label="Sprint count" placeholder="e.g. 12">
            <input
              type="number"
              value={form.sprint_count}
              onChange={e => setForm(p => ({ ...p, sprint_count: e.target.value }))}
              className={inputClass}
            />
          </Field>
          <Field label="Duration (mins)" placeholder="e.g. 75">
            <input
              type="number"
              value={form.duration_mins}
              onChange={e => setForm(p => ({ ...p, duration_mins: e.target.value }))}
              className={inputClass}
            />
          </Field>
          <Field label="Avg heart rate" placeholder="bpm">
            <input
              type="number"
              value={form.heart_rate_avg}
              onChange={e => setForm(p => ({ ...p, heart_rate_avg: e.target.value }))}
              className={inputClass}
            />
          </Field>
        </div>

        <div>
          <label className={labelClass}>Notes (optional)</label>
          <textarea
            rows={2}
            value={form.notes}
            onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
            placeholder="Heat-map, observations, etc."
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          disabled={busy}
          className="w-full bg-[#C9A84C] hover:bg-[#d4b055] disabled:opacity-40 text-black font-black
                     py-2.5 px-4 rounded-sm text-xs tracking-[0.15em] uppercase transition-colors"
          style={{ fontFamily: "'Arial Black', sans-serif" }}
        >
          {busy ? 'Saving…' : 'Save Performance Entry'}
        </button>
      </form>

      {recentPerformance.length > 0 && (
        <div className="border-t border-white/5">
          <div className="px-5 py-3 border-b border-white/5">
            <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">
              Recent Entries · {recentPerformance.length}
            </span>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {recentPerformance.map(p => {
              const m = p.metrics
              return (
                <div key={p.id} className="px-5 py-3">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-[11px] text-[#888]">
                      {formatDate(p.recorded_at)} · {formatTime(p.recorded_at)}
                    </p>
                    {p.division && (
                      <span
                        className="text-[10px] uppercase tracking-wider"
                        style={{ color: p.division.color_hex }}
                      >
                        {p.division.name}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-[#bbb] flex flex-wrap gap-x-3 gap-y-0.5">
                    {typeof m.distance_km === 'number' && <span>{m.distance_km} km</span>}
                    {typeof m.top_speed_kmh === 'number' && <span>{m.top_speed_kmh} km/h top</span>}
                    {typeof m.sprint_count === 'number' && <span>{m.sprint_count} sprints</span>}
                    {typeof m.duration_mins === 'number' && <span>{m.duration_mins} min</span>}
                    {typeof m.heart_rate_avg === 'number' && <span>HR avg {m.heart_rate_avg}</span>}
                  </div>
                  {p.notes && <p className="text-[11px] text-[#888] mt-1 italic">{p.notes}</p>}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function Field({
  label,
  placeholder,
  children,
}: { label: string; placeholder?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] text-[#666] mb-1 uppercase tracking-wider">
        {label}
        {placeholder && <span className="ml-1 text-[#444] normal-case tracking-normal">· {placeholder}</span>}
      </label>
      {children}
    </div>
  )
}

function SessionNoteForm({
  playerId,
  playerName,
  onSaved,
}: { playerId: string; playerName: string; onSaved: () => void }) {
  const [form, setForm] = useState({
    week_start: new Date().toISOString().slice(0, 10),
    area: 'Technical',
    target: '',
    actions: '',
    evidence: '',
    challenges: '',
    learnings: '',
    next_step: '',
    status_colour: '#2E8B35',
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      const res = await fetch(`/api/coach/players/${playerId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(json.error ?? `Save failed (${res.status})`)
        return
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      setForm(p => ({ ...p, target: '', actions: '', evidence: '', challenges: '', learnings: '', next_step: '' }))
      onSaved()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error')
    } finally {
      setBusy(false)
    }
  }

  const inputClass =
    'w-full bg-[#141414] border border-white/[0.08] text-white rounded-sm px-3 py-2 text-sm ' +
    'placeholder:text-[#333] focus:outline-none focus:border-[#C9A84C]/60 transition-colors'
  const labelClass = 'block text-[10px] text-[#666] mb-1 uppercase tracking-wider'

  return (
    <form onSubmit={submit} className="p-5 space-y-4">
      <p className="text-[11px] text-[#888]">
        Add a coaching reflection for <span className="text-white">{playerName}</span>. Visible to the player and parent (read-only).
      </p>

      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-300 text-xs px-3 py-2 rounded-sm">
          {error}
        </div>
      )}
      {saved && (
        <div className="bg-[#2E8B35]/15 border border-[#2E8B35]/30 text-[#2E8B35] text-xs px-3 py-2 rounded-sm">
          Reflection saved.
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Week starting</label>
          <input
            type="date"
            value={form.week_start}
            onChange={e => setForm(p => ({ ...p, week_start: e.target.value }))}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Area</label>
          <select
            value={form.area}
            onChange={e => setForm(p => ({ ...p, area: e.target.value }))}
            className={inputClass}
          >
            {['Technical', 'Tactical', 'Physical', 'Psychological', 'Lifestyle', 'Match', 'Mentoring'].map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Target</label>
        <input
          type="text"
          value={form.target}
          onChange={e => setForm(p => ({ ...p, target: e.target.value }))}
          placeholder="What outcome were we working towards?"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Actions taken</label>
        <textarea
          rows={2}
          value={form.actions}
          onChange={e => setForm(p => ({ ...p, actions: e.target.value }))}
          placeholder="What we did this session/week"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Evidence (what went well)</label>
        <textarea
          rows={2}
          value={form.evidence}
          onChange={e => setForm(p => ({ ...p, evidence: e.target.value }))}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Challenges</label>
        <textarea
          rows={2}
          value={form.challenges}
          onChange={e => setForm(p => ({ ...p, challenges: e.target.value }))}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Learnings</label>
        <textarea
          rows={2}
          value={form.learnings}
          onChange={e => setForm(p => ({ ...p, learnings: e.target.value }))}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Next step</label>
        <input
          type="text"
          value={form.next_step}
          onChange={e => setForm(p => ({ ...p, next_step: e.target.value }))}
          placeholder="Focus for the next session"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Status indicator</label>
        <div className="flex gap-2">
          {[
            { c: '#2E8B35', l: 'On track' },
            { c: '#C9A84C', l: 'Needs focus' },
            { c: '#CC2222', l: 'Concern' },
          ].map(s => (
            <button
              key={s.c}
              type="button"
              onClick={() => setForm(p => ({ ...p, status_colour: s.c }))}
              className={
                'flex items-center gap-2 px-3 py-1.5 rounded-sm border text-[11px] transition-colors ' +
                (form.status_colour === s.c
                  ? 'border-[#C9A84C]/60 bg-[#C9A84C]/5 text-white'
                  : 'border-white/[0.08] text-[#888] hover:border-white/[0.15]')
              }
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.c }} />
              {s.l}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={busy}
        className="w-full bg-[#C9A84C] hover:bg-[#d4b055] disabled:opacity-40 text-black font-black
                   py-2.5 px-4 rounded-sm text-xs tracking-[0.15em] uppercase transition-colors"
        style={{ fontFamily: "'Arial Black', sans-serif" }}
      >
        {busy ? 'Saving…' : 'Save Reflection'}
      </button>
    </form>
  )
}
