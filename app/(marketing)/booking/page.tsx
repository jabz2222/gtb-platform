import { Metadata } from 'next'
import Link from 'next/link'
import BookingEnquiryForm from '@/components/booking/BookingEnquiryForm'

export const metadata: Metadata = { title: 'Booking | GTB Development' }

const BOOKING_TYPES = [
  {
    id: 'one-on-one',
    label: '1-on-1 Sessions',
    tag: 'MOST POPULAR',
    description:
      'Dedicated one-to-one coaching tailored to your Player Development Profile. Choose your coach, pick a time slot, and receive personalised, structured sessions tracked across all 4D dimensions.',
    details: [
      'Select from available GTB coaches',
      'Football, Fitness, Mentoring & more',
      'PDP tracking every session',
      'Flexible scheduling',
    ],
    color: '#C9A84C',
  },
  {
    id: 'group',
    label: 'Group Sessions',
    tag: 'TEAM DEVELOPMENT',
    description:
      'Structured group training across all GTB divisions. Join existing cohorts or book a group session with your team. Competitive, collaborative, and aligned to the 4D Model.',
    details: [
      'Football, Fitness & Sports divisions',
      'Age-appropriate group sizes',
      'Regular cohort sessions',
      'Progress tracked alongside peers',
    ],
    color: '#5BB8E8',
  },
  {
    id: 'contracted',
    label: 'School & Contracted',
    tag: 'ORGANISATIONS',
    description:
      'Contracted delivery for schools, academies, and sports organisations. GTB coaches deliver structured curricula, PDP tracking, and cross-divisional programming on-site.',
    details: [
      'School PE & after-school programmes',
      'Holiday camp delivery',
      'Bespoke curriculum design',
      'Staff CPD available',
    ],
    color: '#2E8B35',
  },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Create Your Account',
    description: 'Register as a client or parent. Your profile is the foundation of your GTB journey.',
  },
  {
    step: '02',
    title: 'Choose Your Session',
    description: 'Select session type, division, coach, and available time slot through the booking wizard.',
  },
  {
    step: '03',
    title: 'Confirm & Attend',
    description: 'Receive confirmation, complete your onboarding form, and show up ready to develop.',
  },
  {
    step: '04',
    title: 'Track Your Progress',
    description: 'Every session feeds into your Player Development Profile across all 4D dimensions.',
  },
]

export default function BookingPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">

      {/* Hero */}
      <section className="pt-16 pb-20 px-6 text-center">
        <p className="text-[#C9A84C] text-[11px] tracking-[0.35em] uppercase mb-4">
          Start Your Journey
        </p>
        <h1
          className="text-5xl md:text-6xl font-black tracking-wider uppercase mb-6"
          style={{ fontFamily: "'Arial Black', sans-serif" }}
        >
          Book a{' '}
          <span style={{ color: '#C9A84C' }}>Session</span>
        </h1>
        <p className="text-[#666] text-base max-w-xl mx-auto leading-relaxed">
          All GTB bookings are managed through your client dashboard. Sign in or create an account to access the booking wizard, choose your coach, and lock in your slot.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10">
          <Link
            href="/register"
            className="btn-shimmer bg-[#C9A84C] hover:bg-[#d4b055] text-black font-bold px-8 py-3.5 text-xs
                       tracking-[0.12em] uppercase transition-colors rounded-sm"
            style={{ fontFamily: "'Arial Black', sans-serif" }}
          >
            Get Started — It&apos;s Free
          </Link>
          <Link
            href="/login"
            className="border border-white/10 text-white/60 hover:text-white hover:border-white/20
                       px-8 py-3.5 text-xs tracking-[0.12em] uppercase transition-colors rounded-sm"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Booking type cards */}
      <section className="px-6 pb-24 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-4">
          {BOOKING_TYPES.map(type => (
            <div
              key={type.id}
              className="card-hover-glow relative bg-[#0D0D0D] border border-white/5 rounded-sm p-7 flex flex-col transition-colors duration-300"
            >
              {/* Tag */}
              <p
                className="text-[10px] tracking-[0.25em] uppercase font-bold mb-5"
                style={{ color: type.color }}
              >
                {type.tag}
              </p>

              {/* Color bar */}
              <div
                className="w-8 h-[3px] rounded-full mb-5"
                style={{ backgroundColor: type.color }}
              />

              <h2
                className="text-xl font-black tracking-wide uppercase text-white mb-4"
                style={{ fontFamily: "'Arial Black', sans-serif" }}
              >
                {type.label}
              </h2>

              <p className="text-[#555] text-sm leading-relaxed mb-6 flex-1">
                {type.description}
              </p>

              <ul className="space-y-2 mb-8">
                {type.details.map(d => (
                  <li key={d} className="flex items-start gap-2.5 text-xs text-[#666]">
                    <span
                      className="w-1 h-1 rounded-full flex-shrink-0 mt-1.5"
                      style={{ backgroundColor: type.color }}
                    />
                    {d}
                  </li>
                ))}
              </ul>

              <div className="flex flex-col gap-2">
                <Link
                  href="/login"
                  className="block text-center border border-white/10 hover:border-white/25 text-xs tracking-[0.12em] uppercase py-2.5 rounded-sm transition-colors"
                  style={{ color: type.color }}
                >
                  Sign In to Book
                </Link>
                <Link
                  href="/register"
                  className="block text-center text-xs tracking-[0.12em] uppercase py-2.5 rounded-sm transition-colors text-[#444] hover:text-[#888]"
                >
                  Create Account
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-white/5 px-6 py-24 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-[#C9A84C] text-[11px] tracking-[0.35em] uppercase mb-3">Process</p>
          <h2
            className="text-3xl md:text-4xl font-black tracking-wider uppercase text-white"
            style={{ fontFamily: "'Arial Black', sans-serif" }}
          >
            How It Works
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {HOW_IT_WORKS.map((item, i) => (
            <div key={item.step} className="relative">
              {/* Connector line */}
              {i < HOW_IT_WORKS.length - 1 && (
                <div className="hidden md:block absolute top-[22px] left-[calc(100%-0px)] w-full h-px bg-white/5 z-0" />
              )}

              <div className="relative z-10">
                <p
                  className="text-4xl font-black tracking-tight mb-4"
                  style={{ fontFamily: "'Arial Black', sans-serif", color: '#C9A84C', opacity: 0.3 }}
                >
                  {item.step}
                </p>
                <h3 className="text-sm font-bold tracking-wider uppercase text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-[#555] text-xs leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Enquiry form */}
      <section id="enquire" className="border-t border-white/5 px-6 py-20 max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-[#C9A84C] text-[11px] tracking-[0.35em] uppercase mb-3">Submit Enquiry</p>
          <h2
            className="text-3xl md:text-4xl font-black tracking-wider text-white uppercase mb-3"
            style={{ fontFamily: "'Arial Black', sans-serif" }}
          >
            Start Your <span style={{ color: '#C9A84C' }}>Enquiry</span>
          </h2>
          <p className="text-[#555] text-sm max-w-xl mx-auto leading-relaxed">
            Tell us about your goals. We&apos;ll reply within 2 working days with options, pricing, and bank-transfer details for any confirmed booking.
          </p>
        </div>
        <BookingEnquiryForm />
      </section>

      {/* Parent note */}
      <section className="border-t border-white/5 px-6 py-16 max-w-6xl mx-auto">
        <div className="bg-[#0D0D0D] border border-white/5 rounded-sm p-8 flex flex-col md:flex-row items-start gap-6">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#C9A84C]/10 flex items-center justify-center">
            <span className="text-[#C9A84C] text-lg">👨‍👧</span>
          </div>
          <div>
            <h3
              className="text-base font-black tracking-wider uppercase text-white mb-2"
              style={{ fontFamily: "'Arial Black', sans-serif" }}
            >
              Booking for a Child?
            </h3>
            <p className="text-[#555] text-sm leading-relaxed max-w-2xl">
              Parents and guardians can register as a parent account and book sessions on behalf of linked minor accounts. Once your child is linked to your account by a GTB administrator, the booking wizard will let you select which family member the session is for.
            </p>
            <Link
              href="/register"
              className="inline-block mt-4 text-[#C9A84C] text-xs tracking-[0.15em] uppercase hover:text-white transition-colors"
            >
              Register as a Parent →
            </Link>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-white/5 px-6 py-24 text-center">
        <p className="text-[#C9A84C] text-[11px] tracking-[0.35em] uppercase mb-4">Ready?</p>
        <h2
          className="text-4xl md:text-5xl font-black tracking-wider uppercase text-white mb-6"
          style={{ fontFamily: "'Arial Black', sans-serif" }}
        >
          Join the GTB Ecosystem
        </h2>
        <p className="text-[#555] text-sm max-w-md mx-auto mb-10 leading-relaxed">
          One account. Five divisions. Every session tracked. Your development starts here.
        </p>
        <Link
          href="/register"
          className="btn-shimmer inline-block bg-[#C9A84C] hover:bg-[#d4b055] text-black font-bold
                     px-10 py-4 text-xs tracking-[0.12em] uppercase transition-colors rounded-sm"
          style={{ fontFamily: "'Arial Black', sans-serif" }}
        >
          Create Your Account
        </Link>
      </section>
    </div>
  )
}
