import Link from 'next/link'
import MarketingNav from '@/components/layout/MarketingNav'
import MarketingFooter from '@/components/layout/MarketingFooter'
import ParticleField from '@/components/marketing/ParticleField'
import CountUp from '@/components/marketing/CountUp'
import FadeUp from '@/components/ui/motion/FadeUp'
import StaggerContainer from '@/components/ui/motion/StaggerContainer'
import AnimatedHeading from '@/components/ui/motion/AnimatedHeading'
import ColourBarReveal from '@/components/ui/motion/ColourBarReveal'
import CTAButton from '@/components/ui/motion/CTAButton'
import ScrollReveal3D from '@/components/ui/motion/ScrollReveal3D'
import TiltCard from '@/components/ui/motion/TiltCard'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white overflow-x-hidden">

      <MarketingNav />

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Particle field */}
        <ParticleField />
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px]
                        bg-[#C9A84C]/6 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative max-w-5xl mx-auto">
          {/* Eyebrow */}
          <FadeUp delay={0} className="flex items-center gap-2 mb-8 justify-center">
            <div className="h-px w-8 bg-[#C9A84C]" />
            <span className="text-[#C9A84C] text-[11px] tracking-[0.35em] uppercase font-medium">
              GTB Development Ltd · South East London
            </span>
            <div className="h-px w-8 bg-[#C9A84C]" />
          </FadeUp>

          {/* Main headline */}
          <AnimatedHeading
            as="h1"
            className="text-[clamp(56px,10vw,120px)] font-black leading-[0.9] tracking-tight text-center mb-8"
            lineClassName=""
            lines={[
              'GROWTH.',
              <span key="train" style={{
                background: 'linear-gradient(135deg, #C9A84C 0%, #F0D080 50%, #A88535 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                TRAIN.
              </span>,
              'BUILD.',
            ]}
          />

          {/* Taglines */}
          <FadeUp delay={0.2} className="text-center text-[#666] text-lg tracking-wide mb-2">
            One Ecosystem. Limitless Development.
          </FadeUp>
          <FadeUp delay={0.25} className="text-center text-[#C9A84C]/80 text-sm tracking-[0.2em] uppercase mb-3">
            &ldquo;I Own My Development&rdquo;
          </FadeUp>
          <FadeUp delay={0.3} className="text-center text-[#444] text-xs tracking-wide mb-12">
            Holistic development is the foundation — not an add-on.
          </FadeUp>

          {/* CTAs */}
          <FadeUp delay={0.4} className="flex flex-col sm:flex-row gap-3 justify-center">
            <CTAButton
              href="/register"
              className="btn-shimmer group relative overflow-hidden bg-[#C9A84C] hover:bg-[#d4b055]
                         text-black font-black px-8 py-3.5 text-xs tracking-[0.15em] uppercase
                         transition-all rounded-sm flex items-center justify-center gap-2"
              style={{ fontFamily: "'Arial Black', sans-serif" }}
            >
              Join GTB
              <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </CTAButton>
            <CTAButton
              href="/login"
              className="border border-white/10 hover:border-white/25 text-white/70 hover:text-white
                         px-8 py-3.5 text-xs tracking-[0.15em] uppercase transition-all rounded-sm
                         flex items-center justify-center backdrop-blur-sm"
            >
              Sign In
            </CTAButton>
          </FadeUp>
        </div>
      </section>

      {/* Division colour bar */}
      <div className="max-w-5xl mx-auto">
        <ColourBarReveal />
      </div>

      {/* Stats bar */}
      <section className="border-t border-white/5 py-14 px-6">
        <ScrollReveal3D rotateXFrom={8} yFrom={30} offset={['start 95%', 'start 40%']}>
          <StaggerContainer className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { count: 5,   suffix: '',   label: 'Divisions' },
              { count: 500, suffix: '+',  label: 'Participants' },
              { count: 10,  suffix: '+',  label: 'Years Experience' },
              { count: 1,   suffix: '',   label: 'Ecosystem' },
            ].map(s => (
              <FadeUp key={s.label} className="text-center">
                <p className="text-3xl font-black text-[#C9A84C] mb-1 tabular-nums"
                   style={{ fontFamily: "'Arial Black', sans-serif" }}>
                  <CountUp value={s.count} suffix={s.suffix} />
                </p>
                <p className="text-[11px] text-[#444] tracking-[0.2em] uppercase">{s.label}</p>
              </FadeUp>
            ))}
          </StaggerContainer>
        </ScrollReveal3D>
      </section>

      {/* Age phases */}
      <section className="border-t border-white/5 px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <FadeUp className="text-center mb-10">
            <p className="text-[#C9A84C] text-[11px] tracking-[0.35em] uppercase mb-3">Five Development Phases</p>
            <h2 className="text-3xl font-black tracking-wider text-white uppercase mb-3"
                style={{ fontFamily: "'Arial Black', sans-serif" }}>
              Every <span style={{ color: '#C9A84C' }}>Age.</span> Every <span style={{ color: '#C9A84C' }}>Stage.</span>
            </h2>
            <p className="text-[#555] text-sm max-w-xl mx-auto">
              GTB Football develops players from first kick to pro pathway. Each phase has its own identity, language, and approach — adapted to what that player needs most.
            </p>
          </FadeUp>
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {[
              { phase: 'Early Years', ages: 'U5–U6', identity: 'I Enjoy Moving & Playing.', accent: '#5BB8E8' },
              { phase: 'Pre-Academy', ages: 'U7–U9', identity: 'I Love Having the Ball.', accent: '#9B2454' },
              { phase: 'Foundation', ages: 'U10–U12', identity: 'I Am Building My Game.', accent: '#C9A84C' },
              { phase: 'Youth', ages: 'U13–U16', identity: 'I Own My Development.', accent: '#2E8B35' },
              { phase: 'Pro Pathway', ages: '16+', identity: 'I Drive My Performance.', accent: '#CC2222' },
            ].map(p => (
              <FadeUp key={p.phase}>
                <TiltCard maxTilt={6} shine>
                  <div className="bg-[#0D0D0D] border border-white/5 rounded-sm p-4 relative overflow-hidden text-center h-full">
                    <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: p.accent }} />
                    <p className="text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: p.accent, fontFamily: "'Arial Black', sans-serif" }}>{p.phase}</p>
                    <p className="text-xs text-white font-medium mb-2">{p.ages}</p>
                    <p className="text-[10px] text-[#444] italic leading-relaxed">&ldquo;{p.identity}&rdquo;</p>
                  </div>
                </TiltCard>
              </FadeUp>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* GTB Learning Flow */}
      <section className="border-t border-white/5 px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <FadeUp className="text-center mb-10">
            <p className="text-[#C9A84C] text-[11px] tracking-[0.35em] uppercase mb-3">GTB Learning Flow</p>
            <h2 className="text-3xl font-black tracking-wider text-white uppercase"
                style={{ fontFamily: "'Arial Black', sans-serif" }}>
              How We <span style={{ color: '#C9A84C' }}>Develop</span>
            </h2>
          </FadeUp>
          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { step: '01', name: 'Reflect', description: 'Video, discussion, prior experience. What do you already know?', colour: '#C9A84C' },
              { step: '02', name: 'Explore', description: 'Guided learning. Coach introduces the concept through demonstration.', colour: '#5BB8E8' },
              { step: '03', name: 'Action', description: 'Training sessions, small-sided games. Try the concept for real.', colour: '#2E8B35' },
              { step: '04', name: 'Sustain', description: 'Journaling, PDP tracking, repetition habits. Make it stick.', colour: '#CC2222' },
            ].map((s, i) => (
              <ScrollReveal3D key={s.step} rotateXFrom={10 + i * 2} yFrom={40 + i * 10} offset={['start 90%', 'center 60%']}>
                <TiltCard maxTilt={5} shine className="h-full">
                  <div className="bg-[#0D0D0D] border border-white/5 rounded-sm p-5 relative overflow-hidden h-full">
                    <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: s.colour }} />
                    <p className="text-[10px] text-[#333] tracking-wider mb-1">{s.step}</p>
                    <h3 className="text-sm font-black uppercase tracking-wide mb-2" style={{ color: s.colour, fontFamily: "'Arial Black', sans-serif" }}>{s.name}</h3>
                    <p className="text-[11px] text-[#555] leading-relaxed">{s.description}</p>
                  </div>
                </TiltCard>
              </ScrollReveal3D>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="px-6 py-20">
        <FadeUp>
          <div className="max-w-5xl mx-auto relative overflow-hidden rounded-sm border border-[#C9A84C]/20
                          bg-gradient-to-br from-[#111] to-[#0D0D0D] p-12 text-center">
            <div className="absolute inset-0 bg-[#C9A84C]/3 pointer-events-none" />
            <p className="text-[#C9A84C] text-[11px] tracking-[0.35em] uppercase mb-3">
              Player Development Platform
            </p>
            <h2 className="text-3xl font-black tracking-wider mb-4 text-white"
                style={{ fontFamily: "'Arial Black', sans-serif" }}>
              YOUR JOURNEY STARTS HERE
            </h2>
            <p className="text-[#666] text-sm mb-8 max-w-lg mx-auto">
              Five divisions. One shared culture. Every session built on the same developmental DNA —
              creating complete athletes, not just able players.
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

      <MarketingFooter />
    </div>
  )
}
