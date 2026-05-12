'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const ROLES = ['client', 'minor', 'parent', 'staff', 'mentor', 'educator', 'admin']
const TIERS = ['', 'bronze', 'silver', 'gold']

// Age phase override (Brief §8.3): admin can manually promote a player's PDP
// view to any phase regardless of date_of_birth. Null = use default derived
// from age.
const AGE_PHASES = [
  { value: '',            label: 'Auto (from date of birth)' },
  { value: 'early_years', label: 'Early Years (U5–U6)' },
  { value: 'pre_academy', label: 'Pre-Academy (U7–U9)' },
  { value: 'foundation',  label: 'Foundation (U10–U12)' },
  { value: 'youth',       label: 'Youth (U13–U15)' },
  { value: 'pro',         label: 'Pro Pathway (U16+)' },
] as const

export default function AdminUserActions({
  userId,
  currentRole,
  currentTier,
  currentAgePhase,
}: {
  userId: string
  currentRole: string
  currentTier: string
  currentAgePhase?: string | null
}) {
  const [role, setRole] = useState(currentRole)
  const [tier, setTier] = useState(currentTier)
  const [agePhase, setAgePhase] = useState(currentAgePhase ?? '')
  const [overrideReason, setOverrideReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  // Track whether age phase is changing — if so, require a reason (Brief §8.3)
  const ageChanged = (agePhase || null) !== (currentAgePhase ?? null)

  async function handleSave() {
    setError(null)
    if (ageChanged && agePhase && !overrideReason.trim()) {
      setError('Please provide a reason for the age phase override.')
      return
    }

    setLoading(true)
    const update: Record<string, unknown> = {
      role,
      tier_id: tier || null,
    }
    if (ageChanged) {
      update.age_phase = agePhase || null
    }
    const { error: err } = await supabase
      .from('profiles')
      .update(update)
      .eq('id', userId)

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    setSaved(true)
    setOverrideReason('')
    setTimeout(() => setSaved(false), 3000)
    setLoading(false)
  }

  const selectClass = `w-full bg-[#141414] border border-white/[0.08] text-white rounded-sm px-3 py-2.5 text-sm
                       focus:outline-none focus:border-[#C9A84C]/60 transition-colors`
  const labelClass = 'block text-[11px] text-[#666] mb-1.5 uppercase tracking-wider'

  return (
    <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-white/5">
        <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">Admin Actions</span>
      </div>
      <div className="p-5 space-y-4">
        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 text-xs px-3 py-2 rounded-sm">
            {error}
          </div>
        )}
        {saved && (
          <div className="bg-[#2E8B35]/15 border border-[#2E8B35]/30 text-[#2E8B35] text-xs px-3 py-2 rounded-sm">
            User updated.
          </div>
        )}

        <div>
          <label className={labelClass}>Role</label>
          <select
            value={role}
            onChange={e => setRole(e.target.value)}
            className={`${selectClass} bg-[#141414]`}
          >
            {ROLES.map(r => (
              <option key={r} value={r} className="capitalize">{r.charAt(0).toUpperCase() + r.slice(1)}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Tier</label>
          <select
            value={tier}
            onChange={e => setTier(e.target.value)}
            className={`${selectClass} bg-[#141414]`}
          >
            {TIERS.map(t => (
              <option key={t} value={t}>{t ? t.charAt(0).toUpperCase() + t.slice(1) : 'Free (no tier)'}</option>
            ))}
          </select>
        </div>

        {/* Age Phase Override — Brief §8.3 */}
        {(role === 'client' || role === 'minor') && (
          <div>
            <label className={labelClass}>
              Age Phase Override
              <span className="ml-2 text-[10px] text-[#444] normal-case tracking-normal">PDP view only</span>
            </label>
            <select
              value={agePhase}
              onChange={e => setAgePhase(e.target.value)}
              className={`${selectClass} bg-[#141414]`}
            >
              {AGE_PHASES.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
            {ageChanged && agePhase && (
              <div className="mt-2">
                <label className={labelClass + ' text-[#C9A84C]'}>
                  Reason for override <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={overrideReason}
                  onChange={e => setOverrideReason(e.target.value)}
                  placeholder="e.g. Advanced for age — Head Coach approved"
                  className={selectClass}
                />
                <p className="text-[10px] text-[#555] mt-1">
                  Required when promoting/demoting PDP phase. The override is logged.
                </p>
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-[#C9A84C] hover:bg-[#d4b055] disabled:opacity-40 text-black font-black
                     py-2.5 px-4 rounded-sm text-xs tracking-[0.12em] uppercase transition-colors"
          style={{ fontFamily: "'Arial Black', sans-serif" }}
        >
          {loading ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
