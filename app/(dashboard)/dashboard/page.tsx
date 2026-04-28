import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Role } from '@/lib/auth/rolePermissions'
import { getRoleDashboard } from '@/lib/auth/rolePermissions'
import { formatTime, formatDate } from '@/lib/utils/formatters'

export default async function DashboardRedirectPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const role = (user.user_metadata?.role ?? 'client') as Role
  const roleHome = getRoleDashboard(role)

  if (roleHome !== '/dashboard') {
    redirect(roleHome)
  }

  const name = user.user_metadata?.full_name ?? 'Athlete'
  const firstName = name.split(' ')[0]

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  // Fetch real data in parallel
  const [bookingsRes, goalsRes, eduProgressRes, assignmentRes] = await Promise.all([
    supabase
      .from('bookings')
      .select(`
        id, booking_type, status, starts_at, ends_at, duration_mins,
        staff:profiles!bookings_staff_id_fkey(full_name),
        division:divisions(name, color_hex)
      `)
      .eq('client_id', user.id)
      .gte('starts_at', startOfMonth)
      .is('deleted_at', null)
      .order('starts_at', { ascending: true }),
    supabase
      .from('goals')
      .select('id, title, category, target_value, current_value, target_date')
      .eq('player_id', user.id)
      .eq('is_active', true)
      .is('completed_at', null)
      .order('created_at', { ascending: false })
      .limit(3),
    supabase
      .from('education_progress')
      .select('content_id, completed_at')
      .eq('user_id', user.id),
    supabase
      .from('client_assignments')
      .select('staff:profiles!client_assignments_staff_id_fkey(id, full_name, role, email)')
      .eq('client_id', user.id)
      .eq('is_active', true)
      .limit(1)
      .maybeSingle(),
  ])

  const allBookings = bookingsRes.data ?? []
  const upcomingBookings = allBookings.filter(b => new Date(b.starts_at) > now && b.status !== 'cancelled')
  const sessionsThisMonth = allBookings.filter(b => b.status !== 'cancelled').length
  const goals = goalsRes.data ?? []
  const completedEdu = (eduProgressRes.data ?? []).filter(p => p.completed_at).length
  const totalTracked = eduProgressRes.data?.length ?? 0
  const eduPercent = totalTracked > 0 ? Math.round((completedEdu / totalTracked) * 100) : 0
  const coach = (assignmentRes.data?.staff ?? null) as { id: string; full_name: string; role: string; email: string } | null

  return (
    <div>
      {/* Header */}
      <div className="mb-10">
        <p className="text-[#C9A84C] text-[11px] tracking-[0.3em] uppercase mb-2">Player Development Platform</p>
        <h1 className="text-4xl font-black tracking-wider text-white uppercase"
            style={{ fontFamily: "'Arial Black', sans-serif" }}>
          Welcome back, <span style={{ color: '#C9A84C' }}>{firstName}</span>
        </h1>
        <p className="text-[#444] mt-1.5 text-sm tracking-wide">&ldquo;I Own My Development&rdquo;</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5 rounded-sm overflow-hidden border border-white/5 mb-8">
        <StatCard
          label="Sessions This Month"
          value={String(sessionsThisMonth)}
          sub={sessionsThisMonth === 0 ? 'No sessions booked' : `${upcomingBookings.length} upcoming`}
          color="#5BB8E8"
          icon={<CalendarStatIcon />}
        />
        <StatCard
          label="Education Progress"
          value={`${eduPercent}%`}
          sub={completedEdu === 0 ? 'Start your first module' : `${completedEdu} completed`}
          color="#C9A84C"
          icon={<ProgressStatIcon />}
        />
        <StatCard
          label="Active Goals"
          value={String(goals.length)}
          sub={goals.length === 0 ? 'Set your first goal' : `${goals.length} in progress`}
          color="#2E8B35"
          icon={<GoalStatIcon />}
        />
      </div>

      {/* Upcoming sessions + Coach card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Upcoming sessions */}
        <div className="lg:col-span-2 bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">Upcoming Sessions</span>
            <Link href="/bookings" className="text-[11px] text-[#444] hover:text-[#C9A84C] transition-colors tracking-wider uppercase">
              View all
            </Link>
          </div>
          {upcomingBookings.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-[#333] text-sm mb-3">No upcoming sessions</p>
              <Link href="/bookings/new" className="text-xs text-[#C9A84C] hover:underline uppercase tracking-wider">
                Book a session →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {upcomingBookings.slice(0, 4).map(b => {
                const staffRaw = b.staff as unknown as { full_name: string } | null
                const staffName = staffRaw?.full_name
                const divRaw = b.division as unknown as { color_hex: string } | null
                const divColor = divRaw?.color_hex ?? '#C9A84C'
                return (
                  <Link key={b.id} href={`/bookings/${b.id}`}
                        className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors group">
                    <div className="w-[3px] h-10 rounded-full flex-shrink-0" style={{ backgroundColor: divColor }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">
                        {(b.booking_type as string).replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        {staffName && <span className="text-[#555] font-normal"> · {staffName}</span>}
                      </p>
                      <p className="text-xs text-[#444] mt-0.5">
                        {formatDate(b.starts_at)} · {formatTime(b.starts_at)} · {b.duration_mins}min
                      </p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-sm capitalize flex-shrink-0"
                          style={{ color: '#C9A84C', backgroundColor: '#C9A84C20' }}>
                      {b.status}
                    </span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* My Team (assigned coach/mentor) */}
        <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">My Team</span>
          </div>
          {!coach ? (
            <div className="px-5 py-10 text-center">
              <p className="text-[#333] text-sm">No coach assigned yet</p>
            </div>
          ) : (
            <div className="p-5 text-center">
              <div className="w-14 h-14 rounded-sm bg-[#C9A84C]/15 flex items-center justify-center
                              text-[#C9A84C] text-base font-black mb-3 mx-auto"
                   style={{ fontFamily: "'Arial Black', sans-serif" }}>
                {coach.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <p className="text-sm font-medium text-white">{coach.full_name}</p>
              <p className="text-xs text-[#444] capitalize mt-0.5">{coach.role}</p>
              <p className="text-xs text-[#333] mt-0.5 truncate">{coach.email}</p>
            </div>
          )}
        </div>
      </div>

      {/* Active goals */}
      {goals.length > 0 && (
        <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">Active Goals</span>
            <Link href="/pdp/goals" className="text-[11px] text-[#444] hover:text-[#C9A84C] transition-colors tracking-wider uppercase">
              View all
            </Link>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {goals.map(g => {
              const pct = g.target_value && g.target_value > 0
                ? Math.min(100, Math.round((g.current_value / g.target_value) * 100))
                : 0
              return (
                <div key={g.id} className="px-5 py-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-white">{g.title}</p>
                    <span className="text-[11px] text-[#444] capitalize">{g.category}</span>
                  </div>
                  {g.target_value && g.target_value > 0 ? (
                    <>
                      <div className="w-full bg-white/5 rounded-full h-1 mb-1">
                        <div className="h-1 rounded-full bg-[#2E8B35] transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <p className="text-[11px] text-[#444]">{g.current_value} / {g.target_value} · {pct}%</p>
                    </>
                  ) : (
                    <p className="text-[11px] text-[#444]">
                      {g.target_date ? `Due ${formatDate(g.target_date)}` : 'In progress'}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="mb-2">
        <span className="text-[11px] tracking-[0.3em] uppercase text-[#333]">Quick Actions</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ActionCard
          href="/bookings/new"
          label="Book a Session"
          description="Schedule 1-on-1 or join a group class"
          color="#5BB8E8"
          icon={<BookingIcon />}
        />
        <ActionCard
          href="/education"
          label="Education Hub"
          description="Videos, documents & live sessions"
          color="#CC2222"
          icon={<EducationIcon />}
        />
        <ActionCard
          href="/pdp/goals"
          label="Set a Goal"
          description="Track progress across all divisions"
          color="#2E8B35"
          icon={<GoalIcon />}
        />
        <ActionCard
          href="/calendar"
          label="My Calendar"
          description="Upcoming sessions and events"
          color="#9B2454"
          icon={<CalendarIcon />}
        />
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, color, icon }: {
  label: string
  value: string
  sub: string
  color: string
  icon: React.ReactNode
}) {
  return (
    <div className="relative bg-[#0D0D0D] p-6 group">
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: color }} />
      <div className="flex items-start justify-between mb-4">
        <div className="w-8 h-8 flex items-center justify-center" style={{ color }}>
          {icon}
        </div>
      </div>
      <div className="text-[2.5rem] font-black leading-none mb-1 tabular-nums"
           style={{ color, fontFamily: "'Arial Black', sans-serif" }}>
        {value}
      </div>
      <div className="text-xs font-semibold text-white uppercase tracking-wider mb-0.5">{label}</div>
      <div className="text-xs text-[#444]">{sub}</div>
    </div>
  )
}

function ActionCard({ href, label, description, color, icon }: {
  href: string
  label: string
  description: string
  color: string
  icon: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="group relative bg-[#0D0D0D] border border-[#1A1A1A] hover:border-white/10
                 rounded-sm p-5 flex items-center gap-4 transition-all overflow-hidden"
    >
      {/* Hover background */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
           style={{ background: `${color}08` }} />

      {/* Icon */}
      <div className="relative w-10 h-10 rounded-sm flex items-center justify-center flex-shrink-0 transition-colors"
           style={{ backgroundColor: `${color}15`, color }}>
        {icon}
      </div>

      {/* Text */}
      <div className="relative flex-1 min-w-0">
        <p className="text-sm font-bold text-white group-hover:text-white transition-colors tracking-wide">
          {label}
        </p>
        <p className="text-xs text-[#555] group-hover:text-[#666] transition-colors mt-0.5">
          {description}
        </p>
      </div>

      {/* Arrow */}
      <div className="relative flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color }}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </div>
    </Link>
  )
}

// Stat card icons
function CalendarStatIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  )
}
function ProgressStatIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  )
}
function GoalStatIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

// Action card icons
function BookingIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
    </svg>
  )
}
function EducationIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
    </svg>
  )
}
function GoalIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
    </svg>
  )
}
function CalendarIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}
