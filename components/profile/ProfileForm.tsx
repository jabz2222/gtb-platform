'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface ProfileFormProps {
  userId: string
  initialName: string
  initialEmail: string
  initialPhone: string
  initialEmergencyName: string
  initialEmergencyPhone: string
  role: string
}

const AVATAR_COLORS = [
  '#C9A84C', '#5BB8E8', '#2E8B35', '#E8641A', '#9B2454', '#CC2222',
]

export default function ProfileForm({
  userId,
  initialName,
  initialEmail,
  initialPhone,
  initialEmergencyName,
  initialEmergencyPhone,
  role,
}: ProfileFormProps) {
  const [name, setName] = useState(initialName)
  const [phone, setPhone] = useState(initialPhone)
  const [emergencyName, setEmergencyName] = useState(initialEmergencyName)
  const [emergencyPhone, setEmergencyPhone] = useState(initialEmergencyPhone)
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0])
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??'

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        full_name: name,
        phone,
        emergency_contact_name: emergencyName,
        emergency_contact_phone: emergencyPhone,
        avatar_color: avatarColor,
      },
    })

    if (updateError) {
      setError(updateError.message)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
    setLoading(false)
  }

  const inputClass = `w-full bg-[#141414] border border-white/[0.08] text-white rounded-sm px-4 py-3 text-sm
                      placeholder:text-[#333] focus:outline-none focus:border-[#C9A84C]/60 transition-colors`
  const labelClass = 'block text-xs text-[#666] mb-1.5 uppercase tracking-wider'

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Avatar + account info */}
      <div className="space-y-4">
        {/* Avatar card */}
        <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">Avatar</span>
          </div>
          <div className="p-5">
            <div
              className="w-16 h-16 rounded-sm flex items-center justify-center mx-auto mb-4 text-xl font-black transition-colors"
              style={{
                backgroundColor: `${avatarColor}20`,
                color: avatarColor,
                fontFamily: "'Arial Black', sans-serif",
              }}
            >
              {initials}
            </div>
            <p className="text-[11px] text-[#444] uppercase tracking-wider mb-3 text-center">
              Accent Colour
            </p>
            <div className="flex gap-2 justify-center flex-wrap">
              {AVATAR_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setAvatarColor(c)}
                  className="w-6 h-6 rounded-sm transition-transform hover:scale-110"
                  style={{
                    backgroundColor: c,
                    outline: avatarColor === c ? `2px solid ${c}` : 'none',
                    outlineOffset: '2px',
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Account details */}
        <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">Account</span>
          </div>
          <div className="p-5 space-y-3">
            <div>
              <p className="text-[10px] text-[#444] uppercase tracking-wider mb-0.5">Email</p>
              <p className="text-sm text-[#888]">{initialEmail}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#444] uppercase tracking-wider mb-0.5">Role</p>
              <p className="text-sm text-white capitalize">{role}</p>
            </div>
            <div className="pt-2 border-t border-white/5">
              <Link
                href="/forgot-password"
                className="text-xs text-[#C9A84C] hover:underline uppercase tracking-wider"
              >
                Change Password →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Edit form */}
      <div className="lg:col-span-2">
        <form onSubmit={handleSave}>
          {error && (
            <div className="bg-red-900/20 border border-red-800/40 text-red-400 text-xs px-4 py-3 rounded-sm mb-5">
              {error}
            </div>
          )}

          {saved && (
            <div className="bg-[#2E8B35]/15 border border-[#2E8B35]/30 text-[#2E8B35] text-xs px-4 py-3 rounded-sm mb-5">
              Profile saved successfully.
            </div>
          )}

          {/* Personal info */}
          <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden mb-4">
            <div className="px-5 py-4 border-b border-white/5">
              <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">Personal Information</span>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    placeholder="Your full name"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Phone (optional)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+44 7700 000000"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Emergency contact */}
          <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden mb-4">
            <div className="px-5 py-4 border-b border-white/5">
              <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">Emergency Contact</span>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Contact Name</label>
                  <input
                    type="text"
                    value={emergencyName}
                    onChange={e => setEmergencyName(e.target.value)}
                    placeholder="Parent / Guardian name"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Contact Phone</label>
                  <input
                    type="tel"
                    value={emergencyPhone}
                    onChange={e => setEmergencyPhone(e.target.value)}
                    placeholder="+44 7700 000000"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C9A84C] hover:bg-[#d4b055] disabled:opacity-40 text-black font-black
                       py-3 px-4 rounded-sm text-xs tracking-[0.15em] uppercase transition-colors"
            style={{ fontFamily: "'Arial Black', sans-serif" }}
          >
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}
