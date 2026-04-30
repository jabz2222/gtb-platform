'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// Which roles each sign-in portal accepts.
// Parents/Players portal → client (player), minor (under-16 player), parent
// Coach portal           → admin, staff, mentor, educator
// Legacy single-role keys remain accepted for direct deep links.
const PORTAL_ROLES: Record<string, readonly string[]> = {
  'parents-players': ['client', 'minor', 'parent'],
  player:            ['client', 'minor'],
  parent:            ['parent'],
  coach:             ['admin', 'staff', 'mentor', 'educator'],
}

const PORTAL_LABEL: Record<string, string> = {
  'parents-players': 'Parents / Players',
  player:            'Player',
  parent:            'Parent',
  coach:             'Coach',
}

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const portal = searchParams.get('role') // e.g. 'parents-players' or 'coach'
  const allowedRoles = portal ? PORTAL_ROLES[portal] : null
  const portalLabel = portal ? PORTAL_LABEL[portal] : null

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // When the user lands here via the wrong portal, we offer a one-click
  // redirect to the correct one. `wrongPortal` holds the target portal slug.
  const [wrongPortal, setWrongPortal] = useState<{ target: string; label: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setWrongPortal(null)

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

    const role = (data.user?.user_metadata?.role as string | undefined) ?? 'client'

    // Portal gating: if the user landed here via a specific portal, ensure
    // their role matches that portal. If not, sign them out and surface a
    // friendly message + one-click link to the correct portal.
    if (allowedRoles && !allowedRoles.includes(role)) {
      await supabase.auth.signOut()
      const isCoachRole =
        role === 'admin' || role === 'staff' || role === 'mentor' || role === 'educator'
      const target = isCoachRole ? 'coach' : 'parents-players'
      const label = isCoachRole ? 'Coach' : 'Parents / Players'
      setError(
        `This account is a ${role.charAt(0).toUpperCase() + role.slice(1)} account — please use the ${label} login instead.`
      )
      setWrongPortal({ target, label })
      setLoading(false)
      return
    }

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
      {portalLabel && (
        <div className="bg-[#0D0D0D] border border-white/[0.06] text-[#888] text-[11px] px-3 py-2 rounded-sm">
          Signing in to the <span className="text-[#C9A84C]">{portalLabel}</span> portal
        </div>
      )}

      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-300 text-sm px-4 py-3 rounded">
          {error}
          {wrongPortal && (
            <Link
              href={`/login?role=${wrongPortal.target}`}
              className="mt-2 block text-center text-[11px] uppercase tracking-[0.15em] bg-[#C9A84C] hover:bg-[#d4b055]
                         text-black font-black py-2 px-3 rounded-sm transition-colors"
              style={{ fontFamily: "'Arial Black', sans-serif" }}
            >
              Go to {wrongPortal.label} Login →
            </Link>
          )}
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
