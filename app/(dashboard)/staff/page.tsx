import { requireRole } from '@/lib/auth/requireRole'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function StaffDashboardPage() {
  const { user } = await requireRole(['admin', 'staff'])
  const supabase = await createClient()

  const now = new Date().toISOString()
  const endOfDay = new Date()
  endOfDay.setHours(23, 59, 59)

  const [todayRes, clientsRes] = await Promise.all([
    supabase
      .from('bookings')
      .select(`
        id, booking_type, status, starts_at, ends_at, duration_mins,
        client:profiles!bookings_client_id_fkey(full_name, email)
      `)
      .eq('staff_id', user.id)
      .gte('starts_at', now)
      .lte('starts_at', endOfDay.toISOString())
      .in('status', ['pending', 'confirmed'])
      .order('starts_at'),
    supabase
      .from('client_assignments')
      .select('client:profiles!client_assignments_client_id_fkey(id, full_name, email)')
      .eq('staff_id', user.id)
      .eq('is_active', true)
      .limit(10),
  ])

  const todaysSessions = todayRes.data ?? []
  const clients = clientsRes.data ?? []
  const firstName = (user.user_metadata?.full_name ?? 'Staff').split(' ')[0]

  return (
    <div>
      {/* Header */}
      <div className="mb-10">
        <p className="text-[#C9A84C] text-[11px] tracking-[0.3em] uppercase mb-2">Staff Portal</p>
        <h1 className="text-4xl font-black tracking-wider text-white uppercase"
            style={{ fontFamily: "'Arial Black', sans-serif" }}>
          Welcome, <span style={{ color: '#C9A84C' }}>{firstName}</span>
        </h1>
        <p className="text-[#444] mt-1.5 text-sm tracking-wide">
          {todaysSessions.length === 0
            ? 'No sessions scheduled today'
            : `${todaysSessions.length} session${todaysSessions.length > 1 ? 's' : ''} today`}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's schedule */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
              <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">
                Today&apos;s Sessions
              </span>
              <Link href="/staff/sessions" className="text-[11px] text-[#444] hover:text-[#C9A84C] transition-colors tracking-wider uppercase">
                All sessions
              </Link>
            </div>
            {todaysSessions.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <p className="text-[#333] text-sm">No sessions today</p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {todaysSessions.map((s: Record<string, unknown>) => (
                  <Link key={s.id as string} href={`/staff/sessions/${s.id}`}
                        className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.03] transition-colors group">
                    <div className="text-center min-w-[52px]">
                      <p className="text-base font-black text-[#C9A84C]"
                         style={{ fontFamily: "'Arial Black', sans-serif" }}>
                        {new Date(s.starts_at as string).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-[10px] text-[#444]">{s.duration_mins as number}min</p>
                    </div>
                    <div className="w-px h-8 bg-white/5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {(s.client as { full_name?: string })?.full_name ?? 'Unknown client'}
                      </p>
                      <p className="text-xs text-[#444] capitalize mt-0.5">
                        {(s.booking_type as string).replace('_', ' ')} · {s.status as string}
                      </p>
                    </div>
                    <svg className="w-3.5 h-3.5 text-[#333] group-hover:text-[#C9A84C] transition-colors flex-shrink-0"
                         fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-2 gap-3">
            <Link href="/staff/availability"
                  className="group bg-[#0D0D0D] border border-white/5 hover:border-white/10
                             rounded-sm p-4 flex items-center gap-3 transition-all">
              <div className="w-8 h-8 rounded-sm bg-[#5BB8E8]/10 flex items-center justify-center text-[#5BB8E8] flex-shrink-0">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-white group-hover:text-white">Set Availability</p>
                <p className="text-xs text-[#444]">Manage your schedule</p>
              </div>
            </Link>
            <Link href="/staff/clients"
                  className="group bg-[#0D0D0D] border border-white/5 hover:border-white/10
                             rounded-sm p-4 flex items-center gap-3 transition-all">
              <div className="w-8 h-8 rounded-sm bg-[#C9A84C]/10 flex items-center justify-center text-[#C9A84C] flex-shrink-0">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-white group-hover:text-white">My Clients</p>
                <p className="text-xs text-[#444]">{clients.length} assigned</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Assigned clients */}
        <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">My Clients</span>
            <Link href="/staff/clients" className="text-[11px] text-[#444] hover:text-[#C9A84C] transition-colors tracking-wider uppercase">
              View all
            </Link>
          </div>
          {clients.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="text-[#333] text-sm">No clients assigned yet</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {clients.map((c: Record<string, unknown>) => {
                const client = c.client as { id: string; full_name: string | null; email: string }
                const initials = (client.full_name ?? 'U').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
                return (
                  <Link key={client.id} href={`/staff/clients/${client.id}`}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors">
                    <div className="w-7 h-7 rounded-sm bg-[#C9A84C]/15 flex items-center justify-center
                                    text-[#C9A84C] text-[10px] font-black flex-shrink-0"
                         style={{ fontFamily: "'Arial Black', sans-serif" }}>
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-white truncate leading-tight">{client.full_name ?? '—'}</p>
                      <p className="text-xs text-[#444] truncate">{client.email}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
