'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Child {
  id: string
  full_name: string
}

interface BookForSelectorProps {
  parentId: string
  onChange: (clientId: string, childName?: string) => void
}

export default function BookForSelector({ parentId, onChange }: BookForSelectorProps) {
  const [children, setChildren] = useState<Child[]>([])
  const [selected, setSelected] = useState<'self' | string>('self')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('profiles')
      .select('id, full_name')
      .eq('parent_guardian_id', parentId)
      .then(({ data }) => {
        setChildren(data ?? [])
        setLoading(false)
      })
  }, [parentId])

  function handleSelect(value: 'self' | string) {
    setSelected(value)
    if (value === 'self') {
      onChange(parentId, undefined)
    } else {
      const child = children.find(c => c.id === value)
      onChange(value, child?.full_name)
    }
  }

  // Always call onChange on mount with self
  useEffect(() => {
    onChange(parentId, undefined)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) return null

  // No children linked — don't show selector
  if (children.length === 0) return null

  return (
    <div className="mb-6 bg-[#0D0D0D] border border-[#C9A84C]/20 rounded-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-white/5 flex items-center gap-2">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5 text-[#C9A84C]">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
        <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">Booking For</span>
      </div>
      <div className="p-4 flex flex-wrap gap-2">
        {/* Self option */}
        <button
          type="button"
          onClick={() => handleSelect('self')}
          className={`px-4 py-2 rounded-sm text-xs border transition-colors ${
            selected === 'self'
              ? 'bg-[#C9A84C] border-[#C9A84C] text-black font-black'
              : 'border-white/10 text-[#666] hover:border-[#C9A84C]/40 hover:text-white'
          }`}
          style={selected === 'self' ? { fontFamily: "'Arial Black', sans-serif" } : undefined}
        >
          Myself
        </button>

        {/* Child options */}
        {children.map(child => (
          <button
            key={child.id}
            type="button"
            onClick={() => handleSelect(child.id)}
            className={`px-4 py-2 rounded-sm text-xs border transition-colors ${
              selected === child.id
                ? 'bg-[#C9A84C] border-[#C9A84C] text-black font-black'
                : 'border-white/10 text-[#666] hover:border-[#C9A84C]/40 hover:text-white'
            }`}
            style={selected === child.id ? { fontFamily: "'Arial Black', sans-serif" } : undefined}
          >
            {child.full_name}
          </button>
        ))}
      </div>
      {selected !== 'self' && (
        <div className="px-5 pb-3">
          <p className="text-[11px] text-[#555]">
            This session will be booked under {children.find(c => c.id === selected)?.full_name}&apos;s account.
          </p>
        </div>
      )}
    </div>
  )
}
