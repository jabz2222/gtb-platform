'use client'

import { useState } from 'react'

const ENQUIRY_TYPES = [
  'General Enquiry',
  'Football Division',
  'Fitness Division',
  'Sports Division',
  'Mentoring',
  'Education',
  'Pricing & Tiers',
  'Platform Support',
  'Partnership',
]

export default function ContactForm() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', type: '', message: '',
  })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Simulate submission — replace with actual API call when backend is ready
    await new Promise(r => setTimeout(r, 1000))
    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="text-center py-10">
        <div className="w-12 h-12 rounded-sm bg-[#2E8B35]/15 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-[#2E8B35]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-lg font-black text-white uppercase mb-2" style={{ fontFamily: "'Arial Black', sans-serif" }}>
          Message Sent
        </p>
        <p className="text-sm text-[#555]">
          We&apos;ll get back to you within 24 hours.
        </p>
      </div>
    )
  }

  const inputClass = `w-full bg-[#141414] border border-white/[0.08] text-white rounded-sm px-4 py-3 text-sm
                      placeholder:text-[#333] focus:outline-none focus:border-[#C9A84C]/60 transition-colors`

  const labelClass = 'block text-xs text-[#666] mb-1.5 uppercase tracking-wider'

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-900/20 border border-red-800/40 text-red-400 text-xs px-4 py-3 rounded-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="name" className={labelClass}>Full Name</label>
          <input
            id="name" name="name" type="text"
            value={form.name} onChange={handleChange}
            required placeholder="Your full name"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>Email</label>
          <input
            id="email" name="email" type="email"
            value={form.email} onChange={handleChange}
            required placeholder="you@example.com"
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="phone" className={labelClass}>Phone (optional)</label>
          <input
            id="phone" name="phone" type="tel"
            value={form.phone} onChange={handleChange}
            placeholder="+44 7700 000000"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="type" className={labelClass}>Enquiry Type</label>
          <select
            id="type" name="type"
            value={form.type} onChange={handleChange}
            required
            className={`${inputClass} bg-[#141414]`}
          >
            <option value="" disabled>Select type…</option>
            {ENQUIRY_TYPES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="message" className={labelClass}>Message</label>
        <textarea
          id="message" name="message"
          value={form.message} onChange={handleChange}
          required rows={5}
          placeholder="Tell us about yourself, your goals, and how we can help…"
          className={`${inputClass} resize-none`}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#C9A84C] hover:bg-[#d4b055] disabled:opacity-40 disabled:cursor-not-allowed
                   text-black font-black py-3 px-4 rounded-sm text-xs tracking-[0.15em] uppercase
                   transition-colors"
        style={{ fontFamily: "'Arial Black', sans-serif" }}
      >
        {loading ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  )
}
