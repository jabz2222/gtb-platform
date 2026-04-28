import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { formatDate, formatTime } from '@/lib/utils/formatters'
import StatusBadge from '@/components/ui/StatusBadge'

export const metadata: Metadata = { title: 'Child Calendar · Parent Portal' }

const DIVISION_COLORS: Record<string, string> = {
  football:  '#5BB8E8',
  fitness:   '#2E8B35',
  sports:    '#E8641A',
  mentoring: '#9B2454',
  education: '#CC2222',
}

export default async function ChildCalendarPage({ params }: { params: Promise<{ childId: string }> }) {
  const { childId } = await params
  const supabase = await createClient()

  const now = new Date().toISOString()

  const [upcomingRes, pastRes] = await Promise.all([
    supabase
      .from('bookings')
      .select(`
        id, booking_type, status, starts_at, ends_at, duration_mins,
        notes, division:divisions(name, slug, color_hex),
        staff:profiles!bookings_staff_id_fkey(full_name, role)
      `)
      .eq('client_id', childId)
      .gte('starts_at', now)
      .is('deleted_at', null)
      .order('starts_at', { ascending: true })
      .limit(20),
    supabase
      .from('bookings')
      .select(`
        id, booking_type, status, starts_at, ends_at, duration_mins,
        division:divisions(name, slug, color_hex),
        staff:profiles!bookings_staff_id_fkey(full_name, role)
      `)
      .eq('client_id', childId)
      .lt('starts_at', now)
      .is('deleted_at', null)
      .order('starts_at', { ascending: false })
      .limit(10),
  ])

  const upcoming = upcomingRes.data ?? []
  const past = pastRes.data ?? []

  return (
    <div className="space-y-6">
      <div className="bg-[#0D0D0D] border border-[#C9A84C]/20 rounded-sm p-3">
        <p className="text-[11px] text-[#555]">
          Upcoming and recent sessions for your child. To book a new session, use the Booking page from the parent portal.
        </p>
      </div>

      {/* Upcoming */}
      <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5">
          <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">
            Upcoming Sessions · {upcoming.length}
          </span>
        </div>
        {upcoming.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-[#444] text-sm">No upcoming sessions</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {upcoming.map(b => {
              const div = Array.isArray(b.division) ? b.division[0] : b.division
              const staff = Array.isArray(b.staff) ? b.staff[0] : b.staff
              const slug = (div?.slug as string | undefined) ?? 'football'
              const color = (div?.color_hex as string | undefined) ?? DIVISION_COLORS[slug] ?? '#C9A84C'
              return (
                <div key={b.id} className="px-5 py-4 flex items-start gap-4">
                  <div className="w-1 h-12 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm text-white capitalize font-medium">
                        {b.booking_type.replace(/_/g, ' ')}
                      </p>
                      <StatusBadge variant={b.status} />
                    </div>
                    <p className="text-[11px] text-[#666]">
                      {formatDate(b.starts_at)} · {formatTime(b.starts_at)} · {b.duration_mins} min
                    </p>
                    {staff?.full_name && (
                      <p className="text-[11px] text-[#555] mt-0.5">
                        Coach: {staff.full_name}
                      </p>
                    )}
                    {b.notes && (
                      <p className="text-[11px] text-[#888] mt-1.5 italic">{b.notes}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Past */}
      <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5">
          <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">
            Recent Sessions · {past.length}
          </span>
        </div>
        {past.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-[#444] text-sm">No past sessions</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {past.map(b => {
              const div = Array.isArray(b.division) ? b.division[0] : b.division
              const staff = Array.isArray(b.staff) ? b.staff[0] : b.staff
              const color = (div?.color_hex as string | undefined) ?? '#C9A84C'
              return (
                <div key={b.id} className="px-5 py-3 flex items-center gap-4">
                  <div
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0 opacity-50"
                    style={{ backgroundColor: color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white capitalize">
                      {b.booking_type.replace(/_/g, ' ')}
                      {staff?.full_name && (
                        <span className="text-[#666]"> · {staff.full_name}</span>
                      )}
                    </p>
                    <p className="text-[11px] text-[#444] mt-0.5">
                      {formatDate(b.starts_at)} · {formatTime(b.starts_at)}
                    </p>
                  </div>
                  <StatusBadge variant={b.status} />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
