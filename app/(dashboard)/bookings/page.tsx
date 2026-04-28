import { requireAuth } from '@/lib/auth/requireRole'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatDateTime, formatGBP } from '@/lib/utils/formatters'

export default async function BookingsPage() {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      id, booking_type, status, starts_at, ends_at, duration_mins,
      deposit_p, total_cost_p,
      staff:profiles!bookings_staff_id_fkey(full_name),
      division:divisions(name, color_hex)
    `)
    .eq('client_id', user.id)
    .is('deleted_at', null)
    .order('starts_at', { ascending: false })
    .limit(20)

  const upcoming = bookings?.filter(b => new Date(b.starts_at) > new Date() && b.status !== 'cancelled') ?? []
  const past = bookings?.filter(b => new Date(b.starts_at) <= new Date() || b.status === 'cancelled') ?? []

  return (
    <div>
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="text-[#C9A84C] text-[11px] tracking-[0.3em] uppercase mb-2">Schedule</p>
          <h1 className="text-4xl font-black tracking-wider text-white uppercase"
              style={{ fontFamily: "'Arial Black', sans-serif" }}>
            My <span style={{ color: '#C9A84C' }}>Bookings</span>
          </h1>
          <p className="text-[#444] mt-1.5 text-sm">Manage your sessions and classes</p>
        </div>
        <Link href="/bookings/new"
              className="bg-[#C9A84C] hover:bg-[#d4b055] text-black font-black px-5 py-2.5 rounded-sm text-xs
                         tracking-[0.12em] uppercase transition-colors"
              style={{ fontFamily: "'Arial Black', sans-serif" }}>
          Book Session
        </Link>
      </div>

      {/* Browse public classes */}
      <div className="mb-6 p-4 bg-[#111] border border-[#1E1E1E] rounded-lg flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white">Browse Group Classes</p>
          <p className="text-xs text-[#555]">Public sessions open to all members</p>
        </div>
        <Link href="/bookings/classes"
              className="text-sm text-[#C9A84C] hover:underline">
          View classes →
        </Link>
      </div>

      {/* Upcoming */}
      <section className="mb-8">
        <h2 className="text-xs font-semibold text-[#C9A84C] uppercase tracking-wider mb-3">
          Upcoming ({upcoming.length})
        </h2>
        {upcoming.length === 0 ? (
          <div className="bg-[#111] border border-[#1E1E1E] rounded-lg p-8 text-center">
            <p className="text-[#555] text-sm mb-3">No upcoming bookings</p>
            <Link href="/bookings/new" className="text-[#C9A84C] text-sm hover:underline">
              Book your first session →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map(b => (
              <BookingCard key={b.id} booking={b} />
            ))}
          </div>
        )}
      </section>

      {/* Past */}
      {past.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-[#555] uppercase tracking-wider mb-3">
            Past & Cancelled ({past.length})
          </h2>
          <div className="space-y-2 opacity-60">
            {past.slice(0, 5).map(b => (
              <BookingCard key={b.id} booking={b} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

const STATUS_COLORS: Record<string, string> = {
  pending:   '#C9A84C',
  confirmed: '#2E8B35',
  cancelled: '#CC2222',
  completed: '#5BB8E8',
  no_show:   '#9B2454',
}

const BOOKING_TYPE_LABELS: Record<string, string> = {
  contracted:    'Contracted',
  one_on_one:    '1-on-1',
  group_public:  'Group (Public)',
  group_private: 'Group (Private)',
}

function BookingCard({ booking }: { booking: Record<string, unknown> }) {
  const statusColor = STATUS_COLORS[booking.status as string] ?? '#888'
  const divisionColor = (booking.division as { color_hex?: string } | null)?.color_hex ?? '#C9A84C'

  return (
    <Link href={`/bookings/${booking.id}`}
          className="block bg-[#111] border border-[#1E1E1E] hover:border-[#C9A84C]/30 rounded-lg p-4
                     transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: divisionColor }} />
          <div>
            <p className="text-sm font-medium text-white">
              {BOOKING_TYPE_LABELS[booking.booking_type as string] ?? booking.booking_type as string}
              {(booking.staff as { full_name?: string } | null)?.full_name && (
                <span className="text-[#555]"> · {(booking.staff as { full_name: string }).full_name}</span>
              )}
            </p>
            <p className="text-xs text-[#555] mt-0.5">
              {formatDateTime(booking.starts_at as string)}
              {' · '}{booking.duration_mins as number}min
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="inline-block px-2 py-0.5 rounded text-xs font-medium capitalize"
                style={{ color: statusColor, backgroundColor: `${statusColor}20` }}>
            {booking.status as string}
          </span>
          {(booking.total_cost_p as number) > 0 && (
            <p className="text-xs text-[#555] mt-1">{formatGBP(booking.total_cost_p as number)}</p>
          )}
        </div>
      </div>
    </Link>
  )
}
