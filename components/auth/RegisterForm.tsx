'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function RegisterForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    isParent: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { error: signUpError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
          role: formData.isParent ? 'parent' : 'client',
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    router.push('/verify-email')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-300 text-sm px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="fullName" className="block text-xs text-[#666] mb-1.5 uppercase tracking-wider">
          Full name
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          value={formData.fullName}
          onChange={handleChange}
          required
          placeholder="Your full name"
          className="w-full bg-[#141414] border border-white/[0.08] text-white rounded-sm px-3 py-2.5 text-sm
                     placeholder:text-[#333] focus:outline-none focus:border-[#C9A84C]/60 transition-colors"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-xs text-[#666] mb-1.5 uppercase tracking-wider">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
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
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
          placeholder="Min. 8 characters"
          className="w-full bg-[#141414] border border-white/[0.08] text-white rounded-sm px-3 py-2.5 text-sm
                     placeholder:text-[#333] focus:outline-none focus:border-[#C9A84C]/60 transition-colors"
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-xs text-[#666] mb-1.5 uppercase tracking-wider">
          Confirm password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          placeholder="••••••••"
          className="w-full bg-[#141414] border border-white/[0.08] text-white rounded-sm px-3 py-2.5 text-sm
                     placeholder:text-[#333] focus:outline-none focus:border-[#C9A84C]/60 transition-colors"
        />
      </div>

      <label className="flex items-center gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          name="isParent"
          checked={formData.isParent}
          onChange={handleChange}
          className="w-4 h-4 rounded-sm border border-white/[0.08] bg-[#141414] accent-[#C9A84C]"
        />
        <span className="text-xs text-[#555]">
          I&apos;m registering as a parent / guardian
        </span>
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#C9A84C] hover:bg-[#d4b055] disabled:opacity-40 disabled:cursor-not-allowed
                   text-black font-black py-3 px-4 rounded-sm text-xs tracking-[0.15em] uppercase
                   transition-colors mt-2"
        style={{ fontFamily: "'Arial Black', sans-serif" }}
      >
        {loading ? 'Creating account…' : 'Create Account'}
      </button>
    </form>
  )
}
