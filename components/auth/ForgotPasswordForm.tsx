'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="text-center py-4">
        <div className="w-10 h-10 rounded-sm bg-[#2E8B35]/15 flex items-center justify-center mx-auto mb-4">
          <svg className="w-5 h-5 text-[#2E8B35]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-white mb-1">Check your email</p>
        <p className="text-xs text-[#555] mb-5">
          We&apos;ve sent a password reset link to <span className="text-[#888]">{email}</span>
        </p>
        <Link href="/login" className="text-xs text-[#C9A84C] hover:underline">
          Back to Sign In
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-900/20 border border-red-800/40 text-red-400 text-xs px-4 py-3 rounded-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-xs text-[#666] mb-1.5 uppercase tracking-wider">
          Email address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="w-full bg-[#141414] border border-white/[0.08] text-white rounded-sm px-3 py-2.5 text-sm
                     placeholder:text-[#333] focus:outline-none focus:border-[#C9A84C]/60 transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#C9A84C] hover:bg-[#d4b055] disabled:opacity-40 disabled:cursor-not-allowed
                   text-black font-black py-3 px-4 rounded-sm text-xs tracking-[0.15em] uppercase
                   transition-colors mt-2"
        style={{ fontFamily: "'Arial Black', sans-serif" }}
      >
        {loading ? 'Sending…' : 'Send Reset Link'}
      </button>

      <div className="text-center text-xs text-[#444] pt-1">
        Remember your password?{' '}
        <Link href="/login" className="text-[#C9A84C] hover:underline">
          Sign in
        </Link>
      </div>
    </form>
  )
}
