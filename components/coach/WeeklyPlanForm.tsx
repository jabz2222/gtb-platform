'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Props {
  coachId: string
  weekStart: string
  existing: {
    intended_focus?: string | null
    coaching_behaviours?: string | null
    practice_design?: string | null
    equipment_notes?: string | null
  } | null
}

function Field({
  label,
  hint,
  value,
  onChange,
  rows = 4,
}: {
  label: string
  hint: string
  value: string
  onChange: (v: string) => void
  rows?: number
}) {
  return (
    <div>
      <label className="block text-[11px] uppercase tracking-[0.25em] text-[#555] mb-1">{label}</label>
      <p className="text-[11px] text-[#333] mb-2">{hint}</p>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={rows}
        className="w-full bg-[#111] border border-white/10 rounded-sm px-4 py-3 text-sm text-white
                   placeholder-[#333] resize-y focus:outline-none focus:border-[#9B2454]/50 transition-colors"
      />
    </div>
  )
}

export default function WeeklyPlanForm({ coachId, weekStart, existing }: Props) {
  const [focus, setFocus] = useState(existing?.intended_focus ?? '')
  const [behaviours, setBehaviours] = useState(existing?.coaching_behaviours ?? '')
  const [practice, setPractice] = useState(existing?.practice_design ?? '')
  const [equipment, setEquipment] = useState(existing?.equipment_notes ?? '')
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  function handleSave() {
    startTransition(async () => {
      setError('')
      const supabase = createClient()
      const { error: err } = await supabase
        .from('coach_weekly_plans')
        .upsert({
          coach_id: coachId,
          week_start: weekStart,
          intended_focus: focus,
          coaching_behaviours: behaviours,
          practice_design: practice,
          equipment_notes: equipment,
        }, { onConflict: 'coach_id,week_start' })

      if (err) {
        setError('Failed to save. Please try again.')
      } else {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
        router.refresh()
      }
    })
  }

  return (
    <div className="space-y-6">
      <Field
        label="Intended Focus"
        hint="What is the primary coaching focus for this week? (theme, technical area, tactical concept)"
        value={focus}
        onChange={setFocus}
        rows={3}
      />
      <Field
        label="Coaching Behaviours"
        hint="Which specific coaching behaviours will you prioritise? (e.g. guided discovery, positive reinforcement, silence & observation)"
        value={behaviours}
        onChange={setBehaviours}
      />
      <Field
        label="Practice Design"
        hint="How will you structure your sessions? (warm-up, main theme, SSGs, cool-down, key progressions)"
        value={practice}
        onChange={setPractice}
        rows={5}
      />
      <Field
        label="Equipment & Logistics"
        hint="Any equipment needed, pitch setup, or logistical notes?"
        value={equipment}
        onChange={setEquipment}
        rows={2}
      />

      {error && (
        <p className="text-[#CC2222] text-sm">{error}</p>
      )}

      {saved && (
        <div className="p-3 bg-[#2E8B35]/15 border border-[#2E8B35]/20 rounded-sm text-[#2E8B35] text-sm">
          Plan saved for week of {new Date(weekStart).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })} ✓
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="px-6 py-2.5 text-[11px] tracking-[0.25em] uppercase font-medium rounded-sm
                     bg-[#9B2454] text-white hover:bg-[#9B2454]/80 disabled:opacity-40 transition-colors"
        >
          {isPending ? 'Saving...' : existing ? 'Update Plan' : 'Save Plan'}
        </button>
      </div>
    </div>
  )
}
