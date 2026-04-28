'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface GameEntry {
  id: string
  game_date: string
  opposition?: string | null
  formation?: string | null
  decision_one?: string | null
  decision_two?: string | null
  decision_three?: string | null
  what_worked?: string | null
  what_didnt?: string | null
  coach_feedback?: string | null
}

export default function GameIntelligenceForm({ userId, entries }: { userId: string; entries: GameEntry[] }) {
  const [gameDate, setGameDate] = useState(new Date().toISOString().split('T')[0])
  const [opposition, setOpposition] = useState('')
  const [formation, setFormation] = useState('')
  const [dec1, setDec1] = useState('')
  const [dec2, setDec2] = useState('')
  const [dec3, setDec3] = useState('')
  const [worked, setWorked] = useState('')
  const [didnt, setDidnt] = useState('')
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleSave() {
    startTransition(async () => {
      const supabase = createClient()
      await supabase.from('pdp_game_intelligence').insert({
        player_id: userId,
        game_date: gameDate,
        opposition: opposition.trim() || null,
        formation: formation.trim() || null,
        decision_one: dec1.trim() || null,
        decision_two: dec2.trim() || null,
        decision_three: dec3.trim() || null,
        what_worked: worked.trim() || null,
        what_didnt: didnt.trim() || null,
      })
      setOpposition(''); setFormation(''); setDec1(''); setDec2(''); setDec3(''); setWorked(''); setDidnt('')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      router.refresh()
    })
  }

  const inputCls = "w-full bg-[#111] border border-white/10 rounded-sm px-3 py-2 text-sm text-white focus:outline-none focus:border-[#CC2222]/50 transition-colors resize-y"
  const labelCls = "block text-[11px] uppercase tracking-[0.2em] text-[#444] mb-1"

  return (
    <div className="space-y-6">
      {/* New entry form */}
      <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5">
          <span className="text-[11px] tracking-[0.3em] uppercase text-[#CC2222]">Log Game</span>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Date</label>
              <input type="date" value={gameDate} onChange={e => setGameDate(e.target.value)} className={inputCls.replace('resize-y', '')} />
            </div>
            <div>
              <label className={labelCls}>Opposition</label>
              <input type="text" value={opposition} onChange={e => setOpposition(e.target.value)} placeholder="e.g. Chelsea U15" className={inputCls.replace('resize-y', '')} />
            </div>
            <div>
              <label className={labelCls}>Formation Used</label>
              <input type="text" value={formation} onChange={e => setFormation(e.target.value)} placeholder="e.g. 4-3-3" className={inputCls.replace('resize-y', '')} />
            </div>
          </div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#CC2222] pt-2">Key Decisions Made</p>
          {[
            { label: 'Decision 1', value: dec1, set: setDec1 },
            { label: 'Decision 2', value: dec2, set: setDec2 },
            { label: 'Decision 3', value: dec3, set: setDec3 },
          ].map(d => (
            <div key={d.label}>
              <label className={labelCls}>{d.label}</label>
              <textarea value={d.value} onChange={e => d.set(e.target.value)} rows={2} placeholder="Describe a key moment where you had to make a decision..." className={inputCls} />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>What Worked</label>
              <textarea value={worked} onChange={e => setWorked(e.target.value)} rows={3} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>What Didn&apos;t Work</label>
              <textarea value={didnt} onChange={e => setDidnt(e.target.value)} rows={3} className={inputCls} />
            </div>
          </div>
        </div>
      </div>

      {saved && <div className="p-3 bg-[#2E8B35]/15 border border-[#2E8B35]/20 rounded-sm text-[#2E8B35] text-sm">Game logged ✓</div>}
      <button onClick={handleSave} disabled={isPending} className="px-6 py-2.5 text-[11px] tracking-[0.25em] uppercase font-medium rounded-sm bg-[#CC2222] text-white hover:bg-[#CC2222]/80 disabled:opacity-40 transition-colors">
        {isPending ? 'Saving...' : 'Log Game'}
      </button>

      {/* History */}
      {entries.length > 0 && (
        <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <span className="text-[11px] tracking-[0.3em] uppercase text-[#CC2222]">Decision Log</span>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {entries.map(e => (
              <div key={e.id} className="px-5 py-4">
                <div className="flex justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-white">
                      {e.opposition ? `vs ${e.opposition}` : 'Game'}
                      {e.formation ? <span className="text-[#444] font-normal"> · {e.formation}</span> : null}
                    </p>
                  </div>
                  <p className="text-xs text-[#555]">{new Date(e.game_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
                </div>
                {[e.decision_one, e.decision_two, e.decision_three].filter(Boolean).map((d, i) => (
                  <p key={i} className="text-[11px] text-[#666] mb-1 pl-3 border-l border-[#CC2222]/30">Decision {i + 1}: {d}</p>
                ))}
                {e.what_worked && <p className="text-[11px] text-[#2E8B35] mt-2">✓ {e.what_worked}</p>}
                {e.what_didnt && <p className="text-[11px] text-[#CC2222] mt-1">✗ {e.what_didnt}</p>}
                {e.coach_feedback && <p className="text-[11px] text-[#C9A84C] mt-2 italic">Coach: {e.coach_feedback}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
