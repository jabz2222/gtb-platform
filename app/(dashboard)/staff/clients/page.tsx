import { requireRole } from '@/lib/auth/requireRole'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatRelative } from '@/lib/utils/formatters'
import { getInitials } from '@/lib/utils/formatters'

export default async function StaffClientsPage() {
  const { user } = await requireRole(['admin', 'staff'])
  const supabase = await createClient()

  const { data: assignments } = await supabase
    .from('client_assignments')
    .select('*, profiles!client_id(id, full_name, email, created_at, role)')
    .eq('staff_id', user.id)
    .order('created_at', { ascending: false })

  const clients = (assignments ?? []).map((a: {
    id: string
    profiles: { id: string; full_name: string; email: string; created_at: string; role: string } | null
  }) => a.profiles).filter(Boolean)

  return (
    <div>
      <div className="mb-8">
        <p className="text-[#C9A84C] text-[11px] tracking-[0.3em] uppercase mb-2">Staff</p>
        <h1
          className="text-4xl font-black tracking-wider text-white uppercase"
          style={{ fontFamily: "'Arial Black', sans-serif" }}
        >
          My <span style={{ color: '#C9A84C' }}>Clients</span>
        </h1>
        <p className="text-[#444] mt-1.5 text-sm">{clients.length} assigned client{clients.length !== 1 ? 's' : ''}</p>
      </div>

      {clients.length === 0 ? (
        <div className="bg-[#0D0D0D] border border-white/5 rounded-sm p-12 text-center">
          <p className="text-[#444] text-sm">No clients assigned yet</p>
          <p className="text-[#333] text-xs mt-1">Contact admin to have clients assigned to you</p>
        </div>
      ) : (
        <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">Assigned Clients</span>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {clients.map(client => {
              if (!client) return null
              const initials = getInitials(client.full_name)
              return (
                <div key={client.id} className="px-5 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                  <div className="w-9 h-9 rounded-sm bg-[#C9A84C]/10 flex items-center justify-center
                                  text-[#C9A84C] text-xs font-black flex-shrink-0"
                       style={{ fontFamily: "'Arial Black', sans-serif" }}>
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{client.full_name}</p>
                    <p className="text-[11px] text-[#444]">{client.email}</p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-[11px] text-[#333] capitalize">{client.role}</p>
                    <p className="text-[10px] text-[#333] mt-0.5">
                      Joined {formatRelative(client.created_at)}
                    </p>
                  </div>
                  <Link
                    href={`/mentor/mentees/${client.id}`}
                    className="flex-shrink-0 text-[#444] hover:text-[#C9A84C] transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
