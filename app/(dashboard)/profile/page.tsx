import { requireAuth } from '@/lib/auth/requireRole'
import { createClient } from '@/lib/supabase/server'
import ProfileForm from '@/components/profile/ProfileForm'

export default async function ProfilePage() {
  const user = await requireAuth()
  const supabase = await createClient()

  // Fetch additional profile data
  const [divisionsRes, assignmentRes, goalsRes] = await Promise.all([
    supabase
      .from('user_divisions')
      .select('division:divisions(id, slug, name, color_hex)')
      .eq('user_id', user.id),
    supabase
      .from('client_assignments')
      .select('staff:profiles!client_assignments_staff_id_fkey(id, full_name, role, email, avatar_url)')
      .eq('client_id', user.id)
      .eq('is_active', true)
      .limit(1)
      .maybeSingle(),
    supabase
      .from('goals')
      .select('id, title, category, completed_at')
      .eq('player_id', user.id)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(10),
  ])

  type Division = { id: string; slug: string; name: string; color_hex: string }
  const divisions = (divisionsRes.data ?? [])
    .map((d: { division: Division | Division[] | null }) => Array.isArray(d.division) ? d.division[0] : d.division)
    .filter(Boolean) as Division[]

  type CoachProfile = { id: string; full_name: string; role: string; email: string; avatar_url?: string | null }
  const coach = (assignmentRes.data?.staff ?? null) as CoachProfile | null

  type CompletedGoal = { id: string; title: string; category: string; completed_at: string }
  const completedGoals = (goalsRes.data ?? []) as CompletedGoal[]

  return (
    <div>
      <div className="mb-8">
        <p className="text-[#C9A84C] text-[11px] tracking-[0.3em] uppercase mb-2">Account</p>
        <h1
          className="text-4xl font-black tracking-wider text-white uppercase"
          style={{ fontFamily: "'Arial Black', sans-serif" }}
        >
          My <span style={{ color: '#C9A84C' }}>Profile</span>
        </h1>
        <p className="text-[#444] mt-1.5 text-sm">Manage your account information</p>
      </div>

      <ProfileForm
        userId={user.id}
        initialName={user.user_metadata?.full_name ?? ''}
        initialEmail={user.email ?? ''}
        initialPhone={user.user_metadata?.phone ?? ''}
        initialEmergencyName={user.user_metadata?.emergency_contact_name ?? ''}
        initialEmergencyPhone={user.user_metadata?.emergency_contact_phone ?? ''}
        role={user.user_metadata?.role ?? 'client'}
      />

      {/* Divisions */}
      {divisions.length > 0 && (
        <div className="mt-6 bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">My Divisions</span>
          </div>
          <div className="p-4 flex flex-wrap gap-2">
            {divisions.map(d => (
              <span
                key={d.id}
                className="px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wider"
                style={{
                  backgroundColor: `${d.color_hex}20`,
                  color: d.color_hex,
                  border: `1px solid ${d.color_hex}30`,
                }}
              >
                {d.name.replace('GTB ', '')}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Assigned coach / mentor */}
      {coach && (
        <div className="mt-6 bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">My Coach / Mentor</span>
          </div>
          <div className="p-5 flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-sm bg-[#C9A84C]/15 flex items-center justify-center
                         text-[#C9A84C] text-sm font-black flex-shrink-0"
              style={{ fontFamily: "'Arial Black', sans-serif" }}
            >
              {coach.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{coach.full_name}</p>
              <p className="text-xs text-[#444] capitalize mt-0.5">{coach.role}</p>
              <p className="text-xs text-[#333] mt-0.5">{coach.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Achievements & Milestones */}
      {completedGoals.length > 0 && (
        <div className="mt-6 bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">Achievements & Milestones</span>
            <span className="text-[11px] text-[#444]">{completedGoals.length} completed</span>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {completedGoals.map(g => (
              <div key={g.id} className="px-5 py-3.5 flex items-center gap-3">
                <div className="w-6 h-6 rounded-sm bg-[#2E8B35]/15 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-[#2E8B35]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{g.title}</p>
                  <p className="text-[11px] text-[#444] mt-0.5 capitalize">{g.category}</p>
                </div>
                <span className="text-[11px] text-[#333] flex-shrink-0">
                  {new Date(g.completed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
