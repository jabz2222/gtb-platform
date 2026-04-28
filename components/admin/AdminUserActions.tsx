'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const ROLES = ['client', 'minor', 'staff', 'mentor', 'educator', 'admin']
const TIERS = ['', 'bronze', 'silver', 'gold']

export default function AdminUserActions({
  userId,
  currentRole,
  currentTier,
}: {
  userId: string
  currentRole: string
  currentTier: string
}) {
  const [role, setRole] = useState(currentRole)
  const [tier, setTier] = useState(currentTier)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const supabase = createClient()

  async function handleSave() {
    setLoading(true)
    await supabase
      .from('profiles')
      .update({ role, tier_id: tier || null })
      .eq('id', userId)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    setLoading(false)
  }

  const selectClass = `w-full bg-[#141414] border border-white/[0.08] text-white rounded-sm px-3 py-2.5 text-sm
                       focus:outline-none focus:border-[#C9A84C]/60 transition-colors`

  return (
    <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-white/5">
        <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">Admin Actions</span>
      </div>
      <div className="p-5 space-y-4">
        {saved && (
          <div className="bg-[#2E8B35]/15 border border-[#2E8B35]/30 text-[#2E8B35] text-xs px-3 py-2 rounded-sm">
            User updated.
          </div>
        )}
        <div>
          <label className="block text-[11px] text-[#666] mb-1.5 uppercase tracking-wider">Role</label>
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
          <label className="block text-[11px] text-[#666] mb-1.5 uppercase tracking-wider">Tier</label>
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
