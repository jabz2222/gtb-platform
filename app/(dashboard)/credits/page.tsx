import { requireAuth } from '@/lib/auth/requireRole'
import { createClient } from '@/lib/supabase/server'
import { formatGBP, formatDateTime } from '@/lib/utils/formatters'
import Link from 'next/link'

const TX_LABELS: Record<string, string> = {
  deposit:           'Deposit',
  booking_payment:   'Session Payment',
  refund_full:       'Full Refund',
  refund_partial:    'Partial Refund',
  manual_adjustment: 'Adjustment',
  bonus:             'Bonus Credit',
}

export default async function CreditsPage() {
  const user = await requireAuth()
  const supabase = await createClient()

  const [profileRes, txRes] = await Promise.all([
    supabase.from('profiles').select('credit_balance_p, full_name').eq('id', user.id).single(),
    supabase.from('credit_transactions')
      .select('id, tx_type, amount_p, balance_after_p, description, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30),
  ])

  const balance = profileRes.data?.credit_balance_p ?? 0
  const transactions = txRes.data ?? []

  return (
    <div>
      <div className="mb-10">
        <p className="text-[#C9A84C] text-[11px] tracking-[0.3em] uppercase mb-2">Wallet</p>
        <h1 className="text-4xl font-black tracking-wider text-white uppercase"
            style={{ fontFamily: "'Arial Black', sans-serif" }}>
          Account <span style={{ color: '#C9A84C' }}>Credits</span>
        </h1>
        <p className="text-[#444] mt-1.5 text-sm">Your balance and transaction history</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Balance card */}
        <div className="relative bg-[#0D0D0D] border border-[#C9A84C]/20 rounded-sm p-7 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#C9A84C]" />
          <div className="absolute inset-0 bg-[#C9A84C]/3 pointer-events-none" />
          <p className="text-[11px] text-[#C9A84C] uppercase tracking-[0.3em] mb-3">Current Balance</p>
          <p className="text-5xl font-black text-[#C9A84C] leading-none mb-1 tabular-nums"
             style={{ fontFamily: "'Arial Black', sans-serif" }}>
            {formatGBP(balance)}
          </p>
          <p className="text-xs text-[#444] mb-5">Available for bookings</p>
          <Link href="/credits/deposit"
                className="inline-flex items-center gap-2 bg-[#C9A84C] hover:bg-[#d4b055] text-black
                           font-black px-5 py-2.5 rounded-sm text-xs tracking-[0.12em] uppercase
                           transition-colors"
                style={{ fontFamily: "'Arial Black', sans-serif" }}>
            Add Funds
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </Link>
        </div>

        {/* Cancellation policy */}
        <div className="lg:col-span-2 bg-[#0D0D0D] border border-white/5 rounded-sm p-6">
          <p className="text-[11px] text-[#C9A84C] uppercase tracking-[0.3em] mb-4">Cancellation Policy</p>
          <div className="space-y-3">
            {[
              { label: '24+ hours notice', note: '100% deposit refunded as account credit', ok: true },
              { label: 'Under 24 hours',   note: '50% of deposit kept · 50% returned as credit', ok: false },
              { label: 'No-show',          note: 'Full deposit retained — no credit issued', ok: false },
            ].map(p => (
              <div key={p.label} className="flex items-start gap-4">
                <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                     style={{ backgroundColor: p.ok ? '#2E8B35' : '#444' }} />
                <div>
                  <p className="text-sm text-white font-medium">{p.label}</p>
                  <p className="text-xs text-[#444] mt-0.5">{p.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transaction history */}
      <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5">
          <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">Transaction History</span>
        </div>
        {transactions.length === 0 ? (
          <div className="py-14 text-center">
            <p className="text-[#333] text-sm">No transactions yet</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {transactions.map((tx: { id: string; tx_type: string; amount_p: number; balance_after_p: number; description: string | null; created_at: string }) => (
              <div key={tx.id} className="px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-white font-medium">{TX_LABELS[tx.tx_type] ?? tx.tx_type}</p>
                  {tx.description && <p className="text-xs text-[#444] mt-0.5">{tx.description}</p>}
                  <p className="text-[11px] text-[#333] mt-0.5">{formatDateTime(tx.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-black tabular-nums ${tx.amount_p >= 0 ? 'text-[#2E8B35]' : 'text-[#CC2222]'}`}
                     style={{ fontFamily: "'Arial Black', sans-serif" }}>
                    {tx.amount_p >= 0 ? '+' : ''}{formatGBP(tx.amount_p)}
                  </p>
                  <p className="text-[11px] text-[#333] mt-0.5">Bal: {formatGBP(tx.balance_after_p)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
