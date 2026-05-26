import { requireAuth } from '@/lib/auth/requireRole'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import PDPWeeklyView from '@/components/pdp/PDPWeeklyView'

const AGE_PHASE_META: Record<string, { label: string; identity: string; accent: string }> = {
  early_years: { label: 'Early Years (U5–U6)',      identity: 'I Enjoy Moving and Playing.',  accent: '#5BB8E8' },
  pre_academy: { label: 'Pre-Academy (U7–U9)',       identity: 'I Love Having the Ball.',     accent: '#9B2454' },
  foundation:  { label: 'Foundation Phase (U10–U12)',identity: 'I Am Building My Game.',      accent: '#C9A84C' },
  youth:       { label: 'Youth Development (U13–U16)',identity: 'I Own My Development.',      accent: '#2E8B35' },
  pro:         { label: 'Pro Pathway (U16+)',         identity: 'I Drive My Performance.',    accent: '#CC2222' },
}

// Foundation cards always visible — PDP set up
const FOUNDATION = [
  {
    href: '/pdp/profile',
    label: 'Player Profile',
    description: 'Identity, position, accountability agreement',
    colour: '#5BB8E8',
    icon: '👤',
  },
  {
    href: '/pdp/baselines',
    label: 'Baselines',
    description: 'Pre-season physical, psychological & technical benchmarks',
    colour: '#C9A84C',
    icon: '📊',
  },
  {
    href: '/pdp/goals',
    label: 'Goal Setting',
    description: 'Short-term and long-term goals across all pillars',
    colour: '#9B2454',
    icon: '🎯',
  },
] as const

// Optional sections — coach activates per-player, otherwise greyed out
const OPTIONAL_SECTIONS = [
  { href: '/pdp/sc',                slug: 'sc',                label: 'S&C Training',       description: 'Strength & conditioning logs and benchmarks', colour: '#CC2222', icon: '💪' },
  { href: '/pdp/mentorship',        slug: 'mentorship',        label: 'Mentorship & Review',description: 'Mentor check-ins, growth tasks',              colour: '#5BB8E8', icon: '🤝' },
  { href: '/pdp/kpis',              slug: 'kpis',              label: 'Habits & Consistency',description:'Daily habits tracker, streak, leaderboard',    colour: '#C9A84C', icon: '🔥' },
  { href: '/pdp/performance',       slug: 'performance',       label: 'Training Reflection',description: 'Rate each training session — 6 key areas',    colour: '#9B2454', icon: '⚽' },
  { href: '/pdp/performance?tab=match', slug: 'match',         label: 'Match Reflection',   description: 'Post-match analysis — 6 performance areas',   colour: '#E8641A', icon: '🏟️' },
  { href: '/pdp/performance?tab=technical', slug: 'technical', label: 'Technical Tracker',  description: 'Skill-by-skill ratings over time',            colour: '#2E8B35', icon: '📈' },
  { href: '/pdp/game-intelligence', slug: 'game-intelligence', label: 'Game Intelligence',  description: 'Decision-making log and tactical analysis',   colour: '#CC2222', icon: '🧠' },
  { href: '/pdp/feedback',          slug: 'feedback',          label: 'Feedback & Review',  description: 'Coach feedback, ratings, and your responses', colour: '#444',    icon: '💬' },
] as const

export default async function PDPPage() {
  const user = await requireAuth()
  const supabase = await createClient()
  const name = user.user_metadata?.full_name ?? 'Player'

  const { data: profile } = await supabase
    .from('profiles')
    .select('age_phase, coach_activated_sections')
    .eq('id', user.id)
    .single()

  const phase = profile?.age_phase ? AGE_PHASE_META[profile.age_phase] : null
  const identity = phase?.identity ?? 'I Own My Development.'
  const accent = phase?.accent ?? '#C9A84C'
  const activatedSet = new Set<string>(profile?.coach_activated_sections ?? [])

  // Compute Mon–Sun for THIS week (or current/visible week; fed via search params later)
  const now = new Date()
  const day = now.getDay() // 0=Sun..6=Sat
  const dowMon = (day + 6) % 7 // 0 if Mon, 6 if Sun
  const monday = new Date(now)
  monday.setDate(now.getDate() - dowMon)
  monday.setHours(0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 7)

  const weekStartIso = monday.toISOString()
  const weekEndIso   = sunday.toISOString()

  // Pull data for the visible week
  const [
    bookingsRes,
    externalRes,
    sessionReflectionsRes,
    scSessionsRes,
    weeklyReflectionsRes,
  ] = await Promise.all([
    supabase
      .from('bookings')
      .select('id, starts_at, ends_at, booking_type, status, divisions(slug, name, color_hex)')
      .eq('client_id', user.id)
      .gte('starts_at', weekStartIso)
      .lt('starts_at', weekEndIso)
      .order('starts_at', { ascending: true }),
    supabase
      .from('external_events')
      .select('id, title, event_type, starts_at, ends_at, location, notes, color_hex')
      .eq('user_id', user.id)
      .gte('starts_at', weekStartIso)
      .lt('starts_at', weekEndIso)
      .order('starts_at', { ascending: true }),
    supabase
      .from('pdp_session_reflections')
      .select('id, session_date, reflection_type, area, rating, notes')
      .eq('player_id', user.id)
      .gte('session_date', monday.toISOString().slice(0, 10))
      .lt('session_date', sunday.toISOString().slice(0, 10)),
    supabase
      .from('pdp_sc_sessions')
      .select('id, session_date, session_type, focus, completed')
      .eq('player_id', user.id)
      .gte('session_date', monday.toISOString().slice(0, 10))
      .lt('session_date', sunday.toISOString().slice(0, 10)),
    supabase
      .from('pdp_reflections')
      .select('id, week_start, area, target, status_colour')
      .eq('player_id', user.id)
      .gte('week_start', monday.toISOString().slice(0, 10))
      .lt('week_start', sunday.toISOString().slice(0, 10)),
  ])

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="text-[11px] tracking-[0.3em] uppercase mb-2" style={{ color: accent }}>
          {phase?.label ?? 'Personal Development'}
        </p>
        <h1
          className="text-4xl font-black tracking-wider text-white uppercase"
          style={{ fontFamily: "'Arial Black', sans-serif" }}
        >
          Player <span style={{ color: accent }}>Development</span> Plan
        </h1>
        <p className="text-[#444] mt-1.5 text-sm">{name} · &ldquo;{identity}&rdquo;</p>
      </div>

      {/* Top bar — Foundation of PDP setup (always visible) */}
      <div className="mb-6">
        <p className="text-[11px] tracking-[0.3em] uppercase text-[#888] mb-3">PDP Foundation</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {FOUNDATION.map(f => (
            <Link
              key={f.href}
              href={f.href}
              className="group bg-[#0D0D0D] border border-white/5 rounded-sm p-4 hover:border-white/15 transition-colors relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: f.colour }} />
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">{f.icon}</span>
                <div>
                  <p className="text-sm font-medium text-white mb-0.5">{f.label}</p>
                  <p className="text-[11px] text-[#555] leading-relaxed">{f.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Weekly view (Mon–Sun) */}
      <PDPWeeklyView
        weekStart={monday.toISOString()}
        bookings={(bookingsRes.data ?? []) as Record<string, unknown>[]}
        externalEvents={externalRes.data ?? []}
        sessionReflections={sessionReflectionsRes.data ?? []}
        scSessions={scSessionsRes.data ?? []}
        weeklyReflections={weeklyReflectionsRes.data ?? []}
        accent={accent}
      />

      {/* Optional sections (coach-activated) */}
      <div className="mt-10">
        <div className="flex items-baseline justify-between mb-3">
          <p className="text-[11px] tracking-[0.3em] uppercase text-[#888]">Optional Sections</p>
          <p className="text-[10px] text-[#555]">Activated by your coach when relevant</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {OPTIONAL_SECTIONS.map(section => {
            const activated = activatedSet.has(section.slug)
            return (
              <Link
                key={section.href}
                href={section.href}
                className={
                  'group bg-[#0D0D0D] border rounded-sm p-4 transition-colors relative overflow-hidden ' +
                  (activated
                    ? 'border-white/5 hover:border-white/15'
                    : 'border-white/[0.04] opacity-50 hover:opacity-80')
                }
              >
                <div
                  className="absolute top-0 left-0 right-0 h-[2px]"
                  style={{ backgroundColor: section.colour }}
                />
                <div className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0">{section.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <p className="text-sm font-medium text-white">{section.label}</p>
                      {activated && (
                        <span
                          className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-sm"
                          style={{ color: '#2E8B35', backgroundColor: '#2E8B3520' }}
                        >
                          Coach Activated
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#555] leading-relaxed">{section.description}</p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
