'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'

interface Profile {
  id: string
  full_name: string | null
  email: string
  role: string
  date_of_birth: string | null
}

interface Props {
  parentId: string
  linked: Profile[]
  candidates: Profile[]
}

export default function LinkChildForm({ parentId, linked, candidates }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const filteredCandidates = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return candidates
    return candidates.filter(
      c =>
        c.email.toLowerCase().includes(q) ||
        (c.full_name ?? '').toLowerCase().includes(q)
    )
  }, [candidates, search])

  async function link(childId: string) {
    setError(null)
    setBusyId(childId)
    try {
      const res = await fetch(`/api/admin/users/${parentId}/children`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ child_id: childId }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(json.error ?? `Link failed (${res.status})`)
        return
      }
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error')
    } finally {
      setBusyId(null)
    }
  }

  async function unlink(childId: string) {
    setError(null)
    setBusyId(childId)
    try {
      const res = await fetch(
        `/api/admin/users/${parentId}/children?child_id=${encodeURIComponent(childId)}`,
        { method: 'DELETE' }
      )
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(json.error ?? `Unlink failed (${res.status})`)
        return
      }
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-300 text-sm px-4 py-3 rounded-sm">
          {error}
        </div>
      )}

      {/* Currently linked */}
      <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">
            Linked Children · {linked.length}
          </span>
        </div>
        {linked.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-[#444] text-sm">No children linked yet</p>
            <p className="text-[#333] text-xs mt-1">Use the search below to link a player.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {linked.map(c => (
              <div
                key={c.id}
                className="px-5 py-3 flex items-center justify-between hover:bg-white/[0.02]"
              >
                <div>
                  <p className="text-sm text-white font-medium">{c.full_name ?? '—'}</p>
                  <p className="text-xs text-[#555] mt-0.5">
                    {c.email} · <span className="capitalize">{c.role}</span>
                  </p>
                </div>
                <button
                  onClick={() => unlink(c.id)}
                  disabled={busyId === c.id}
                  className="text-xs text-red-400 hover:text-red-300 disabled:opacity-40 px-3 py-1.5
                             rounded-sm border border-red-500/20 hover:border-red-500/40 transition-colors
                             tracking-wider uppercase"
                >
                  {busyId === c.id ? 'Unlinking…' : 'Unlink'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Candidates */}
      <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5">
          <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">
            Available Players (no parent linked) · {filteredCandidates.length}
          </span>
        </div>
        <div className="p-5 border-b border-white/5">
          <input
            type="search"
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#141414] border border-white/[0.08] text-white rounded-sm px-3 py-2.5
                       text-sm placeholder:text-[#333] focus:outline-none focus:border-[#C9A84C]/60
                       transition-colors"
          />
        </div>
        {filteredCandidates.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-[#444] text-sm">No matching players</p>
            <p className="text-[#333] text-xs mt-1">
              Players appear here only if they have no parent_guardian linked yet.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04] max-h-[480px] overflow-y-auto">
            {filteredCandidates.map(c => (
              <div
                key={c.id}
                className="px-5 py-3 flex items-center justify-between hover:bg-white/[0.02]"
              >
                <div>
                  <p className="text-sm text-white font-medium">{c.full_name ?? '—'}</p>
                  <p className="text-xs text-[#555] mt-0.5">
                    {c.email} · <span className="capitalize">{c.role}</span>
                    {c.date_of_birth && (
                      <> · DOB {new Date(c.date_of_birth).toLocaleDateString('en-GB')}</>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => link(c.id)}
                  disabled={busyId === c.id}
                  className="text-xs text-black bg-[#C9A84C] hover:bg-[#d4b055] disabled:opacity-40
                             px-3 py-1.5 rounded-sm font-black tracking-wider uppercase"
                  style={{ fontFamily: "'Arial Black', sans-serif" }}
                >
                  {busyId === c.id ? 'Linking…' : 'Link'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
