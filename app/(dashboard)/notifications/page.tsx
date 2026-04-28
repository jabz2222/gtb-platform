import { requireAuth } from '@/lib/auth/requireRole'
import { createClient } from '@/lib/supabase/server'
import { formatRelative } from '@/lib/utils/formatters'
import InquiryApprovalList from '@/components/parent/InquiryApprovalList'

// Notification types derived from DB events
interface Notification {
  id: string
  type: 'booking_confirmed' | 'booking_cancelled' | 'credit_added' | 'session_reminder' | 'system'
  title: string
  body: string
  read: boolean
  created_at: string
}

const TYPE_CONFIG = {
  booking_confirmed: { color: '#2E8B35', icon: 'check' },
  booking_cancelled: { color: '#CC2222', icon: 'x' },
  credit_added:      { color: '#C9A84C', icon: 'coin' },
  session_reminder:  { color: '#5BB8E8', icon: 'clock' },
  system:            { color: '#555',    icon: 'info' },
}

function Icon({ type }: { type: string }) {
  switch (type) {
    case 'check':
      return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
    case 'x':
      return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
    case 'coin':
      return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    case 'clock':
      return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    default:
      return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>
  }
}

export default async function NotificationsPage() {
  const user = await requireAuth()
  const supabase = await createClient()

  // Fetch pending session inquiries for parents
  const { data: children } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('parent_guardian_id', user.id)

  const childIds = (children ?? []).map(c => c.id)

  const { data: pendingInquiries } = childIds.length > 0
    ? await supabase
        .from('session_inquiries')
        .select(`
          id, session_type, requested_slot, player_notes, created_at,
          player:profiles!session_inquiries_player_id_fkey(id, full_name),
          group_class:group_classes!session_inquiries_class_id_fkey(title)
        `)
        .in('player_id', childIds)
        .eq('status', 'pending_parent')
        .order('created_at', { ascending: false })
    : { data: [] }

  // Build notifications from recent bookings + credit transactions
  const [bookingsRes, creditsRes] = await Promise.all([
    supabase
      .from('bookings')
      .select('id, status, booking_type, starts_at, created_at')
      .eq('client_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('credit_transactions')
      .select('id, amount_p, description, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  const notifications: Notification[] = []

  for (const b of (bookingsRes.data ?? [])) {
    const type = b.status === 'confirmed' ? 'booking_confirmed'
      : b.status === 'cancelled' ? 'booking_cancelled'
      : 'system'
    notifications.push({
      id: `b-${b.id}`,
      type: type as Notification['type'],
      title: b.status === 'confirmed' ? 'Booking Confirmed'
        : b.status === 'cancelled' ? 'Booking Cancelled'
        : 'Booking Update',
      body: `Your ${b.booking_type.replace(/_/g, ' ')} on ${new Date(b.starts_at).toLocaleDateString('en-GB')} has been ${b.status}.`,
      read: false,
      created_at: b.created_at,
    })
  }

  for (const t of (creditsRes.data ?? [])) {
    const sign = t.amount_p >= 0 ? '+' : ''
    notifications.push({
      id: `c-${t.id}`,
      type: 'credit_added',
      title: 'Credit Transaction',
      body: `${sign}£${Math.abs(t.amount_p / 100).toFixed(2)} — ${(t.description ?? 'credit').replace(/_/g, ' ')}.`,
      read: false,
      created_at: t.created_at,
    })
  }

  // Sort by date
  notifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return (
    <div>
      <div className="mb-8">
        <p className="text-[#C9A84C] text-[11px] tracking-[0.3em] uppercase mb-2">Activity</p>
        <h1
          className="text-4xl font-black tracking-wider text-white uppercase"
          style={{ fontFamily: "'Arial Black', sans-serif" }}
        >
          <span style={{ color: '#C9A84C' }}>Notifications</span>
        </h1>
        <p className="text-[#444] mt-1.5 text-sm">Your recent platform activity</p>
      </div>

      {(pendingInquiries ?? []).length > 0 && (
        <div className="mb-8">
          <p className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C] mb-3">
            Action Required
          </p>
          <InquiryApprovalList inquiries={pendingInquiries ?? []} />
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="bg-[#0D0D0D] border border-white/5 rounded-sm p-12 text-center">
          <p className="text-[#444] text-sm">No notifications yet</p>
          <p className="text-[#333] text-xs mt-1">Activity from bookings, credits, and sessions will appear here</p>
        </div>
      ) : (
        <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">
              {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {notifications.map(n => {
              const config = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.system
              return (
                <div key={n.id} className="px-5 py-4 flex items-start gap-4">
                  <div
                    className="w-8 h-8 rounded-sm flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: `${config.color}20`, color: config.color }}
                  >
                    <Icon type={config.icon} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{n.title}</p>
                    <p className="text-[11px] text-[#555] mt-0.5 leading-relaxed">{n.body}</p>
                    <p className="text-[10px] text-[#333] mt-1">{formatRelative(n.created_at)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
