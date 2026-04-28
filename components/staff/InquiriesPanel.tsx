'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate, formatTime } from '@/lib/utils/formatters'

interface Inquiry {
  id: string
  session_type: string
  requested_slot: string
  status: string
  player_notes: string | null
  created_at: string
  class_id: string | null
  player: { id: string; full_name: string; email: string } | null
  group_class: { title: string; start_time: string; end_time: string } | null
}

export default function InquiriesPanel({ inquiries: initial, coachId }: { inquiries: Inquiry[]; coachId: string }) {
  const [inquiries, setInquiries] = useState(initial)
  const [isPending, startTransition] = useTransition()
  const supabase = createClient()

  async function handleAction(inquiryId: string, action: 'coach_confirmed' | 'coach_declined') {
    startTransition(async () => {
      const inquiry = inquiries.find(i => i.id === inquiryId)
      if (!inquiry) return

      await supabase
        .from('session_inquiries')
        .update({ status: action })
        .eq('id', inquiryId)

      if (action === 'coach_confirmed' && inquiry.player) {
        // Create the actual booking
        await supabase.from('bookings').insert({
          client_id: inquiry.player.id,
          staff_id: coachId,
          booking_type: inquiry.session_type === 'group' ? 'group_public' : 'one_on_one',
          starts_at: inquiry.requested_slot,
          status: 'confirmed',
          deposit_p: 0,
        })

        // Notify player
        await supabase.from('notifications').insert({
          user_id: inquiry.player.id,
          type: 'booking_confirmed',
          title: 'Session Confirmed',
          body: `Your session request for ${formatDate(inquiry.requested_slot)} at ${formatTime(inquiry.requested_slot)} has been confirmed by your coach.`,
          metadata: { inquiry_id: inquiryId },
        })
      } else if (action === 'coach_declined' && inquiry.player) {
        await supabase.from('notifications').insert({
          user_id: inquiry.player.id,
          type: 'booking_declined',
          title: 'Session Request Declined',
          body: `Your session request for ${formatDate(inquiry.requested_slot)} at ${formatTime(inquiry.requested_slot)} was not available. Please request a different slot.`,
          metadata: { inquiry_id: inquiryId },
        })
      }

      setInquiries(prev => prev.filter(i => i.id !== inquiryId))
    })
  }

  if (inquiries.length === 0) {
    return (
      <div className="bg-[#0D0D0D] border border-white/5 rounded-sm p-12 text-center">
        <p className="text-sm text-[#444]">No pending inquiries</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {inquiries.map(inquiry => {
        const sessionLabel =
          inquiry.session_type === 'group' && inquiry.group_class
            ? inquiry.group_class.title
            : inquiry.session_type === '1on1'
            ? '1-on-1 Session'
            : 'Session'

        return (
          <div
            key={inquiry.id}
            className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#C9A84C]" />
            <div className="p-5">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p className="text-sm font-medium text-white mb-0.5">
                    {inquiry.player?.full_name ?? 'Unknown Player'}
                  </p>
                  <p className="text-[11px] text-[#C9A84C] uppercase tracking-wider mb-1">
                    Inquiry — {sessionLabel}
                  </p>
                  <p className="text-xs text-[#444]">
                    {formatDate(inquiry.requested_slot)} · {formatTime(inquiry.requested_slot)}
                  </p>
                </div>
                <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-sm ${
                  inquiry.status === 'parent_approved'
                    ? 'bg-[#2E8B35]/15 text-[#2E8B35]'
                    : 'bg-[#C9A84C]/15 text-[#C9A84C]'
                }`}>
                  {inquiry.status === 'parent_approved' ? 'Parent Approved' : 'Pending'}
                </span>
              </div>

              {inquiry.player_notes && (
                <p className="text-xs text-[#555] mb-4 italic">
                  &ldquo;{inquiry.player_notes}&rdquo;
                </p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => handleAction(inquiry.id, 'coach_confirmed')}
                  disabled={isPending}
                  className="flex-1 bg-[#2E8B35] hover:bg-[#359b3d] disabled:opacity-40 text-white
                             font-black py-2 px-3 rounded-sm text-xs tracking-[0.12em] uppercase transition-colors"
                  style={{ fontFamily: "'Arial Black', sans-serif" }}
                >
                  Confirm
                </button>
                <button
                  onClick={() => handleAction(inquiry.id, 'coach_declined')}
                  disabled={isPending}
                  className="flex-1 bg-[#0D0D0D] hover:bg-white/5 disabled:opacity-40 text-[#CC2222]
                             border border-[#CC2222]/30 hover:border-[#CC2222]/60 font-black py-2 px-3
                             rounded-sm text-xs tracking-[0.12em] uppercase transition-colors"
                  style={{ fontFamily: "'Arial Black', sans-serif" }}
                >
                  Decline
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
