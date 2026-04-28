'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate, formatGBP } from '@/lib/utils/formatters'

interface Transaction {
  id: string
  user_id: string
  amount_p: number
  description: string
  created_at: string
  profiles: { full_name: string; email: string } | null
}

interface UserProfile {
  id: string
  full_name: string
  email: string
}

const REASONS = ['manual_adjustment', 'cancellation_refund', 'loyalty_credit', 'correction', 'promotion']

export default function AdminCreditsManager({
  transactions: initial,
  users,
}: {
  transactions: Transaction[]
  users: UserProfile[]
}) {
  const [transactions, setTransactions] = useState(initial)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ userId: '', amount: '', reason: 'manual_adjustment' })

  const supabase = createClient()

  async function handleAdjust(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const pence = Math.round(parseFloat(form.amount) * 100)
    const { data, error } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: form.userId,
        amount_p: pence,
        description: form.reason,
      })
      .select('*, profiles!user_id(full_name, email)')
      .single()

    if (!error && data) {
      setTransactions(prev => [data, ...prev])
      setForm({ userId: '', amount: '', reason: 'manual_adjustment' })
      setShowForm(false)
    }
    setLoading(false)
  }

  const filtered = transactions.filter(t => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      t.profiles?.full_name?.toLowerCase().includes(q) ||
      t.profiles?.email?.toLowerCase().includes(q)
    )
  })

  const inputClass = `w-full bg-[#141414] border border-white/[0.08] text-white rounded-sm px-3 py-2.5 text-sm
                      placeholder:text-[#333] focus:outline-none focus:border-[#C9A84C]/60 transition-colors`
  const labelClass = 'block text-xs text-[#666] mb-1.5 uppercase tracking-wider'

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-2 bg-[#C9A84C] hover:bg-[#d4b055] text-black font-black
                     px-4 py-2 text-xs tracking-[0.12em] uppercase rounded-sm transition-colors"
          style={{ fontFamily: "'Arial Black', sans-serif" }}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Manual Adjustment
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleAdjust}
          className="bg-[#0D0D0D] border border-[#C9A84C]/30 rounded-sm p-5 mb-5"
        >
          <p className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C] mb-4">Credit Adjustment</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="sm:col-span-1">
              <label className={labelClass}>User</label>
              <select
                required
                value={form.userId}
                onChange={e => setForm(p => ({ ...p, userId: e.target.value }))}
                className={`${inputClass} bg-[#141414]`}
              >
                <option value="">Select user…</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.full_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Amount (£, negative to deduct)</label>
              <input
                required
                type="number"
                step="0.01"
                value={form.amount}
                onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                placeholder="e.g. 20.00"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Reason</label>
              <select
                value={form.reason}
                onChange={e => setForm(p => ({ ...p, reason: e.target.value }))}
                className={`${inputClass} bg-[#141414]`}
              >
                {REASONS.map(r => (
                  <option key={r} value={r} className="capitalize">{r.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#C9A84C] hover:bg-[#d4b055] disabled:opacity-40 text-black font-black
                         px-5 py-2 text-xs tracking-[0.12em] uppercase rounded-sm transition-colors"
              style={{ fontFamily: "'Arial Black', sans-serif" }}
            >
              {loading ? 'Saving…' : 'Apply'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="border border-white/10 text-[#555] hover:text-white px-5 py-2
                         text-xs tracking-wider uppercase rounded-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-white/5">
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#141414] border border-white/[0.08] text-white rounded-sm px-3 py-2 text-sm
                       placeholder:text-[#333] focus:outline-none focus:border-[#C9A84C]/60 transition-colors"
          />
        </div>
        {filtered.length === 0 ? (
          <div className="p-8 text-center"><p className="text-[#444] text-sm">No transactions found</p></div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {filtered.map(t => (
              <div key={t.id} className="px-5 py-3.5 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">{t.profiles?.full_name ?? 'Unknown'}</p>
                  <p className="text-[11px] text-[#444] mt-0.5 capitalize">
                    {t.description?.replace(/_/g, ' ')} · {formatDate(t.created_at)}
                  </p>
                </div>
                <span
                  className={`text-sm font-medium flex-shrink-0 ${
                    t.amount_p >= 0 ? 'text-[#2E8B35]' : 'text-[#CC2222]'
                  }`}
                >
                  {t.amount_p >= 0 ? '+' : ''}{formatGBP(t.amount_p)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
