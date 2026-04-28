'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface SCSession {
  id: string
  session_date: string
  session_type: string | null
  duration_mins: number | null
  focus: string | null
  completed: boolean
  reflection: string | null
}

export default function SCTrainingForm({ userId, sessions }: { userId: string; sessions: SCSession[] }) {
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0])
  const [sessionType, setSessionType] = useState('gym')
  const [duration, setDuration] = useState('')
  const [focus, setFocus] = useState('')
  const [reflection, setReflection] = useState('')
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleLog() {
    startTransition(async () => {
      const supabase = createClient()
      await supabase.from('pdp_sc_sessions').insert({
        player_id: userId,
        session_date: sessionDate,
        session_type: sessionType,
        duration_mins: duration ? parseInt(duration) : null,
        focus: focus.trim() || null,
        reflection: reflection.trim() || null,
        completed: true,
      })
      setFocus(''); setReflection(''); setDuration('')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      router.refresh()
    })
  }

  const inputCls = "w-full bg-[#111] border border-white/10 rounded-sm px-3 py-2 text-sm text-white focus:outline-none focus:border-[#CC2222]/50 transition-colors"
  const labelCls = "block text-[11px] uppercase tracking-[0.2em] text-[#444] mb-1"

  return (
    <div className="space-y-6">
      {/* Log form */}
      <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5">
          <span className="text-[11px] tracking-[0.3em] uppercase text-[#CC2222]">Log Session</span>
        </div>
        <div className="p-5 grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Date</label>
            <input type="date" value={sessionDate} onChange={e => setSessionDate(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Session Type</label>
            <select value={sessionType} onChange={e => setSessionType(e.target.value)} className={inputCls + ' cursor-pointer'}>
              <option value="gym">Gym / Weights</option>
              <option value="pitch">Pitch S&C</option>
              <option value="cardio">Cardio / Conditioning</option>
              <option value="recovery">Recovery / Flexibility</option>
              <option value="plyometrics">Plyometrics / Speed</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Duration (mins)</label>
            <input type="number" value={duration} onChange={e => setDuration(e.target.value)} placeholder="e.g. 60" min="10" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Focus Area</label>
            <input type="text" value={focus} onChange={e => setFocus(e.target.value)} placeholder="e.g. Upper body strength" className={inputCls} />
          </div>
          <div className="col-span-2">
            <label className={labelCls}>Reflection / Notes</label>
            <textarea value={reflection} onChange={e => setReflection(e.target.value)} rows={3} placeholder="How did the session go? Key takeaways..." className={inputCls + ' resize-y'} />
          </div>
        </div>
      </div>

      {saved && (
        <div className="p-3 bg-[#2E8B35]/15 border border-[#2E8B35]/20 rounded-sm text-[#2E8B35] text-sm">Session logged ✓</div>
      )}

      <button onClick={handleLog} disabled={isPending} className="px-6 py-2.5 text-[11px] tracking-[0.25em] uppercase font-medium rounded-sm bg-[#CC2222] text-white hover:bg-[#CC2222]/80 disabled:opacity-40 transition-colors">
        {isPending ? 'Logging...' : 'Log Session'}
      </button>

      {/* History */}
      {sessions.length > 0 && (
        <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <span className="text-[11px] tracking-[0.3em] uppercase text-[#CC2222]">Session History</span>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {sessions.map(s => (
              <div key={s.id} className="px-5 py-3.5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-white capitalize">{s.session_type?.replace(/_/g, ' ') ?? 'Session'}</p>
                  {s.focus && <p className="text-[11px] text-[#444] mt-0.5">{s.focus}</p>}
                  {s.reflection && <p className="text-[11px] text-[#333] mt-1 italic">{s.reflection}</p>}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-[#555]">{new Date(s.session_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
                  {s.duration_mins && <p className="text-[11px] text-[#CC2222] mt-0.5">{s.duration_mins}min</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
