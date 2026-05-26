'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const COMMITMENTS = [
  'I will give 100% effort in every session',
  'I will be on time and prepared',
  'I will reflect honestly on my development',
  'I will act with respect to coaches, teammates, and opponents',
  'I will take responsibility for my own progress',
  'I will complete all tasks set by my coach or mentor',
  'I will be honest about my performances and my areas for growth',
]

const DOMINANT_FEET = ['Right', 'Left', 'Both']
const AGE_GROUPS = ['U5–U6 (Early Years)', 'U7–U9 (Pre-Academy)', 'U10–U12 (Foundation)', 'U13–U16 (Youth)', '16+ (Pro Pathway)']

interface Props {
  userId: string
  profile: {
    full_name: string
    position: string
    academy_year: string
    about_me: string
    my_purpose: string
  }
}

export default function PlayerProfileForm({ userId, profile }: Props) {
  const [fullName, setFullName] = useState(profile.full_name)
  const [position, setPosition] = useState(profile.position)
  const [academyYear, setAcademyYear] = useState(profile.academy_year)
  const [dominantFoot, setDominantFoot] = useState('')
  const [ageGroup, setAgeGroup] = useState('')
  const [aboutMe, setAboutMe] = useState(profile.about_me)
  const [myPurpose, setMyPurpose] = useState(profile.my_purpose)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleSave() {
    startTransition(async () => {
      setError('')
      const supabase = createClient()
      const { error: err } = await supabase.from('profiles').update({
        full_name: fullName,
        position,
        academy_year: academyYear,
        about_me: aboutMe,
        my_purpose: myPurpose,
      }).eq('id', userId)
      if (err) {
        setError('Failed to save. Please try again.')
      } else {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
        router.refresh()
      }
    })
  }

  const inputCls = "w-full bg-[#111] border border-white/10 rounded-sm px-3 py-2 text-sm text-white focus:outline-none focus:border-[#5BB8E8]/50 transition-colors"
  const labelCls = "block text-[11px] uppercase tracking-[0.2em] text-[#444] mb-1"

  return (
    <div className="max-w-2xl space-y-6">
      {/* 1.1 Details */}
      <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5">
          <span className="text-[11px] tracking-[0.3em] uppercase text-[#5BB8E8]">1.1 Player Details</span>
        </div>
        <div className="p-5 grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className={labelCls}>Full Name</label>
            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Position</label>
            <input type="text" value={position} onChange={e => setPosition(e.target.value)} placeholder="e.g. Central Midfielder" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Academy Year</label>
            <input type="text" value={academyYear} onChange={e => setAcademyYear(e.target.value)} placeholder="e.g. Year 2" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Dominant Foot</label>
            <select value={dominantFoot} onChange={e => setDominantFoot(e.target.value)} className={inputCls + ' cursor-pointer'}>
              <option value="">Select...</option>
              {DOMINANT_FEET.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Age Group</label>
            <select value={ageGroup} onChange={e => setAgeGroup(e.target.value)} className={inputCls + ' cursor-pointer'}>
              <option value="">Select...</option>
              {AGE_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* 1.2 About Me */}
      <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5">
          <span className="text-[11px] tracking-[0.3em] uppercase text-[#5BB8E8]">1.2 About Me</span>
        </div>
        <div className="p-5">
          <label className={labelCls}>Interests, aspirations, influences</label>
          <textarea
            value={aboutMe}
            onChange={e => setAboutMe(e.target.value)}
            rows={4}
            placeholder="Tell us about yourself — your interests, who inspires you, where you want to go..."
            className={inputCls + ' resize-y'}
          />
        </div>
      </div>

      {/* 1.3 My Purpose */}
      <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5">
          <span className="text-[11px] tracking-[0.3em] uppercase text-[#5BB8E8]">1.3 My Purpose</span>
        </div>
        <div className="p-5">
          <label className={labelCls}>I play football because...</label>
          <textarea
            value={myPurpose}
            onChange={e => setMyPurpose(e.target.value)}
            rows={3}
            placeholder="What motivates you? What does football mean to you?"
            className={inputCls + ' resize-y'}
          />
        </div>
      </div>

      {/* 1.4 Accountability Agreement */}
      <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5">
          <span className="text-[11px] tracking-[0.3em] uppercase text-[#5BB8E8]">1.4 Accountability Agreement</span>
        </div>
        <div className="p-5">
          <p className="text-[11px] text-[#444] mb-4">
            By checking each commitment, you agree to uphold this standard throughout your development journey.
          </p>
          <div className="space-y-3 mb-5">
            {COMMITMENTS.map((c, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-4 h-4 rounded-sm border border-[#5BB8E8]/40 bg-[#5BB8E8]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-2.5 h-2.5 text-[#5BB8E8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm text-[#888]">{c}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
            <div>
              <label className={labelCls}>Coach Sign-off</label>
              <input type="text" placeholder="Coach name" className={inputCls} readOnly />
            </div>
            <div>
              <label className={labelCls}>Parent / Guardian Sign-off</label>
              <input type="text" placeholder="Parent / Guardian name" className={inputCls} readOnly />
            </div>
          </div>
          <p className="text-[10px] text-[#333] mt-2">Sign-offs are completed by your coach and parent/guardian.</p>
        </div>
      </div>

      {error && <p className="text-[#CC2222] text-sm">{error}</p>}

      {saved && (
        <div className="p-3 bg-[#2E8B35]/15 border border-[#2E8B35]/20 rounded-sm text-[#2E8B35] text-sm">
          Profile saved ✓
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={isPending}
        className="px-6 py-2.5 text-[11px] tracking-[0.25em] uppercase font-medium rounded-sm
                   bg-[#5BB8E8] text-black hover:bg-[#5BB8E8]/80 disabled:opacity-40 transition-colors"
      >
        {isPending ? 'Saving...' : 'Save Profile'}
      </button>
    </div>
  )
}
