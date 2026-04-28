'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordForm() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    router.push('/login?reset=success')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-900/20 border border-red-800/40 text-red-400 text-xs px-4 py-3 rounded-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="password" className="block text-xs text-[#666] mb-1.5 uppercase tracking-wider">
          New Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          placeholder="Min. 8 characters"
          className="w-full bg-[#141414] border border-white/[0.08] text-white rounded-sm px-3 py-2.5 text-sm
                     placeholder:text-[#333] focus:outline-none focus:border-[#C9A84C]/60 transition-colors"
        />
      </div>

      <div>
        <label htmlFor="confirm" className="block text-xs text-[#666] mb-1.5 uppercase tracking-wider">
          Confirm Password
        </label>
        <input
          id="confirm"
          type="password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          required
          autoComplete="new-password"
          placeholder="••••••••"
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
        {loading ? 'Updating…' : 'Set New Password'}
      </button>
    </form>
  )
}
