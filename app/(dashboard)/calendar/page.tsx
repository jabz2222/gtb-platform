import { requireAuth } from '@/lib/auth/requireRole'
import { createClient } from '@/lib/supabase/server'
import CalendarView from '@/components/calendar/CalendarView'

const ALL_DIVISION_COLORS: Record<string, string> = {
  football:  '#5BB8E8',
  fitness:   '#2E8B35',
  sports:    '#E8641A',
  mentoring: '#9B2454',
  education: '#CC2222',
}

const IN_PERSON_COLOUR = '#F5A623'

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay()
  return day === 0 ? 6 : day - 1
}

export default async function CalendarPage() {
  const user = await requireAuth()
  const supabase = await createClient()

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()

  const firstDay = new Date(year, month, 1).toISOString()
  const lastDay = new Date(year, month + 1, 0, 23, 59, 59).toISOString()

  const [bookingsRes, divisionsRes, availableRes] = await Promise.all([
    supabase
      .from('bookings')
      .select('id, starts_at, ends_at, booking_type, status, divisions(slug, name)')
      .eq('client_id', user.id)
      .gte('starts_at', firstDay)
      .lte('starts_at', lastDay)
      .in('status', ['confirmed', 'pending'])
      .order('starts_at', { ascending: true }),
    // Fetch player's enrolled divisions
    supabase
      .from('user_divisions')
      .select('division_id, divisions(name, slug)')
      .eq('user_id', user.id),
    // Fetch coach available slots for booking view
    supabase
      .from('sessions')
      .select('id, starts_at, ends_at, session_type, status, coach:profiles!sessions_coach_id_fkey(id, full_name)')
      .eq('status', 'available')
      .gte('starts_at', new Date().toISOString())
      .order('starts_at', { ascending: true })
      .limit(50),
  ])

  // Build dynamic division legend — only show divisions the player is in
  const enrolledSlugs = (divisionsRes.data ?? [])
    .map(d => (d.divisions as { slug: string } | null)?.slug)
    .filter(Boolean) as string[]

  const divisionKey = enrolledSlugs.length > 0
    ? enrolledSlugs.reduce((acc, slug) => {
        if (ALL_DIVISION_COLORS[slug]) acc[slug] = ALL_DIVISION_COLORS[slug]
        return acc
      }, {} as Record<string, string>)
    : ALL_DIVISION_COLORS // fallback if no divisions found

  const monthName = new Date(year, month).toLocaleString('en-GB', { month: 'long', year: 'numeric' })
  const daysInMonth = getDaysInMonth(year, month)
  const firstDayOffset = getFirstDayOfMonth(year, month)
  const today = now.getDate()

  return (
    <CalendarView
      bookings={(bookingsRes.data ?? []) as Record<string, unknown>[]}
      availableSlots={(availableRes.data ?? []) as Record<string, unknown>[]}
      divisionKey={divisionKey}
      inPersonColour={IN_PERSON_COLOUR}
      monthName={monthName}
      year={year}
      month={month}
      daysInMonth={daysInMonth}
      firstDayOffset={firstDayOffset}
      today={today}
    />
  )
}
