'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface SessionActionsProps {
  sessionId: string
  currentStatus: string
  cancelOnly?: boolean
}

export default function SessionActions({ sessionId, currentStatus, cancelOnly = false }: SessionActionsProps) {
  const [status, setStatus] = useState(currentStatus)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const supabase = createClient()

  async function handleUpdate(newStatus?: string) {
    setLoading(true)
    const updates: Record<string, string> = {}
    if (newStatus) updates.status = newStatus
    if (notes) updates.notes = notes

    await supabase.from('bookings').update(updates).eq('id', sessionId)

    if (newStatus) setStatus(newStatus)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    setLoading(false)
  }

  if (cancelOnly) {
    return (
      <button
        onClick={() => handleUpdate('cancelled')}
        disabled={loading || status === 'cancelled'}
        className="w-full border border-red-900/40 text-red-500 hover:bg-red-900/10 disabled:opacity-40
                   py-2 px-4 rounded-sm text-xs tracking-wider uppercase transition-colors"
      >
        {loading ? 'Cancelling…' : status === 'cancelled' ? 'Cancelled' : 'Cancel Session'}
      </button>
    )
  }

  return (
    <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-white/5">
        <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">Mark Attendance</span>
      </div>
      <div className="p-5 space-y-4">
        {saved && (
          <div className="bg-[#2E8B35]/15 border border-[#2E8B35]/30 text-[#2E8B35] text-xs px-3 py-2 rounded-sm">
            Session updated.
          </div>
        )}
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'completed', label: 'Attended', color: '#2E8B35' },
            { value: 'no_show', label: 'No Show', color: '#CC2222' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => handleUpdate(opt.value)}
              disabled={loading || status === opt.value}
              className={`py-2 px-3 rounded-sm text-xs tracking-wider uppercase transition-colors border ${
                status === opt.value
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:opacity-80'
              }`}
              style={{
                borderColor: `${opt.color}40`,
                color: opt.color,
                backgroundColor: `${opt.color}10`,
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div>
          <label className="block text-[11px] text-[#666] mb-1.5 uppercase tracking-wider">
            Session Notes
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Add notes about this session…"
            className="w-full bg-[#141414] border border-white/[0.08] text-white rounded-sm px-3 py-2.5 text-sm
                       placeholder:text-[#333] focus:outline-none focus:border-[#C9A84C]/60 transition-colors resize-none"
          />
        </div>
        {notes && (
          <button
            onClick={() => handleUpdate()}
            disabled={loading}
            className="w-full bg-[#C9A84C] hover:bg-[#d4b055] disabled:opacity-40 text-black font-black
                       py-2.5 px-4 rounded-sm text-xs tracking-[0.12em] uppercase transition-colors"
            style={{ fontFamily: "'Arial Black', sans-serif" }}
          >
            {loading ? 'Saving…' : 'Save Notes'}
          </button>
        )}
      </div>
    </div>
  )
}
