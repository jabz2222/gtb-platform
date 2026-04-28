'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Area = 'technical' | 'tactical' | 'physical' | 'psychological' | 'lifestyle'
type StatusColour = 'blue' | 'green' | 'yellow' | 'red'

const AREAS: Area[] = ['technical', 'tactical', 'physical', 'psychological', 'lifestyle']

const STATUS_OPTIONS: { value: StatusColour; label: string; colour: string }[] = [
  { value: 'blue',   label: 'Exceeding',       colour: '#5BB8E8' },
  { value: 'green',  label: 'On Track',         colour: '#2E8B35' },
  { value: 'yellow', label: 'Some Challenges',  colour: '#C9A84C' },
  { value: 'red',    label: 'Off Track',        colour: '#CC2222' },
]

interface Reflection {
  id?: string
  area: string
  target?: string | null
  actions?: string | null
  evidence?: string | null
  challenges?: string | null
  learnings?: string | null
  next_step?: string | null
  status_colour?: string | null
}

interface Props {
  userId: string
  weekStart: string
  existing: Reflection[]
  pastWeeks: string[]
}

export default function WeeklyReflectionsForm({ userId, weekStart, existing, pastWeeks }: Props) {
  const [activeArea, setActiveArea] = useState<Area>('technical')
  const [entries, setEntries] = useState<Record<Area, Reflection>>(() => {
    const init = {} as Record<Area, Reflection>
    for (const area of AREAS) {
      const found = existing.find(r => r.area === area)
      init[area] = found ?? { area, target: '', actions: '', evidence: '', challenges: '', learnings: '', next_step: '', status_colour: 'green' }
    }
    return init
  })
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const router = useRouter()

  const current = entries[activeArea]

  function update(field: keyof Reflection, value: string) {
    setEntries(e => ({ ...e, [activeArea]: { ...e[activeArea], [field]: value } }))
  }

  function handleSave() {
    startTransition(async () => {
      const supabase = createClient()
      const row = {
        player_id: userId,
        week_start: weekStart,
        area: activeArea,
        target: entries[activeArea].target ?? '',
        actions: entries[activeArea].actions ?? '',
        evidence: entries[activeArea].evidence ?? '',
        challenges: entries[activeArea].challenges ?? '',
        learnings: entries[activeArea].learnings ?? '',
        next_step: entries[activeArea].next_step ?? '',
        status_colour: entries[activeArea].status_colour ?? 'green',
      }
      await supabase.from('pdp_reflections').upsert(row, { onConflict: 'player_id,week_start,area' })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      router.refresh()
    })
  }

  const inputCls = "w-full bg-[#111] border border-white/10 rounded-sm px-3 py-2 text-sm text-white focus:outline-none focus:border-[#2E8B35]/50 transition-colors resize-y"
  const labelCls = "block text-[11px] uppercase tracking-[0.2em] text-[#444] mb-1"

  const statusColour = STATUS_OPTIONS.find(s => s.value === (current.status_colour ?? 'green'))?.colour ?? '#2E8B35'

  return (
    <div className="space-y-6">
      {/* Area tabs */}
      <div className="flex gap-1 border-b border-white/5 pb-0 flex-wrap">
        {AREAS.map(area => (
          <button
            key={area}
            onClick={() => setActiveArea(area)}
            className={`px-4 py-2.5 text-xs tracking-wider uppercase transition-colors border-b-2 -mb-px capitalize ${
              activeArea === area
                ? 'text-[#2E8B35] border-[#2E8B35]'
                : 'text-[#444] border-transparent hover:text-[#888]'
            }`}
          >
            {area}
          </button>
        ))}
      </div>

      <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <span className="text-[11px] tracking-[0.3em] uppercase text-[#2E8B35] capitalize">{activeArea} Reflection</span>
          {/* Status selector */}
          <div className="flex gap-2">
            {STATUS_OPTIONS.map(s => (
              <button
                key={s.value}
                onClick={() => update('status_colour', s.value)}
                title={s.label}
                className="w-3 h-3 rounded-full border-2 transition-all"
                style={{
                  backgroundColor: s.value === current.status_colour ? s.colour : 'transparent',
                  borderColor: s.colour,
                }}
              />
            ))}
            <span className="text-[10px] ml-1" style={{ color: statusColour }}>
              {STATUS_OPTIONS.find(s => s.value === current.status_colour)?.label ?? 'On Track'}
            </span>
          </div>
        </div>
        <div className="p-5 grid grid-cols-2 gap-4">
          {[
            { field: 'target' as keyof Reflection, label: 'Target' },
            { field: 'actions' as keyof Reflection, label: 'Actions Taken' },
            { field: 'evidence' as keyof Reflection, label: 'Evidence' },
            { field: 'challenges' as keyof Reflection, label: 'Challenges' },
            { field: 'learnings' as keyof Reflection, label: 'Key Learnings' },
            { field: 'next_step' as keyof Reflection, label: 'Next Step' },
          ].map(({ field, label }) => (
            <div key={field} className={field === 'learnings' || field === 'next_step' ? 'col-span-2' : ''}>
              <label className={labelCls}>{label}</label>
              <textarea
                value={(current[field] as string) ?? ''}
                onChange={e => update(field, e.target.value)}
                rows={3}
                className={inputCls}
              />
            </div>
          ))}
        </div>
      </div>

      {saved && (
        <div className="p-3 bg-[#2E8B35]/15 border border-[#2E8B35]/20 rounded-sm text-[#2E8B35] text-sm">
          Reflection saved ✓
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={isPending}
        className="px-6 py-2.5 text-[11px] tracking-[0.25em] uppercase font-medium rounded-sm
                   bg-[#2E8B35] text-white hover:bg-[#2E8B35]/80 disabled:opacity-40 transition-colors"
      >
        {isPending ? 'Saving...' : 'Save Reflection'}
      </button>

      {pastWeeks.length > 0 && (
        <div className="mt-4">
          <p className="text-[11px] text-[#444] uppercase tracking-wider mb-2">Past Weeks</p>
          <div className="flex gap-2 flex-wrap">
            {pastWeeks.map(w => (
              <span key={w} className="text-[11px] px-2 py-1 bg-[#111] border border-white/5 rounded-sm text-[#555]">
                {new Date(w).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
