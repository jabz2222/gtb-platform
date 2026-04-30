'use client'

import { useState, useMemo } from 'react'
import PDPReflectionForm from './PDPReflectionForm'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

interface Booking {
  id: string
  starts_at: string
  ends_at: string | null
  booking_type: string
  status: string
  divisions: { slug: string; name: string; color_hex: string } | { slug: string; name: string; color_hex: string }[] | null
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

interface SessionReflection {
  id: string
  session_date: string
  reflection_type: string | null
  area: string | null
  rating: number | null
  notes: string | null
}

interface SCSession {
  id: string
  session_date: string
  session_type: string | null
  focus: string | null
  completed: boolean
}

interface WeeklyReflection {
  id: string
  week_start: string
  area: string | null
  target: string | null
  status_colour: string | null
}

interface Props {
  weekStart: string // ISO of Monday 00:00
  bookings: Record<string, unknown>[]
  externalEvents: ExternalEvent[]
  sessionReflections: SessionReflection[]
  scSessions: SCSession[]
  weeklyReflections: WeeklyReflection[]
  accent: string
}

const REFLECTION_TYPES = [
  { id: 'training',  label: 'Training Reflection', icon: '⚽', description: 'Understanding · Learning · Challenges · Self-Awareness · Effort · Improvement' },
  { id: 'sc',        label: 'S&C Reflection',      icon: '💪', description: 'Sessions · RPE · Loads · Recovery · Pain/Tightness areas' },
  { id: 'short',     label: 'Short-term Goals',    icon: '🎯', description: 'Weekly tracker — target · actions · evidence · status' },
  { id: 'long',      label: 'Long-term Goals',     icon: '🧭', description: 'Monthly progress review — technical/tactical/physical/psychological/lifestyle' },
  { id: 'match',     label: 'Match Reflection',    icon: '🏟️', description: 'Highlights · Areas to improve · Effort · Next steps' },
] as const

type ReflectionTypeId = (typeof REFLECTION_TYPES)[number]['id']

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function sameDay(d1: string | Date, d2: Date): boolean {
  const dd1 = typeof d1 === 'string' ? new Date(d1) : d1
  return (
    dd1.getFullYear() === d2.getFullYear() &&
    dd1.getMonth() === d2.getMonth() &&
    dd1.getDate() === d2.getDate()
  )
}

export default function PDPWeeklyView({
  weekStart,
  bookings,
  externalEvents,
  sessionReflections,
  scSessions,
  weeklyReflections,
  accent,
}: Props) {
  const [openReflection, setOpenReflection] = useState<{
    type: ReflectionTypeId
    sessionDate: string
    label?: string
  } | null>(null)

  const monday = useMemo(() => new Date(weekStart), [weekStart])
  const days = useMemo(
    () =>
      Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(monday)
        d.setDate(monday.getDate() + i)
        return d
      }),
    [monday]
  )

  const today = new Date()

  function bookingsOn(d: Date) {
    return bookings.filter(b => sameDay(b.starts_at as string, d))
  }
  function externalsOn(d: Date) {
    return externalEvents.filter(e => sameDay(e.starts_at, d))
  }
  function reflectionsOn(d: Date, type?: string) {
    return sessionReflections.filter(r => {
      if (!sameDay(r.session_date, d)) return false
      if (type && r.reflection_type !== type) return false
      return true
    })
  }
  function scOn(d: Date) {
    return scSessions.filter(s => sameDay(s.session_date, d))
  }
  function weeklyOn(d: Date) {
    return weeklyReflections.filter(w => sameDay(w.week_start, d))
  }

  return (
    <div>
      {/* Week heading */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] tracking-[0.3em] uppercase text-[#888]">
          Weekly View · {monday.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – {days[6].toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
        </p>
        <p className="text-[10px] text-[#555]">Tap a day to log a reflection</p>
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
        {days.map((d, i) => {
          const isToday = sameDay(d, today)
          const dayBookings = bookingsOn(d)
          const dayExternal = externalsOn(d)
          const dayTrainingRefl = reflectionsOn(d, 'training')
          const dayMatchRefl = reflectionsOn(d, 'match')
          const daySC = scOn(d)
          const dayWeekly = weeklyOn(d)
          const isoDate = d.toISOString().slice(0, 10)

          return (
            <div
              key={i}
              className={
                'bg-[#0D0D0D] border rounded-sm p-3 min-h-[180px] flex flex-col ' +
                (isToday ? 'border-[#C9A84C]/40' : 'border-white/5')
              }
            >
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-[10px] uppercase tracking-wider text-[#666]">{DAYS[i]}</span>
                <span
                  className={
                    'text-sm font-bold ' + (isToday ? '' : 'text-white/80')
                  }
                  style={isToday ? { color: accent, fontFamily: "'Arial Black', sans-serif" } : undefined}
                >
                  {d.getDate()}
                </span>
              </div>

              <div className="flex-1 space-y-1.5 mb-2">
                {/* Bookings */}
                {dayBookings.map(b => {
                  const div = Array.isArray(b.divisions) ? b.divisions[0] : (b.divisions as { color_hex: string } | null)
                  const colour = (div?.color_hex as string | undefined) ?? accent
                  return (
                    <div
                      key={b.id as string}
                      className="text-[10px] px-1.5 py-1 rounded-sm"
                      style={{ backgroundColor: `${colour}18`, color: colour }}
                    >
                      <span className="font-medium">{formatTime(b.starts_at as string)}</span>{' '}
                      <span className="capitalize">{(b.booking_type as string).replace(/_/g, ' ')}</span>
                    </div>
                  )
                })}
                {/* External events */}
                {dayExternal.map(ev => (
                  <div
                    key={ev.id}
                    className="text-[10px] px-1.5 py-1 rounded-sm border border-dashed"
                    style={{
                      borderColor: `${ev.color_hex || '#666'}55`,
                      color: ev.color_hex || '#aaa',
                    }}
                  >
                    {formatTime(ev.starts_at)} · {ev.title}
                  </div>
                ))}

                {/* Existing reflection markers */}
                <div className="flex flex-wrap gap-1 mt-1">
                  {dayTrainingRefl.length > 0 && (
                    <span className="text-[9px] px-1 rounded-sm bg-[#9B2454]/20 text-[#9B2454]">
                      ⚽ {dayTrainingRefl.length}
                    </span>
                  )}
                  {dayMatchRefl.length > 0 && (
                    <span className="text-[9px] px-1 rounded-sm bg-[#E8641A]/20 text-[#E8641A]">
                      🏟️ {dayMatchRefl.length}
                    </span>
                  )}
                  {daySC.length > 0 && (
                    <span className="text-[9px] px-1 rounded-sm bg-[#CC2222]/20 text-[#CC2222]">
                      💪 {daySC.length}
                    </span>
                  )}
                  {dayWeekly.length > 0 && (
                    <span className="text-[9px] px-1 rounded-sm bg-[#C9A84C]/20 text-[#C9A84C]">
                      🎯 {dayWeekly.length}
                    </span>
                  )}
                </div>
              </div>

              {/* Add-reflection menu */}
              <details className="group">
                <summary
                  className="cursor-pointer list-none text-[10px] uppercase tracking-wider text-[#666] hover:text-white py-1 px-1.5 rounded-sm border border-white/[0.06] hover:border-white/15 transition-colors flex items-center justify-between"
                >
                  <span>+ Reflect</span>
                  <span className="group-open:rotate-180 transition-transform">▾</span>
                </summary>
                <div className="mt-1.5 space-y-0.5">
                  {REFLECTION_TYPES.map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setOpenReflection({ type: t.id, sessionDate: isoDate, label: t.label })}
                      className="w-full text-left text-[10px] px-1.5 py-1 rounded-sm hover:bg-white/[0.04] text-[#aaa] hover:text-white"
                      title={t.description}
                    >
                      <span className="mr-1">{t.icon}</span>
                      {t.label}
                    </button>
                  ))}
                </div>
              </details>
            </div>
          )
        })}
      </div>

      {/* Reflection form modal */}
      {openReflection && (
        <PDPReflectionForm
          type={openReflection.type}
          sessionDate={openReflection.sessionDate}
          label={openReflection.label ?? ''}
          onClose={() => setOpenReflection(null)}
          onSaved={() => {
            setOpenReflection(null)
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}
