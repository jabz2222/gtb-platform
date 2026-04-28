'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import BookForSelector from '@/components/booking/BookForSelector'
import OnboardingFormModal from '@/components/dashboard/OnboardingFormModal'
import { ONBOARDING_FORM_URL } from '@/lib/utils/constants'

interface StaffMember {
  id: string
  full_name: string
  role: string
  division_id?: string
}

interface Slot {
  date: string
  time: string
  label: string
}

// Generate mock availability slots for the next 7 days
function generateSlots(): Slot[] {
  const slots: Slot[] = []
  const times = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00']
  for (let d = 1; d <= 7; d++) {
    const date = new Date()
    date.setDate(date.getDate() + d)
    if (date.getDay() === 0 || date.getDay() === 6) continue // skip weekends
    const dateStr = date.toISOString().split('T')[0]
    for (const time of times.slice(0, 4 + Math.floor(Math.random() * 3))) {
      slots.push({
        date: dateStr,
        time,
        label: date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }),
      })
    }
  }
  return slots
}

const STEPS = ['Select Coach', 'Choose Slot', 'Confirm']

export default function OneOnOneWizard({
  staff,
  clientId,
  isParent = false,
  onboardingFormSent = false,
  clientName,
}: {
  staff: StaffMember[]
  clientId: string
  isParent?: boolean
  onboardingFormSent?: boolean
  clientName?: string
}) {
  const [step, setStep] = useState(0)
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [loading, setLoading] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)

  // Booking target — starts as the logged-in user, can be switched to a child
  const [bookingClientId, setBookingClientId] = useState(clientId)
  const [bookingChildName, setBookingChildName] = useState<string | undefined>(undefined)

  const supabase = createClient()
  const slots = generateSlots()

  // Group slots by date
  const slotsByDate: Record<string, Slot[]> = {}
  for (const s of slots) {
    if (!slotsByDate[s.date]) slotsByDate[s.date] = []
    slotsByDate[s.date].push(s)
  }

  async function handleConfirm() {
    if (!selectedStaff || !selectedSlot) return
    setLoading(true)

    const start = new Date(`${selectedSlot.date}T${selectedSlot.time}:00`)
    const end = new Date(start.getTime() + 60 * 60 * 1000) // 1 hour

    // Check if player has a parent guardian (minors require parent approval)
    const { data: playerProfile } = await supabase
      .from('profiles')
      .select('parent_guardian_id')
      .eq('id', bookingClientId)
      .maybeSingle()

    const hasParent = !!playerProfile?.parent_guardian_id
    const inquiryStatus = hasParent ? 'pending_parent' : 'pending_coach'

    const { data: inquiry } = await supabase.from('session_inquiries').insert({
      player_id: bookingClientId,
      coach_id: selectedStaff.id,
      session_type: '1on1',
      requested_slot: start.toISOString(),
      status: inquiryStatus,
    }).select('id').single()

    // Notify parent if they exist
    if (hasParent && playerProfile?.parent_guardian_id) {
      await supabase.from('notifications').insert({
        user_id: playerProfile.parent_guardian_id,
        type: 'session_inquiry',
        title: 'Session Request — Approval Required',
        body: `${bookingChildName ?? 'Your child'} has requested a 1-on-1 session with ${selectedStaff.full_name} on ${selectedSlot.label} at ${selectedSlot.time}. Please review and approve.`,
        is_read: false,
      })
      if (inquiry?.id) {
        await supabase.from('session_inquiries').update({ parent_notified_at: new Date().toISOString() }).eq('id', inquiry.id)
      }
    }

    setConfirmed(true)
    setLoading(false)
  }

  const displayName = bookingChildName ?? clientName

  if (confirmed) {
    return (
      <>
        {showOnboarding && ONBOARDING_FORM_URL && (
          <OnboardingFormModal formUrl={ONBOARDING_FORM_URL} clientName={displayName} />
        )}
        <div className="bg-[#0D0D0D] border border-white/5 rounded-sm p-12 text-center max-w-md mx-auto">
          <div className="w-12 h-12 rounded-sm bg-[#2E8B35]/15 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-[#2E8B35]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-xl font-black text-white uppercase mb-2" style={{ fontFamily: "'Arial Black', sans-serif" }}>
            Request Sent
          </p>
          <p className="text-sm text-[#444] mb-2">
            {bookingChildName
              ? `Session request for ${bookingChildName} with ${selectedStaff?.full_name} on ${selectedSlot?.label} at ${selectedSlot?.time}.`
              : `Session request with ${selectedStaff?.full_name} on ${selectedSlot?.label} at ${selectedSlot?.time}.`
            }
          </p>
          <p className="text-xs text-[#C9A84C] mb-6">Awaiting parent approval before the booking is confirmed.</p>
          <Link
            href="/bookings"
            className="inline-block bg-[#C9A84C] hover:bg-[#d4b055] text-black font-black px-6 py-2.5
                       text-xs tracking-[0.12em] uppercase rounded-sm transition-colors"
            style={{ fontFamily: "'Arial Black', sans-serif" }}
          >
            View Bookings
          </Link>
        </div>
      </>
    )
  }

  return (
    <div>
      {/* Book for selector — only shown to parents with linked children */}
      {isParent && (
        <BookForSelector
          parentId={clientId}
          onChange={(id, name) => {
            setBookingClientId(id)
            setBookingChildName(id === clientId ? undefined : name)
          }}
        />
      )}

      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-sm text-xs uppercase tracking-wider transition-colors ${
              i === step
                ? 'bg-[#C9A84C] text-black font-black'
                : i < step
                  ? 'text-[#C9A84C] bg-[#C9A84C]/10'
                  : 'text-[#333] bg-[#0D0D0D] border border-white/5'
            }`}
            style={i === step ? { fontFamily: "'Arial Black', sans-serif" } : undefined}
            >
              <span>{i + 1}</span>
              <span>{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-6 h-px ${i < step ? 'bg-[#C9A84C]/40' : 'bg-white/10'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 0: Select coach */}
      {step === 0 && (
        <div>
          <p className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C] mb-5">Available Coaches</p>
          {staff.length === 0 ? (
            <div className="bg-[#0D0D0D] border border-white/5 rounded-sm p-8 text-center">
              <p className="text-[#444] text-sm">No coaches available at this time</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {staff.map(s => (
                <button
                  key={s.id}
                  onClick={() => { setSelectedStaff(s); setStep(1) }}
                  className={`bg-[#0D0D0D] border rounded-sm p-5 text-left hover:border-[#C9A84C]/40 transition-colors ${
                    selectedStaff?.id === s.id ? 'border-[#C9A84C]/40' : 'border-white/5'
                  }`}
                >
                  <div className="w-10 h-10 rounded-sm bg-[#C9A84C]/10 flex items-center justify-center
                                  text-[#C9A84C] text-sm font-black mb-3"
                       style={{ fontFamily: "'Arial Black', sans-serif" }}>
                    {s.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <p className="text-sm font-medium text-white">{s.full_name}</p>
                  <p className="text-[11px] text-[#444] capitalize mt-0.5">{s.role}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 1: Select slot */}
      {step === 1 && (
        <div>
          <div className="flex items-center justify-between mb-5">
            <p className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">
              Available Slots — {selectedStaff?.full_name}
            </p>
            <button
              onClick={() => setStep(0)}
              className="text-xs text-[#444] hover:text-white uppercase tracking-wider transition-colors"
            >
              ← Back
            </button>
          </div>
          <div className="space-y-4">
            {Object.entries(slotsByDate).map(([date, daySlots]) => (
              <div key={date} className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-white/5">
                  <span className="text-xs text-white">
                    {new Date(date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </span>
                </div>
                <div className="p-4 flex flex-wrap gap-2">
                  {daySlots.map(slot => (
                    <button
                      key={slot.time}
                      onClick={() => { setSelectedSlot(slot); setStep(2) }}
                      className={`px-3 py-2 text-xs rounded-sm border transition-colors ${
                        selectedSlot?.date === date && selectedSlot?.time === slot.time
                          ? 'bg-[#C9A84C] border-[#C9A84C] text-black font-black'
                          : 'border-white/10 text-[#666] hover:border-[#C9A84C]/40 hover:text-white'
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Confirm */}
      {step === 2 && selectedStaff && selectedSlot && (
        <div className="max-w-md">
          <div className="flex items-center justify-between mb-5">
            <p className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">Request Session</p>
            <button
              onClick={() => setStep(1)}
              className="text-xs text-[#444] hover:text-white uppercase tracking-wider transition-colors"
            >
              ← Back
            </button>
          </div>
          <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden mb-4">
            <div className="px-5 py-4 border-b border-white/5">
              <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">Booking Summary</span>
            </div>
            <div className="p-5 space-y-3">
              {[
                { label: 'Type', value: '1-on-1 Session' },
                ...(bookingChildName ? [{ label: 'Booking For', value: bookingChildName }] : []),
                { label: 'Coach', value: selectedStaff.full_name },
                { label: 'Date', value: new Date(selectedSlot.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) },
                { label: 'Time', value: `${selectedSlot.time} – ${String(Number(selectedSlot.time.split(':')[0]) + 1).padStart(2, '0')}:00` },
                { label: 'Duration', value: '60 minutes' },
                { label: 'Deposit', value: '£20.00' },
              ].map(row => (
                <div key={row.label} className="flex justify-between text-sm">
                  <span className="text-[#444]">{row.label}</span>
                  <span className="text-white">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-[#0D0D0D] border border-white/5 rounded-sm p-4 mb-5">
            <p className="text-[11px] text-[#444] leading-relaxed">
              Cancellation policy: 24+ hours notice = full credit refund. Under 24 hours = 50% deposit retained.
            </p>
          </div>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="w-full bg-[#C9A84C] hover:bg-[#d4b055] disabled:opacity-40 text-black font-black
                       py-3 px-4 rounded-sm text-xs tracking-[0.15em] uppercase transition-colors"
            style={{ fontFamily: "'Arial Black', sans-serif" }}
          >
            {loading ? 'Confirming…' : 'Request Session'}
          </button>
        </div>
      )}
    </div>
  )
}
