'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type ReflectionType = 'training' | 'match' | 'technical'

const TRAINING_AREAS = ['Understanding', 'Learning', 'Challenges', 'Self-Awareness', 'Effort', 'Improvement']
const MATCH_AREAS = ['Decision-Making', 'Technical Quality', 'Tactical Awareness', 'Effort & Attitude', 'Communication', 'Areas for Growth']
const TECHNICAL_SKILLS = ['Passing', 'Receiving', 'Dribbling', '1v1 Defending', 'Positioning', 'Shooting', 'Heading', 'Set Pieces']

interface Reflection {
  id: string
  session_date: string
  reflection_type: string
  area: string
  rating: number | null
  notes: string | null
}

interface Props {
  userId: string
  defaultTab: ReflectionType
  reflections: Reflection[]
}

export default function SessionReflectionForm({ userId, defaultTab, reflections }: Props) {
  const [tab, setTab] = useState<ReflectionType>(defaultTab)
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0])
  const [ratings, setRatings] = useState<Record<string, number>>({})
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const router = useRouter()

  const areasForTab: Record<ReflectionType, string[]> = {
    training: TRAINING_AREAS,
    match: MATCH_AREAS,
    technical: TECHNICAL_SKILLS,
  }

  const tabColour: Record<ReflectionType, string> = {
    training: '#9B2454',
    match: '#E8641A',
    technical: '#2E8B35',
  }

  const colour = tabColour[tab]

  function setRating(area: string, val: number) {
    setRatings(r => ({ ...r, [`${tab}:${area}`]: val }))
  }

  function setNote(area: string, val: string) {
    setNotes(n => ({ ...n, [`${tab}:${area}`]: val }))
  }

  function handleSave() {
    const areas = areasForTab[tab]
    const rows = areas.map(area => ({
      player_id: userId,
      session_date: sessionDate,
      reflection_type: tab,
      area,
      rating: ratings[`${tab}:${area}`] ?? null,
      notes: notes[`${tab}:${area}`]?.trim() || null,
    }))

    startTransition(async () => {
      const supabase = createClient()
      await supabase.from('pdp_session_reflections').insert(rows)
      setRatings({}); setNotes({})
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      router.refresh()
    })
  }

  const recentForTab = reflections.filter(r => r.reflection_type === tab).slice(0, 6)

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/5 pb-0">
        {([
          { key: 'training', label: 'Training' },
          { key: 'match', label: 'Match' },
          { key: 'technical', label: 'Technical' },
        ] as const).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="px-4 py-2.5 text-xs tracking-wider uppercase transition-colors border-b-2 -mb-px"
            style={tab === t.key
              ? { color: tabColour[t.key], borderColor: tabColour[t.key] }
              : { color: '#444', borderColor: 'transparent' }
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Date */}
      <div className="flex items-center gap-4">
        <div>
          <label className="block text-[11px] uppercase tracking-[0.2em] text-[#444] mb-1">Session Date</label>
          <input
            type="date"
            value={sessionDate}
            onChange={e => setSessionDate(e.target.value)}
            className="bg-[#111] border border-white/10 rounded-sm px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30 transition-colors"
          />
        </div>
      </div>

      {/* Rating grid */}
      <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5">
          <span className="text-[11px] tracking-[0.3em] uppercase capitalize" style={{ color: colour }}>
            {tab} Reflection — Rate each area 1–5
          </span>
        </div>
        <div className="p-5 space-y-5">
          {areasForTab[tab].map(area => {
            const key = `${tab}:${area}`
            const rating = ratings[key] ?? 0
            return (
              <div key={area}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#888]">{area}</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(v => (
                      <button
                        key={v}
                        onClick={() => setRating(area, v)}
                        className="w-8 h-8 rounded-sm text-xs font-medium transition-colors"
                        style={rating >= v
                          ? { backgroundColor: colour, color: '#000' }
                          : { backgroundColor: '#1A1A1A', color: '#444' }
                        }
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="text"
                  value={notes[key] ?? ''}
                  onChange={e => setNote(area, e.target.value)}
                  placeholder="Notes..."
                  className="w-full bg-[#111] border border-white/10 rounded-sm px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white/20 transition-colors"
                />
              </div>
            )
          })}
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
        className="px-6 py-2.5 text-[11px] tracking-[0.25em] uppercase font-medium rounded-sm text-white disabled:opacity-40 transition-opacity"
        style={{ backgroundColor: colour }}
      >
        {isPending ? 'Saving...' : 'Save Reflection'}
      </button>

      {/* Recent entries */}
      {recentForTab.length > 0 && (
        <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <span className="text-[11px] tracking-[0.3em] uppercase" style={{ color: colour }}>Recent Entries</span>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {recentForTab.map(r => (
              <div key={r.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <span className="text-sm text-[#888]">{r.area}</span>
                  {r.notes && <p className="text-[11px] text-[#333] mt-0.5">{r.notes}</p>}
                </div>
                <div className="text-right">
                  {r.rating && (
                    <span className="text-sm font-medium" style={{ color: colour }}>{r.rating}/5</span>
                  )}
                  <p className="text-[10px] text-[#333] mt-0.5">
                    {new Date(r.session_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
