import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import DivisionTabBar from '@/components/marketing/DivisionTabBar'
import FadeUp from '@/components/ui/motion/FadeUp'
import StaggerContainer from '@/components/ui/motion/StaggerContainer'
import AnimatedHeading from '@/components/ui/motion/AnimatedHeading'
import SlideIn from '@/components/ui/motion/SlideIn'
import CTAButton from '@/components/ui/motion/CTAButton'

type DivisionSlug = 'football' | 'fitness' | 'sports' | 'mentoring' | 'education'

interface DivisionContent {
  name: string
  slug: DivisionSlug
  tagline: string
  description: string
  color: string
  logo?: string
  stat: string
  statLabel: string
  ageRange: string
  fourDFocus: [string, string]
  crossDivision: string
  features: { title: string; body: string }[]
  programmes: { name: string; description: string; ages: string }[]
  keyBenefits: string[]
}

const DIVISION_CONTENT: Record<DivisionSlug, DivisionContent> = {
  football: {
    name: 'GTB Football',
    slug: 'football',
    logo: '/logos/gtb-football.png',
    tagline: 'Develop the Player. Build the Person.',
    description:
      'GTB Football develops football performance, decision-making, and competitive intelligence through guided discovery, constraints-led training, and reflective questioning. It builds technical fundamentals, tactical understanding, position-specific detail, psychological resilience, and match realism across all age phases — creating intelligent players who understand why decisions are made, not just how to execute techniques.',
    color: '#5BB8E8',
    stat: 'U5–U15+',
    statLabel: 'All Age Groups',
    ageRange: 'Under 5s to Under 15s and beyond',
    fourDFocus: ['Decision', 'Delivery'],
    crossDivision: 'Football sessions integrate with GTB Fitness for strength and conditioning, GTB Mentoring for mindset development, and GTB Education for sports science understanding. Participants on multi-discipline programmes move seamlessly between divisions.',
    features: [
      {
        title: 'Technical Development',
        body: 'Ball mastery, dual-foot development, passing, shooting, and positional play — coached through progressive drill structures and guided discovery that match each age group.',
      },
      {
        title: 'Tactical Intelligence',
        body: 'From basic shapes to advanced pressing systems — players learn to understand the game through scenario-based training, not just instruction. Decision-speed and scanning are coached explicitly.',
      },
      {
        title: 'Physical Conditioning',
        body: 'Age-appropriate strength and conditioning woven into every session, building athleticism and reducing injury risk. Integrated with GTB Fitness programming.',
      },
      {
        title: '1-on-1 Coaching',
        body: 'Dedicated individual sessions focused on specific development areas. Tracked against your Player Development Profile with measurable KPI progression.',
      },
      {
        title: 'Video Analysis',
        body: 'Gold tier members receive video analysis sessions reviewing match footage and training clips with coaching staff, reinforcing decision-making and tactical awareness.',
      },
      {
        title: 'Performance Tracking',
        body: 'Every session feeds into your PDP. KPIs tracked across all 4D dimensions so development is measurable, not just felt.',
      },
    ],
    programmes: [
      {
        name: 'Mini Kickers',
        description: 'Introduction to football through games and fun movement challenges. Drive through enjoyment, Decision through guided play.',
        ages: 'U5 – U7',
      },
      {
        name: 'Development Academy',
        description: 'Core technical and tactical development. Weekly training with monthly reviews against 4D benchmarks.',
        ages: 'U8 – U11',
      },
      {
        name: 'Performance Programme',
        description: 'High-intensity coaching with position-specific training, match analysis, and integrated mentoring support.',
        ages: 'U12 – U15+',
      },
      {
        name: '1-to-1 & Small Group Development Centre',
        description: 'Individual and small group sessions (2–4 players) focused on specific technical, tactical, or positional development. Tailored to the player\'s PDP and delivered by specialist GTB coaches.',
        ages: 'All ages',
      },
      {
        name: 'Analysis Service',
        description: 'Coming soon — video and data analysis of match footage and training sessions. Players receive a detailed breakdown of their decision-making, movement patterns, and technical execution against 4D benchmarks.',
        ages: 'U10+',
      },
    ],
    keyBenefits: [
      'Structured progression across all age groups',
      'Qualified coaching staff delivering guided discovery methodology',
      'Integrated PDP tracking every session across all 4D dimensions',
      'Video analysis for advanced players',
      'Cross-division fitness and mentoring integration',
      'Parent progress updates included',
    ],
  },
  fitness: {
    name: 'GTB Fitness',
    slug: 'fitness',
    logo: '/logos/gtb-fitness.png',
    tagline: 'Stronger Body. Stronger Mind.',
    description:
      'GTB Fitness develops physical performance, movement efficiency, strength progression, speed mechanics, and injury resilience across all ages. Delivery is rooted in long-term athletic development research, progressive overload principles, and movement competency screening. Participants are educated on recovery, nutrition, and self-monitoring — ensuring physical intelligence develops alongside performance capacity.',
    color: '#2E8B35',
    stat: 'Ages 8–18',
    statLabel: 'S&C Programme',
    ageRange: 'Ages 8 through 18',
    fourDFocus: ['Durability', 'Delivery'],
    crossDivision: 'Physical programmes directly support GTB Football performance and GTB Sports athleticism. Fitness participants can integrate sport-specific training to apply physical gains in competitive environments across the ecosystem.',
    features: [
      {
        title: 'Strength & Conditioning',
        body: 'Periodised S&C programmes designed for youth athletes. Builds strength through progressive overload without compromising long-term physical development.',
      },
      {
        title: 'Movement Screening',
        body: 'Initial movement assessment to identify imbalances and risks. Programming is adjusted based on your individual movement profile and competency level.',
      },
      {
        title: 'Speed & Agility',
        body: 'Sprint mechanics, change-of-direction, and reactive agility — the athletic attributes that underpin performance in every sport.',
      },
      {
        title: 'Injury Prevention',
        body: 'Prehab protocols, mobility work, and load management integrated into every training block. Durability is built, not left to chance.',
      },
      {
        title: 'Nutrition Guidance',
        body: 'Bronze tier and above receive access to performance nutrition resources through the education module, building physical intelligence.',
      },
      {
        title: 'Wellness Check-ins',
        body: 'Weekly energy, sleep, soreness, and mood check-ins tracked on your PDP to inform training load decisions and protect long-term development.',
      },
    ],
    programmes: [
      {
        name: 'Athletic Foundations',
        description: 'Fundamental movement skills, coordination, and basic strength for younger athletes. Durability through movement literacy.',
        ages: '8 – 11',
      },
      {
        name: 'Youth S&C',
        description: 'Progressive strength and conditioning programme with monthly performance testing and 4D tracking.',
        ages: '12 – 15',
      },
      {
        name: 'Elite Prep',
        description: 'High-performance training for athletes pursuing academy or elite pathways. Periodised and strategically managed.',
        ages: '15 – 18',
      },
      {
        name: 'PT & Online Fitness Coaching',
        description: 'Personal training sessions available in-person and online. Tailored fitness programmes delivered 1-to-1, tracking progress against your PDP across strength, conditioning, and physical intelligence goals.',
        ages: 'All ages',
      },
    ],
    keyBenefits: [
      'Age-appropriate S&C methodology based on LTAD research',
      'Movement screening and individual risk assessment',
      'Integrated with football and sports divisions',
      'Weekly wellness tracking on PDP',
      'Periodised programming blocks',
      'Performance testing every 4 weeks',
    ],
  },
  sports: {
    name: 'GTB Sports',
    slug: 'sports',
    logo: '/logos/gtb-sports.png',
    tagline: 'Every Sport. One Standard.',
    description:
      'GTB Sports delivers broad sports participation, school-based delivery, multi-sport exposure, and inclusive physical education. It strengthens coordination, teamwork, social development, and enjoyment of movement — acting as both an introduction to sport and a participation pathway for long-term involvement. Sessions blend structured coaching with educational frameworks aligned to school key stages.',
    color: '#E8641A',
    stat: 'Multi-Sport',
    statLabel: 'U5 – U16',
    ageRange: 'Under 5s to Under 16s',
    fourDFocus: ['Drive', 'Delivery'],
    crossDivision: 'Broad athletic foundations developed in GTB Sports feed directly into GTB Football and GTB Fitness specialisation pathways. School participants can transition into performance training, while talent identification signposts athletes toward appropriate progression routes.',
    features: [
      {
        title: 'Multi-Sport Curriculum',
        body: 'Structured exposure to football, basketball, athletics, cricket, and more — building universal athletic literacy and movement competence.',
      },
      {
        title: 'FUNdamentals',
        body: 'The core movement skills — run, jump, throw, catch — delivered through engaging, game-based sessions that build confidence and coordination.',
      },
      {
        title: 'Transition Support',
        body: 'As athletes specialise, GTB Sports builds the athletic base that makes specialisation more effective across any discipline.',
      },
      {
        title: 'Group Classes',
        body: 'Regular group sessions across multiple sports. Book by division or by sport type through the platform.',
      },
      {
        title: 'Competition Preparation',
        body: 'Athletes are prepared for inter-programme competitions and external tournaments throughout the year.',
      },
      {
        title: 'Cross-Division Integration',
        body: 'GTB Sports links directly with Football and Fitness divisions for athletes on multi-discipline programmes.',
      },
    ],
    programmes: [
      {
        name: 'Sports Explorers',
        description: 'Fun, high-energy multi-sport sessions introducing the joy of movement. Drive through enjoyment and exploration.',
        ages: 'U5 – U8',
      },
      {
        name: 'Multi-Sport Academy',
        description: 'Structured multi-sport programme with skill tracking, progression benchmarks, and 4D reflection.',
        ages: 'U9 – U12',
      },
      {
        name: 'Performance Sports',
        description: 'Competitive training environment across 3+ disciplines with performance reviews and pathway guidance.',
        ages: 'U13 – U16',
      },
      {
        name: 'Sports Events',
        description: 'Organised competitive sports events and tournaments across multiple disciplines. Open to GTB participants and external teams — building competitive experience and community.',
        ages: 'All ages',
      },
      {
        name: 'Birthday Parties',
        description: 'Themed multi-sport birthday party sessions delivered by GTB coaches. Fully organised, high-energy, and memorable — with optional add-ons for larger groups.',
        ages: 'U5 – U14',
      },
      {
        name: 'Holiday Camps',
        description: 'Full-day multi-sport holiday camps running across school holiday periods. Structured sessions, fun competitions, and cross-division taster experiences in a safe, engaging environment.',
        ages: 'U5 – U14',
      },
    ],
    keyBenefits: [
      'Exposure to 5+ sports disciplines',
      'Builds universal athletic competence',
      'Supports specialisation pathways into Football and Fitness',
      'Regular competitions and showcases',
      'Curriculum-aligned school delivery',
      'All sessions tracked in PDP',
    ],
  },
  mentoring: {
    name: 'GTB Mentoring',
    slug: 'mentoring',
    logo: '/logos/gtb-mentoring.png',
    tagline: 'Guide the Mind. Shape the Future.',
    description:
      'GTB Mentoring pairs young people with experienced mentors who understand both the demands of sport and the challenges of growing up in South East London. Operating through a structured four-phase architecture — Reflect, Explore, Action, Sustain — mentoring develops self-awareness, psychological literacy, and the internal motivation that sustains long-term development.',
    color: '#9B2454',
    stat: 'Ages 10–18',
    statLabel: '1:1 & Group',
    ageRange: 'Ages 10 through 18',
    fourDFocus: ['Drive', 'Decision'],
    crossDivision: 'Mentoring conversations connect across all divisions through the 4D Model and PDP. Whether supporting a footballer, a fitness participant, or a student in schools provision, mentoring reinforces the same behavioural standards and reflective processes.',
    features: [
      {
        title: '1-on-1 Mentoring',
        body: 'Dedicated mentor assignment for Silver and Gold tier members. Regular sessions following the 4-phase architecture: Reflect, Explore, Action, Sustain.',
      },
      {
        title: 'Goal Setting',
        body: 'Structured goal-setting sessions tracked through your PDP. Short-term actions mapped to long-term ambitions across all 4D dimensions.',
      },
      {
        title: 'Mental Performance',
        body: 'Resilience, confidence, focus, and pressure management — the psychological skills that separate good athletes from great ones.',
      },
      {
        title: 'Life Skills',
        body: 'Communication, leadership, time management, and decision-making — skills that matter beyond the pitch and translate into every environment.',
      },
      {
        title: 'Group Sessions',
        body: 'Facilitated group mentoring discussions on topics relevant to young people in sport and life, building relatedness and peer support.',
      },
      {
        title: 'Progress Reviews',
        body: 'Monthly reviews between athlete, mentor, and where appropriate, parents/guardians — tracking development against the GTB participant profile.',
      },
    ],
    programmes: [
      {
        name: 'Foundations',
        description: 'Introduction to mentoring: identity, values, personal goal setting. Building self-awareness through the Reflect phase.',
        ages: '10 – 13',
      },
      {
        name: 'Performance Mindset',
        description: 'Mental performance coaching integrated with athletic development goals. Explore and Action phases in depth.',
        ages: '13 – 16',
      },
      {
        name: 'Future Ready',
        description: 'Career pathways, leadership development, and transition coaching. Full participant-led ownership of the Sustain phase.',
        ages: '16 – 18',
      },
    ],
    keyBenefits: [
      'Dedicated mentor assignment (Silver & Gold)',
      'Structured 4-phase mentoring architecture',
      'Personal goal tracking on PDP across all 4D dimensions',
      'Mental performance framework',
      'Group and 1-on-1 formats',
      'Integrated with all 5 divisions',
    ],
  },
  education: {
    name: 'GTB Education',
    slug: 'education',
    logo: '/logos/gtb-education.png',
    tagline: 'Learn Today. Lead Tomorrow.',
    description:
      'GTB Education bridges the gap between sport and academic success. From GCSE support to applied sports science and life skills programmes, our tiered education content equips young people with the knowledge they need to make intelligent decisions — in sport, education, and life.',
    color: '#CC2222',
    stat: 'Ages 5–16',
    statLabel: 'Academic & Life Skills',
    ageRange: 'Ages 5 through 16',
    fourDFocus: ['Decision', 'Drive'],
    crossDivision: 'Educational content bridges academic achievement with sport-specific performance knowledge. Sports science modules support GTB Football and Fitness participants, while life skills programmes reinforce the mentoring architecture across the ecosystem.',
    features: [
      {
        title: 'Tiered Content Library',
        body: 'Bronze, Silver, and Gold content tiers unlock progressively advanced material — from foundational literacy to elite performance theory.',
      },
      {
        title: 'GCSE Support',
        body: 'Structured academic support resources aligned to the national curriculum for key stage 3 and 4 students.',
      },
      {
        title: 'Sports Science Modules',
        body: 'Applied sports science content covering nutrition, biomechanics, psychology, and physiology — building physical and decision intelligence.',
      },
      {
        title: 'Life Skills Programme',
        body: 'Financial literacy, communication, leadership, and career preparation modules for older age groups.',
      },
      {
        title: 'Live Sessions',
        body: 'Scheduled live educational sessions hosted by GTB educators and external experts. Access varies by tier.',
      },
      {
        title: 'Progress Tracking',
        body: 'Module completion tracked on your PDP. Certificates of completion issued for each completed unit.',
      },
    ],
    programmes: [
      {
        name: 'Learning Foundations',
        description: 'Early literacy, numeracy, and social development through sport-themed education.',
        ages: '5 – 8',
      },
      {
        name: 'Academic Accelerator',
        description: 'Curriculum-aligned academic support alongside sports science and life skills content.',
        ages: '9 – 13',
      },
      {
        name: 'Elite Scholars',
        description: 'GCSE support, advanced sports science, leadership, and future pathways planning.',
        ages: '14 – 16',
      },
    ],
    keyBenefits: [
      'Tiered content unlocked by programme tier',
      'GCSE-aligned academic resources',
      'Applied sports science modules building Decision intelligence',
      'Live sessions with GTB educators',
      'Completion certificates issued',
      'Integrated with your player development goals',
    ],
  },
}

export async function generateStaticParams() {
  return Object.keys(DIVISION_CONTENT).map(slug => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const division = DIVISION_CONTENT[slug as DivisionSlug]
  if (!division) return { title: 'GTB Development' }
  return { title: `${division.name} — GTB Development` }
}

export default async function DivisionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const division = DIVISION_CONTENT[slug as DivisionSlug]
  if (!division) notFound()

  const otherDivisions = Object.values(DIVISION_CONTENT).filter(d => d.slug !== division.slug)

  return (
    <div>
      {/* Division Tab Bar */}
      <DivisionTabBar />

      {/* Hero */}
      <section className="relative px-6 py-24 overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] blur-[120px] rounded-full pointer-events-none opacity-20"
          style={{ backgroundColor: division.color }}
        />
        <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ backgroundColor: division.color }} />

        <div className="relative max-w-5xl mx-auto">
          <FadeUp delay={0} className="flex items-center gap-2 mb-6">
            <div className="h-px w-6" style={{ backgroundColor: division.color }} />
            <span
              className="text-[11px] tracking-[0.35em] uppercase"
              style={{ color: division.color }}
            >
              GTB Division
            </span>
          </FadeUp>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <AnimatedHeading
                as="h1"
                className="text-5xl md:text-6xl font-black tracking-tight leading-[0.9] mb-5 text-white uppercase"
                lines={[
                  <span key="title">GTB <span style={{ color: division.color }}>{division.slug.charAt(0).toUpperCase() + division.slug.slice(1)}</span></span>,
                ]}
              />
              <FadeUp delay={0.1} className="text-[#555] text-sm mb-3 tracking-wide italic">
                &ldquo;{division.tagline}&rdquo;
              </FadeUp>
              <FadeUp delay={0.15} className="text-[#444] text-sm leading-relaxed mb-8">
                {division.description}
              </FadeUp>
              <FadeUp delay={0.25} className="flex flex-col sm:flex-row gap-3">
                <CTAButton
                  href="/register"
                  className="inline-flex items-center gap-2 font-black px-6 py-3 text-xs
                             tracking-[0.15em] uppercase transition-colors rounded-sm text-black"
                  style={{ backgroundColor: division.color, fontFamily: "'Arial Black', sans-serif" }}
                >
                  Join This Division
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </CTAButton>
                <CTAButton
                  href="/contact"
                  className="inline-flex items-center gap-2 border border-white/10 hover:border-white/25
                             text-white/60 hover:text-white px-6 py-3 text-xs tracking-[0.15em]
                             uppercase transition-all rounded-sm"
                >
                  Enquire
                </CTAButton>
              </FadeUp>
            </div>

            {/* Logo + Stats */}
            <FadeUp delay={0.2}>
              <div>
                {division.logo && (
                  <div className="mb-6 rounded-sm overflow-hidden border border-white/5">
                    <Image
                      src={division.logo}
                      alt={`${division.name} logo`}
                      width={560}
                      height={315}
                      className="w-full object-cover"
                      priority
                    />
                  </div>
                )}
                <StaggerContainer className="grid grid-cols-2 gap-4">
                  {[
                    { label: division.statLabel, value: division.stat },
                    { label: 'Programmes', value: String(division.programmes.length) },
                    { label: 'Age Range', value: division.ageRange, small: true },
                    { label: '4D Focus', value: division.fourDFocus.join(' + '), small: true },
                  ].map(item => (
                    <FadeUp key={item.label}>
                      <div className="bg-[#0D0D0D] border border-white/5 rounded-sm p-5 relative overflow-hidden h-full">
                        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: division.color }} />
                        {item.small ? (
                          <>
                            <p className="text-[11px] text-[#444] uppercase tracking-wider mb-1">{item.label}</p>
                            <p className="text-sm text-white">{item.value}</p>
                          </>
                        ) : (
                          <>
                            <p className="text-2xl font-black text-white mb-1" style={{ fontFamily: "'Arial Black', sans-serif" }}>{item.value}</p>
                            <p className="text-[11px] text-[#444] uppercase tracking-wider">{item.label}</p>
                          </>
                        )}
                      </div>
                    </FadeUp>
                  ))}
                </StaggerContainer>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <p
              className="text-[11px] tracking-[0.3em] uppercase mb-3"
              style={{ color: division.color }}
            >
              What&apos;s Included
            </p>
            <h2
              className="text-4xl font-black tracking-wider text-white uppercase mb-10"
              style={{ fontFamily: "'Arial Black', sans-serif" }}
            >
              Division <span style={{ color: division.color }}>Features</span>
            </h2>
          </FadeUp>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {division.features.map(f => (
              <FadeUp key={f.title}>
                <div
                  className="relative bg-[#0D0D0D] border border-white/5 rounded-sm p-5 overflow-hidden h-full"
                >
                  <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: division.color }} />
                  <h3
                    className="text-xs font-black tracking-wide uppercase mb-2"
                    style={{ color: division.color, fontFamily: "'Arial Black', sans-serif" }}
                  >
                    {f.title}
                  </h3>
                  <p className="text-xs text-[#555] leading-relaxed">{f.body}</p>
                </div>
              </FadeUp>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Programmes */}
      <section className="px-6 py-20 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <p
              className="text-[11px] tracking-[0.3em] uppercase mb-3"
              style={{ color: division.color }}
            >
              Programme Structure
            </p>
            <h2
              className="text-4xl font-black tracking-wider text-white uppercase mb-10"
              style={{ fontFamily: "'Arial Black', sans-serif" }}
            >
              Our <span style={{ color: division.color }}>Programmes</span>
            </h2>
          </FadeUp>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {division.programmes.map((prog, i) => (
              <FadeUp key={prog.name}>
                <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden h-full">
                  <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                    <span
                      className="text-[11px] tracking-[0.3em] uppercase font-black"
                      style={{ color: division.color, fontFamily: "'Arial Black', sans-serif" }}
                    >
                      Programme {i + 1}
                    </span>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-sm"
                      style={{ backgroundColor: `${division.color}20`, color: division.color }}
                    >
                      {prog.ages}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="text-sm font-bold text-white mb-2">{prog.name}</h3>
                    <p className="text-xs text-[#555] leading-relaxed">{prog.description}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Key benefits */}
      <section className="px-6 py-20 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <SlideIn direction="left">
              <div>
                <p
                  className="text-[11px] tracking-[0.3em] uppercase mb-3"
                  style={{ color: division.color }}
                >
                  Why Choose This Division
                </p>
                <h2
                  className="text-4xl font-black tracking-wider text-white uppercase mb-6"
                  style={{ fontFamily: "'Arial Black', sans-serif" }}
                >
                  Key <span style={{ color: division.color }}>Benefits</span>
                </h2>
                <div className="space-y-3">
                  {division.keyBenefits.map((b, i) => (
                    <FadeUp key={b} delay={i * 0.07}>
                      <div className="flex items-start gap-3">
                        <div
                          className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                          style={{ backgroundColor: division.color }}
                        />
                        <span className="text-sm text-[#666]">{b}</span>
                      </div>
                    </FadeUp>
                  ))}
                </div>
              </div>
            </SlideIn>

            {/* CTA card */}
            <SlideIn direction="right">
              <div
                className="bg-[#0D0D0D] border rounded-sm p-8 relative overflow-hidden"
                style={{ borderColor: `${division.color}30` }}
              >
                <div
                  className="absolute inset-0 opacity-5 pointer-events-none"
                  style={{ backgroundColor: division.color }}
                />
                <p
                  className="text-[11px] tracking-[0.3em] uppercase mb-3"
                  style={{ color: division.color }}
                >
                  Get Started
                </p>
                <h3
                  className="text-2xl font-black text-white uppercase mb-3"
                  style={{ fontFamily: "'Arial Black', sans-serif" }}
                >
                  Ready to Join?
                </h3>
                <p className="text-xs text-[#555] leading-relaxed mb-6">
                  Tiers are assigned by GTB staff based on your programme. Contact us to find out
                  which programme is right for you, or create your profile and we&apos;ll be in touch.
                </p>
                <div className="space-y-3">
                  <CTAButton
                    href="/register"
                    className="flex items-center justify-center gap-2 font-black px-5 py-3 text-xs
                               tracking-[0.15em] uppercase transition-colors rounded-sm text-black w-full"
                    style={{ backgroundColor: division.color, fontFamily: "'Arial Black', sans-serif" }}
                  >
                    Create Your Profile
                  </CTAButton>
                  <CTAButton
                    href="/contact"
                    className="flex items-center justify-center gap-2 border border-white/10 hover:border-white/20
                               text-white/50 hover:text-white px-5 py-3 text-xs tracking-[0.15em]
                               uppercase transition-all rounded-sm w-full"
                  >
                    Speak to the Team
                  </CTAButton>
                </div>
              </div>
            </SlideIn>
          </div>
        </div>
      </section>

      {/* Cross-Division Connection + Other Divisions */}
      <section className="px-6 py-20 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          {/* Cross-division narrative */}
          <div className="mb-12">
            <FadeUp>
              <p className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C] mb-3">
                One Ecosystem
              </p>
              <h2
                className="text-4xl font-black tracking-wider text-white uppercase mb-4"
                style={{ fontFamily: "'Arial Black', sans-serif" }}
              >
                Explore the <span style={{ color: '#C9A84C' }}>Ecosystem</span>
              </h2>
              <p className="text-[#555] text-sm leading-relaxed max-w-2xl">
                {division.crossDivision}
              </p>
            </FadeUp>
          </div>

          {/* Other division cards */}
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {otherDivisions.map(d => (
              <FadeUp key={d.slug}>
                <Link
                  href={`/divisions/${d.slug}`}
                  className="group relative bg-[#0D0D0D] border border-white/5 hover:border-white/10 rounded-sm p-5 overflow-hidden transition-colors block h-full"
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-[2px]"
                    style={{ backgroundColor: d.color }}
                  />
                  <div className="flex items-start justify-between mb-3">
                    <h3
                      className="text-sm font-black tracking-wide uppercase"
                      style={{ color: d.color, fontFamily: "'Arial Black', sans-serif" }}
                    >
                      {d.name.replace('GTB ', '')}
                    </h3>
                    <svg
                      className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5"
                      style={{ color: d.color }}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </div>
                  <p className="text-xs text-[#555] italic mb-2">&ldquo;{d.tagline}&rdquo;</p>
                  <p className="text-[10px] text-[#444] tracking-wider uppercase">{d.stat} · {d.statLabel}</p>
                </Link>
              </FadeUp>
            ))}
          </StaggerContainer>
        </div>
      </section>
    </div>
  )
}
