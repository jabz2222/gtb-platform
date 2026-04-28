'use client'

import { useState } from 'react'

const DIVISIONS = [
  { slug: 'football',  label: 'GTB Football',  color: '#5BB8E8' },
  { slug: 'fitness',   label: 'GTB Fitness',   color: '#2E8B35' },
  { slug: 'sports',    label: 'GTB Sports',    color: '#E8641A' },
  { slug: 'mentoring', label: 'GTB Mentoring', color: '#9B2454' },
  { slug: 'education', label: 'GTB Education', color: '#CC2222' },
] as const

const SESSION_TYPES_BY_DIVISION: Record<string, string[]> = {
  football:  ['1:1 / Small Group', 'Development Centre', 'Mentoring (Football-aligned)', 'Athletic Dev / S&C (Football-aligned)'],
  fitness:   ['1:1 / Small Group S&C', 'Online Fitness Coaching'],
  sports:    ['Hire a Coach (curriculum PE / clubs / camps)'],
  mentoring: ['1:1 / Small Group Mentoring', 'Group Mentoring Programme'],
  education: ['Education Programme Enquiry'],
}

const HOW_HEARD_OPTIONS = [
  '— Choose —',
  'Search engine',
  'Instagram',
  'TikTok',
  'Friend / family',
  'Coach recommendation',
  'School',
  'Event',
  'Other',
]

export default function BookingEnquiryForm() {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    division_slug: 'football' as (typeof DIVISIONS)[number]['slug'],
    session_type: SESSION_TYPES_BY_DIVISION.football[0],
    participant_age: '',
    message: '',
    source: '',
    honeypot: '', // bot trap
    consent: false,
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  function setDivision(slug: (typeof DIVISIONS)[number]['slug']) {
    setForm(p => ({
      ...p,
      division_slug: slug,
      session_type: SESSION_TYPES_BY_DIVISION[slug][0],
    }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!form.consent) {
      setError('Please confirm you accept being contacted about this enquiry.')
      return
    }
    setBusy(true)
    try {
      const res = await fetch('/api/booking/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(json.error ?? `Submission failed (${res.status})`)
        return
      }
      setSuccess(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error')
    } finally {
      setBusy(false)
    }
  }

  if (success) {
    return (
      <div className="bg-[#0D0D0D] border border-[#2E8B35]/30 rounded-sm p-8 text-center">
        <div className="text-4xl mb-3">✓</div>
        <h3
          className="text-xl font-black tracking-wider text-white uppercase mb-2"
          style={{ fontFamily: "'Arial Black', sans-serif" }}
        >
          Enquiry Received
        </h3>
        <p className="text-sm text-[#888] mb-4">
          Thank you. A GTB Development team member will reply to <span className="text-white">{form.email}</span> within 2 working days.
        </p>
        <div className="bg-[#0A0A0A] border border-white/[0.06] rounded-sm p-5 text-left max-w-md mx-auto">
          <p className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C] mb-3">
            Bank Transfer Details
          </p>
          <p className="text-xs text-[#aaa] leading-relaxed">
            Payment for confirmed sessions is by UK bank transfer. The team will provide payment details, an invoice, and a reference once your booking is confirmed.
          </p>
          <p className="text-[11px] text-[#666] mt-3">
            Account name, sort code, and reference will be sent in the confirmation email.
          </p>
        </div>
      </div>
    )
  }

  const inputClass =
    'w-full bg-[#141414] border border-white/[0.08] text-white rounded-sm px-3 py-2.5 text-sm ' +
    'placeholder:text-[#333] focus:outline-none focus:border-[#C9A84C]/60 transition-colors'
  const labelClass = 'block text-[11px] text-[#666] mb-1.5 uppercase tracking-wider'

  return (
    <form onSubmit={submit} className="space-y-5">
      {/* Division tabs */}
      <div>
        <p className={labelClass}>Division</p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {DIVISIONS.map(d => {
            const active = form.division_slug === d.slug
            return (
              <button
                key={d.slug}
                type="button"
                onClick={() => setDivision(d.slug)}
                className={
                  'px-3 py-3 rounded-sm border text-[11px] tracking-wider uppercase transition-all ' +
                  (active
                    ? 'border-white/30 bg-white/[0.04] text-white'
                    : 'border-white/[0.06] text-[#666] hover:text-white hover:border-white/[0.15]')
                }
                style={active ? { borderColor: d.color + '60', boxShadow: `inset 0 -2px 0 0 ${d.color}` } : undefined}
              >
                <span className="block text-[10px]" style={{ color: d.color }}>●</span>
                {d.label.replace('GTB ', '')}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <label className={labelClass}>Session type</label>
        <select
          value={form.session_type}
          onChange={e => setForm(p => ({ ...p, session_type: e.target.value }))}
          className={inputClass}
        >
          {SESSION_TYPES_BY_DIVISION[form.division_slug].map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Full name</label>
          <input
            type="text"
            required
            value={form.full_name}
            onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Email address</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Phone (optional)</label>
          <input
            type="tel"
            value={form.phone}
            onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Participant age / year group</label>
          <input
            type="text"
            placeholder="e.g. 11 / Year 7"
            value={form.participant_age}
            onChange={e => setForm(p => ({ ...p, participant_age: e.target.value }))}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Message / additional info</label>
        <textarea
          rows={4}
          value={form.message}
          onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
          placeholder="Tell us about your goals, preferred days, anything we should know."
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>How did you hear about GTB?</label>
        <select
          value={form.source}
          onChange={e => setForm(p => ({ ...p, source: e.target.value === HOW_HEARD_OPTIONS[0] ? '' : e.target.value }))}
          className={inputClass}
        >
          {HOW_HEARD_OPTIONS.map(o => (
            <option key={o} value={o === HOW_HEARD_OPTIONS[0] ? '' : o}>{o}</option>
          ))}
        </select>
      </div>

      {/* Honeypot — hidden from real users via CSS, bots will fill it. */}
      <div aria-hidden="true" className="absolute left-[-9999px] top-[-9999px]">
        <label>Leave this empty</label>
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={form.honeypot}
          onChange={e => setForm(p => ({ ...p, honeypot: e.target.value }))}
        />
      </div>

      <label className="flex items-start gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          checked={form.consent}
          onChange={e => setForm(p => ({ ...p, consent: e.target.checked }))}
          className="w-4 h-4 mt-0.5 rounded-sm border border-white/[0.08] bg-[#141414] accent-[#C9A84C]"
        />
        <span className="text-xs text-[#888]">
          I&apos;m happy for GTB Development Ltd to contact me about this enquiry. We will not share your details with third parties.
        </span>
      </label>

      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-300 text-sm px-4 py-3 rounded-sm">
          {error}
        </div>
      )}

      <div className="bg-[#0A0A0A] border border-white/[0.06] rounded-sm p-4">
        <p className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C] mb-2">Payment</p>
        <p className="text-xs text-[#888]">
          GTB takes payment by <span className="text-white">UK bank transfer</span> after your booking is confirmed. We will email an invoice with our account details and a payment reference.
        </p>
      </div>

      <button
        type="submit"
        disabled={busy}
        className="w-full bg-[#C9A84C] hover:bg-[#d4b055] disabled:opacity-40 text-black font-black
                   py-3 px-4 rounded-sm text-xs tracking-[0.15em] uppercase transition-colors"
        style={{ fontFamily: "'Arial Black', sans-serif" }}
      >
        {busy ? 'Sending…' : 'Submit Enquiry'}
      </button>
    </form>
  )
}
