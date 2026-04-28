'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    const role = data.user?.user_metadata?.role
    const redirectMap: Record<string, string> = {
      admin:    '/admin',
      staff:    '/staff',
      mentor:   '/mentor',
      educator: '/educator',
      parent:   '/parent',
    }

    router.push(redirectMap[role] ?? '/dashboard')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-300 text-sm px-4 py-3 rounded">
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

      <div>
        <label htmlFor="password" className="block text-xs text-[#666] mb-1.5 uppercase tracking-wider">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          autoComplete="current-password"
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
        {loading ? 'Signing in…' : 'Sign In'}
      </button>
    </form>
  )
}
