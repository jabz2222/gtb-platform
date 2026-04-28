import { requireRole } from '@/lib/auth/requireRole'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatRelative } from '@/lib/utils/formatters'

export default async function MenteesPage() {
  const { user } = await requireRole(['admin', 'mentor'])
  const supabase = await createClient()

  const { data: assignments } = await supabase
    .from('client_assignments')
    .select('*, profiles!client_id(id, full_name, email, created_at)')
    .eq('staff_id', user.id)
    .order('created_at', { ascending: false })

  const mentees = (assignments ?? []).map((a: {
    profiles: { id: string; full_name: string; email: string; created_at: string } | null
  }) => a.profiles).filter(Boolean)

  return (
    <div>
      <div className="mb-8">
        <p className="text-[#9B2454] text-[11px] tracking-[0.3em] uppercase mb-2">Mentor</p>
        <h1
          className="text-4xl font-black tracking-wider text-white uppercase"
          style={{ fontFamily: "'Arial Black', sans-serif" }}
        >
          My <span style={{ color: '#9B2454' }}>Mentees</span>
        </h1>
        <p className="text-[#444] mt-1.5 text-sm">{mentees.length} mentee{mentees.length !== 1 ? 's' : ''} assigned</p>
      </div>

      {mentees.length === 0 ? (
        <div className="bg-[#0D0D0D] border border-white/5 rounded-sm p-12 text-center">
          <p className="text-[#444] text-sm">No mentees assigned yet</p>
        </div>
      ) : (
        <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">Assigned Mentees</span>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {mentees.map(m => {
              if (!m) return null
              return (
                <div key={m.id} className="px-5 py-4 flex items-center gap-4">
                  <div
                    className="w-9 h-9 rounded-sm flex items-center justify-center text-xs font-black flex-shrink-0"
                    style={{ backgroundColor: '#9B245420', color: '#9B2454', fontFamily: "'Arial Black', sans-serif" }}
                  >
                    {m.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{m.full_name}</p>
                    <p className="text-[11px] text-[#444]">{m.email}</p>
                    <p className="text-[10px] text-[#333] mt-0.5">
                      Assigned {formatRelative(m.created_at)}
                    </p>
                  </div>
                  <Link
                    href={`/mentor/mentees/${m.id}`}
                    className="text-[11px] text-[#C9A84C] hover:underline uppercase tracking-wider flex-shrink-0"
                  >
                    Open →
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
