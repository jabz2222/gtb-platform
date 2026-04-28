'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Checkin { id: string; checkin_date: string; key_topics?: string | null; actions_set?: string | null; follow_up_date?: string | null }
interface Review { id: string; review_date: string; went_well?: string | null; do_differently?: string | null; key_learning?: string | null; next_target?: string | null }

export default function MentorshipForm({ userId, checkins, reviews }: { userId: string; checkins: Checkin[]; reviews: Review[] }) {
  const [tab, setTab] = useState<'checkin' | 'review' | 'map'>('checkin')
  const router = useRouter()

  const inputCls = "w-full bg-[#111] border border-white/10 rounded-sm px-3 py-2 text-sm text-white focus:outline-none focus:border-[#5BB8E8]/50 transition-colors resize-y"
  const labelCls = "block text-[11px] uppercase tracking-[0.2em] text-[#444] mb-1"

  return (
    <div className="space-y-6">
      <div className="flex gap-1 border-b border-white/5 pb-0">
        {[
          { key: 'checkin', label: 'Mentor Check-ins' },
          { key: 'review',  label: 'Player-Led Review' },
          { key: 'map',     label: 'Motivation Map' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as 'checkin' | 'review' | 'map')}
            className={`px-4 py-2.5 text-xs tracking-wider uppercase transition-colors border-b-2 -mb-px ${
              tab === t.key ? 'text-[#5BB8E8] border-[#5BB8E8]' : 'text-[#444] border-transparent hover:text-[#888]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'checkin' && <MentorCheckinTab userId={userId} checkins={checkins} router={router} inputCls={inputCls} labelCls={labelCls} />}
      {tab === 'review' && <PlayerReviewTab userId={userId} reviews={reviews} router={router} inputCls={inputCls} labelCls={labelCls} />}
      {tab === 'map' && <MotivationMap inputCls={inputCls} labelCls={labelCls} />}
    </div>
  )
}

function MentorCheckinTab({ userId, checkins, router, inputCls, labelCls }: { userId: string; checkins: Checkin[]; router: ReturnType<typeof import('next/navigation').useRouter>; inputCls: string; labelCls: string }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [topics, setTopics] = useState('')
  const [actions, setActions] = useState('')
  const [followUp, setFollowUp] = useState('')
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    startTransition(async () => {
      const supabase = createClient()
      await supabase.from('pdp_mentor_checkins').insert({
        player_id: userId,
        checkin_date: date,
        key_topics: topics.trim() || null,
        actions_set: actions.trim() || null,
        follow_up_date: followUp || null,
      })
      setTopics(''); setActions(''); setFollowUp('')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      router.refresh()
    })
  }

  return (
    <div className="space-y-5">
      <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5">
          <span className="text-[11px] tracking-[0.3em] uppercase text-[#5BB8E8]">New Check-in</span>
        </div>
        <div className="p-5 grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputCls.replace('resize-y', '')} />
          </div>
          <div>
            <label className={labelCls}>Follow-up Date</label>
            <input type="date" value={followUp} onChange={e => setFollowUp(e.target.value)} className={inputCls.replace('resize-y', '')} />
          </div>
          <div className="col-span-2">
            <label className={labelCls}>Key Topics Discussed</label>
            <textarea value={topics} onChange={e => setTopics(e.target.value)} rows={3} className={inputCls} />
          </div>
          <div className="col-span-2">
            <label className={labelCls}>Actions Set</label>
            <textarea value={actions} onChange={e => setActions(e.target.value)} rows={3} className={inputCls} />
          </div>
        </div>
      </div>
      {saved && <div className="p-3 bg-[#2E8B35]/15 border border-[#2E8B35]/20 rounded-sm text-[#2E8B35] text-sm">Saved ✓</div>}
      <button onClick={handleSave} disabled={isPending} className="px-6 py-2.5 text-[11px] tracking-[0.25em] uppercase font-medium rounded-sm bg-[#5BB8E8] text-black hover:bg-[#5BB8E8]/80 disabled:opacity-40 transition-colors">
        {isPending ? 'Saving...' : 'Log Check-in'}
      </button>
      {checkins.length > 0 && (
        <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <span className="text-[11px] tracking-[0.3em] uppercase text-[#5BB8E8]">Check-in History</span>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {checkins.map(c => (
              <div key={c.id} className="px-5 py-3.5">
                <p className="text-xs text-[#555] mb-1">{new Date(c.checkin_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                {c.key_topics && <p className="text-sm text-white">{c.key_topics}</p>}
                {c.actions_set && <p className="text-[11px] text-[#444] mt-1">Actions: {c.actions_set}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function PlayerReviewTab({ userId, reviews, router, inputCls, labelCls }: { userId: string; reviews: Review[]; router: ReturnType<typeof import('next/navigation').useRouter>; inputCls: string; labelCls: string }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [wentWell, setWentWell] = useState('')
  const [differently, setDifferently] = useState('')
  const [learning, setLearning] = useState('')
  const [nextTarget, setNextTarget] = useState('')
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    startTransition(async () => {
      const supabase = createClient()
      await supabase.from('pdp_player_reviews').insert({
        player_id: userId,
        review_date: date,
        went_well: wentWell.trim() || null,
        do_differently: differently.trim() || null,
        key_learning: learning.trim() || null,
        next_target: nextTarget.trim() || null,
      })
      setWentWell(''); setDifferently(''); setLearning(''); setNextTarget('')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      router.refresh()
    })
  }

  return (
    <div className="space-y-5">
      <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5">
          <span className="text-[11px] tracking-[0.3em] uppercase text-[#5BB8E8]">Player-Led Review</span>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className={labelCls}>Review Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputCls.replace('resize-y', '')} />
          </div>
          {[
            { label: 'What went well?', value: wentWell, set: setWentWell },
            { label: "What I'd do differently", value: differently, set: setDifferently },
            { label: 'My key learning', value: learning, set: setLearning },
            { label: 'My next target', value: nextTarget, set: setNextTarget },
          ].map(f => (
            <div key={f.label}>
              <label className={labelCls}>{f.label}</label>
              <textarea value={f.value} onChange={e => f.set(e.target.value)} rows={3} className={inputCls} />
            </div>
          ))}
        </div>
      </div>
      {saved && <div className="p-3 bg-[#2E8B35]/15 border border-[#2E8B35]/20 rounded-sm text-[#2E8B35] text-sm">Saved ✓</div>}
      <button onClick={handleSave} disabled={isPending} className="px-6 py-2.5 text-[11px] tracking-[0.25em] uppercase font-medium rounded-sm bg-[#5BB8E8] text-black hover:bg-[#5BB8E8]/80 disabled:opacity-40 transition-colors">
        {isPending ? 'Saving...' : 'Submit Review'}
      </button>
    </div>
  )
}

function MotivationMap({ inputCls, labelCls }: { inputCls: string; labelCls: string }) {
  return (
    <div className="space-y-5">
      <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5">
          <span className="text-[11px] tracking-[0.3em] uppercase text-[#5BB8E8]">Motivation & Purpose Map</span>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-[11px] text-[#444] mb-4">Explore the three rings of your motivation — from your deepest purpose outward.</p>
          {[
            { label: 'Inner Ring — Why I Play', placeholder: 'The deepest reason you play football...', colour: '#9B2454' },
            { label: 'Middle Ring — What Drives Me', placeholder: 'The goals and ambitions that motivate you daily...', colour: '#C9A84C' },
            { label: 'Outer Ring — My Role Models', placeholder: 'Players, coaches, or people who inspire you...', colour: '#5BB8E8' },
          ].map(ring => (
            <div key={ring.label}>
              <label className={labelCls} style={{ color: ring.colour }}>{ring.label}</label>
              <textarea rows={3} placeholder={ring.placeholder} className={inputCls} />
            </div>
          ))}
          <button className="px-6 py-2.5 text-[11px] tracking-[0.25em] uppercase font-medium rounded-sm bg-[#5BB8E8] text-black hover:bg-[#5BB8E8]/80 transition-colors">
            Save Map
          </button>
        </div>
      </div>
    </div>
  )
}
