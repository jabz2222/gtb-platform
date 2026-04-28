import { requireRole } from '@/lib/auth/requireRole'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatDate } from '@/lib/utils/formatters'

export default async function AdminUsersPage() {
  await requireRole(['admin'])
  const supabase = await createClient()

  const { data: users } = await supabase
    .from('profiles')
    .select(`
      id, full_name, email, role, created_at,
      tier:tiers(name)
    `)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(50)

  const ROLE_COLORS: Record<string, string> = {
    admin:    '#C9A84C',
    staff:    '#5BB8E8',
    mentor:   '#9B2454',
    educator: '#CC2222',
    client:   '#2E8B35',
    minor:    '#2E9B8A',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[#C9A84C] text-[11px] tracking-[0.3em] uppercase mb-2">Admin</p>
          <h1 className="text-4xl font-black tracking-wider text-white uppercase"
              style={{ fontFamily: "'Arial Black', sans-serif" }}>
            User <span style={{ color: '#C9A84C' }}>Management</span>
          </h1>
          <p className="text-[#444] mt-1.5 text-sm">{users?.length ?? 0} users registered</p>
        </div>
        <Link
          href="/admin/users/new"
          className="bg-[#C9A84C] hover:bg-[#d4b055] text-black font-black py-2.5 px-5 rounded-sm
                     text-xs tracking-[0.15em] uppercase transition-colors"
          style={{ fontFamily: "'Arial Black', sans-serif" }}
        >
          + Create User
        </Link>
      </div>

      <div className="bg-[#111] border border-[#1E1E1E] rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-[#1E1E1E] grid grid-cols-12 gap-4 text-xs text-[#555] uppercase tracking-wider font-medium">
          <span className="col-span-4">Name / Email</span>
          <span className="col-span-2">Role</span>
          <span className="col-span-2">Tier</span>
          <span className="col-span-2">Joined</span>
          <span className="col-span-2">Actions</span>
        </div>

        <div className="divide-y divide-[#1A1A1A]">
          {users?.map((u: { id: string; full_name: string | null; email: string; role: string; created_at: string; tier: { name: string }[] | { name: string } | null }) => (
            <div key={u.id} className="px-6 py-4 grid grid-cols-12 gap-4 items-center hover:bg-[#151515]">
              <div className="col-span-4">
                <p className="text-sm text-white font-medium">{u.full_name ?? '—'}</p>
                <p className="text-xs text-[#555] mt-0.5">{u.email}</p>
              </div>
              <div className="col-span-2">
                <span className="inline-block px-2 py-0.5 rounded text-xs font-medium capitalize"
                      style={{
                        color: ROLE_COLORS[u.role] ?? '#888',
                        backgroundColor: `${ROLE_COLORS[u.role] ?? '#888'}20`
                      }}>
                  {u.role}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-xs text-[#888]">
                  {(Array.isArray(u.tier) ? u.tier[0]?.name : u.tier?.name) ?? 'No tier'}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-xs text-[#555]">{formatDate(u.created_at)}</span>
              </div>
              <div className="col-span-2">
                <Link href={`/admin/users/${u.id}`}
                      className="text-xs text-[#C9A84C] hover:underline">
                  View →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
