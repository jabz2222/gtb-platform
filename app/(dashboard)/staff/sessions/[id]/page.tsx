import { requireRole } from '@/lib/auth/requireRole'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatDate, formatTime, formatDuration } from '@/lib/utils/formatters'
import StatusBadge from '@/components/ui/StatusBadge'
import SessionActions from '@/components/staff/SessionActions'

export default async function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { user } = await requireRole(['admin', 'staff'])
  const supabase = await createClient()

  const { data: session } = await supabase
    .from('bookings')
    .select('*, profiles!client_id(id, full_name, email, created_at)')
    .eq('id', id)
    .single()

  if (!session) notFound()

  const startTime = new Date(session.starts_at)
  const endTime = new Date(session.ends_at)
  const durationMins = Math.round((endTime.getTime() - startTime.getTime()) / 60000)
  const isPast = endTime < new Date()

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/staff/sessions"
          className="text-xs text-[#444] hover:text-white uppercase tracking-wider mb-4 inline-block transition-colors"
        >
          ← Back to Sessions
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[#C9A84C] text-[11px] tracking-[0.3em] uppercase mb-2">Session Detail</p>
            <h1
              className="text-4xl font-black tracking-wider text-white uppercase"
              style={{ fontFamily: "'Arial Black', sans-serif" }}
            >
              {(session.profiles as { full_name: string } | null)?.full_name ?? 'Client'} <span style={{ color: '#C9A84C' }}>Session</span>
            </h1>
          </div>
          <StatusBadge variant={session.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Session info */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5">
              <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">Session Details</span>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4">
              {[
                { label: 'Date', value: formatDate(session.starts_at) },
                { label: 'Time', value: `${formatTime(session.starts_at)} – ${formatTime(session.ends_at)}` },
                { label: 'Duration', value: formatDuration(durationMins) },
                { label: 'Type', value: session.booking_type.replace(/_/g, ' ') },
                { label: 'Status', value: session.status },
                { label: 'Deposit', value: session.deposit_p ? `£${session.deposit_p / 100}` : '—' },
              ].map(row => (
                <div key={row.label}>
                  <p className="text-[10px] text-[#444] uppercase tracking-wider mb-0.5">{row.label}</p>
                  <p className="text-sm text-white capitalize">{row.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Attendance + notes — only for past sessions */}
          {isPast && (
            <SessionActions sessionId={session.id} currentStatus={session.status} />
          )}
        </div>

        {/* Client info */}
        <div className="space-y-4">
          <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5">
              <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">Client</span>
            </div>
            <div className="p-5">
              {session.profiles ? (
                <div>
                  <div className="w-12 h-12 rounded-sm bg-[#C9A84C]/10 flex items-center justify-center
                                  text-[#C9A84C] text-sm font-black mb-3"
                       style={{ fontFamily: "'Arial Black', sans-serif" }}>
                    {(session.profiles as { full_name: string }).full_name
                      .split(' ')
                      .map((n: string) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <p className="text-sm font-medium text-white">{(session.profiles as { full_name: string }).full_name}</p>
                  <p className="text-[11px] text-[#444] mt-0.5">{(session.profiles as { email: string }).email}</p>
                  <Link
                    href={`/admin/users/${(session.profiles as { id: string }).id}`}
                    className="text-[11px] text-[#C9A84C] hover:underline mt-3 inline-block uppercase tracking-wider"
                  >
                    View PDP →
                  </Link>
                </div>
              ) : (
                <p className="text-sm text-[#444]">Client details unavailable</p>
              )}
            </div>
          </div>

          {/* Cancel action */}
          {!isPast && session.status !== 'cancelled' && (
            <div className="bg-[#0D0D0D] border border-white/5 rounded-sm p-5">
              <p className="text-[11px] text-[#444] uppercase tracking-wider mb-3">Actions</p>
              <SessionActions sessionId={session.id} currentStatus={session.status} cancelOnly />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
