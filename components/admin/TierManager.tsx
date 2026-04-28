'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Tier {
  id: string
  name: string
  description: string | null
}

interface UserProfile {
  id: string
  full_name: string
  email: string
  tier_id: string | null
}

const TIER_COLORS: Record<string, string> = {
  free: '#888',
  bronze: '#CD7F32',
  silver: '#C9A84C',
  gold: '#FFD700',
}

export default function TierManager({ tiers, users }: { tiers: Tier[]; users: UserProfile[] }) {
  const [search, setSearch] = useState('')
  const [assigning, setAssigning] = useState<string | null>(null)
  const [userTiers, setUserTiers] = useState<Record<string, string | null>>(
    Object.fromEntries(users.map(u => [u.id, u.tier_id]))
  )

  const supabase = createClient()

  async function assignTier(userId: string, tierId: string | null) {
    setAssigning(userId)
    await supabase.from('profiles').update({ tier_id: tierId }).eq('id', userId)
    setUserTiers(prev => ({ ...prev, [userId]: tierId }))
    setAssigning(null)
  }

  const filtered = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Tier cards */}
      <div className="space-y-3">
        {(['free', ...tiers.map(t => t.name.toLowerCase())] as string[]).map(name => {
          const tier = tiers.find(t => t.name.toLowerCase() === name)
          const color = TIER_COLORS[name] ?? '#888'
          const count = name === 'free'
            ? users.filter(u => !u.tier_id).length
            : users.filter(u => {
                const userTier = userTiers[u.id]
                const t = tiers.find(x => x.id === userTier)
                return t?.name.toLowerCase() === name
              }).length

          return (
            <div
              key={name}
              className="bg-[#0D0D0D] border border-white/5 rounded-sm p-4 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: color }} />
              <div className="flex items-center justify-between">
                <p
                  className="text-xs font-black uppercase tracking-wider"
                  style={{ color, fontFamily: "'Arial Black', sans-serif" }}
                >
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </p>
                <span
                  className="text-xl font-black text-white"
                  style={{ fontFamily: "'Arial Black', sans-serif" }}
                >
                  {count}
                </span>
              </div>
              {tier?.description && (
                <p className="text-[11px] text-[#444] mt-1">{tier.description}</p>
              )}
            </div>
          )
        })}
      </div>

      {/* User assign list */}
      <div className="lg:col-span-2 bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5">
          <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">Assign Tiers</span>
        </div>
        <div className="px-5 py-3 border-b border-white/5">
          <input
            type="text"
            placeholder="Search users…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#141414] border border-white/[0.08] text-white rounded-sm px-3 py-2 text-sm
                       placeholder:text-[#333] focus:outline-none focus:border-[#C9A84C]/60 transition-colors"
          />
        </div>
        <div className="divide-y divide-white/[0.04] max-h-[500px] overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-[#444] text-sm">No users found</p>
            </div>
          ) : (
            filtered.map(user => {
              const currentTierId = userTiers[user.id]
              const currentTier = tiers.find(t => t.id === currentTierId)
              const currentTierName = currentTier?.name.toLowerCase() ?? 'free'
              const color = TIER_COLORS[currentTierName] ?? '#888'

              return (
                <div key={user.id} className="px-5 py-3.5 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white">{user.full_name}</p>
                    <p className="text-[11px] text-[#444]">{user.email}</p>
                  </div>
                  <select
                    value={currentTierId ?? ''}
                    onChange={e => assignTier(user.id, e.target.value || null)}
                    disabled={assigning === user.id}
                    className="bg-[#141414] border border-white/[0.08] rounded-sm px-2 py-1.5 text-xs
                               focus:outline-none focus:border-[#C9A84C]/60 transition-colors disabled:opacity-50"
                    style={{ color }}
                  >
                    <option value="" style={{ color: '#888' }}>Free</option>
                    {tiers.map(t => (
                      <option key={t.id} value={t.id} style={{ color: TIER_COLORS[t.name.toLowerCase()] ?? '#888' }}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
