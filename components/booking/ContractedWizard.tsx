'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const PROGRAMMES = [
  {
    id: 'football-6w',
    name: '6-Week Football Academy',
    division: 'football',
    divisionName: 'GTB Football',
    color: '#5BB8E8',
    duration: '6 weeks',
    sessionsPerWeek: 3,
    depositPence: 5000,
    description: 'Intensive 6-week football development programme with technical, tactical, and physical sessions.',
    minTier: 'Bronze',
  },
  {
    id: 'fitness-8w',
    name: '8-Week S&C Block',
    division: 'fitness',
    divisionName: 'GTB Fitness',
    color: '#2E8B35',
    duration: '8 weeks',
    sessionsPerWeek: 2,
    depositPence: 4000,
    description: 'Progressive strength and conditioning block with monthly performance testing and programme adjustments.',
    minTier: 'Bronze',
  },
  {
    id: 'sports-term',
    name: 'Term-Time Sports Programme',
    division: 'sports',
    divisionName: 'GTB Sports',
    color: '#E8641A',
    duration: '10 weeks',
    sessionsPerWeek: 2,
    depositPence: 4500,
    description: 'Multi-sport development programme aligned to the school term. Covers 3+ sports disciplines.',
    minTier: 'Free',
  },
  {
    id: 'mentoring-12w',
    name: '12-Week Mentoring Programme',
    division: 'mentoring',
    divisionName: 'GTB Mentoring',
    color: '#9B2454',
    duration: '12 weeks',
    sessionsPerWeek: 1,
    depositPence: 3000,
    description: 'Structured mentoring programme with goal setting, progress reviews, and life skills development.',
    minTier: 'Silver',
  },
]

const STEPS = ['Select Programme', 'Set Dates', 'Confirm']

type Programme = typeof PROGRAMMES[number]

export default function ContractedWizard({ clientId }: { clientId: string }) {
  const [step, setStep] = useState(0)
  const [selected, setSelected] = useState<Programme | null>(null)
  const [startDate, setStartDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  const supabase = createClient()

  // Calculate end date based on programme duration
  function getEndDate(start: string, programme: Programme): string {
    if (!start) return ''
    const weeks = parseInt(programme.duration)
    const end = new Date(start)
    end.setDate(end.getDate() + weeks * 7)
    return end.toISOString().split('T')[0]
  }

  async function handleConfirm() {
    if (!selected || !startDate) return
    setLoading(true)

    const start = new Date(startDate)
    const end = new Date(getEndDate(startDate, selected))

    await supabase.from('bookings').insert({
      client_id: clientId,
      booking_type: 'contracted',
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      status: 'pending',
      deposit_pence: selected.depositPence,
    })

    setConfirmed(true)
    setLoading(false)
  }

  const minDate = new Date()
  minDate.setDate(minDate.getDate() + 3)
  const minDateStr = minDate.toISOString().split('T')[0]

  if (confirmed && selected) {
    return (
      <div className="bg-[#0D0D0D] border border-white/5 rounded-sm p-12 text-center max-w-md mx-auto">
        <div className="w-12 h-12 rounded-sm bg-[#2E8B35]/15 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-[#2E8B35]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-xl font-black text-white uppercase mb-2" style={{ fontFamily: "'Arial Black', sans-serif" }}>
          Application Submitted
        </p>
        <p className="text-sm text-[#444] mb-6">
          Your application for <strong className="text-white">{selected.name}</strong> has been submitted. GTB staff will confirm your placement within 24 hours.
        </p>
        <Link
          href="/bookings"
          className="inline-block bg-[#C9A84C] hover:bg-[#d4b055] text-black font-black px-6 py-2.5
                     text-xs tracking-[0.12em] uppercase rounded-sm transition-colors"
          style={{ fontFamily: "'Arial Black', sans-serif" }}
        >
          View Bookings
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-sm text-xs uppercase tracking-wider transition-colors ${
              i === step
                ? 'bg-[#C9A84C] text-black font-black'
                : i < step
                  ? 'text-[#C9A84C] bg-[#C9A84C]/10'
                  : 'text-[#333] bg-[#0D0D0D] border border-white/5'
            }`}
            style={i === step ? { fontFamily: "'Arial Black', sans-serif" } : undefined}
            >
              <span>{i + 1}</span>
              <span>{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-6 h-px ${i < step ? 'bg-[#C9A84C]/40' : 'bg-white/10'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 0: Programme selection */}
      {step === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PROGRAMMES.map(prog => (
            <button
              key={prog.id}
              onClick={() => { setSelected(prog); setStep(1) }}
              className="bg-[#0D0D0D] border border-white/5 hover:border-white/15 rounded-sm p-5
                         text-left relative overflow-hidden transition-colors"
            >
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: prog.color }} />
              <div className="flex items-center justify-between mb-3">
                <span
                  className="text-[11px] tracking-[0.2em] uppercase font-black"
                  style={{ color: prog.color, fontFamily: "'Arial Black', sans-serif" }}
                >
                  {prog.divisionName}
                </span>
                <span
                  className="text-[10px] px-2 py-0.5 rounded-sm"
                  style={{ backgroundColor: `${prog.color}20`, color: prog.color }}
                >
                  {prog.minTier}+
                </span>
              </div>
              <p className="text-sm font-medium text-white mb-2">{prog.name}</p>
              <p className="text-xs text-[#444] leading-relaxed mb-4">{prog.description}</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Duration', value: prog.duration },
                  { label: 'Per Week', value: `${prog.sessionsPerWeek} sessions` },
                  { label: 'Deposit', value: `£${prog.depositPence / 100}` },
                ].map(s => (
                  <div key={s.label}>
                    <p className="text-[10px] text-[#333] uppercase tracking-wider mb-0.5">{s.label}</p>
                    <p className="text-xs text-white">{s.value}</p>
                  </div>
                ))}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Step 1: Set dates */}
      {step === 1 && selected && (
        <div className="max-w-md">
          <div className="flex items-center justify-between mb-5">
            <p className="text-[11px] tracking-[0.3em] uppercase" style={{ color: selected.color }}>
              {selected.name}
            </p>
            <button
              onClick={() => setStep(0)}
              className="text-xs text-[#444] hover:text-white uppercase tracking-wider transition-colors"
            >
              ← Back
            </button>
          </div>
          <div className="bg-[#0D0D0D] border border-white/5 rounded-sm p-5 mb-4">
            <label className="block text-xs text-[#666] mb-1.5 uppercase tracking-wider">
              Programme Start Date
            </label>
            <input
              type="date"
              min={minDateStr}
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full bg-[#141414] border border-white/[0.08] text-white rounded-sm px-4 py-3 text-sm
                         focus:outline-none focus:border-[#C9A84C]/60 transition-colors"
            />
            {startDate && (
              <p className="text-[11px] text-[#444] mt-2">
                Programme ends: {new Date(getEndDate(startDate, selected)).toLocaleDateString('en-GB', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </p>
            )}
          </div>
          <button
            onClick={() => startDate && setStep(2)}
            disabled={!startDate}
            className="w-full bg-[#C9A84C] hover:bg-[#d4b055] disabled:opacity-40 disabled:cursor-not-allowed
                       text-black font-black py-3 px-4 rounded-sm text-xs tracking-[0.15em] uppercase transition-colors"
            style={{ fontFamily: "'Arial Black', sans-serif" }}
          >
            Continue
          </button>
        </div>
      )}

      {/* Step 2: Confirm */}
      {step === 2 && selected && startDate && (
        <div className="max-w-md">
          <div className="flex items-center justify-between mb-5">
            <p className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">Confirm Programme</p>
            <button
              onClick={() => setStep(1)}
              className="text-xs text-[#444] hover:text-white uppercase tracking-wider transition-colors"
            >
              ← Back
            </button>
          </div>
          <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden mb-4">
            <div className="px-5 py-4 border-b border-white/5">
              <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">Programme Summary</span>
            </div>
            <div className="p-5 space-y-3">
              {[
                { label: 'Programme', value: selected.name },
                { label: 'Division', value: selected.divisionName },
                { label: 'Start Date', value: new Date(startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) },
                { label: 'End Date', value: new Date(getEndDate(startDate, selected)).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) },
                { label: 'Duration', value: selected.duration },
                { label: 'Sessions/Week', value: `${selected.sessionsPerWeek}` },
                { label: 'Deposit Required', value: `£${selected.depositPence / 100}.00` },
              ].map(row => (
                <div key={row.label} className="flex justify-between text-sm">
                  <span className="text-[#444]">{row.label}</span>
                  <span className="text-white">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-[#0D0D0D] border border-white/5 rounded-sm p-4 mb-5">
            <p className="text-[11px] text-[#444] leading-relaxed">
              A deposit of <strong className="text-white">£{selected.depositPence / 100}</strong> is required to confirm your place.
              GTB staff will contact you to arrange payment and finalise your schedule within 24 hours.
            </p>
          </div>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="w-full bg-[#C9A84C] hover:bg-[#d4b055] disabled:opacity-40 text-black font-black
                       py-3 px-4 rounded-sm text-xs tracking-[0.15em] uppercase transition-colors"
            style={{ fontFamily: "'Arial Black', sans-serif" }}
          >
            {loading ? 'Submitting…' : 'Submit Application'}
          </button>
        </div>
      )}
    </div>
  )
}
