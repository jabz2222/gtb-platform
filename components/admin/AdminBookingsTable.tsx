'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate, formatTime, formatGBP } from '@/lib/utils/formatters'
import StatusBadge from '@/components/ui/StatusBadge'

interface Booking {
  id: string
  starts_at: string
  booking_type: string
  status: string
  deposit_p: number
  profiles: { full_name: string; email: string } | null
}

const STATUS_FILTERS = ['all', 'pending', 'confirmed', 'completed', 'cancelled', 'no_show']
const TYPE_FILTERS = ['all', 'one_on_one', 'group_public', 'contracted']

export default function AdminBookingsTable({ bookings: initial }: { bookings: Booking[] }) {
  const [bookings, setBookings] = useState(initial)
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [cancelling, setCancelling] = useState<string | null>(null)

  const supabase = createClient()

  async function handleCancel(id: string) {
    setCancelling(id)
    await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', id)
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b))
    setCancelling(null)
  }

  const filtered = bookings.filter(b => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false
    if (typeFilter !== 'all' && b.booking_type !== typeFilter) return false
    if (search) {
      const q = search.toLowerCase()
      if (!b.profiles?.full_name?.toLowerCase().includes(q) &&
          !b.profiles?.email?.toLowerCase().includes(q)) return false
    }
    return true
  })

  return (
    <div>
      {/* Filters */}
      <div className="bg-[#0D0D0D] border border-white/5 rounded-sm p-4 mb-4 space-y-3">
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-[#141414] border border-white/[0.08] text-white rounded-sm px-3 py-2 text-sm
                     placeholder:text-[#333] focus:outline-none focus:border-[#C9A84C]/60 transition-colors"
        />
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1 text-[11px] uppercase tracking-wider rounded-sm transition-colors capitalize ${
                statusFilter === f
                  ? 'bg-[#C9A84C] text-black font-black'
                  : 'bg-[#141414] border border-white/[0.06] text-[#555] hover:text-white'
              }`}
              style={statusFilter === f ? { fontFamily: "'Arial Black', sans-serif" } : undefined}
            >
              {f.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {TYPE_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setTypeFilter(f)}
              className={`px-3 py-1 text-[11px] uppercase tracking-wider rounded-sm transition-colors ${
                typeFilter === f
                  ? 'bg-[#5BB8E8] text-black font-black'
                  : 'bg-[#141414] border border-white/[0.06] text-[#555] hover:text-white'
              }`}
              style={typeFilter === f ? { fontFamily: "'Arial Black', sans-serif" } : undefined}
            >
              {f === 'all' ? 'All Types' : f.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
          <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">
            {filtered.length} booking{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
        {filtered.length === 0 ? (
          <div className="p-8 text-center"><p className="text-[#444] text-sm">No bookings match your filters</p></div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {filtered.map(b => (
              <div key={b.id} className="px-5 py-3.5 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">{b.profiles?.full_name ?? 'Unknown'}</p>
                  <p className="text-[11px] text-[#444] mt-0.5">
                    {formatDate(b.starts_at)} · {formatTime(b.starts_at)} ·{' '}
                    <span className="capitalize">{b.booking_type.replace(/_/g, ' ')}</span>
                  </p>
                </div>
                <span className="text-xs text-[#555] flex-shrink-0">{formatGBP(b.deposit_p ?? 0)}</span>
                <StatusBadge variant={b.status} />
                {b.status !== 'cancelled' && b.status !== 'completed' && (
                  <button
                    onClick={() => handleCancel(b.id)}
                    disabled={cancelling === b.id}
                    className="text-[11px] text-[#333] hover:text-red-500 transition-colors flex-shrink-0 uppercase tracking-wider"
                  >
                    {cancelling === b.id ? '…' : 'Cancel'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
