import { requireAuth } from '@/lib/auth/requireRole'
import { createClient } from '@/lib/supabase/server'

// ─── Types ────────────────────────────────────────────────────────────────────

interface BadgeDefinition {
  id: string
  slug: string
  name: string
  description: string | null
  icon_emoji: string
  category: string
  points_value: number
}

interface AwardedBadge {
  awarded_at: string
  context: string | null
  badge_definitions: BadgeDefinition
}

interface LeaderboardRow {
  user_id: string
  total_points: number
  profiles: { full_name: string }
}

const CATEGORY_COLORS: Record<string, string> = {
  session:   '#5BB8E8',
  goal:      '#C9A84C',
  education: '#CC2222',
  coach:     '#9B2454',
  general:   '#555',
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-[#0D0D0D] border border-white/5 rounded-sm p-5">
      <p className="text-[11px] tracking-[0.3em] uppercase text-[#444] mb-2">{label}</p>
      <p className="text-3xl font-black text-[#C9A84C]" style={{ fontFamily: "'Arial Black', sans-serif" }}>
        {value}
      </p>
      {sub && <p className="text-[11px] text-[#444] mt-1">{sub}</p>}
    </div>
  )
}

// ─── Badge card ───────────────────────────────────────────────────────────────

function BadgeCard({ badge, earned, earnedAt }: {
  badge: BadgeDefinition
  earned: boolean
  earnedAt?: string
}) {
  const color = CATEGORY_COLORS[badge.category] ?? '#555'
  return (
    <div className={`bg-[#0D0D0D] border rounded-sm p-4 flex items-start gap-3 transition-colors ${
      earned ? 'border-white/10' : 'border-white/[0.03] opacity-40'
    }`}>
      <div
        className="w-10 h-10 rounded-sm flex items-center justify-center text-xl flex-shrink-0"
        style={{ backgroundColor: `${color}15` }}
      >
        {badge.icon_emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white">{badge.name}</p>
        <p className="text-[11px] text-[#555] mt-0.5 leading-relaxed">{badge.description}</p>
        {earned && earnedAt && (
          <p className="text-[10px] mt-1" style={{ color }}>
            Earned {new Date(earnedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        )}
        {!earned && (
          <p className="text-[10px] text-[#333] mt-1">+{badge.points_value} pts when earned</p>
        )}
      </div>
      {earned && badge.points_value > 0 && (
        <div className="flex-shrink-0">
          <span className="text-[11px] font-medium" style={{ color }}>+{badge.points_value}</span>
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AchievementsPage() {
  const user = await requireAuth()
  const supabase = await createClient()

  const [pointsRes, badgesRes, allBadgesRes, leaderboardRes] = await Promise.all([
    // Total points for this user
    supabase
      .from('player_points')
      .select('points')
      .eq('user_id', user.id),

    // Awarded badges for this user
    supabase
      .from('awarded_badges')
      .select('awarded_at, context, badge_definitions(id, slug, name, description, icon_emoji, category, points_value)')
      .eq('user_id', user.id)
      .order('awarded_at', { ascending: false }),

    // All badge definitions (to show locked ones)
    supabase
      .from('badge_definitions')
      .select('id, slug, name, description, icon_emoji, category, points_value')
      .order('category'),

    // Leaderboard: top 10 by total points (via the view)
    supabase
      .from('player_points_totals')
      .select('user_id, total_points')
      .order('total_points', { ascending: false })
      .limit(10),
  ])

  const totalPoints = (pointsRes.data ?? []).reduce((sum, r) => sum + r.points, 0)
  const awardedBadges = (badgesRes.data ?? []) as AwardedBadge[]
  const allBadges = (allBadgesRes.data ?? []) as BadgeDefinition[]
  const leaderboard = (leaderboardRes.data ?? []) as { user_id: string; total_points: number }[]

  // Build earned set for quick lookup
  const earnedMap = new Map(awardedBadges.map(ab => [ab.badge_definitions.id, ab.awarded_at]))

  // Fetch names for leaderboard users
  const leaderboardUserIds = leaderboard.map(r => r.user_id)
  const { data: leaderboardProfiles } = leaderboardUserIds.length > 0
    ? await supabase.from('profiles').select('id, full_name').in('id', leaderboardUserIds)
    : { data: [] }
  const nameMap = new Map((leaderboardProfiles ?? []).map(p => [p.id, p.full_name]))

  const myRank = leaderboard.findIndex(r => r.user_id === user.id) + 1

  // Group all badges by category
  const categories = ['session', 'goal', 'education', 'coach', 'general']

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="text-[#C9A84C] text-[11px] tracking-[0.3em] uppercase mb-2">Rewards</p>
        <h1
          className="text-4xl font-black tracking-wider text-white uppercase"
          style={{ fontFamily: "'Arial Black', sans-serif" }}
        >
          My <span style={{ color: '#C9A84C' }}>Achievements</span>
        </h1>
        <p className="text-[#444] mt-1.5 text-sm">Track your points, badges, and rank within GTB</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Points" value={totalPoints.toLocaleString()} />
        <StatCard label="Badges Earned" value={awardedBadges.length} sub={`of ${allBadges.length} available`} />
        <StatCard label="Division Rank" value={myRank > 0 ? `#${myRank}` : '—'} sub="leaderboard position" />
        <StatCard label="Badges Available" value={allBadges.length - awardedBadges.length} sub="still to unlock" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Badges by category */}
        <div className="lg:col-span-2 space-y-6">
          {categories.map(cat => {
            const catBadges = allBadges.filter(b => b.category === cat)
            if (catBadges.length === 0) return null
            const color = CATEGORY_COLORS[cat] ?? '#555'
            return (
              <div key={cat} className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-white/5 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-[11px] tracking-[0.3em] uppercase" style={{ color }}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)} Badges
                  </span>
                </div>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {catBadges.map(badge => (
                    <BadgeCard
                      key={badge.id}
                      badge={badge}
                      earned={earnedMap.has(badge.id)}
                      earnedAt={earnedMap.get(badge.id)}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Leaderboard */}
        <div className="space-y-6">
          <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5">
              <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">Top 10 — Points</span>
            </div>
            {leaderboard.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-[#444] text-sm">No points logged yet</p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {leaderboard.map((row, idx) => {
                  const isMe = row.user_id === user.id
                  const rank = idx + 1
                  const rankColor = rank === 1 ? '#C9A84C' : rank === 2 ? '#888' : rank === 3 ? '#CD7F32' : '#333'
                  return (
                    <div
                      key={row.user_id}
                      className={`px-5 py-3.5 flex items-center gap-3 ${isMe ? 'bg-[#C9A84C]/5' : ''}`}
                    >
                      <span
                        className="text-sm font-black w-5 text-right flex-shrink-0"
                        style={{ fontFamily: "'Arial Black', sans-serif", color: rankColor }}
                      >
                        {rank}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm truncate ${isMe ? 'text-[#C9A84C]' : 'text-white'}`}>
                          {nameMap.get(row.user_id) ?? 'GTB Member'}
                          {isMe && <span className="text-[10px] text-[#444] ml-1">(you)</span>}
                        </p>
                      </div>
                      <span className="text-sm font-medium text-[#C9A84C] flex-shrink-0">
                        {Number(row.total_points).toLocaleString()}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Recent points history */}
          <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5">
              <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">Recent Points</span>
            </div>
            {(pointsRes.data ?? []).length === 0 ? (
              <div className="p-5 text-center">
                <p className="text-[#444] text-sm">No points yet</p>
                <p className="text-[#333] text-xs mt-1">Attend sessions, complete goals, and finish modules to earn points</p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {(pointsRes.data ?? []).slice(0, 8).map((row, i) => (
                  <div key={i} className="px-5 py-3 flex justify-between items-center">
                    <p className="text-[11px] text-[#555] capitalize">{String(row.points)}</p>
                    <span className={`text-sm font-medium ${row.points >= 0 ? 'text-[#2E8B35]' : 'text-[#CC2222]'}`}>
                      {row.points >= 0 ? '+' : ''}{row.points}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
