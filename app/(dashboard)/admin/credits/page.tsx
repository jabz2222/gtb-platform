import { requireRole } from '@/lib/auth/requireRole'
import { createClient } from '@/lib/supabase/server'
import AdminCreditsManager from '@/components/admin/AdminCreditsManager'
import { formatGBP } from '@/lib/utils/formatters'

export default async function AdminCreditsPage() {
  await requireRole(['admin'])
  const supabase = await createClient()

  const [transRes, usersRes] = await Promise.all([
    supabase
      .from('credit_transactions')
      .select('*, profiles!user_id(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(100),
    supabase
      .from('profiles')
      .select('id, full_name, email')
      .order('full_name'),
  ])

  const transactions = transRes.data ?? []
  const totalCredits = transactions.reduce((sum: number, t: { amount_p: number }) => sum + t.amount_p, 0)

  return (
    <div>
      <div className="mb-8">
        <p className="text-[#C9A84C] text-[11px] tracking-[0.3em] uppercase mb-2">Admin</p>
        <h1
          className="text-4xl font-black tracking-wider text-white uppercase"
          style={{ fontFamily: "'Arial Black', sans-serif" }}
        >
          Credit <span style={{ color: '#C9A84C' }}>Ledger</span>
        </h1>
        <p className="text-[#444] mt-1.5 text-sm">
          {transactions.length} transactions · {formatGBP(totalCredits)} total issued
        </p>
      </div>

      <AdminCreditsManager
        transactions={transactions}
        users={usersRes.data ?? []}
      />
    </div>
  )
}
