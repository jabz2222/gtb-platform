import { requireAuth } from '@/lib/auth/requireRole'
import Link from 'next/link'

const BOOKING_TYPES = [
  {
    id: 'one-on-one',
    label: '1-on-1 Session',
    description: 'Book a private session with a coach or mentor from their available slots.',
    color: '#5BB8E8',
    href: '/bookings/new/one-on-one',
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
  {
    id: 'group',
    label: 'Group Class',
    description: 'Join a public group class or accept an invite to a private group session.',
    color: '#2E8B35',
    href: '/bookings/new/group',
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
  },
  {
    id: 'contracted',
    label: 'Contracted Block',
    description: 'Set up a recurring block of sessions as part of your GTB programme agreement.',
    color: '#C9A84C',
    href: '/bookings/new/contracted',
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
      </svg>
    ),
  },
]

export default async function NewBookingPage() {
  await requireAuth()

  return (
    <div>
      <div className="mb-10">
        <p className="text-[#C9A84C] text-[11px] tracking-[0.3em] uppercase mb-2">Bookings</p>
        <h1 className="text-4xl font-black tracking-wider text-white uppercase"
            style={{ fontFamily: "'Arial Black', sans-serif" }}>
          Book a <span style={{ color: '#C9A84C' }}>Session</span>
        </h1>
        <p className="text-[#444] mt-1.5 text-sm">Choose the type of session you want to book</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mb-10">
        {BOOKING_TYPES.map(t => (
          <Link key={t.id} href={t.href}
                className="group relative bg-[#0D0D0D] border border-white/5 hover:border-white/10
                           rounded-sm p-6 transition-all overflow-hidden">
            {/* Top accent */}
            <div className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity"
                 style={{ backgroundColor: t.color }} />

            {/* Icon */}
            <div className="w-10 h-10 rounded-sm flex items-center justify-center mb-5 transition-colors"
                 style={{ backgroundColor: `${t.color}15`, color: t.color }}>
              {t.icon}
            </div>

            <h2 className="text-sm font-black tracking-wide mb-2"
                style={{ color: t.color, fontFamily: "'Arial Black', sans-serif" }}>
              {t.label}
            </h2>
            <p className="text-xs text-[#555] leading-relaxed mb-5">{t.description}</p>

            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="h-px w-4" style={{ backgroundColor: t.color }} />
              <svg className="w-3 h-3" style={{ color: t.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      {/* Cancellation policy */}
      <div className="max-w-3xl bg-[#0D0D0D] border border-white/5 rounded-sm p-5">
        <p className="text-[11px] text-[#C9A84C] uppercase tracking-[0.2em] mb-3">Cancellation Policy</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: '24+ hours notice', note: '100% credited to account', positive: true },
            { label: 'Under 24 hours',   note: '50% kept · 50% credited',  positive: false },
            { label: 'No-show',          note: 'Full deposit retained',     positive: false },
          ].map(p => (
            <div key={p.label} className="border-l-2 pl-3"
                 style={{ borderColor: p.positive ? '#2E8B35' : '#333' }}>
              <p className="text-xs font-medium text-white mb-0.5">{p.label}</p>
              <p className="text-xs text-[#444]">{p.note}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
