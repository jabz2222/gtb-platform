'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'

interface Division {
  id: string
  slug: string
  name: string
  color_hex: string
}

interface Player {
  id: string
  full_name: string | null
  email: string
  role: string
}

interface Assignment {
  client_id: string
  division_id: string | null
  assigned_at: string
  client: Player | null
  division: { id: string; name: string; color_hex: string } | null
}

interface Props {
  staffId: string
  assigned: Assignment[]
  candidates: Player[]
  divisions: Division[]
}

export default function AssignmentManager({ staffId, assigned, candidates, divisions }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [pickedDivision, setPickedDivision] = useState<string>('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return candidates
    return candidates.filter(
      c => c.email.toLowerCase().includes(q) || (c.full_name ?? '').toLowerCase().includes(q)
    )
  }, [candidates, search])

  async function assign(clientId: string) {
    setError(null)
    setBusyId(clientId)
    try {
      const res = await fetch(`/api/admin/users/${staffId}/assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: clientId, division_id: pickedDivision || null }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(json.error ?? `Assign failed (${res.status})`)
        return
      }
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error')
    } finally {
      setBusyId(null)
    }
  }

  async function unassign(clientId: string) {
    setError(null)
    setBusyId(clientId)
    try {
      const res = await fetch(
        `/api/admin/users/${staffId}/assignments?client_id=${encodeURIComponent(clientId)}`,
        { method: 'DELETE' }
      )
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(json.error ?? `Unassign failed (${res.status})`)
        return
      }
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error')
    } finally {
      setBusyId(null)
    }
  }

  const inputClass = `w-full bg-[#141414] border border-white/[0.08] text-white rounded-sm px-3 py-2.5 text-sm
                      placeholder:text-[#333] focus:outline-none focus:border-[#C9A84C]/60 transition-colors`

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-300 text-sm px-4 py-3 rounded-sm">
          {error}
        </div>
      )}

      {/* Active assignments */}
      <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5">
          <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">
            Active Assignments · {assigned.length}
          </span>
        </div>
        {assigned.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-[#444] text-sm">No participants assigned yet</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {assigned.map(a => (
              <div
                key={a.client_id}
                className="px-5 py-3 flex items-center justify-between hover:bg-white/[0.02] gap-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">
                    {a.client?.full_name ?? '—'}
                  </p>
                  <p className="text-xs text-[#555] mt-0.5 truncate">
                    {a.client?.email} · <span className="capitalize">{a.client?.role}</span>
                  </p>
                </div>
                {a.division && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: a.division.color_hex }}
                    />
                    <span className="text-[11px] text-[#555]">{a.division.name}</span>
                  </div>
                )}
                <button
                  onClick={() => unassign(a.client_id)}
                  disabled={busyId === a.client_id}
                  className="text-xs text-red-400 hover:text-red-300 disabled:opacity-40 px-3 py-1.5
                             rounded-sm border border-red-500/20 hover:border-red-500/40 transition-colors
                             tracking-wider uppercase flex-shrink-0"
                >
                  {busyId === a.client_id ? 'Removing…' : 'Remove'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add new assignment */}
      <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5">
          <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">
            Available Players · {filtered.length}
          </span>
        </div>
        <div className="p-5 border-b border-white/5 grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="search"
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={inputClass}
          />
          <select
            value={pickedDivision}
            onChange={e => setPickedDivision(e.target.value)}
            className={inputClass}
          >
            <option value="">— No division — </option>
            {divisions.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        {filtered.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-[#444] text-sm">No matching players</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04] max-h-[480px] overflow-y-auto">
            {filtered.map(c => (
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
                  onClick={() => assign(c.id)}
                  disabled={busyId === c.id}
                  className="text-xs text-black bg-[#C9A84C] hover:bg-[#d4b055] disabled:opacity-40
                             px-3 py-1.5 rounded-sm font-black tracking-wider uppercase"
                  style={{ fontFamily: "'Arial Black', sans-serif" }}
                >
                  {busyId === c.id ? 'Adding…' : 'Assign'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
