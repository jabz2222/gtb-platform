import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils/formatters'

export const metadata: Metadata = { title: 'Child PDP · Parent Portal' }

const PILLAR_COLORS: Record<string, string> = {
  technical:     '#5BB8E8',
  tactical:      '#2E9B8A',
  physical:      '#2E8B35',
  psychological: '#9B2454',
  lifestyle:     '#C9A84C',
}

const AGE_PHASE_LABEL: Record<string, string> = {
  early_years:  'Early Years (U5–U6)',
  pre_academy:  'Pre-Academy (U7–U9)',
  foundation:   'Foundation Phase (U10–U12)',
  youth:        'Youth Development (U13–U15)',
  pro:          'Pro Pathway (U16+)',
}

const IDENTITY_STANDARDS: Record<string, string> = {
  early_years: 'I Enjoy Moving and Playing.',
  pre_academy: 'I love having the ball.',
  foundation:  'I Am Building My Game.',
  youth:       'I Own My Development.',
  pro:         'I Drive My Performance.',
}

export default async function ChildPDPPage({ params }: { params: Promise<{ childId: string }> }) {
  const { childId } = await params
  const supabase = await createClient()

  // Layout already gates ownership.
  const [profileRes, goalsRes, reflectionsRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('age_phase, about_me, my_purpose, position, academy_year, date_of_birth')
      .eq('id', childId)
      .single(),
    supabase
      .from('goals')
      .select('id, title, description, category, pillar, goal_term, target_value, current_value, target_date, success_criteria, completed_at')
      .eq('player_id', childId)
      .order('created_at', { ascending: false }),
    supabase
      .from('pdp_reflections')
      .select('id, week_start, area, target, actions, evidence, challenges, learnings, next_step, status_colour, created_at')
      .eq('player_id', childId)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const profile = profileRes.data
  const goals = goalsRes.data ?? []
  const reflections = reflectionsRes.data ?? []

  const ageLabel = profile?.age_phase ? AGE_PHASE_LABEL[profile.age_phase] : 'Age phase not set'
  const identity = profile?.age_phase ? IDENTITY_STANDARDS[profile.age_phase] : null

  return (
    <div className="space-y-6">
      <div className="bg-[#0D0D0D] border border-[#C9A84C]/20 rounded-sm p-3">
        <p className="text-[11px] text-[#555]">
          Read-only view of your child&apos;s Player Development Portfolio. Updates are made by your child and their coach.
        </p>
      </div>

      {/* Identity & age phase */}
      <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">Identity & Phase</span>
          <span className="text-[10px] text-[#444] uppercase tracking-wider">{ageLabel}</span>
        </div>
        <div className="p-5">
          {identity && (
            <p
              className="text-2xl font-black tracking-wide text-white uppercase mb-3"
              style={{ fontFamily: "'Arial Black', sans-serif" }}
            >
              <span className="text-[#C9A84C]">&ldquo;</span>{identity}<span className="text-[#C9A84C]">&rdquo;</span>
            </p>
          )}
          {profile?.about_me && (
            <div className="mb-3">
              <p className="text-[10px] text-[#666] tracking-wider uppercase mb-1">About Me</p>
              <p className="text-sm text-[#bbb] leading-relaxed">{profile.about_me}</p>
            </div>
          )}
          {profile?.my_purpose && (
            <div className="mb-3">
              <p className="text-[10px] text-[#666] tracking-wider uppercase mb-1">My Purpose</p>
              <p className="text-sm text-[#bbb] leading-relaxed">{profile.my_purpose}</p>
            </div>
          )}
          {profile?.position && (
            <p className="text-[11px] text-[#666] mt-2">Position: {profile.position}</p>
          )}
        </div>
      </div>

      {/* Goals */}
      <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5">
          <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">
            Development Goals · {goals.length}
          </span>
        </div>
        {goals.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-[#444] text-sm">No goals set yet</p>
            <p className="text-[#333] text-xs mt-1">Goals are set by the coach and player together.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {goals.map(g => {
              const pct = g.target_value
                ? Math.min(100, Math.round((g.current_value / g.target_value) * 100))
                : null
              const pillarColor = g.pillar ? PILLAR_COLORS[g.pillar] : '#C9A84C'
              return (
                <div key={g.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <div>
                      <p className="text-sm text-white font-medium">{g.title}</p>
                      {g.description && (
                        <p className="text-[11px] text-[#666] mt-1">{g.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {g.pillar && (
                        <span
                          className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm"
                          style={{
                            color: pillarColor,
                            backgroundColor: `${pillarColor}15`,
                          }}
                        >
                          {g.pillar}
                        </span>
                      )}
                      {g.goal_term && (
                        <span className="text-[10px] uppercase tracking-wider text-[#666]">
                          {g.goal_term}-term
                        </span>
                      )}
                    </div>
                  </div>
                  {pct != null && (
                    <>
                      <div className="w-full bg-[#1A1A1A] rounded-full h-1 mt-2">
                        <div
                          className="h-1 rounded-full transition-all"
                          style={{ width: `${pct}%`, backgroundColor: pillarColor }}
                        />
                      </div>
                      <p className="text-[11px] text-[#666] mt-1">
                        {g.current_value} / {g.target_value} · {pct}%
                      </p>
                    </>
                  )}
                  {g.target_date && (
                    <p className="text-[11px] text-[#444] mt-1">
                      Target: {formatDate(g.target_date)}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Recent reflections */}
      <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5">
          <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">
            Recent Reflections · {reflections.length}
          </span>
        </div>
        {reflections.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-[#444] text-sm">No reflections submitted yet</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {reflections.map(r => (
              <div key={r.id} className="px-5 py-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] text-[#666] uppercase tracking-wider">
                    {r.week_start ? `Week of ${formatDate(r.week_start)}` : formatDate(r.created_at)}
                    {r.area && <span className="text-[#888] ml-2">· {r.area}</span>}
                  </p>
                  {r.status_colour && (
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: r.status_colour }}
                    />
                  )}
                </div>
                {r.target && (
                  <div className="mb-2">
                    <p className="text-[10px] text-[#C9A84C] uppercase tracking-wider mb-0.5">Target</p>
                    <p className="text-xs text-[#bbb]">{r.target}</p>
                  </div>
                )}
                {r.actions && (
                  <div className="mb-2">
                    <p className="text-[10px] text-[#5BB8E8] uppercase tracking-wider mb-0.5">Actions</p>
                    <p className="text-xs text-[#bbb]">{r.actions}</p>
                  </div>
                )}
                {r.evidence && (
                  <div className="mb-2">
                    <p className="text-[10px] text-[#2E8B35] uppercase tracking-wider mb-0.5">Evidence</p>
                    <p className="text-xs text-[#bbb]">{r.evidence}</p>
                  </div>
                )}
                {r.learnings && (
                  <div className="mt-3 pt-3 border-t border-white/[0.04]">
                    <p className="text-[10px] text-[#aaa] uppercase tracking-wider mb-0.5">Learnings</p>
                    <p className="text-xs text-[#aaa]">{r.learnings}</p>
                  </div>
                )}
                {r.next_step && (
                  <div className="mt-2">
                    <p className="text-[10px] text-[#9B2454] uppercase tracking-wider mb-0.5">Next step</p>
                    <p className="text-xs text-[#aaa]">{r.next_step}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
