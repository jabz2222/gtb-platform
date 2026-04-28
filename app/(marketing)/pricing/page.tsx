import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Pricing — GTB Development' }

const TIERS = [
  {
    name: 'Free',
    price: null,
    priceLabel: 'Free',
    sub: 'Get started with the basics',
    color: '#888',
    features: [
      'Player Development Profile',
      'Basic goal tracking',
      'View public group classes',
      'Access to GTB community',
      'Personal calendar',
    ],
    locked: [
      'Education content',
      '1-on-1 coaching sessions',
      'Contracted programmes',
      'Advanced analytics',
    ],
    cta: 'Get Started',
    href: '/register',
    highlight: false,
  },
  {
    name: 'Bronze',
    price: 'Contact Us',
    priceLabel: 'Bronze',
    sub: 'Entry-level programme access',
    color: '#CD7F32',
    features: [
      'Everything in Free',
      'Access to Bronze education modules',
      'Book 1-on-1 sessions',
      'Group class bookings',
      'Performance tracking',
      'Wellness check-ins',
    ],
    locked: [
      'Silver & Gold education content',
      'Contracted block programmes',
    ],
    cta: 'Enquire Now',
    href: '/contact',
    highlight: false,
  },
  {
    name: 'Silver',
    price: 'Contact Us',
    priceLabel: 'Silver',
    sub: 'Full platform access',
    color: '#C9A84C',
    features: [
      'Everything in Bronze',
      'Access to Silver education modules',
      'Contracted period bookings',
      'Advanced PDP analytics',
      'KPI radar charts',
      'Mentor access',
      'Priority booking',
    ],
    locked: [
      'Gold education content',
    ],
    cta: 'Enquire Now',
    href: '/contact',
    highlight: true,
  },
  {
    name: 'Gold',
    price: 'Contact Us',
    priceLabel: 'Gold',
    sub: 'Elite development access',
    color: '#FFD700',
    features: [
      'Everything in Silver',
      'Full education library access',
      'Dedicated mentor assignment',
      'Video analysis sessions',
      'Monthly progress reviews',
      'Exclusive Gold workshops',
      'Parent dashboard access',
    ],
    locked: [],
    cta: 'Enquire Now',
    href: '/contact',
    highlight: false,
  },
]

const COMPARISON_FEATURES = [
  { feature: 'Player Development Profile', free: true,  bronze: true,  silver: true,  gold: true  },
  { feature: 'Goal Tracking',              free: true,  bronze: true,  silver: true,  gold: true  },
  { feature: 'Public Group Classes',       free: true,  bronze: true,  silver: true,  gold: true  },
  { feature: '1-on-1 Sessions',           free: false, bronze: true,  silver: true,  gold: true  },
  { feature: 'Contracted Programmes',      free: false, bronze: false, silver: true,  gold: true  },
  { feature: 'Wellness Check-ins',         free: false, bronze: true,  silver: true,  gold: true  },
  { feature: 'Education — Bronze',         free: false, bronze: true,  silver: true,  gold: true  },
  { feature: 'Education — Silver',         free: false, bronze: false, silver: true,  gold: true  },
  { feature: 'Education — Gold',           free: false, bronze: false, silver: false, gold: true  },
  { feature: 'Mentor Access',              free: false, bronze: false, silver: true,  gold: true  },
  { feature: 'KPI Analytics',             free: false, bronze: true,  silver: true,  gold: true  },
  { feature: 'Video Analysis',            free: false, bronze: false, silver: false, gold: true  },
  { feature: 'Parent Portal',             free: false, bronze: false, silver: true,  gold: true  },
]

function Check({ yes }: { yes: boolean }) {
  return yes ? (
    <svg className="w-4 h-4 text-[#2E8B35] mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  ) : (
    <svg className="w-4 h-4 text-[#222] mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

export default function PricingPage() {
  return (
    <div className="max-w-5xl mx-auto px-6">
      {/* Header */}
      <div className="text-center pt-16 pb-14">
        <p className="text-[#C9A84C] text-[11px] tracking-[0.3em] uppercase mb-3">Pricing</p>
        <h1
          className="text-5xl font-black tracking-tight text-white uppercase mb-4"
          style={{ fontFamily: "'Arial Black', sans-serif" }}
        >
          Choose Your <span style={{ color: '#C9A84C' }}>Tier</span>
        </h1>
        <p className="text-[#555] text-sm max-w-md mx-auto">
          All tiers are personalised and assigned by GTB staff based on your programme.
          Contact us to find out which is right for you.
        </p>
      </div>

      {/* Tier cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
        {TIERS.map(tier => (
          <div
            key={tier.name}
            className={`relative bg-[#0D0D0D] rounded-sm overflow-hidden flex flex-col
                        ${tier.highlight
                          ? 'border border-[#C9A84C]/40 shadow-[0_0_30px_rgba(201,168,76,0.08)]'
                          : 'border border-white/5'
                        }`}
          >
            {tier.highlight && (
              <div className="bg-[#C9A84C] text-black text-[10px] font-black tracking-[0.2em]
                              uppercase text-center py-1.5">
                Most Popular
              </div>
            )}
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: tier.color }} />

            <div className="p-5 flex-1 flex flex-col">
              <p
                className="text-xs font-black tracking-[0.2em] uppercase mb-1"
                style={{ color: tier.color, fontFamily: "'Arial Black', sans-serif" }}
              >
                {tier.name}
              </p>
              <p className="text-xs text-[#444] mb-4">{tier.sub}</p>

              <div className="mb-5">
                <p
                  className="text-2xl font-black text-white"
                  style={{ fontFamily: "'Arial Black', sans-serif" }}
                >
                  {tier.priceLabel === 'Free' ? '£0' : tier.price}
                </p>
                {tier.priceLabel !== 'Free' && (
                  <p className="text-[10px] text-[#444] mt-0.5">Personalised pricing</p>
                )}
              </div>

              <div className="space-y-2 flex-1 mb-5">
                {tier.features.map(f => (
                  <div key={f} className="flex items-start gap-2">
                    <svg className="w-3.5 h-3.5 text-[#2E8B35] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <span className="text-xs text-[#666]">{f}</span>
                  </div>
                ))}
                {tier.locked.map(f => (
                  <div key={f} className="flex items-start gap-2">
                    <svg className="w-3.5 h-3.5 text-[#222] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="text-xs text-[#333]">{f}</span>
                  </div>
                ))}
              </div>

              <Link
                href={tier.href}
                className="block text-center py-2.5 rounded-sm text-xs font-black tracking-[0.12em]
                           uppercase transition-colors"
                style={
                  tier.highlight
                    ? { backgroundColor: '#C9A84C', color: '#000', fontFamily: "'Arial Black', sans-serif" }
                    : { backgroundColor: 'rgba(255,255,255,0.05)', color: '#888', fontFamily: "'Arial Black', sans-serif" }
                }
              >
                {tier.cta}
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Comparison table */}
      <div className="mb-20">
        <p className="text-[#C9A84C] text-[11px] tracking-[0.3em] uppercase mb-6 text-center">Full Feature Comparison</p>
        <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-5 px-5 py-3 border-b border-white/5">
            <div className="text-[11px] text-[#444] uppercase tracking-wider">Feature</div>
            {TIERS.map(t => (
              <div
                key={t.name}
                className="text-center text-[11px] font-black uppercase tracking-wider"
                style={{ color: t.color, fontFamily: "'Arial Black', sans-serif" }}
              >
                {t.name}
              </div>
            ))}
          </div>
          {/* Rows */}
          {COMPARISON_FEATURES.map((row, i) => (
            <div
              key={row.feature}
              className={`grid grid-cols-5 px-5 py-3 ${i % 2 === 0 ? '' : 'bg-white/[0.02]'}`}
            >
              <div className="text-xs text-[#666]">{row.feature}</div>
              <div><Check yes={row.free} /></div>
              <div><Check yes={row.bronze} /></div>
              <div><Check yes={row.silver} /></div>
              <div><Check yes={row.gold} /></div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ-style note */}
      <div className="bg-[#0D0D0D] border border-white/5 rounded-sm p-6 mb-20">
        <p className="text-[11px] text-[#C9A84C] uppercase tracking-[0.3em] mb-4">How Tiers Work</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { q: 'How is my tier assigned?', a: 'Tiers are personalised and assigned by GTB staff based on your programme enrolment, age, and development goals.' },
            { q: 'Can I upgrade?', a: 'Yes — contact your assigned staff member or GTB admin to discuss upgrading your tier and unlocking additional content.' },
            { q: 'What about cancellations?', a: '24+ hours notice = full credit refund. Under 24 hours = 50% kept. No-show = full deposit retained.' },
          ].map(item => (
            <div key={item.q}>
              <p className="text-xs font-bold text-white mb-1">{item.q}</p>
              <p className="text-xs text-[#444] leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
