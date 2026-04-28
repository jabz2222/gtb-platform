'use client'

import { useState } from 'react'

interface OnboardingFormModalProps {
  formUrl: string
  clientName?: string
}

export default function OnboardingFormModal({ formUrl, clientName }: OnboardingFormModalProps) {
  const [visible, setVisible] = useState(true)
  const [marking, setMarking] = useState(false)

  async function markSent() {
    setMarking(true)
    try {
      await fetch('/api/onboarding/mark-sent', { method: 'POST' })
    } catch {
      // Silent — don't block the user
    } finally {
      setMarking(false)
    }
  }

  async function handleOpen() {
    await markSent()
    window.open(formUrl, '_blank', 'noopener,noreferrer')
    setVisible(false)
  }

  async function handleDismiss() {
    await markSent()
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-[#0D0D0D] border border-[#C9A84C]/20 rounded-sm overflow-hidden">
        {/* Gold top accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#C9A84C]" />

        {/* Content */}
        <div className="p-8">
          {/* Icon */}
          <div className="w-12 h-12 rounded-sm bg-[#C9A84C]/10 flex items-center justify-center mb-6">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6 text-[#C9A84C]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
            </svg>
          </div>

          {/* Heading */}
          <p className="text-[#C9A84C] text-[11px] tracking-[0.3em] uppercase mb-2">Welcome to GTB</p>
          <h2
            className="text-2xl font-black text-white uppercase tracking-tight mb-4"
            style={{ fontFamily: "'Arial Black', sans-serif" }}
          >
            One Last Step{clientName ? `, ${clientName.split(' ')[0]}` : ''}
          </h2>

          {/* Body */}
          <p className="text-sm text-[#888] leading-relaxed mb-3">
            Your booking is confirmed. Before your first session, we&apos;d love to learn a little more about you — your goals, background, and what you&apos;re looking to get from GTB.
          </p>
          <p className="text-sm text-[#888] leading-relaxed mb-8">
            It takes about 3 minutes and helps us tailor your experience from day one.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleOpen}
              disabled={marking}
              className="btn-shimmer flex-1 bg-[#C9A84C] hover:bg-[#d4b055] disabled:opacity-40
                         text-black font-black py-3 px-5 rounded-sm text-xs tracking-[0.15em]
                         uppercase transition-colors flex items-center justify-center gap-2"
              style={{ fontFamily: "'Arial Black', sans-serif" }}
            >
              Complete Your Onboarding
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </button>
            <button
              onClick={handleDismiss}
              disabled={marking}
              className="flex-1 sm:flex-none border border-white/10 hover:border-white/20 text-[#555]
                         hover:text-white py-3 px-5 rounded-sm text-xs tracking-[0.15em] uppercase
                         transition-colors"
            >
              I&apos;ll do this later
            </button>
          </div>

          <p className="text-[10px] text-[#333] mt-4 text-center">
            You can always find this form in your profile settings.
          </p>
        </div>
      </div>
    </div>
  )
}
