import { requireRole } from '@/lib/auth/requireRole'
import { createClient } from '@/lib/supabase/server'
import TierManager from '@/components/admin/TierManager'

export default async function TiersPage() {
  await requireRole(['admin'])
  const supabase = await createClient()

  const [tiersRes, usersRes] = await Promise.all([
    supabase.from('tiers').select('*').order('id'),
    supabase.from('profiles').select('id, full_name, email, tier_id').order('full_name'),
  ])

  return (
    <div>
      <div className="mb-8">
        <p className="text-[#C9A84C] text-[11px] tracking-[0.3em] uppercase mb-2">Admin</p>
        <h1
          className="text-4xl font-black tracking-wider text-white uppercase"
          style={{ fontFamily: "'Arial Black', sans-serif" }}
        >
          Tier <span style={{ color: '#C9A84C' }}>Management</span>
        </h1>
        <p className="text-[#444] mt-1.5 text-sm">Manage tiers and assign users</p>
      </div>

      <TierManager tiers={tiersRes.data ?? []} users={usersRes.data ?? []} />
    </div>
  )
}
