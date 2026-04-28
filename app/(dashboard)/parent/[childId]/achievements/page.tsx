import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils/formatters'

export const metadata: Metadata = { title: 'Child Achievements · Parent Portal' }

export default async function ChildAchievementsPage({ params }: { params: Promise<{ childId: string }> }) {
  const { childId } = await params
  const supabase = await createClient()

  const [awardedRes, allBadgesRes, pointsRes] = await Promise.all([
    supabase
      .from('awarded_badges')
      .select(`
        id, awarded_at, context,
        badge:badge_definitions(id, slug, name, description, icon_emoji, category, points_value, division_id),
        awarder:profiles!awarded_badges_awarded_by_fkey(full_name, role)
      `)
      .eq('user_id', childId)
      .order('awarded_at', { ascending: false }),
    supabase
      .from('badge_definitions')
      .select('id, slug, name, description, icon_emoji, category, points_value'),
    supabase
      .from('player_points')
      .select('points')
      .eq('user_id', childId),
  ])

  const awarded = awardedRes.data ?? []
  const allBadges = allBadgesRes.data ?? []
  const totalPoints = (pointsRes.data ?? []).reduce((s, r) => s + (r.points ?? 0), 0)

  // Build a set of earned badge ids for greying-out unearned ones.
  const earnedIds = new Set(
    awarded
      .map(a => (Array.isArray(a.badge) ? a.badge[0]?.id : a.badge?.id))
      .filter(Boolean) as string[]
  )

  return (
    <div className="space-y-6">
      <div className="bg-[#0D0D0D] border border-[#C9A84C]/20 rounded-sm p-3">
        <p className="text-[11px] text-[#555]">
          Read-only view of badges and certificates your child has earned. Greyed badges are available to earn.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-white/5 rounded-sm overflow-hidden border border-white/5">
        <Stat label="Badges Earned" value={String(awarded.length)} accent="#C9A84C" />
        <Stat label="Total Points" value={String(totalPoints)} accent="#5BB8E8" />
        <Stat label="Available Badges" value={String(allBadges.length)} accent="#2E8B35" />
      </div>

      {/* Earned recently */}
      <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5">
          <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">
            Recent Earned · {awarded.length}
          </span>
        </div>
        {awarded.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-[#444] text-sm">No badges earned yet</p>
            <p className="text-[#333] text-xs mt-1">
              Badges are awarded automatically on milestones, or manually by the coach.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {awarded.slice(0, 10).map(a => {
              const badge = Array.isArray(a.badge) ? a.badge[0] : a.badge
              const awarder = Array.isArray(a.awarder) ? a.awarder[0] : a.awarder
              return (
                <div key={a.id} className="px-5 py-3.5 flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-sm bg-[#C9A84C]/10 flex items-center justify-center
                               text-xl flex-shrink-0"
                  >
                    {badge?.icon_emoji ?? '🏅'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium">{badge?.name ?? 'Badge'}</p>
                    <p className="text-[11px] text-[#666] mt-0.5">
                      {formatDate(a.awarded_at)}
                      {awarder?.full_name && (
                        <>
                          {' · '}awarded by {awarder.full_name}{' '}
                          <span className="capitalize">({awarder.role})</span>
                        </>
                      )}
                    </p>
                    {a.context && (
                      <p className="text-[11px] text-[#aaa] mt-1.5">{a.context}</p>
                    )}
                  </div>
                  {badge?.points_value != null && badge.points_value > 0 && (
                    <span className="text-[11px] text-[#C9A84C] font-mono flex-shrink-0">
                      +{badge.points_value} pts
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Badge wall */}
      <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5">
          <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">Badge Wall</span>
        </div>
        {allBadges.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-[#444] text-sm">No badges defined yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 p-5">
            {allBadges.map(b => {
              const earned = earnedIds.has(b.id)
              return (
                <div
                  key={b.id}
                  className={
                    'aspect-square rounded-sm border flex flex-col items-center justify-center text-center p-2 transition-opacity ' +
                    (earned
                      ? 'bg-[#C9A84C]/10 border-[#C9A84C]/30'
                      : 'bg-[#0A0A0A] border-white/5 opacity-30 grayscale')
                  }
                  title={b.description ?? b.name}
                >
                  <span className="text-2xl mb-1">{b.icon_emoji ?? '🏅'}</span>
                  <p className="text-[10px] text-white tracking-wide leading-tight">{b.name}</p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function Stat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="bg-[#0D0D0D] p-5 relative">
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: accent }} />
      <div
        className="text-[2rem] font-black leading-none mb-1 tabular-nums"
        style={{ color: accent, fontFamily: "'Arial Black', sans-serif" }}
      >
        {value}
      </div>
      <div className="text-[11px] text-[#666] uppercase tracking-wider">{label}</div>
    </div>
  )
}
