'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate, formatTime } from '@/lib/utils/formatters'
import Link from 'next/link'

const DIVISION_COLORS: Record<string, string> = {
  football:  '#5BB8E8',
  fitness:   '#2E8B35',
  sports:    '#E8641A',
  mentoring: '#9B2454',
  education: '#CC2222',
}

interface GroupClass {
  id: string
  title: string
  start_time: string
  end_time: string
  capacity: number
  enrolled_count: number
  min_tier: string
  divisions?: { name: string; slug: string } | null
}

// Placeholder classes when DB is empty
const PLACEHOLDER_CLASSES: GroupClass[] = [
  { id: '1', title: 'U10 Football Skills', start_time: new Date(Date.now() + 2 * 86400000).toISOString(), end_time: new Date(Date.now() + 2 * 86400000 + 3600000).toISOString(), capacity: 12, enrolled_count: 7, min_tier: 'free', divisions: { name: 'GTB Football', slug: 'football' } },
  { id: '2', title: 'Youth S&C Session', start_time: new Date(Date.now() + 3 * 86400000).toISOString(), end_time: new Date(Date.now() + 3 * 86400000 + 3600000).toISOString(), capacity: 10, enrolled_count: 3, min_tier: 'bronze', divisions: { name: 'GTB Fitness', slug: 'fitness' } },
  { id: '3', title: 'Multi-Sport Explorers', start_time: new Date(Date.now() + 4 * 86400000).toISOString(), end_time: new Date(Date.now() + 4 * 86400000 + 5400000).toISOString(), capacity: 15, enrolled_count: 12, min_tier: 'free', divisions: { name: 'GTB Sports', slug: 'sports' } },
  { id: '4', title: 'Mentoring Group Session', start_time: new Date(Date.now() + 5 * 86400000).toISOString(), end_time: new Date(Date.now() + 5 * 86400000 + 3600000).toISOString(), capacity: 8, enrolled_count: 4, min_tier: 'bronze', divisions: { name: 'GTB Mentoring', slug: 'mentoring' } },
  { id: '5', title: 'Education Workshop', start_time: new Date(Date.now() + 6 * 86400000).toISOString(), end_time: new Date(Date.now() + 6 * 86400000 + 7200000).toISOString(), capacity: 20, enrolled_count: 11, min_tier: 'silver', divisions: { name: 'GTB Education', slug: 'education' } },
]

export default function GroupBookingWizard({ classes: raw, clientId }: { classes: GroupClass[]; clientId: string }) {
  const classes = raw.length > 0 ? raw : PLACEHOLDER_CLASSES
  const [filterDiv, setFilterDiv] = useState('all')
  const [selected, setSelected] = useState<GroupClass | null>(null)
  const [loading, setLoading] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  const supabase = createClient()

  const divisions = ['all', ...Array.from(new Set(classes.map(c => c.divisions?.slug ?? 'football')))]

  const filtered = filterDiv === 'all'
    ? classes
    : classes.filter(c => c.divisions?.slug === filterDiv)

  async function handleJoin() {
    if (!selected) return
    setLoading(true)

    // Look up parent_guardian_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('parent_guardian_id')
      .eq('id', clientId)
      .single()

    const parentId = profile?.parent_guardian_id ?? null
    const status = parentId ? 'pending_parent' : 'pending_coach'

    const { data: inquiry } = await supabase.from('session_inquiries').insert({
      player_id: clientId,
      session_type: 'group',
      class_id: selected.id,
      requested_slot: selected.start_time,
      status,
    }).select('id').single()

    if (parentId && inquiry) {
      await supabase.from('notifications').insert({
        user_id: parentId,
        type: 'inquiry',
        title: 'Session Request Awaiting Approval',
        body: `Your child has requested to join "${selected.title}" on ${formatDate(selected.start_time)} at ${formatTime(selected.start_time)}.`,
        metadata: { inquiry_id: inquiry.id },
      })
      await supabase.from('session_inquiries').update({ parent_notified_at: new Date().toISOString() }).eq('id', inquiry.id)
    }

    setConfirmed(true)
    setLoading(false)
  }

  if (confirmed && selected) {
    return (
      <div className="bg-[#0D0D0D] border border-white/5 rounded-sm p-12 text-center max-w-md mx-auto">
        <div className="w-12 h-12 rounded-sm bg-[#C9A84C]/15 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-[#C9A84C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-xl font-black text-white uppercase mb-2" style={{ fontFamily: "'Arial Black', sans-serif" }}>
          Request Sent
        </p>
        <p className="text-sm text-[#444] mb-6">
          Your request to join <strong className="text-white">{selected.title}</strong> on {formatDate(selected.start_time)} is awaiting parent approval before the booking is confirmed.
        </p>
        <Link
          href="/bookings"
          className="inline-block bg-[#C9A84C] hover:bg-[#d4b055] text-black font-black px-6 py-2.5
                     text-xs tracking-[0.12em] uppercase rounded-sm transition-colors"
          style={{ fontFamily: "'Arial Black', sans-serif" }}
        >
          View Bookings
        </Link>
      </div>
    )
  }

  if (selected) {
    const divSlug = selected.divisions?.slug ?? 'football'
    const color = DIVISION_COLORS[divSlug] ?? '#C9A84C'
    const spotsLeft = selected.capacity - selected.enrolled_count

    return (
      <div className="max-w-md">
        <button
          onClick={() => setSelected(null)}
          className="text-xs text-[#444] hover:text-white uppercase tracking-wider mb-5 inline-block transition-colors"
        >
          ← Back to Classes
        </button>
        <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden mb-4">
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: color }} />
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <span className="text-[11px] tracking-[0.3em] uppercase" style={{ color }}>
              {selected.divisions?.name ?? 'Group Class'}
            </span>
            {spotsLeft <= 3 && (
              <span className="text-[10px] text-[#E8641A] uppercase tracking-wider">
                {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left
              </span>
            )}
          </div>
          <div className="p-5 space-y-3">
            <p className="text-lg font-bold text-white">{selected.title}</p>
            {[
              { label: 'Date', value: formatDate(selected.start_time) },
              { label: 'Time', value: `${formatTime(selected.start_time)} – ${formatTime(selected.end_time)}` },
              { label: 'Capacity', value: `${selected.enrolled_count} / ${selected.capacity} enrolled` },
              { label: 'Min. Tier', value: selected.min_tier.charAt(0).toUpperCase() + selected.min_tier.slice(1) },
              { label: 'Cost', value: 'Included in your programme' },
            ].map(row => (
              <div key={row.label} className="flex justify-between text-sm">
                <span className="text-[#444]">{row.label}</span>
                <span className="text-white">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={handleJoin}
          disabled={loading || spotsLeft === 0}
          className="w-full bg-[#C9A84C] hover:bg-[#d4b055] disabled:opacity-40 text-black font-black
                     py-3 px-4 rounded-sm text-xs tracking-[0.15em] uppercase transition-colors"
          style={{ fontFamily: "'Arial Black', sans-serif" }}
        >
          {loading ? 'Sending Request…' : spotsLeft === 0 ? 'Class Full' : 'Request Session'}
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Division filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        {divisions.map(d => (
          <button
            key={d}
            onClick={() => setFilterDiv(d)}
            className={`px-3 py-1.5 text-xs uppercase tracking-wider rounded-sm transition-colors capitalize ${
              filterDiv === d
                ? 'bg-[#C9A84C] text-black font-black'
                : 'bg-[#0D0D0D] border border-white/5 text-[#555] hover:text-white'
            }`}
            style={filterDiv === d ? { fontFamily: "'Arial Black', sans-serif" } : undefined}
          >
            {d === 'all' ? 'All Divisions' : `GTB ${d}`}
          </button>
        ))}
      </div>

      {/* Class list */}
      <div className="space-y-3">
        {filtered.map(cls => {
          const divSlug = cls.divisions?.slug ?? 'football'
          const color = DIVISION_COLORS[divSlug] ?? '#C9A84C'
          const spotsLeft = cls.capacity - cls.enrolled_count
          const full = spotsLeft === 0

          return (
            <button
              key={cls.id}
              onClick={() => !full && setSelected(cls)}
              disabled={full}
              className={`w-full bg-[#0D0D0D] border rounded-sm p-5 text-left relative overflow-hidden
                          transition-colors ${full ? 'opacity-50 cursor-not-allowed border-white/5' : 'border-white/5 hover:border-white/15'}`}
            >
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: color }} />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-white mb-1">{cls.title}</p>
                  <p className="text-[11px] text-[#444]">
                    {formatDate(cls.start_time)} · {formatTime(cls.start_time)}–{formatTime(cls.end_time)}
                  </p>
                  <p className="text-[11px] mt-1" style={{ color }}>
                    {cls.divisions?.name ?? 'Group Class'}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-white">{cls.enrolled_count}/{cls.capacity}</p>
                  <p className={`text-[11px] ${full ? 'text-[#E8641A]' : spotsLeft <= 3 ? 'text-[#E8641A]' : 'text-[#2E8B35]'}`}>
                    {full ? 'Full' : `${spotsLeft} left`}
                  </p>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
