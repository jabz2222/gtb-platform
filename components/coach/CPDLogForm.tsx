'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const ACTIVITY_TYPES = [
  { value: 'course',      label: 'Course / Qualification' },
  { value: 'shadowing',   label: 'Coaching Observation / Shadowing' },
  { value: 'webinar',     label: 'Webinar / Online Session' },
  { value: 'workshop',    label: 'Workshop / Conference' },
  { value: 'reading',     label: 'Reading / Research' },
  { value: 'peer_review', label: 'Peer Review / Mentoring' },
  { value: 'other',       label: 'Other' },
]

export default function CPDLogForm({ coachId }: { coachId: string }) {
  const [activityType, setActivityType] = useState('course')
  const [title, setTitle] = useState('')
  const [provider, setProvider] = useState('')
  const [hours, setHours] = useState('')
  const [activityDate, setActivityDate] = useState(new Date().toISOString().split('T')[0])
  const [description, setDescription] = useState('')
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  function reset() {
    setTitle('')
    setProvider('')
    setHours('')
    setDescription('')
    setActivityType('course')
  }

  function handleSubmit() {
    if (!title.trim() || !hours || Number(hours) <= 0) {
      setError('Please fill in title and a valid number of hours.')
      return
    }
    startTransition(async () => {
      setError('')
      const supabase = createClient()
      const { error: err } = await supabase.from('cpd_log').insert({
        coach_id: coachId,
        activity_date: activityDate,
        activity_type: activityType,
        title: title.trim(),
        provider: provider.trim() || null,
        hours: Number(hours),
        description: description.trim() || null,
      })
      if (err) {
        setError('Failed to save. Please try again.')
      } else {
        setSuccess(true)
        reset()
        router.refresh()
        setTimeout(() => setSuccess(false), 3000)
      }
    })
  }

  const inputCls = "w-full bg-[#111] border border-white/10 rounded-sm px-3 py-2 text-sm text-white focus:outline-none focus:border-[#9B2454]/50 transition-colors"

  return (
    <div className="space-y-4">
      {success && (
        <div className="p-3 bg-[#2E8B35]/15 border border-[#2E8B35]/20 rounded-sm text-[#2E8B35] text-sm">
          Activity logged ✓
        </div>
      )}
      {error && <p className="text-[#CC2222] text-sm">{error}</p>}

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-[11px] uppercase tracking-[0.2em] text-[#444] mb-1">Activity Title *</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. UEFA B Licence Module 3"
            className={inputCls}
          />
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-[0.2em] text-[#444] mb-1">Type *</label>
          <select
            value={activityType}
            onChange={e => setActivityType(e.target.value)}
            className={inputCls + ' cursor-pointer'}
          >
            {ACTIVITY_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-[0.2em] text-[#444] mb-1">Hours *</label>
          <input
            type="number"
            value={hours}
            onChange={e => setHours(e.target.value)}
            min="0.5"
            step="0.5"
            placeholder="e.g. 3.5"
            className={inputCls}
          />
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-[0.2em] text-[#444] mb-1">Provider / Source</label>
          <input
            type="text"
            value={provider}
            onChange={e => setProvider(e.target.value)}
            placeholder="e.g. FA, GTB, Coursera"
            className={inputCls}
          />
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-[0.2em] text-[#444] mb-1">Date</label>
          <input
            type="date"
            value={activityDate}
            onChange={e => setActivityDate(e.target.value)}
            className={inputCls}
          />
        </div>

        <div className="col-span-2">
          <label className="block text-[11px] uppercase tracking-[0.2em] text-[#444] mb-1">Notes / Reflection</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            placeholder="Key takeaways, how you'll apply this..."
            className={inputCls + ' resize-y'}
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={isPending}
        className="px-5 py-2.5 text-[11px] tracking-[0.25em] uppercase font-medium rounded-sm
                   bg-[#9B2454] text-white hover:bg-[#9B2454]/80 disabled:opacity-40 transition-colors"
      >
        {isPending ? 'Saving...' : 'Log Activity'}
      </button>
    </div>
  )
}
