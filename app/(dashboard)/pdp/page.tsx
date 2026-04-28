import { requireAuth } from '@/lib/auth/requireRole'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

const AGE_PHASE_META: Record<string, { label: string; identity: string; accent: string }> = {
  early_years: { label: 'Early Years (U5–U6)',      identity: 'I Enjoy Moving and Playing.',  accent: '#5BB8E8' },
  pre_academy: { label: 'Pre-Academy (U7–U9)',       identity: 'I Love Having the Ball.',     accent: '#9B2454' },
  foundation:  { label: 'Foundation Phase (U10–U12)',identity: 'I Am Building My Game.',      accent: '#C9A84C' },
  youth:       { label: 'Youth Development (U13–U15)',identity: 'I Own My Development.',      accent: '#2E8B35' },
  pro:         { label: 'Pro Pathway (U16+)',         identity: 'I Drive My Performance.',    accent: '#CC2222' },
}

const SECTIONS = [
  {
    href: '/pdp/profile',
    label: 'Player Profile',
    description: 'Your details, purpose, and accountability agreement',
    colour: '#5BB8E8',
    icon: '👤',
  },
  {
    href: '/pdp/baselines',
    label: 'Pre-Season Baselines',
    description: 'Physical, psychological, and technical benchmarks',
    colour: '#C9A84C',
    icon: '📊',
  },
  {
    href: '/pdp/goals',
    label: 'Goal Setting',
    description: 'Technical, tactical, physical, psychological & lifestyle goals',
    colour: '#9B2454',
    icon: '🎯',
  },
  {
    href: '/pdp/reflections',
    label: 'Weekly Reflections',
    description: 'Track targets, actions, and progress each week',
    colour: '#2E8B35',
    icon: '📝',
  },
  {
    href: '/pdp/sc',
    label: 'S&C Training',
    description: 'Strength & conditioning log and benchmarks',
    colour: '#CC2222',
    icon: '💪',
  },
  {
    href: '/pdp/mentorship',
    label: 'Mentorship & Review',
    description: 'Mentor check-ins, player-led reviews, and growth tasks',
    colour: '#5BB8E8',
    icon: '🤝',
  },
  {
    href: '/pdp/kpis',
    label: 'Habits & Consistency',
    description: 'Daily habits tracker, streak, and division standings',
    colour: '#C9A84C',
    icon: '🔥',
  },
  {
    href: '/pdp/performance',
    label: 'Training Reflection',
    description: 'Rate each session across 6 key areas',
    colour: '#9B2454',
    icon: '⚽',
  },
  {
    href: '/pdp/performance?tab=match',
    label: 'Match Reflection',
    description: 'Post-match analysis across 6 performance areas',
    colour: '#E8641A',
    icon: '🏟️',
  },
  {
    href: '/pdp/performance?tab=technical',
    label: 'Technical Tracker',
    description: 'Skill-by-skill ratings over time',
    colour: '#2E8B35',
    icon: '📈',
  },
  {
    href: '/pdp/game-intelligence',
    label: 'Game Intelligence',
    description: 'Decision-making log and tactical analysis',
    colour: '#CC2222',
    icon: '🧠',
  },
  {
    href: '/pdp/feedback',
    label: 'Feedback & Review Hub',
    description: 'Coach feedback, ratings, and your responses',
    colour: '#444',
    icon: '💬',
  },
]

export default async function PDPPage() {
  const user = await requireAuth()
  const supabase = await createClient()
  const name = user.user_metadata?.full_name ?? 'Player'

  const { data: profile } = await supabase
    .from('profiles')
    .select('age_phase')
    .eq('id', user.id)
    .single()

  const phase = profile?.age_phase ? AGE_PHASE_META[profile.age_phase] : null
  const identity = phase?.identity ?? 'I Own My Development.'
  const accent = phase?.accent ?? '#C9A84C'

  return (
    <div>
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

      {/* SDT Banner */}
      <div className="mb-8 bg-[#0D0D0D] border border-white/5 rounded-sm p-5">
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { label: 'Autonomy', desc: 'Take ownership of your journey', colour: '#5BB8E8' },
            { label: 'Competence', desc: 'Build skills with every session', colour: '#C9A84C' },
            { label: 'Relatedness', desc: 'Grow through your team and mentors', colour: '#9B2454' },
          ].map(p => (
            <div key={p.label}>
              <p className="text-[11px] uppercase tracking-[0.2em] font-medium mb-1" style={{ color: p.colour }}>
                {p.label}
              </p>
              <p className="text-[11px] text-[#444]">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Section grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SECTIONS.map(section => (
          <Link
            key={section.href}
            href={section.href}
            className="group bg-[#0D0D0D] border border-white/5 rounded-sm p-5 hover:border-white/15 transition-colors relative overflow-hidden"
          >
            <div
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{ backgroundColor: section.colour }}
            />
            <div className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0">{section.icon}</span>
              <div>
                <p className="text-sm font-medium text-white mb-1">{section.label}</p>
                <p className="text-[11px] text-[#444] leading-relaxed">{section.description}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1">
              <span className="text-[10px] uppercase tracking-wider" style={{ color: section.colour }}>Open</span>
              <span className="text-[10px]" style={{ color: section.colour }}> →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
