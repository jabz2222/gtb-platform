'use client'

import { useState } from 'react'
import Link from 'next/link'
import ExternalEventForm from './ExternalEventForm'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const EXTERNAL_EVENT_COLOURS: Record<string, string> = {
  training:      '#5BB8E8',
  gym:           '#2E8B35',
  match:         '#E8641A',
  team_training: '#9B2454',
  recovery:      '#2E9B8A',
  school:        '#888',
  other:         '#666',
}

interface ExternalEvent {
  id: string
  title: string
  event_type: string
  starts_at: string
  ends_at: string | null
  location: string | null
  notes: string | null
  color_hex: string | null
}

interface Props {
  bookings: Record<string, unknown>[]
  availableSlots: Record<string, unknown>[]
  externalEvents: ExternalEvent[]
  divisionKey: Record<string, string>
  inPersonColour: string
  monthName: string
  year: number
  month: number
  daysInMonth: number
  firstDayOffset: number
  today: number
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function isInPerson(bookingType: string): boolean {
  return bookingType === 'one_on_one' || bookingType === '1on1' || bookingType === 'contracted'
}

export default function CalendarView({
  bookings,
  availableSlots,
  externalEvents,
  divisionKey,
  inPersonColour,
  monthName,
  year,
  month,
  daysInMonth,
  firstDayOffset,
  today,
}: Props) {
  const [view, setView] = useState<'calendar' | 'booking'>('calendar')
  const [selectedEvent, setSelectedEvent] = useState<Record<string, unknown> | null>(null)
  const [selectedExternal, setSelectedExternal] = useState<ExternalEvent | null>(null)
  const [filterType, setFilterType] = useState('all')
  const [addEventOpen, setAddEventOpen] = useState(false)

  // Group bookings by day
  const bookingsByDay: Record<number, Record<string, unknown>[]> = {}
  for (const b of bookings) {
    const day = new Date(b.starts_at as string).getDate()
    if (!bookingsByDay[day]) bookingsByDay[day] = []
    bookingsByDay[day].push(b)
  }

  // Group external events by day (only ones in this rendered month)
  const externalByDay: Record<number, ExternalEvent[]> = {}
  for (const ev of externalEvents) {
    const d = new Date(ev.starts_at)
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate()
      if (!externalByDay[day]) externalByDay[day] = []
      externalByDay[day].push(ev)
    }
  }

  // Filter available slots by service type
  const filteredSlots = filterType === 'all'
    ? availableSlots
    : availableSlots.filter(s => (s.session_type as string) === filterType)

  const SERVICE_TYPES = [
    { key: 'all', label: 'All' },
    { key: '1on1', label: '1-on-1' },
    { key: 'group', label: 'Group' },
    { key: 'fitness', label: 'Fitness' },
    { key: 'technical', label: 'Technical' },
  ]

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-[#C9A84C] text-[11px] tracking-[0.3em] uppercase mb-2">Schedule</p>
          <h1
            className="text-4xl font-black tracking-wider text-white uppercase"
            style={{ fontFamily: "'Arial Black', sans-serif" }}
          >
            {view === 'calendar'
              ? <>My <span style={{ color: '#C9A84C' }}>Calendar</span></>
              : <>Book a <span style={{ color: '#C9A84C' }}>Session</span></>
            }
          </h1>
          <p className="text-[#444] mt-1.5 text-sm">
            {view === 'calendar' ? 'Your sessions and bookings' : 'Choose from available coach slots'}
          </p>
        </div>

        {/* Toggle + Add event */}
        <div className="flex items-center gap-2 mt-1">
          {view === 'calendar' && (
            <button
              onClick={() => setAddEventOpen(true)}
              className="px-3 py-2 text-xs tracking-wider uppercase rounded-sm border border-white/10
                         text-[#C9A84C] hover:bg-[#C9A84C]/10 transition-colors"
            >
              + Add event
            </button>
          )}
          <div className="flex gap-1 bg-[#0D0D0D] border border-white/5 rounded-sm p-1">
            <button
              onClick={() => setView('calendar')}
              className={`px-4 py-2 text-xs tracking-wider uppercase rounded-sm transition-colors ${
                view === 'calendar' ? 'bg-[#C9A84C] text-black font-black' : 'text-[#555] hover:text-white'
              }`}
              style={view === 'calendar' ? { fontFamily: "'Arial Black', sans-serif" } : undefined}
            >
              Calendar
            </button>
            <button
              onClick={() => setView('booking')}
              className={`px-4 py-2 text-xs tracking-wider uppercase rounded-sm transition-colors ${
                view === 'booking' ? 'bg-[#C9A84C] text-black font-black' : 'text-[#555] hover:text-white'
              }`}
              style={view === 'booking' ? { fontFamily: "'Arial Black', sans-serif" } : undefined}
            >
              Book Session
            </button>
          </div>
        </div>
      </div>

      {/* ===== CALENDAR VIEW ===== */}
      {view === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar grid */}
          <div className="lg:col-span-2 bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
              <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">{monthName}</span>
            </div>
            <div className="grid grid-cols-7 border-b border-white/5">
              {WEEKDAYS.map(d => (
                <div key={d} className="text-center py-3 text-[10px] text-[#444] uppercase tracking-wider">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {Array.from({ length: firstDayOffset }).map((_, i) => (
                <div key={`empty-${i}`} className="border-b border-r border-white/[0.03] min-h-[64px] p-1.5" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const isToday = day === today
                const dayBookings = bookingsByDay[day] ?? []
                const dayExternal = externalByDay[day] ?? []
                const totalEvents = dayBookings.length + dayExternal.length

                return (
                  <div
                    key={day}
                    className={`border-b border-r border-white/[0.03] min-h-[64px] p-1.5 transition-colors
                      ${isToday ? 'bg-[#C9A84C]/5' : 'hover:bg-white/[0.02]'}
                      ${(i + firstDayOffset) % 7 === 6 ? 'border-r-0' : ''}`}
                  >
                    <span
                      className={`text-xs block mb-1 w-6 h-6 flex items-center justify-center rounded-sm
                        ${isToday ? 'bg-[#C9A84C] text-black font-black' : day < today ? 'text-[#333]' : 'text-[#666]'}`}
                      style={isToday ? { fontFamily: "'Arial Black', sans-serif" } : undefined}
                    >
                      {day}
                    </span>
                    {dayBookings.slice(0, 2).map(b => {
                      const bType = b.booking_type as string
                      const inPerson = isInPerson(bType)
                      const divSlug = (b.divisions as { slug: string } | null)?.slug ?? 'football'
                      const colour = inPerson ? inPersonColour : (divisionKey[divSlug] ?? '#C9A84C')
                      return (
                        <button
                          key={b.id as string}
                          onClick={() => setSelectedEvent(b)}
                          className="w-full text-left text-[9px] px-1 py-0.5 rounded-sm mb-0.5 truncate transition-opacity hover:opacity-80"
                          style={{ backgroundColor: `${colour}25`, color: colour }}
                        >
                          {formatTime(b.starts_at as string)}
                          {inPerson ? ' 📍' : ''}
                        </button>
                      )
                    })}
                    {dayExternal.slice(0, Math.max(0, 2 - dayBookings.length)).map(ev => {
                      const colour = ev.color_hex || EXTERNAL_EVENT_COLOURS[ev.event_type] || '#666'
                      return (
                        <button
                          key={ev.id}
                          onClick={() => setSelectedExternal(ev)}
                          className="w-full text-left text-[9px] px-1 py-0.5 rounded-sm mb-0.5 truncate transition-opacity hover:opacity-80
                                     border border-dashed"
                          style={{ borderColor: `${colour}55`, color: colour }}
                          title={ev.title}
                        >
                          {formatTime(ev.starts_at)} · {ev.title}
                        </button>
                      )
                    })}
                    {totalEvents > 2 && (
                      <div className="text-[9px] text-[#444] px-1">+{totalEvents - 2}</div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Upcoming */}
            <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-white/5">
                <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">Upcoming</span>
              </div>
              {bookings.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-sm text-[#444]">No sessions this month</p>
                  <button onClick={() => setView('booking')} className="text-xs text-[#C9A84C] uppercase tracking-wider hover:underline mt-2 inline-block">
                    Book a session →
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-white/[0.04]">
                  {bookings.slice(0, 6).map(b => {
                    const bType = b.booking_type as string
                    const inPerson = isInPerson(bType)
                    const divSlug = (b.divisions as { slug: string; name: string } | null)?.slug ?? 'football'
                    const divName = (b.divisions as { slug: string; name: string } | null)?.name ?? 'Session'
                    const colour = inPerson ? inPersonColour : (divisionKey[divSlug] ?? '#C9A84C')
                    const start = new Date(b.starts_at as string)

                    return (
                      <button
                        key={b.id as string}
                        onClick={() => inPerson ? setSelectedEvent(b) : null}
                        className="w-full text-left px-5 py-3.5 flex items-start gap-3 hover:bg-white/[0.02] transition-colors"
                      >
                        <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: colour }} />
                        <div>
                          <p className="text-xs font-medium text-white">{inPerson ? '📍 In-Person' : divName}</p>
                          <p className="text-[11px] text-[#444] mt-0.5">
                            {start.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                            {' · '}{formatTime(b.starts_at as string)}
                          </p>
                          {inPerson && <p className="text-[10px] text-[#F5A623] mt-0.5">Tap to complete readiness form →</p>}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Division key */}
            <div className="bg-[#0D0D0D] border border-white/5 rounded-sm p-5">
              <p className="text-[11px] text-[#C9A84C] uppercase tracking-wider mb-3">Colour Key</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: inPersonColour }} />
                  <span className="text-xs text-[#555]">In-Person Sessions</span>
                </div>
                {Object.entries(divisionKey).map(([slug, colour]) => (
                  <div key={slug} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: colour }} />
                    <span className="text-xs text-[#555] capitalize">GTB {slug}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== BOOKING VIEW ===== */}
      {view === 'booking' && (
        <div>
          {/* Service type filter */}
          <div className="flex gap-2 flex-wrap mb-6">
            {SERVICE_TYPES.map(t => (
              <button
                key={t.key}
                onClick={() => setFilterType(t.key)}
                className={`px-3 py-1.5 text-xs uppercase tracking-wider rounded-sm transition-colors ${
                  filterType === t.key
                    ? 'bg-[#C9A84C] text-black font-black'
                    : 'bg-[#0D0D0D] border border-white/5 text-[#555] hover:text-white'
                }`}
                style={filterType === t.key ? { fontFamily: "'Arial Black', sans-serif" } : undefined}
              >
                {t.label}
              </button>
            ))}
          </div>

          {filteredSlots.length === 0 ? (
            <div className="bg-[#0D0D0D] border border-white/5 rounded-sm p-10 text-center">
              <p className="text-[#444] text-sm mb-1">No available slots at this time</p>
              <p className="text-[#333] text-xs">Your coach will post availability here. Check back soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSlots.map(slot => {
                const coach = slot.coach as { id: string; full_name: string } | null
                const start = new Date(slot.starts_at as string)
                const end = new Date(slot.ends_at as string)
                return (
                  <div
                    key={slot.id as string}
                    className="bg-[#0D0D0D] border border-white/5 rounded-sm p-5 hover:border-[#C9A84C]/30 transition-colors relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#C9A84C]" />
                    <p className="text-sm font-medium text-white mb-1 capitalize">
                      {(slot.session_type as string)?.replace(/_/g, ' ') ?? 'Session'}
                    </p>
                    {coach && <p className="text-[11px] text-[#555] mb-2">{coach.full_name}</p>}
                    <p className="text-xs text-[#888]">
                      {start.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}
                    </p>
                    <p className="text-xs text-[#888]">
                      {formatTime(slot.starts_at as string)} – {formatTime(slot.ends_at as string)}
                    </p>
                    <Link
                      href={`/bookings/new?coachId=${coach?.id ?? ''}&slot=${slot.starts_at as string}&type=${slot.session_type as string}`}
                      className="mt-4 w-full block text-center py-2 text-[11px] uppercase tracking-wider rounded-sm bg-[#C9A84C] text-black font-black transition-colors hover:bg-[#d4b055]"
                      style={{ fontFamily: "'Arial Black', sans-serif" }}
                    >
                      Request Slot
                    </Link>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ===== IN-PERSON EVENT MODAL ===== */}
      {selectedEvent && isInPerson(selectedEvent.booking_type as string) && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setSelectedEvent(null)}>
          <div className="bg-[#0D0D0D] border border-white/10 rounded-sm p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: inPersonColour }} />
              <button onClick={() => setSelectedEvent(null)} className="text-[#444] hover:text-white transition-colors text-xl leading-none">×</button>
            </div>
            <p className="text-[11px] uppercase tracking-wider mb-1" style={{ color: inPersonColour }}>In-Person Session</p>
            <p className="text-lg font-medium text-white mb-1 capitalize">
              {(selectedEvent.booking_type as string).replace(/_/g, ' ')}
            </p>
            <p className="text-sm text-[#555] mb-5">
              {new Date(selectedEvent.starts_at as string).toLocaleDateString('en-GB', {
                weekday: 'long', day: 'numeric', month: 'long',
              })} · {formatTime(selectedEvent.starts_at as string)}
            </p>
            <div className="bg-[#111] border border-white/5 rounded-sm p-4 mb-5">
              <p className="text-[11px] uppercase tracking-wider text-[#C9A84C] mb-2">Training Readiness Form</p>
              <p className="text-xs text-[#555] leading-relaxed">
                Complete your pre-session readiness check to help your coach track your physical and mental state before training.
              </p>
            </div>
            <Link
              href={`/pdp/wellness?sessionId=${selectedEvent.id as string}`}
              onClick={() => setSelectedEvent(null)}
              className="w-full block text-center py-2.5 text-[11px] uppercase tracking-[0.2em] rounded-sm text-black font-black transition-colors"
              style={{ backgroundColor: inPersonColour, fontFamily: "'Arial Black', sans-serif" }}
            >
              Complete Readiness Form
            </Link>
            <button onClick={() => setSelectedEvent(null)} className="w-full mt-2 py-2 text-[11px] uppercase tracking-wider text-[#444] hover:text-white transition-colors">
              Close
            </button>
          </div>
        </div>
      )}

      {/* ===== EXTERNAL EVENT DETAIL MODAL ===== */}
      {selectedExternal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setSelectedExternal(null)}>
          <div className="bg-[#0D0D0D] border border-white/10 rounded-sm p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: selectedExternal.color_hex || EXTERNAL_EVENT_COLOURS[selectedExternal.event_type] || '#666' }}
              />
              <button onClick={() => setSelectedExternal(null)} className="text-[#444] hover:text-white transition-colors text-xl leading-none">×</button>
            </div>
            <p
              className="text-[11px] uppercase tracking-wider mb-1"
              style={{ color: selectedExternal.color_hex || EXTERNAL_EVENT_COLOURS[selectedExternal.event_type] || '#666' }}
            >
              {selectedExternal.event_type.replace(/_/g, ' ')}
            </p>
            <p className="text-lg font-medium text-white mb-1">{selectedExternal.title}</p>
            <p className="text-sm text-[#555] mb-3">
              {new Date(selectedExternal.starts_at).toLocaleDateString('en-GB', {
                weekday: 'long', day: 'numeric', month: 'long',
              })} · {formatTime(selectedExternal.starts_at)}
              {selectedExternal.ends_at && <> – {formatTime(selectedExternal.ends_at)}</>}
            </p>
            {selectedExternal.location && (
              <p className="text-xs text-[#888] mb-2">📍 {selectedExternal.location}</p>
            )}
            {selectedExternal.notes && (
              <div className="bg-[#111] border border-white/5 rounded-sm p-3 mb-3">
                <p className="text-xs text-[#aaa] whitespace-pre-wrap">{selectedExternal.notes}</p>
              </div>
            )}
            <button
              onClick={async () => {
                if (!confirm('Delete this event?')) return
                const res = await fetch(`/api/calendar/events/${selectedExternal.id}`, { method: 'DELETE' })
                if (res.ok) {
                  setSelectedExternal(null)
                  window.location.reload()
                }
              }}
              className="w-full py-2 text-[11px] uppercase tracking-wider text-red-400 border border-red-500/20 hover:border-red-500/40 rounded-sm transition-colors"
            >
              Delete event
            </button>
          </div>
        </div>
      )}

      {/* ===== ADD EXTERNAL EVENT FORM ===== */}
      {addEventOpen && (
        <ExternalEventForm
          onClose={() => setAddEventOpen(false)}
          onSaved={() => {
            setAddEventOpen(false)
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}
