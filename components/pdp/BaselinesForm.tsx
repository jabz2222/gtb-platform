'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Category = 'physical' | 'psychological' | 'technical'

const PHYSICAL_METRICS = ['Height (cm)', 'Weight (kg)', 'Sprint 10m (s)', 'Sprint 20m (s)', 'Sprint 40m (s)', 'Agility T-Test (s)', 'VO2 Max (ml/kg/min)']
const PSYCH_METRICS = ['Confidence', 'Resilience', 'Focus', 'Leadership', 'Coachability']
const TECH_METRICS = ['Passing', 'Receiving', '1v1 Defending', '1v1 Attacking', 'Positioning', 'Decision-Making', 'Set Pieces']

const STATUS_COLOURS: Record<string, string> = {
  physical: '#CC2222',
  psychological: '#9B2454',
  technical: '#5BB8E8',
}

interface Baseline { category: string; metric_name: string; value: number | null }

export default function BaselinesForm({ userId, existing }: { userId: string; existing: Baseline[] }) {
  const [tab, setTab] = useState<Category>('physical')
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    for (const b of existing) {
      init[`${b.category}:${b.metric_name}`] = b.value != null ? String(b.value) : ''
    }
    return init
  })
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const colour = STATUS_COLOURS[tab]

  const metricsForTab: Record<Category, string[]> = {
    physical: PHYSICAL_METRICS,
    psychological: PSYCH_METRICS,
    technical: TECH_METRICS,
  }

  function handleSave() {
    startTransition(async () => {
      const supabase = createClient()
      const metrics = metricsForTab[tab]
      const rows = metrics
        .filter(m => values[`${tab}:${m}`] !== undefined && values[`${tab}:${m}`] !== '')
        .map(m => ({
          player_id: userId,
          season: new Date().getFullYear().toString(),
          category: tab,
          metric_name: m,
          value: parseFloat(values[`${tab}:${m}`] ?? '0'),
          rated_by: 'self',
        }))

      if (rows.length > 0) {
        await supabase.from('pdp_baselines').upsert(rows, {
          onConflict: 'player_id,season,category,metric_name',
          ignoreDuplicates: false,
        })
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      router.refresh()
    })
  }

  const inputCls = "w-full bg-[#111] border border-white/10 rounded-sm px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30 transition-colors"
  const sliderCls = "w-full accent-[#9B2454] h-2 rounded-full bg-[#1A1A1A] cursor-pointer"

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/5 pb-0">
        {(['physical', 'psychological', 'technical'] as Category[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-xs tracking-wider uppercase transition-colors border-b-2 -mb-px capitalize ${
              tab === t
                ? 'border-b-2'
                : 'text-[#444] border-transparent hover:text-[#888]'
            }`}
            style={tab === t ? { color: STATUS_COLOURS[t], borderColor: STATUS_COLOURS[t] } : undefined}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5">
          <span className="text-[11px] tracking-[0.3em] uppercase capitalize" style={{ color: colour }}>
            {tab} Baseline — {new Date().getFullYear()} Season
          </span>
        </div>
        <div className="p-5">
          {tab === 'psychological' ? (
            <div className="space-y-5">
              <p className="text-[11px] text-[#444] mb-2">Rate each quality 1–10</p>
              {PSYCH_METRICS.map(m => {
                const key = `${tab}:${m}`
                const val = parseInt(values[key] ?? '5')
                return (
                  <div key={m}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-[#888]">{m}</span>
                      <span className="text-sm font-medium text-white">{val}/10</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={val}
                      onChange={e => setValues(v => ({ ...v, [key]: e.target.value }))}
                      className={sliderCls}
                    />
                  </div>
                )
              })}
            </div>
          ) : tab === 'technical' ? (
            <div>
              <p className="text-[11px] text-[#444] mb-4">Self-rating 1–10 (coach rating may be added separately)</p>
              <div className="space-y-4">
                {TECH_METRICS.map(m => {
                  const key = `${tab}:${m}`
                  const val = parseInt(values[key] ?? '5')
                  return (
                    <div key={m}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-[#888]">{m}</span>
                        <span className="text-sm font-medium" style={{ color: colour }}>{val}/10</span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={10}
                        value={val}
                        onChange={e => setValues(v => ({ ...v, [key]: e.target.value }))}
                        className="w-full h-2 rounded-full bg-[#1A1A1A] cursor-pointer"
                        style={{ accentColor: colour }}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {PHYSICAL_METRICS.map(m => {
                const key = `${tab}:${m}`
                return (
                  <div key={m}>
                    <label className="block text-[11px] uppercase tracking-[0.2em] text-[#444] mb-1">{m}</label>
                    <input
                      type="number"
                      step="0.01"
                      value={values[key] ?? ''}
                      onChange={e => setValues(v => ({ ...v, [key]: e.target.value }))}
                      placeholder="Enter value"
                      className={inputCls}
                    />
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {saved && (
        <div className="p-3 bg-[#2E8B35]/15 border border-[#2E8B35]/20 rounded-sm text-[#2E8B35] text-sm">
          Baselines saved ✓
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={isPending}
        className="px-6 py-2.5 text-[11px] tracking-[0.25em] uppercase font-medium rounded-sm
                   text-white hover:opacity-80 disabled:opacity-40 transition-opacity"
        style={{ backgroundColor: colour }}
      >
        {isPending ? 'Saving...' : 'Save Baselines'}
      </button>
    </div>
  )
}
