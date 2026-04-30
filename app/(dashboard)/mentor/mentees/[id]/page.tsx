import { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { requireRole } from '@/lib/auth/requireRole'
import { createClient } from '@/lib/supabase/server'
import { formatDate, formatTime } from '@/lib/utils/formatters'
import StatusBadge from '@/components/ui/StatusBadge'
import CoachWorkbench from '@/components/coach/CoachWorkbench'

export const metadata: Metadata = { title: 'Player Management · Coach' }

interface Props { params: Promise<{ id: string }> }

export default async function MenteeDetailPage({ params }: Props) {
  const { user, role } = await requireRole(['admin', 'staff', 'mentor'])
  const { id: clientId } = await params
  const supabase = await createClient()

  // Visibility tier (Brief §3.2 Step 4):
  //   - admin: see all
  //   - staff (Head Coach / Dept Lead): see division-wide
  //   - mentor: own assignments only
  let canView = role === 'admin'
  if (!canView) {
    const { data: assignment } = await supabase
      .from('client_assignments')
      .select('staff_id, client_id, is_active')
      .eq('staff_id', user.id)
      .eq('client_id', clientId)
      .eq('is_active', true)
      .maybeSingle()
    if (assignment) canView = true
  }
  if (!canView && role === 'staff') {
    // Head Coach sees players in their division.
    const { data: me } = await supabase
      .from('profiles')
      .select('head_coach_for_division_id')
      .eq('id', user.id)
      .single()
    if (me?.head_coach_for_division_id) {
      // Player must have a session in that division OR be enrolled in that division.
      const { data: sharesDivision } = await supabase
        .from('user_divisions')
        .select('user_id')
        .eq('user_id', clientId)
        .eq('division_id', me.head_coach_for_division_id)
        .maybeSingle()
      if (sharesDivision) canView = true
    }
  }
  if (!canView) {
    redirect('/mentor/mentees')
  }

  const { data: player } = await supabase
    .from('profiles')
    .select(`
      id, full_name, email, role, date_of_birth, position, academy_year,
      about_me, my_purpose, age_phase, parent_guardian_id, coach_activated_sections,
      parent:profiles!profiles_parent_guardian_id_fkey(id, full_name, email)
    `)
    .eq('id', clientId)
    .single()

  if (!player) notFound()

  const [bookingsRes, goalsRes, performanceRes, divisionsRes] = await Promise.all([
    supabase
      .from('bookings')
      .select(`
        id, booking_type, status, starts_at, duration_mins,
        division:divisions(id, name, color_hex, slug)
      `)
      .eq('client_id', clientId)
      .order('starts_at', { ascending: false })
      .limit(8),
    supabase
      .from('goals')
      .select('id, title, category, pillar, goal_term, target_value, current_value, target_date')
      .eq('player_id', clientId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('performance_entries')
      .select(`
        id, recorded_at, metrics, notes,
        division:divisions(name, color_hex)
      `)
      .eq('player_id', clientId)
      .order('recorded_at', { ascending: false })
      .limit(5),
    supabase
      .from('divisions')
      .select('id, name, slug, color_hex')
      .eq('is_active', true)
      .order('name'),
  ])

  const bookings = bookingsRes.data ?? []
  const goals = goalsRes.data ?? []
  const performance = performanceRes.data ?? []
  const divisions = divisionsRes.data ?? []
  const parent = Array.isArray(player.parent) ? player.parent[0] : player.parent
  const initials = (player.full_name ?? '')
    .split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div>
      <Link
        href={role === 'mentor' ? '/mentor/mentees' : '/admin/users'}
        className="text-xs text-[#444] hover:text-white uppercase tracking-wider mb-4 inline-block transition-colors"
      >
        ← Back
      </Link>

      <div className="flex items-center gap-4 mb-6">
        <div
          className="w-14 h-14 rounded-sm bg-[#9B2454]/15 flex items-center justify-center
                     text-[#9B2454] text-base font-black flex-shrink-0"
          style={{ fontFamily: "'Arial Black', sans-serif" }}
        >
          {initials}
        </div>
        <div>
          <p className="text-[#9B2454] text-[11px] tracking-[0.3em] uppercase mb-1">Player Management</p>
          <h1
            className="text-3xl font-black tracking-wider text-white uppercase"
            style={{ fontFamily: "'Arial Black', sans-serif" }}
          >
            {player.full_name}
          </h1>
          <p className="text-[#444] text-xs mt-0.5 capitalize">
            {player.role}
            {player.position && <> · {player.position}</>}
            {player.academy_year && <> · {player.academy_year}</>}
            {player.date_of_birth && (
              <> · DOB {new Date(player.date_of_birth).toLocaleDateString('en-GB')}</>
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — read-only player snapshot */}
        <div className="lg:col-span-1 space-y-6">
          {/* Parent contact */}
          <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5">
              <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">Parent Contact</span>
            </div>
            {parent ? (
              <div className="p-5">
                <p className="text-sm text-white">{parent.full_name}</p>
                <p className="text-xs text-[#666] mt-0.5">{parent.email}</p>
                <Link
                  href={`/messages?to=${parent.id}`}
                  className="mt-3 inline-block text-[11px] text-[#C9A84C] hover:underline uppercase tracking-wider"
                >
                  Send message →
                </Link>
              </div>
            ) : (
              <div className="p-5 text-[#444] text-xs">No parent linked</div>
            )}
          </div>

          {/* Identity / about */}
          {(player.about_me || player.my_purpose) && (
            <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-white/5">
                <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">Identity</span>
              </div>
              <div className="p-5 space-y-3">
                {player.about_me && (
                  <div>
                    <p className="text-[10px] text-[#666] uppercase tracking-wider mb-1">About</p>
                    <p className="text-xs text-[#bbb]">{player.about_me}</p>
                  </div>
                )}
                {player.my_purpose && (
                  <div>
                    <p className="text-[10px] text-[#666] uppercase tracking-wider mb-1">Purpose</p>
                    <p className="text-xs text-[#bbb]">{player.my_purpose}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Goals */}
          <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5">
              <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">
                Active Goals · {goals.length}
              </span>
            </div>
            {goals.length === 0 ? (
              <div className="p-5 text-[#444] text-xs">No active goals</div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {goals.map(g => (
                  <div key={g.id} className="px-5 py-3">
                    <p className="text-xs text-white">{g.title}</p>
                    <p className="text-[10px] text-[#666] mt-0.5 capitalize">
                      {g.category}
                      {g.pillar && <> · {g.pillar}</>}
                      {g.goal_term && <> · {g.goal_term}-term</>}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent bookings */}
          <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5">
              <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">Recent Sessions</span>
            </div>
            {bookings.length === 0 ? (
              <div className="p-5 text-[#444] text-xs">No sessions</div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {bookings.slice(0, 5).map(b => {
                  const div = Array.isArray(b.division) ? b.division[0] : b.division
                  return (
                    <div key={b.id} className="px-5 py-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs text-white capitalize truncate">
                          {b.booking_type.replace(/_/g, ' ')}
                        </p>
                        <StatusBadge variant={b.status} />
                      </div>
                      <p className="text-[10px] text-[#666] mt-0.5">
                        {formatDate(b.starts_at)} · {formatTime(b.starts_at)}
                        {div && <span style={{ color: div.color_hex as string }}> · {div.name as string}</span>}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right column — coach workbench (writable) */}
        <div className="lg:col-span-2">
          <CoachWorkbench
            playerId={clientId}
            playerName={player.full_name ?? 'Player'}
            divisions={divisions}
            recentPerformance={performance.map(p => ({
              id: p.id,
              recorded_at: p.recorded_at,
              metrics: (p.metrics ?? {}) as Record<string, unknown>,
              notes: p.notes,
              division: Array.isArray(p.division) ? p.division[0] : p.division,
            }))}
            activatedSections={(player as { coach_activated_sections?: string[] }).coach_activated_sections ?? []}
          />
        </div>
      </div>
    </div>
  )
}
