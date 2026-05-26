import { Metadata } from 'next'
import Link from 'next/link'
import FadeUp from '@/components/ui/motion/FadeUp'
import StaggerContainer from '@/components/ui/motion/StaggerContainer'
import AnimatedHeading from '@/components/ui/motion/AnimatedHeading'
import ColourBarReveal from '@/components/ui/motion/ColourBarReveal'
import CTAButton from '@/components/ui/motion/CTAButton'
import ScrollReveal3D from '@/components/ui/motion/ScrollReveal3D'
import TiltCard from '@/components/ui/motion/TiltCard'

export const metadata: Metadata = { title: 'Our Divisions — GTB Development' }

const DIVISIONS = [
  {
    slug: 'football',
    name: 'GTB Football',
    tagline: 'Develop the Player. Build the Person.',
    description: 'Technical, tactical, and game intelligence development through guided discovery coaching across all age groups.',
    color: '#5BB8E8',
    stat: 'U5–16+',
  },
  {
    slug: 'fitness',
    name: 'GTB Fitness',
    tagline: 'Stronger Body. Stronger Mind.',
    description: 'Youth-specific strength and conditioning built on progressive overload, movement screening, and physical intelligence.',
    color: '#2E8B35',
    stat: 'Ages 8–18',
  },
  {
    slug: 'sports',
    name: 'GTB Sports',
    tagline: 'Every Sport. One Standard.',
    description: 'Multi-sport participation, school provision, and broad athletic foundations for long-term development.',
    color: '#E8641A',
    stat: 'U5–U16',
  },
  {
    slug: 'mentoring',
    name: 'GTB Mentoring',
    tagline: 'Guide the Mind. Shape the Future.',
    description: 'Structured 4-phase mentoring architecture developing self-awareness, psychological literacy, and internal motivation.',
    color: '#9B2454',
    stat: 'Ages 10–18',
  },
  {
    slug: 'education',
    name: 'GTB Education',
    tagline: 'Learn Today. Lead Tomorrow.',
    description: 'Tiered educational content bridging sport and academic success — from GCSE support to applied sports science.',
    color: '#CC2222',
    stat: 'Ages 5–16',
  },
]

export default function DivisionsIndexPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative px-6 py-28 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px]
                        bg-[#C9A84C]/5 blur-[100px] rounded-full pointer-events-none" />
        <div className="relative max-w-5xl mx-auto text-center">
          <FadeUp delay={0} className="flex items-center gap-2 mb-6 justify-center">
            <div className="h-px w-6 bg-[#C9A84C]" />
            <span className="text-[#C9A84C] text-[11px] tracking-[0.35em] uppercase">
              Five Divisions · One Ecosystem
            </span>
            <div className="h-px w-6 bg-[#C9A84C]" />
          </FadeUp>
          <AnimatedHeading
            as="h1"
            className="text-5xl md:text-7xl font-black tracking-tight leading-[0.9] mb-6 text-white uppercase"
            lines={[
              <span key="heading">Our <span style={{ color: '#C9A84C' }}>Divisions</span></span>,
            ]}
          />
          <FadeUp delay={0.2} className="text-[#555] text-lg max-w-2xl mx-auto leading-relaxed">
            Every department shares the same culture, mentoring systems, values, and developmental DNA.
            Whether entering through football, fitness, or school provision — participants experience the same 4D framework.
          </FadeUp>
        </div>
      </section>

      {/* Division colour bar */}
      <div className="max-w-5xl mx-auto">
        <ColourBarReveal />
      </div>

      {/* Division cards */}
      <section className="px-6 py-20 max-w-5xl mx-auto">
        <StaggerContainer className="space-y-4">
          {DIVISIONS.map(d => (
            <FadeUp key={d.slug}>
              <TiltCard maxTilt={3} shine>
              <Link
                href={`/divisions/${d.slug}`}
                className="group relative block bg-[#0D0D0D] border border-white/5 hover:border-white/10 rounded-sm overflow-hidden transition-colors"
              >
                <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: d.color }} />
                <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                  {/* Name + stat */}
                  <div className="flex items-center gap-4 md:w-[200px] flex-shrink-0">
                    <div
                      className="w-12 h-12 rounded-sm flex items-center justify-center text-base font-black flex-shrink-0"
                      style={{
                        backgroundColor: `${d.color}15`,
                        color: d.color,
                        fontFamily: "'Arial Black', sans-serif",
                      }}
                    >
                      {d.name.replace('GTB ', '').charAt(0)}
                    </div>
                    <div>
                      <h2
                        className="text-sm font-black tracking-wide uppercase"
                        style={{ color: d.color, fontFamily: "'Arial Black', sans-serif" }}
                      >
                        {d.name.replace('GTB ', '')}
                      </h2>
                      <p className="text-[10px] text-[#444] tracking-wider uppercase mt-0.5">{d.stat}</p>
                    </div>
                  </div>

                  {/* Tagline + description */}
                  <div className="flex-1">
                    <p className="text-xs text-[#555] italic mb-1">&ldquo;{d.tagline}&rdquo;</p>
                    <p className="text-xs text-[#444] leading-relaxed">{d.description}</p>
                  </div>

                  {/* Arrow */}
                  <div className="flex-shrink-0 hidden md:flex items-center">
                    <svg
                      className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: d.color }}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </div>
                </div>
              </Link>
              </TiltCard>
            </FadeUp>
          ))}
        </StaggerContainer>
      </section>

      {/* CTA */}
      <section className="px-6 pb-20">
        <FadeUp>
          <div className="max-w-5xl mx-auto text-center border border-[#C9A84C]/20 rounded-sm p-12
                          bg-gradient-to-br from-[#111] to-[#0D0D0D] relative overflow-hidden">
            <div className="absolute inset-0 bg-[#C9A84C]/3 pointer-events-none" />
            <p className="text-[#C9A84C] text-[11px] tracking-[0.35em] uppercase mb-3">Join the Ecosystem</p>
            <h2
              className="text-3xl font-black tracking-wider mb-4 text-white uppercase"
              style={{ fontFamily: "'Arial Black', sans-serif" }}
            >
              Not Sure Where to <span style={{ color: '#C9A84C' }}>Start?</span>
            </h2>
            <p className="text-[#666] text-sm mb-8 max-w-md mx-auto">
              Get in touch and we&apos;ll help find the right programme for you. Every journey begins with a conversation.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <CTAButton
                href="/register"
                className="inline-flex items-center justify-center gap-2 bg-[#C9A84C] hover:bg-[#d4b055]
                           text-black font-black px-8 py-3.5 text-xs tracking-[0.15em]
                           uppercase transition-colors rounded-sm"
                style={{ fontFamily: "'Arial Black', sans-serif" }}
              >
                Create Your Profile
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </CTAButton>
              <CTAButton
                href="/contact"
                className="inline-flex items-center justify-center border border-white/10 hover:border-white/25
                           text-white/70 hover:text-white px-8 py-3.5 text-xs tracking-[0.15em]
                           uppercase transition-all rounded-sm"
              >
                Speak to the Team
              </CTAButton>
            </div>
          </div>
        </FadeUp>
      </section>
    </div>
  )
}
