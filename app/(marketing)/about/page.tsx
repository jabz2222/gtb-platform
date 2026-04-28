import { Metadata } from 'next'
import Link from 'next/link'
import { FOUR_D_MODEL, GTB_VALUES } from '@/lib/utils/constants'
import FadeUp from '@/components/ui/motion/FadeUp'
import StaggerContainer from '@/components/ui/motion/StaggerContainer'
import AnimatedHeading from '@/components/ui/motion/AnimatedHeading'
import SlideIn from '@/components/ui/motion/SlideIn'
import CTAButton from '@/components/ui/motion/CTAButton'

export const metadata: Metadata = { title: 'About GTB Development' }


const STATS = [
  { value: '5',    label: 'Divisions'    },
  { value: 'U5+',  label: 'All Ages'     },
  { value: 'SE',   label: 'London'       },
  { value: '2015', label: 'Est.'         },
]

const INTELLIGENCES = [
  { name: 'Participant', description: 'Understanding personal strengths, limitations, and behavioural patterns.' },
  { name: 'Decision', description: 'Processing information quickly and acting adaptively under pressure.' },
  { name: 'Physical', description: 'Movement mechanics, progressive overload, recovery, and nutrition principles.' },
  { name: 'Emotional', description: 'Self-regulation, composure under stress, and empathy within team environments.' },
  { name: 'Leadership', description: 'Communication, influence, accountability, and elevating group standards.' },
]

const MENTORING_PHASES = [
  { phase: '01', name: 'Reflect', description: 'Establish awareness of 4D baseline, habits, motivation, and barriers.' },
  { phase: '02', name: 'Explore', description: 'Build psychological literacy, reframe limiting beliefs, develop growth mindset.' },
  { phase: '03', name: 'Action', description: 'Set structured PDP targets per 4D dimension with clear data indicators.' },
  { phase: '04', name: 'Sustain', description: 'Transition responsibility from mentor-led to participant-led ownership.' },
]

export default function AboutPage() {
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
              GTB Development Ltd · Lewisham &amp; Bromley · South East London
            </span>
            <div className="h-px w-6 bg-[#C9A84C]" />
          </FadeUp>
          <AnimatedHeading
            as="h1"
            className="text-5xl md:text-7xl font-black tracking-tight leading-[0.9] mb-6 text-white uppercase"
            lines={[
              'Built for',
              <span key="athletes" style={{ color: '#C9A84C' }}>Athletes.</span>,
            ]}
          />
          <FadeUp delay={0.2} className="text-[#555] text-lg max-w-2xl mx-auto leading-relaxed">
            GTB Development is an integrated holistic performance and participation ecosystem — combining
            football, fitness, sports, mentoring, and education within one aligned philosophical and operational framework.
          </FadeUp>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-white/5 py-10">
        <StaggerContainer className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map(s => (
            <FadeUp key={s.label} className="text-center">
              <p
                className="text-3xl font-black text-[#C9A84C] mb-1"
                style={{ fontFamily: "'Arial Black', sans-serif" }}
              >
                {s.value}
              </p>
              <p className="text-[11px] text-[#444] tracking-[0.2em] uppercase">{s.label}</p>
            </FadeUp>
          ))}
        </StaggerContainer>
      </section>

      {/* Mission */}
      <section className="px-6 py-24 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <SlideIn direction="left">
            <div>
              <p className="text-[#C9A84C] text-[11px] tracking-[0.3em] uppercase mb-3">Our Mission</p>
              <h2
                className="text-4xl font-black tracking-wider text-white uppercase mb-6"
                style={{ fontFamily: "'Arial Black', sans-serif" }}
              >
                One Ecosystem.<br />
                <span style={{ color: '#C9A84C' }}>Limitless</span> Development.
              </h2>
              <p className="text-[#555] text-sm leading-relaxed mb-4">
                GTB Development LTD is not three separate services. It is one ecosystem. Every
                department shares the same culture, mentoring systems, values, accountability structures,
                and educational principles.
              </p>
              <p className="text-[#444] text-sm leading-relaxed mb-4">
                Whether an individual enters through football, general fitness, school provision, or
                performance training, they experience the same developmental DNA. Data, mentoring insight,
                and performance tracking flow across departments. Coaches collaborate across disciplines.
              </p>
              <p className="text-[#444] text-sm leading-relaxed">
                Holistic development is not housed in one department. It is engineered across the entire
                organisation — building intelligent performers, resilient individuals, and adaptable leaders.
              </p>
            </div>
          </SlideIn>
          <SlideIn direction="right">
            <div className="relative">
              <div className="bg-[#0D0D0D] border border-white/5 rounded-sm p-8">
                <p className="text-[#C9A84C] text-[11px] tracking-[0.3em] uppercase mb-4">
                  Our Motto
                </p>
                <blockquote
                  className="text-3xl font-black text-white uppercase leading-tight"
                  style={{ fontFamily: "'Arial Black', sans-serif" }}
                >
                  &ldquo;I Own My<br />
                  <span style={{ color: '#C9A84C' }}>Development.&rdquo;</span>
                </blockquote>
                <p className="text-[#444] text-xs mt-4 leading-relaxed">
                  GTB environments are designed so participants feel ownership, experience progress,
                  and feel valued. When autonomy, competence, and belonging are present — intrinsic
                  motivation becomes stable and sustainable.
                </p>
              </div>
            </div>
          </SlideIn>
        </div>
      </section>

      {/* 4D Model */}
      <section className="px-6 pb-24 max-w-5xl mx-auto">
        <FadeUp>
          <p className="text-[#C9A84C] text-[11px] tracking-[0.3em] uppercase mb-3">Our Framework</p>
          <h2
            className="text-4xl font-black tracking-wider text-white uppercase mb-4"
            style={{ fontFamily: "'Arial Black', sans-serif" }}
          >
            The <span style={{ color: '#C9A84C' }}>4D</span> Model
          </h2>
          <p className="text-[#444] text-sm leading-relaxed mb-10 max-w-2xl">
            The 4D Core Model is the developmental architecture of GTB Development LTD. It is applied
            universally across Football, Fitness, Sports, Mentoring, and Education — forming the shared
            operational language of the entire organisation.
          </p>
        </FadeUp>
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FOUR_D_MODEL.map(d => (
            <FadeUp key={d.key}>
              <div className="relative bg-[#0D0D0D] border border-white/5 rounded-sm p-6 overflow-hidden h-full">
                <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: d.color }} />
                <div
                  className="w-10 h-10 rounded-sm flex items-center justify-center mb-4 text-sm font-black"
                  style={{
                    backgroundColor: `${d.color}15`,
                    color: d.color,
                    fontFamily: "'Arial Black', sans-serif",
                  }}
                >
                  {d.name.charAt(0)}
                </div>
                <h3
                  className="text-sm font-black tracking-wide uppercase mb-2"
                  style={{ color: d.color, fontFamily: "'Arial Black', sans-serif" }}
                >
                  {d.name}
                </h3>
                <p className="text-xs text-[#555] leading-relaxed">{d.description}</p>
              </div>
            </FadeUp>
          ))}
        </StaggerContainer>
        <FadeUp>
          <p className="text-[#333] text-xs tracking-wide mt-6 text-center">
            Applied across every division. From first session to elite pathway.
          </p>
        </FadeUp>
      </section>

      {/* Philosophy */}
      <section className="border-t border-white/5 px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <p className="text-[#C9A84C] text-[11px] tracking-[0.3em] uppercase mb-3">Our Philosophy</p>
            <h2
              className="text-4xl font-black tracking-wider text-white uppercase mb-4"
              style={{ fontFamily: "'Arial Black', sans-serif" }}
            >
              The Holistic <span style={{ color: '#C9A84C' }}>Intelligence</span> Model
            </h2>
            <p className="text-[#555] text-sm leading-relaxed mb-12 max-w-2xl">
              True development is multi-dimensional. Performance without character is incomplete.
              Skill without intelligence is unstable. Physical ability without education is fragile.
              We develop complete individuals.
            </p>
          </FadeUp>

          {/* 5 Intelligences */}
          <div className="mb-16">
            <FadeUp>
              <p className="text-[11px] tracking-[0.3em] uppercase text-[#444] mb-6">
                Five Forms of Intelligence
              </p>
            </FadeUp>
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {INTELLIGENCES.map((intel, i) => (
                <FadeUp key={intel.name}>
                  <div className="bg-[#0D0D0D] border border-white/5 rounded-sm p-5 relative overflow-hidden h-full">
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#C9A84C]" />
                    <p className="text-[10px] text-[#444] tracking-wider uppercase mb-2">
                      {String(i + 1).padStart(2, '0')}
                    </p>
                    <h3
                      className="text-xs font-black tracking-wide uppercase text-white mb-2"
                      style={{ fontFamily: "'Arial Black', sans-serif" }}
                    >
                      {intel.name}
                    </h3>
                    <p className="text-[11px] text-[#555] leading-relaxed">{intel.description}</p>
                  </div>
                </FadeUp>
              ))}
            </StaggerContainer>
          </div>

          {/* Coaching Approach */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
            <SlideIn direction="left">
              <div>
                <p className="text-[11px] tracking-[0.3em] uppercase text-[#444] mb-4">
                  Coaching & Delivery Approach
                </p>
                <div className="space-y-3">
                  {[
                    'Participant-centred delivery',
                    'Guided discovery learning',
                    'Constraints-led training environments',
                    'Reflective questioning over direct instruction',
                    'Long-term development over short-term outcomes',
                  ].map(item => (
                    <div key={item} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 bg-[#C9A84C]" />
                      <span className="text-sm text-[#666]">{item}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[#444] text-xs mt-4 leading-relaxed">
                  Coaches facilitate learning — they do not dominate it. Sessions are designed to
                  encourage independent thinking, promote problem-solving, and build intrinsic motivation.
                </p>
              </div>
            </SlideIn>

            {/* Mentoring Architecture */}
            <SlideIn direction="right">
              <div>
                <p className="text-[11px] tracking-[0.3em] uppercase text-[#444] mb-4">
                  4-Phase Mentoring Architecture
                </p>
                <div className="space-y-3">
                  {MENTORING_PHASES.map((phase, i) => (
                    <SlideIn key={phase.phase} direction="left" delay={i * 0.1}>
                      <div className="flex gap-4 items-start">
                        <div className="flex-shrink-0 w-8 h-8 rounded-sm bg-[#C9A84C]/10 flex items-center justify-center">
                          <span className="text-[10px] font-black text-[#C9A84C]" style={{ fontFamily: "'Arial Black', sans-serif" }}>
                            {phase.phase}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white uppercase tracking-wider">{phase.name}</p>
                          <p className="text-[11px] text-[#555] leading-relaxed mt-0.5">{phase.description}</p>
                        </div>
                      </div>
                    </SlideIn>
                  ))}
                </div>
                <p className="text-[#444] text-xs mt-4 leading-relaxed">
                  The goal is self-regulating individuals, not dependent performers. Responsibility
                  transitions progressively from mentor-led to participant-led.
                </p>
              </div>
            </SlideIn>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="border-t border-white/5 px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <p className="text-[#C9A84C] text-[11px] tracking-[0.3em] uppercase mb-3">What We Stand For</p>
            <h2
              className="text-4xl font-black tracking-wider text-white uppercase mb-3"
              style={{ fontFamily: "'Arial Black', sans-serif" }}
            >
              Our <span style={{ color: '#C9A84C' }}>Values</span>
            </h2>
            <p className="text-[#444] text-sm leading-relaxed mb-10 max-w-2xl">
              These are not motivational slogans. They are behavioural standards that shape decisions,
              communication, and daily conduct — embedded into the 4D Model, mentoring conversations,
              and every performance review.
            </p>
          </FadeUp>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {GTB_VALUES.map(v => (
              <FadeUp key={v.title}>
                <div className="relative bg-[#0D0D0D] border border-white/5 rounded-sm p-6 overflow-hidden h-full">
                  <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: v.color }} />
                  <h3
                    className="text-sm font-black tracking-wide uppercase mb-2"
                    style={{ color: v.color, fontFamily: "'Arial Black', sans-serif" }}
                  >
                    {v.title}
                  </h3>
                  <p className="text-xs text-[#555] leading-relaxed">{v.body}</p>
                </div>
              </FadeUp>
            ))}
          </StaggerContainer>

          {/* SDT Foundation */}
          <FadeUp>
            <div className="mt-10 bg-[#0D0D0D] border border-white/5 rounded-sm p-6">
              <p className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C] mb-4">
                Psychological Foundation
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { name: 'Autonomy', sub: 'Ownership of Development', body: 'Participants feel choice, voice, and responsibility appropriate to their maturity level.' },
                  { name: 'Mastery', sub: 'Measurable Progress', body: 'Structured progression models, transparent performance indicators, and actionable feedback.' },
                  { name: 'Belonging', sub: 'Meaningful Connection', body: 'Respectful communication, mentor relationships, and psychologically safe team environments.' },
                ].map(need => (
                  <div key={need.name}>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider mb-0.5"
                        style={{ fontFamily: "'Arial Black', sans-serif" }}>
                      {need.name}
                    </h4>
                    <p className="text-[10px] text-[#C9A84C] tracking-wider uppercase mb-2">{need.sub}</p>
                    <p className="text-[11px] text-[#555] leading-relaxed">{need.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20">
        <FadeUp>
          <div className="max-w-5xl mx-auto text-center border border-[#C9A84C]/20 rounded-sm p-12
                          bg-gradient-to-br from-[#111] to-[#0D0D0D] relative overflow-hidden">
            <div className="absolute inset-0 bg-[#C9A84C]/3 pointer-events-none" />
            <p className="text-[#C9A84C] text-[11px] tracking-[0.35em] uppercase mb-3">Join the Ecosystem</p>
            <h2
              className="text-3xl font-black tracking-wider mb-4 text-white uppercase"
              style={{ fontFamily: "'Arial Black', sans-serif" }}
            >
              Ready to <span style={{ color: '#C9A84C' }}>Start?</span>
            </h2>
            <p className="text-[#666] text-sm mb-8 max-w-md mx-auto">
              Create your profile today and become part of South East London&apos;s most ambitious
              development community.
            </p>
            <CTAButton
              href="/register"
              className="inline-flex items-center gap-2 bg-[#C9A84C] hover:bg-[#d4b055]
                         text-black font-black px-8 py-3.5 text-xs tracking-[0.15em]
                         uppercase transition-colors rounded-sm"
              style={{ fontFamily: "'Arial Black', sans-serif" }}
            >
              Create Your Profile
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </CTAButton>
          </div>
        </FadeUp>
      </section>
    </div>
  )
}
