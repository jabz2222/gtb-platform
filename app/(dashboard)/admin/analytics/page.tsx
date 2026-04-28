import { requireRole } from '@/lib/auth/requireRole'
import { createClient } from '@/lib/supabase/server'
import AnalyticsCharts from '@/components/admin/AnalyticsCharts'
import { formatGBP } from '@/lib/utils/formatters'

export default async function AnalyticsPage() {
  await requireRole(['admin'])
  const supabase = await createClient()

  const [bookingsRes, usersRes, creditsRes] = await Promise.all([
    supabase.from('bookings').select('id, status, booking_type, deposit_p, starts_at, created_at'),
    supabase.from('profiles').select('id, role, created_at'),
    supabase.from('credit_transactions').select('amount_p, created_at'),
  ])

  const bookings = bookingsRes.data ?? []
  const users = usersRes.data ?? []
  const transactions = creditsRes.data ?? []

  // Aggregate stats
  const totalRevenue = bookings.reduce((sum: number, b: { deposit_p: number }) => sum + (b.deposit_p ?? 0), 0)
  const confirmedCount = bookings.filter((b: { status: string }) => b.status === 'confirmed' || b.status === 'completed').length
  const noShowCount = bookings.filter((b: { status: string }) => b.status === 'no_show').length
  const attendanceRate = bookings.length > 0 ? Math.round((confirmedCount / bookings.length) * 100) : 0

  // Bookings by type
  const byType: Record<string, number> = {}
  for (const b of bookings as { booking_type: string }[]) {
    byType[b.booking_type] = (byType[b.booking_type] ?? 0) + 1
  }

  // Users by role
  const byRole: Record<string, number> = {}
  for (const u of users as { role: string }[]) {
    byRole[u.role] = (byRole[u.role] ?? 0) + 1
  }

  // Monthly bookings for chart (last 6 months)
  const months: { month: string; count: number; revenue: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const label = d.toLocaleString('en-GB', { month: 'short', year: '2-digit' })
    const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const monthBookings = bookings.filter((b: { created_at: string }) => b.created_at?.startsWith(monthStr))
    months.push({
      month: label,
      count: monthBookings.length,
      revenue: monthBookings.reduce((sum: number, b: { deposit_p: number }) => sum + (b.deposit_p ?? 0), 0),
    })
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-[#C9A84C] text-[11px] tracking-[0.3em] uppercase mb-2">Admin</p>
        <h1
          className="text-4xl font-black tracking-wider text-white uppercase"
          style={{ fontFamily: "'Arial Black', sans-serif" }}
        >
          Platform <span style={{ color: '#C9A84C' }}>Analytics</span>
        </h1>
        <p className="text-[#444] mt-1.5 text-sm">Overview of platform performance</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Users', value: users.length, color: '#C9A84C' },
          { label: 'Total Bookings', value: bookings.length, color: '#5BB8E8' },
          { label: 'Attendance Rate', value: `${attendanceRate}%`, color: '#2E8B35' },
          { label: 'Total Revenue', value: formatGBP(totalRevenue), color: '#9B2454' },
        ].map(s => (
          <div key={s.label} className="bg-[#0D0D0D] border border-white/5 rounded-sm p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: s.color }} />
            <p className="text-[11px] text-[#444] uppercase tracking-wider mb-1">{s.label}</p>
            <p
              className="text-2xl font-black text-white"
              style={{ fontFamily: "'Arial Black', sans-serif" }}
            >
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <AnalyticsCharts monthlyData={months} />

      {/* Breakdown tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Bookings by type */}
        <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">Bookings by Type</span>
          </div>
          <div className="p-5 space-y-2">
            {Object.entries(byType).length === 0 ? (
              <p className="text-[#444] text-sm">No data</p>
            ) : (
              Object.entries(byType).map(([type, count]) => (
                <div key={type} className="flex justify-between text-sm">
                  <span className="text-[#666] capitalize">{type.replace(/_/g, ' ')}</span>
                  <span className="text-white font-medium">{count}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Users by role */}
        <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">Users by Role</span>
          </div>
          <div className="p-5 space-y-2">
            {Object.entries(byRole).length === 0 ? (
              <p className="text-[#444] text-sm">No data</p>
            ) : (
              Object.entries(byRole).map(([role, count]) => (
                <div key={role} className="flex justify-between text-sm">
                  <span className="text-[#666] capitalize">{role}</span>
                  <span className="text-white font-medium">{count}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* No-show note */}
      <div className="mt-4 bg-[#0D0D0D] border border-white/5 rounded-sm p-4">
        <div className="flex items-center gap-6 text-sm">
          <div>
            <span className="text-[#444]">No-shows: </span>
            <span className="text-[#CC2222] font-medium">{noShowCount}</span>
          </div>
          <div>
            <span className="text-[#444]">No-show rate: </span>
            <span className="text-white font-medium">
              {bookings.length > 0 ? Math.round((noShowCount / bookings.length) * 100) : 0}%
            </span>
          </div>
          <div>
            <span className="text-[#444]">Credit transactions: </span>
            <span className="text-white font-medium">{transactions.length}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
