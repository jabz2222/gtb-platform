import { requireRole } from '@/lib/auth/requireRole'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatDate, formatGBP, getInitials } from '@/lib/utils/formatters'
import StatusBadge from '@/components/ui/StatusBadge'
import AdminUserActions from '@/components/admin/AdminUserActions'

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await requireRole(['admin'])
  const supabase = await createClient()

  const [profileRes, bookingsRes, creditsRes, goalsRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', id).single(),
    supabase.from('bookings').select('*').eq('client_id', id).order('starts_at', { ascending: false }).limit(10),
    supabase.from('credit_transactions').select('*').eq('user_id', id).order('created_at', { ascending: false }).limit(10),
    supabase.from('goals').select('*').eq('player_id', id).eq('is_active', true).limit(5),
  ])

  if (!profileRes.data) notFound()

  const profile = profileRes.data
  const bookings = bookingsRes.data ?? []
  const credits = creditsRes.data ?? []
  const goals = goalsRes.data ?? []

  const creditBalance = credits.reduce((sum: number, t: { amount_p: number }) => sum + t.amount_p, 0)
  const initials = getInitials(profile.full_name ?? 'Unknown')

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/users"
          className="text-xs text-[#444] hover:text-white uppercase tracking-wider mb-4 inline-block transition-colors"
        >
          ← Back to Users
        </Link>
        <div className="flex items-start gap-4">
          <div
            className="w-14 h-14 rounded-sm flex items-center justify-center text-lg font-black flex-shrink-0"
            style={{ backgroundColor: '#C9A84C20', color: '#C9A84C', fontFamily: "'Arial Black', sans-serif" }}
          >
            {initials}
          </div>
          <div>
            <p className="text-[#C9A84C] text-[11px] tracking-[0.3em] uppercase mb-1">User Detail</p>
            <h1
              className="text-4xl font-black tracking-wider text-white uppercase"
              style={{ fontFamily: "'Arial Black', sans-serif" }}
            >
              {profile.full_name ?? 'Unknown User'}
            </h1>
            <p className="text-[#444] text-sm mt-1">{profile.email}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: profile info + actions */}
        <div className="space-y-4">
          {/* Account info */}
          <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5">
              <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">Account</span>
            </div>
            <div className="p-5 space-y-3">
              {[
                { label: 'User ID', value: id.slice(0, 8) + '…' },
                { label: 'Joined', value: formatDate(profile.created_at) },
                { label: 'Role', value: profile.role },
                { label: 'Tier', value: profile.tier_id ?? 'Free' },
                { label: 'Credit Balance', value: formatGBP(creditBalance) },
              ].map(row => (
                <div key={row.label}>
                  <p className="text-[10px] text-[#444] uppercase tracking-wider mb-0.5">{row.label}</p>
                  <p className="text-sm text-white capitalize">{String(row.value)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Admin actions */}
          <AdminUserActions
            userId={id}
            currentRole={profile.role ?? 'client'}
            currentTier={profile.tier_id ?? ''}
            currentAgePhase={(profile as { age_phase?: string | null }).age_phase ?? null}
          />

          {/* Role-specific admin links */}
          {(profile.role === 'parent' || profile.role === 'admin' || profile.role === 'staff' || profile.role === 'mentor') && (
            <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-white/5">
                <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">Linking</span>
              </div>
              <div className="p-5 space-y-2">
                {profile.role === 'parent' && (
                  <Link
                    href={`/admin/users/${id}/children`}
                    className="block w-full text-center bg-white/[0.04] hover:bg-white/[0.08] border border-white/10
                               text-white/80 hover:text-white py-2.5 px-4 rounded-sm text-xs uppercase
                               tracking-wider transition-colors"
                  >
                    Manage Linked Children →
                  </Link>
                )}
                {(profile.role === 'staff' || profile.role === 'mentor' || profile.role === 'admin') && (
                  <Link
                    href={`/admin/users/${id}/assignments`}
                    className="block w-full text-center bg-white/[0.04] hover:bg-white/[0.08] border border-white/10
                               text-white/80 hover:text-white py-2.5 px-4 rounded-sm text-xs uppercase
                               tracking-wider transition-colors"
                  >
                    Manage Participant Assignments →
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Goals */}
          {goals.length > 0 && (
            <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-white/5">
                <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">Active Goals</span>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {goals.map((g: { id: string; title: string; category: string }) => (
                  <div key={g.id} className="px-5 py-3">
                    <p className="text-xs text-white">{g.title}</p>
                    <p className="text-[11px] text-[#444] capitalize mt-0.5">{g.category}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: bookings + credits */}
        <div className="lg:col-span-2 space-y-4">
          {/* Booking history */}
          <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5">
              <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">Booking History</span>
            </div>
            {bookings.length === 0 ? (
              <div className="p-8 text-center"><p className="text-[#444] text-sm">No bookings</p></div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {bookings.map((b: { id: string; starts_at: string; booking_type: string; status: string; deposit_p: number }) => (
                  <div key={b.id} className="px-5 py-3.5 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white capitalize">{b.booking_type.replace(/_/g, ' ')}</p>
                      <p className="text-[11px] text-[#444] mt-0.5">{formatDate(b.starts_at)}</p>
                    </div>
                    <p className="text-xs text-[#555]">{formatGBP(b.deposit_p ?? 0)}</p>
                    <StatusBadge variant={b.status} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Credit ledger */}
          <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
              <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">Credit Ledger</span>
              <span className="text-sm font-black text-white" style={{ fontFamily: "'Arial Black', sans-serif" }}>
                {formatGBP(creditBalance)} balance
              </span>
            </div>
            {credits.length === 0 ? (
              <div className="p-8 text-center"><p className="text-[#444] text-sm">No credit transactions</p></div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {credits.map((t: { id: string; created_at: string; amount_p: number; description: string | null; tx_type: string }) => (
                  <div key={t.id} className="px-5 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-white capitalize">{(t.description ?? t.tx_type).replace(/_/g, ' ')}</p>
                      <p className="text-[11px] text-[#444] mt-0.5">{formatDate(t.created_at)}</p>
                    </div>
                    <span
                      className={`text-sm font-medium ${t.amount_p >= 0 ? 'text-[#2E8B35]' : 'text-[#CC2222]'}`}
                    >
                      {t.amount_p >= 0 ? '+' : ''}{formatGBP(t.amount_p)}
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
