'use client'

import { useState } from 'react'

const ENQUIRY_TYPES = [
  {
    title: 'General Enquiry',
    who: 'Anyone',
    description:
      "Not sure where your question fits? Send us a general enquiry and we'll direct it to the right person. No question is too small — we'd rather you ask than not.",
    include: 'As much detail as possible about what you need so we can point you in the right direction.',
    color: '#C9A84C',
    tag: 'General',
  },
  {
    title: 'Football Division',
    who: 'Players, parents & coaches',
    description:
      'GTB Football develops game intelligence, decision-making, and competitive performance through guided discovery and constraints-led training. We run programmes across all age phases from Mini Kickers (U5) through to adult.',
    include: 'Age of participant, current level, whether you\'re looking for a trial or a full programme.',
    color: '#5BB8E8',
    tag: 'Football',
  },
  {
    title: 'Fitness Division',
    who: 'Individuals aged 8–18',
    description:
      'GTB Fitness builds physical intelligence through youth-specific strength & conditioning, movement screening, and progressive overload. Not just performance training — we build durability and long-term athletic development.',
    include: 'Age, current fitness background, any specific goals or physical targets.',
    color: '#2E8B35',
    tag: 'Fitness',
  },
  {
    title: 'Sports Division',
    who: 'Players aged U5–U16 & schools',
    description:
      'GTB Sports delivers multi-sport participation for broad athletic development. Whether through schools, after-school provision, or holiday camps — we build the physical and social foundations that feed into all specialisation pathways.',
    include: 'Age group, whether individual or school/group booking, type of sports provision needed.',
    color: '#E8641A',
    tag: 'Sports',
  },
  {
    title: 'Mentoring',
    who: 'Individuals aged 10–18',
    description:
      'Our mentoring programme uses the 4D Model to support confidence, focus, resilience, and personal direction — on and off the pitch. Sessions run 1:1 and in small groups, following the Reflect → Explore → Action → Sustain framework.',
    include: 'Age, current challenges or goals (academic, social, or performance), whether 1:1 or group is preferred.',
    color: '#9B2454',
    tag: 'Mentoring',
  },
  {
    title: 'Education',
    who: 'Students aged 5–16 & schools',
    description:
      'GTB Education bridges sport and academic development — combining life skills, sports science, and curriculum-linked content. We work in partnership with schools to deliver structured educational programmes that develop the whole person.',
    include: 'Whether individual or school enquiry, year groups involved, type of provision needed.',
    color: '#CC2222',
    tag: 'Education',
  },
  {
    title: 'Pricing & Tiers',
    who: 'Parents, participants & schools',
    description:
      'Every GTB programme has clear pricing and session structures. Whether you\'re asking about a single division, a multi-discipline package, or school block booking rates — we can walk you through all available options.',
    include: 'Which division(s) you\'re interested in, number of participants, and any budget considerations.',
    color: '#C9A84C',
    tag: 'Pricing',
  },
  {
    title: 'Platform Support',
    who: 'Registered users',
    description:
      'Having trouble accessing your account, bookings, or the participant dashboard? Our team can help with login issues, session management, and any technical problems with the GTB platform.',
    include: 'Your registered email address, a description of the issue, and any error messages you\'ve seen.',
    color: '#888888',
    tag: 'Support',
  },
  {
    title: 'Partnership',
    who: 'Schools, organisations & businesses',
    description:
      'GTB actively partners with schools, sports clubs, local authorities, and organisations that share our commitment to holistic youth development. If you\'d like to explore a formal partnership, we\'d love to start a conversation.',
    include: 'Organisation name, type of partnership you have in mind, and the age groups or communities you serve.',
    color: '#C9A84C',
    tag: 'Partnership',
  },
]

export default function EnquiryCarousel() {
  const [current, setCurrent] = useState(0)

  const prev = () => setCurrent(i => (i === 0 ? ENQUIRY_TYPES.length - 1 : i - 1))
  const next = () => setCurrent(i => (i === ENQUIRY_TYPES.length - 1 ? 0 : i + 1))

  const item = ENQUIRY_TYPES[current]

  return (
    <div className="space-y-4">
      {/* Slide */}
      <div
        className="bg-[#111] border border-white/5 rounded-sm overflow-hidden transition-all duration-300"
        style={{ borderTop: `2px solid ${item.color}` }}
      >
        {/* Top bar — counter + nav */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            {ENQUIRY_TYPES.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className="transition-all duration-200 rounded-full"
                style={{
                  width: i === current ? '20px' : '6px',
                  height: '6px',
                  backgroundColor: i === current ? item.color : '#333',
                }}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
          <span className="text-[10px] text-[#444] tabular-nums">
            {current + 1} / {ENQUIRY_TYPES.length}
          </span>
        </div>

        {/* Content */}
        <div className="p-6 min-h-[220px] flex flex-col gap-4">
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase mb-1.5" style={{ color: item.color }}>
              {item.who}
            </p>
            <h3
              className="text-xl font-black uppercase tracking-tight text-white"
              style={{ fontFamily: "'Arial Black', sans-serif" }}
            >
              {item.title}
            </h3>
          </div>

          <p className="text-sm text-[#888] leading-relaxed flex-1">{item.description}</p>

          <div className="border-t border-white/5 pt-4">
            <p className="text-[10px] text-[#444] uppercase tracking-wider mb-1">
              Include in your message
            </p>
            <p className="text-xs text-[#666] leading-relaxed">{item.include}</p>
          </div>
        </div>

        {/* Prev / Next */}
        <div className="flex border-t border-white/5">
          <button
            onClick={prev}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 text-xs text-[#555] hover:text-white hover:bg-white/[0.03] transition-colors border-r border-white/5"
          >
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Previous
          </button>
          <button
            onClick={next}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 text-xs text-[#555] hover:text-white hover:bg-white/[0.03] transition-colors"
          >
            Next
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Quick-pick labels */}
      <div className="flex flex-wrap gap-2">
        {ENQUIRY_TYPES.map((t, i) => (
          <button
            key={t.title}
            onClick={() => setCurrent(i)}
            className="text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-sm border transition-colors"
            style={
              i === current
                ? { borderColor: t.color, color: t.color, backgroundColor: `${t.color}15` }
                : { borderColor: '#1a1a1a', color: '#444', backgroundColor: 'transparent' }
            }
          >
            {t.tag}
          </button>
        ))}
      </div>
    </div>
  )
}
