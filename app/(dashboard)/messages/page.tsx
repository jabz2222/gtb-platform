import { requireAuth } from '@/lib/auth/requireRole'
import { createClient } from '@/lib/supabase/server'
import MessagingUI from '@/components/messages/MessagingUI'

export default async function MessagesPage() {
  const user = await requireAuth()
  const supabase = await createClient()

  // Get all staff/mentors/admins the user can message
  const { data: contacts } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .in('role', ['admin', 'staff', 'mentor', 'educator'])
    .neq('id', user.id)
    .order('full_name')

  return (
    <div>
      <div className="mb-8">
        <p className="text-[#C9A84C] text-[11px] tracking-[0.3em] uppercase mb-2">Messaging</p>
        <h1
          className="text-4xl font-black tracking-wider text-white uppercase"
          style={{ fontFamily: "'Arial Black', sans-serif" }}
        >
          My <span style={{ color: '#C9A84C' }}>Messages</span>
        </h1>
        <p className="text-[#444] mt-1.5 text-sm">Communicate with your coaches and mentors</p>
      </div>

      <MessagingUI currentUserId={user.id} contacts={contacts ?? []} />
    </div>
  )
}
