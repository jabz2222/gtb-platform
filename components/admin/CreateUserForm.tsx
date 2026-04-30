'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Division {
  id: string
  slug: string
  name: string
  color_hex: string
}

interface CreateUserFormProps {
  divisions: Division[]
}

const ROLES = [
  { value: 'client',   label: 'Player — Adult / U16+ (client)' },
  { value: 'minor',    label: 'Player — Minor / U16- (minor)' },
  { value: 'parent',   label: 'Parent / Guardian' },
  { value: 'mentor',   label: 'Coach / Mentor (own assignments only)' },
  { value: 'staff',    label: 'Staff / Head Coach (division-wide access)' },
  { value: 'educator', label: 'Educator (content delivery only)' },
  { value: 'admin',    label: 'Admin (Director — full access)' },
] as const

export default function CreateUserForm({ divisions }: CreateUserFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'mentor' as (typeof ROLES)[number]['value'],
    divisionIds: [] as string[],
    headCoachDivisionId: '' as string,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  function generatePassword() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$'
    let pw = ''
    for (let i = 0; i < 14; i++) pw += chars.charAt(Math.floor(Math.random() * chars.length))
    setFormData(p => ({ ...p, password: pw }))
  }

  function toggleDivision(id: string) {
    setFormData(p => ({
      ...p,
      divisionIds: p.divisionIds.includes(id)
        ? p.divisionIds.filter(d => d !== id)
        : [...p.divisionIds, id],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      const res = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          full_name: formData.fullName,
          role: formData.role,
          division_ids: formData.divisionIds.length ? formData.divisionIds : undefined,
          head_coach_for_division_id:
            formData.role === 'staff' && formData.headCoachDivisionId
              ? formData.headCoachDivisionId
              : null,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? 'Failed to create user')
        setLoading(false)
        return
      }
      setSuccess(
        `Created ${formData.email} (${formData.role}). Temp password: ${formData.password}` +
          (json.warning ? ` · Warning: ${json.warning}` : '')
      )
      // Reset form for the next account
      setFormData({
        fullName: '',
        email: '',
        password: '',
        role: 'mentor',
        divisionIds: [],
        headCoachDivisionId: '',
      })
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = `w-full bg-[#141414] border border-white/[0.08] text-white rounded-sm px-3 py-2.5 text-sm
                      placeholder:text-[#333] focus:outline-none focus:border-[#C9A84C]/60 transition-colors`
  const labelClass = 'block text-[11px] text-[#666] mb-1.5 uppercase tracking-wider'

  return (
    <form onSubmit={handleSubmit} className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-white/5">
        <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">New Staff Account</span>
      </div>
      <div className="p-5 space-y-4">
        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 text-sm px-4 py-3 rounded-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-[#2E8B35]/15 border border-[#2E8B35]/30 text-[#2E8B35] text-xs px-3 py-2 rounded-sm whitespace-pre-wrap">
            {success}
          </div>
        )}

        <div>
          <label htmlFor="fullName" className={labelClass}>Full name</label>
          <input
            id="fullName"
            type="text"
            value={formData.fullName}
            onChange={e => setFormData(p => ({ ...p, fullName: e.target.value }))}
            required
            placeholder="Jane Coach"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>Email address</label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
            required
            placeholder="jane@gtbdevelopment.co.uk"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="password" className={labelClass}>
            Temporary password
            <button
              type="button"
              onClick={generatePassword}
              className="ml-2 text-[#C9A84C] hover:underline normal-case tracking-normal text-[10px]"
            >
              Generate
            </button>
          </label>
          <input
            id="password"
            type="text"
            value={formData.password}
            onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
            required
            minLength={8}
            placeholder="Min. 8 characters"
            className={`${inputClass} font-mono tracking-wider`}
          />
          <p className="text-[10px] text-[#444] mt-1">
            Share this temp password with the user — they should change it on first login.
          </p>
        </div>

        <div>
          <label htmlFor="role" className={labelClass}>Role</label>
          <select
            id="role"
            value={formData.role}
            onChange={e => setFormData(p => ({ ...p, role: e.target.value as (typeof ROLES)[number]['value'] }))}
            className={inputClass}
          >
            {ROLES.map(r => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>

        {divisions.length > 0 && formData.role !== 'admin' && formData.role !== 'educator' && (
          <div>
            <label className={labelClass}>Division memberships</label>
            <div className="grid grid-cols-2 gap-2">
              {divisions.map(d => {
                const checked = formData.divisionIds.includes(d.id)
                return (
                  <label
                    key={d.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-sm border cursor-pointer transition-colors ${
                      checked ? 'border-[#C9A84C]/40 bg-[#C9A84C]/5' : 'border-white/[0.08] hover:border-white/[0.15]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleDivision(d.id)}
                      className="w-3.5 h-3.5 accent-[#C9A84C]"
                    />
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: d.color_hex }}
                    />
                    <span className="text-xs text-white">{d.name}</span>
                  </label>
                )
              })}
            </div>
            <p className="text-[10px] text-[#444] mt-1">
              First selected division is treated as primary.
            </p>
          </div>
        )}

        {formData.role === 'staff' && (
          <div>
            <label htmlFor="headCoachDivision" className={labelClass}>
              Head Coach for division (optional — grants division-wide access)
            </label>
            <select
              id="headCoachDivision"
              value={formData.headCoachDivisionId}
              onChange={e => setFormData(p => ({ ...p, headCoachDivisionId: e.target.value }))}
              className={inputClass}
            >
              <option value="">— None —</option>
              {divisions.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#C9A84C] hover:bg-[#d4b055] disabled:opacity-40 text-black font-black
                     py-3 px-4 rounded-sm text-xs tracking-[0.15em] uppercase transition-colors mt-2"
          style={{ fontFamily: "'Arial Black', sans-serif" }}
        >
          {loading ? 'Creating account…' : 'Create Account'}
        </button>
      </div>
    </form>
  )
}
