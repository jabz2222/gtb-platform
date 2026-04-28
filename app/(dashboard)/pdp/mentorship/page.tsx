import { requireAuth } from '@/lib/auth/requireRole'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import MentorshipForm from '@/components/pdp/MentorshipForm'

export default async function MentorshipPage() {
  const user = await requireAuth()
  const supabase = await createClient()

  const [checkinsRes, reviewsRes] = await Promise.all([
    supabase.from('pdp_mentor_checkins').select('*').eq('player_id', user.id).order('checkin_date', { ascending: false }).limit(10),
    supabase.from('pdp_player_reviews').select('*').eq('player_id', user.id).order('review_date', { ascending: false }).limit(10),
  ])

  return (
    <div>
      <Link href="/pdp" className="text-xs text-[#444] hover:text-white uppercase tracking-wider mb-6 inline-block transition-colors">
        ← Development Plan
      </Link>
      <div className="mb-8">
        <p className="text-[#5BB8E8] text-[11px] tracking-[0.3em] uppercase mb-2">PDP Section 6</p>
        <h1
          className="text-3xl font-black tracking-wider text-white uppercase"
          style={{ fontFamily: "'Arial Black', sans-serif" }}
        >
          Mentorship <span style={{ color: '#5BB8E8' }}>&amp; Review</span>
        </h1>
        <p className="text-[#444] mt-1.5 text-sm">Mentor check-ins, player-led reviews, and your motivation map.</p>
      </div>
      <MentorshipForm
        userId={user.id}
        checkins={checkinsRes.data ?? []}
        reviews={reviewsRes.data ?? []}
      />
    </div>
  )
}
