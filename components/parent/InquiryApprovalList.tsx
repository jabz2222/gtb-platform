'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate, formatTime } from '@/lib/utils/formatters'

interface Inquiry {
  id: string
  session_type: string
  requested_slot: string
  player_notes: string | null
  created_at: string
  player: { id: string; full_name: string } | null
  group_class: { title: string } | null
}

export default function InquiryApprovalList({ inquiries: initial }: { inquiries: Inquiry[] }) {
  const [inquiries, setInquiries] = useState(initial)
  const [isPending, startTransition] = useTransition()
  const supabase = createClient()

  async function handleAction(inquiryId: string, action: 'parent_approved' | 'parent_rejected') {
    startTransition(async () => {
      const updates: Record<string, string> = { status: action }
      if (action === 'parent_approved') {
        updates.parent_approved_at = new Date().toISOString()
      }

      await supabase.from('session_inquiries').update(updates).eq('id', inquiryId)

      const inquiry = inquiries.find(i => i.id === inquiryId)
      if (inquiry?.player) {
        await supabase.from('notifications').insert({
          user_id: inquiry.player.id,
          type: action === 'parent_approved' ? 'booking_confirmed' : 'booking_cancelled',
          title: action === 'parent_approved' ? 'Session Request Approved' : 'Session Request Declined',
          body: action === 'parent_approved'
            ? `Your parent has approved your session request for ${formatDate(inquiry.requested_slot)}. Awaiting coach confirmation.`
            : `Your parent has declined your session request for ${formatDate(inquiry.requested_slot)}.`,
          metadata: { inquiry_id: inquiryId },
        })
      }

      setInquiries(prev => prev.filter(i => i.id !== inquiryId))
    })
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
            className="bg-[#0D0D0D] border border-[#C9A84C]/20 rounded-sm p-5 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#C9A84C]" />
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-sm font-medium text-white mb-0.5">
                  {inquiry.player?.full_name ?? 'Your child'} requested a session
                </p>
                <p className="text-[11px] text-[#C9A84C] uppercase tracking-wider mb-1">
                  {sessionLabel}
                </p>
                <p className="text-xs text-[#444]">
                  {formatDate(inquiry.requested_slot)} · {formatTime(inquiry.requested_slot)}
                </p>
              </div>
              <span className="text-[10px] text-[#C9A84C] bg-[#C9A84C]/10 px-2 py-1 rounded-sm uppercase tracking-wider flex-shrink-0">
                Approval Needed
              </span>
            </div>

            {inquiry.player_notes && (
              <p className="text-xs text-[#555] mb-4 italic">
                &ldquo;{inquiry.player_notes}&rdquo;
              </p>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => handleAction(inquiry.id, 'parent_approved')}
                disabled={isPending}
                className="flex-1 bg-[#2E8B35] hover:bg-[#359b3d] disabled:opacity-40 text-white
                           font-black py-2 px-3 rounded-sm text-xs tracking-[0.12em] uppercase transition-colors"
                style={{ fontFamily: "'Arial Black', sans-serif" }}
              >
                Approve
              </button>
              <button
                onClick={() => handleAction(inquiry.id, 'parent_rejected')}
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
        )
      })}
    </div>
  )
}
