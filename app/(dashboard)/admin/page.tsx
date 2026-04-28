import { requireRole } from '@/lib/auth/requireRole'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

const DIVISIONS = [
  { name: 'Football',  color: '#5BB8E8', tagline: 'Develop the Player. Build the Person.' },
  { name: 'Fitness',   color: '#2E8B35', tagline: 'Stronger Body. Stronger Mind.' },
  { name: 'Sports',    color: '#E8641A', tagline: 'Every Sport. One Standard.' },
  { name: 'Mentoring', color: '#9B2454', tagline: 'Guide the Mind. Shape the Future.' },
  { name: 'Education', color: '#CC2222', tagline: 'Learn Today. Lead Tomorrow.' },
]

export default async function AdminDashboardPage() {
  await requireRole(['admin'])
  const supabase = await createClient()

  const [usersRes, bookingsRes] = await Promise.all([
    supabase.from('profiles').select('role', { count: 'exact' }).is('deleted_at', null),
    supabase.from('bookings').select('status', { count: 'exact' }),
  ])

  const totalUsers = usersRes.count ?? 0
  const totalBookings = bookingsRes.count ?? 0

  return (
    <div>
      {/* Header */}
      <div className="mb-10">
        <p className="text-[#C9A84C] text-[11px] tracking-[0.3em] uppercase mb-2">Control Centre</p>
        <h1 className="text-4xl font-black tracking-wider text-white uppercase"
            style={{ fontFamily: "'Arial Black', sans-serif" }}>
          Admin <span style={{ color: '#C9A84C' }}>Dashboard</span>
        </h1>
        <p className="text-[#444] mt-1.5 text-sm tracking-wide">GTB Development Ltd · Platform Overview</p>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 rounded-lg overflow-hidden border border-white/5 mb-10">
        <AdminStat label="Total Users"     value={String(totalUsers)}   color="#C9A84C" />
        <AdminStat label="Total Bookings"  value={String(totalBookings)} color="#5BB8E8" />
        <AdminStat label="Active Sessions" value="—"                    color="#2E8B35" />
        <AdminStat label="Credits Issued"  value="—"                    color="#E8641A" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick actions */}
        <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">Quick Actions</span>
          </div>
          <div className="p-3 space-y-px">
            {[
              { href: '/admin/users',     label: 'Manage Users',    sub: 'Roles, tiers, profiles' },
              { href: '/admin/tiers',     label: 'Manage Tiers',    sub: 'Assign education access' },
              { href: '/admin/analytics', label: 'View Analytics',  sub: 'Platform performance' },
              { href: '/admin/credits',   label: 'Credit Ledger',   sub: 'Transactions & balances' },
            ].map(item => (
              <Link key={item.href} href={item.href}
                 className="group flex items-center justify-between px-4 py-3 rounded-sm
                            hover:bg-white/[0.04] transition-colors">
                <div>
                  <p className="text-sm text-[#CCC] group-hover:text-white transition-colors font-medium">
                    {item.label}
                  </p>
                  <p className="text-xs text-[#444] group-hover:text-[#555] transition-colors mt-0.5">
                    {item.sub}
                  </p>
                </div>
                <svg className="w-3.5 h-3.5 text-[#333] group-hover:text-[#C9A84C] transition-colors flex-shrink-0"
                     fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            ))}
          </div>
        </div>

        {/* Divisions */}
        <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">Five Divisions</span>
            <span className="text-[11px] tracking-[0.3em] uppercase text-[#333]">One Ecosystem</span>
          </div>
          <div className="p-3 space-y-px">
            {DIVISIONS.map(d => (
              <div key={d.name} className="flex items-center gap-4 px-4 py-3 rounded-sm hover:bg-white/[0.04] transition-colors">
                <div className="w-[3px] h-8 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold tracking-wide" style={{ color: d.color,  fontFamily: "'Arial Black', sans-serif" }}>
                    {d.name}
                  </p>
                  <p className="text-xs text-[#444] truncate">{d.tagline}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function AdminStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="relative bg-[#0D0D0D] p-6">
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: color }} />
      <div className="text-[2.5rem] font-black leading-none mb-1 tabular-nums"
           style={{ color, fontFamily: "'Arial Black', sans-serif" }}>
        {value}
      </div>
      <div className="text-xs text-[#555] uppercase tracking-wider">{label}</div>
    </div>
  )
}
