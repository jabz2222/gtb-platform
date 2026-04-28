'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils/formatters'

interface ContentItem {
  id: string
  title: string
  content_type: string
  tier_id: string | null
  division_id: string | null
  url: string | null
  created_at: string
}

interface Tier {
  id: string
  name: string
}

const CONTENT_TYPES = ['video', 'document', 'article', 'quiz', 'worksheet']
const TIER_COLORS: Record<string, string> = {
  bronze: '#CD7F32',
  silver: '#C9A84C',
  gold: '#FFD700',
}

export default function EducatorContentManager({
  content: initial,
  tiers,
  educatorId,
}: {
  content: ContentItem[]
  tiers: Tier[]
  educatorId: string
}) {
  const [content, setContent] = useState<ContentItem[]>(initial)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    content_type: 'video',
    tier_id: '',
    url: '',
  })

  const supabase = createClient()

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { data, error } = await supabase
      .from('education_content')
      .insert({
        title: form.title,
        content_type: form.content_type,
        tier_id: form.tier_id || null,
        url: form.url || null,
        created_by: educatorId,
      })
      .select()
      .single()

    if (!error && data) {
      setContent(prev => [data, ...prev])
      setForm({ title: '', content_type: 'video', tier_id: '', url: '' })
      setShowForm(false)
    }
    setLoading(false)
  }

  async function handleDelete(id: string) {
    await supabase.from('education_content').delete().eq('id', id)
    setContent(prev => prev.filter(c => c.id !== id))
  }

  const inputClass = `w-full bg-[#141414] border border-white/[0.08] text-white rounded-sm px-3 py-2.5 text-sm
                      placeholder:text-[#333] focus:outline-none focus:border-[#C9A84C]/60 transition-colors`
  const labelClass = 'block text-xs text-[#666] mb-1.5 uppercase tracking-wider'

  return (
    <div>
      <div className="flex justify-end mb-5">
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-2 bg-[#CC2222] hover:bg-[#dd2222] text-white font-black
                     px-4 py-2 text-xs tracking-[0.12em] uppercase rounded-sm transition-colors"
          style={{ fontFamily: "'Arial Black', sans-serif" }}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Upload Module
        </button>
      </div>

      {/* Upload form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-[#0D0D0D] border border-[#CC2222]/30 rounded-sm p-5 mb-5"
        >
          <p className="text-[11px] tracking-[0.3em] uppercase text-[#CC2222] mb-4">New Content Module</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="sm:col-span-2">
              <label className={labelClass}>Title</label>
              <input
                required
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="Module title"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Content Type</label>
              <select
                value={form.content_type}
                onChange={e => setForm(p => ({ ...p, content_type: e.target.value }))}
                className={`${inputClass} bg-[#141414]`}
              >
                {CONTENT_TYPES.map(t => (
                  <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Minimum Tier</label>
              <select
                value={form.tier_id}
                onChange={e => setForm(p => ({ ...p, tier_id: e.target.value }))}
                className={`${inputClass} bg-[#141414]`}
              >
                <option value="">All tiers (Free)</option>
                {tiers.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>URL / Embed Link</label>
              <input
                type="url"
                value={form.url}
                onChange={e => setForm(p => ({ ...p, url: e.target.value }))}
                placeholder="https://…"
                className={inputClass}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#CC2222] hover:bg-[#dd2222] disabled:opacity-40 text-white font-black
                         px-5 py-2 text-xs tracking-[0.12em] uppercase rounded-sm transition-colors"
              style={{ fontFamily: "'Arial Black', sans-serif" }}
            >
              {loading ? 'Uploading…' : 'Upload'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="border border-white/10 text-[#555] hover:text-white px-5 py-2
                         text-xs tracking-wider uppercase rounded-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Content list */}
      {content.length === 0 ? (
        <div className="bg-[#0D0D0D] border border-white/5 rounded-sm p-12 text-center">
          <p className="text-[#444] text-sm">No content uploaded yet</p>
        </div>
      ) : (
        <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">All Modules</span>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {content.map(item => {
              const tierName = tiers.find(t => t.id === item.tier_id)?.name?.toLowerCase()
              const tierColor = TIER_COLORS[tierName ?? ''] ?? '#555'

              return (
                <div key={item.id} className="px-5 py-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{item.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] text-[#444] capitalize">{item.content_type}</span>
                      {tierName && (
                        <>
                          <span className="text-[#333]">·</span>
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded-sm capitalize"
                            style={{ backgroundColor: `${tierColor}20`, color: tierColor }}
                          >
                            {tierName}+
                          </span>
                        </>
                      )}
                      <span className="text-[#333]">·</span>
                      <span className="text-[11px] text-[#333]">{formatDate(item.created_at)}</span>
                    </div>
                  </div>
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#444] hover:text-[#C9A84C] transition-colors flex-shrink-0"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                    </a>
                  )}
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-[#333] hover:text-red-500 transition-colors flex-shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
