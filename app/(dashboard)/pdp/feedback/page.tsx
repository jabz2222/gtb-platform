import { requireAuth } from '@/lib/auth/requireRole'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function FeedbackPage() {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: feedbacks } = await supabase
    .from('pdp_feedback')
    .select('*, coach:profiles!pdp_feedback_coach_id_fkey(full_name)')
    .eq('player_id', user.id)
    .order('review_date', { ascending: false })
    .limit(10)

  const DIMENSIONS = ['Technical', 'Tactical', 'Physical', 'Psychological', 'Lifestyle']

  return (
    <div>
      <Link href="/pdp" className="text-xs text-[#444] hover:text-white uppercase tracking-wider mb-6 inline-block transition-colors">
        ← Development Plan
      </Link>
      <div className="mb-8">
        <p className="text-[#444] text-[11px] tracking-[0.3em] uppercase mb-2">PDP Section 12</p>
        <h1
          className="text-3xl font-black tracking-wider text-white uppercase"
          style={{ fontFamily: "'Arial Black', sans-serif" }}
        >
          Feedback <span style={{ color: '#C9A84C' }}>&amp; Review Hub</span>
        </h1>
        <p className="text-[#444] mt-1.5 text-sm">Coach evaluations and your personal responses.</p>
      </div>

      {(!feedbacks || feedbacks.length === 0) ? (
        <div className="bg-[#0D0D0D] border border-white/5 rounded-sm p-10 text-center">
          <p className="text-[#444] text-sm mb-1">No feedback yet</p>
          <p className="text-[#333] text-xs">Your coach will add reviews here after sessions.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {feedbacks.map((fb) => {
            const ratings = (fb.dimension_ratings ?? {}) as Record<string, number>
            return (
              <div key={fb.id} className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">
                      Review — {new Date(fb.review_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    {fb.coach && (
                      <p className="text-[11px] text-[#444] mt-0.5">
                        By {(fb.coach as { full_name: string }).full_name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Ratings */}
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-[#C9A84C] mb-3">Dimension Ratings</p>
                    <div className="space-y-2">
                      {DIMENSIONS.map(dim => {
                        const val = ratings[dim.toLowerCase()] ?? 0
                        return (
                          <div key={dim}>
                            <div className="flex justify-between mb-1">
                              <span className="text-xs text-[#666]">{dim}</span>
                              <span className="text-xs text-white">{val}/10</span>
                            </div>
                            <div className="w-full bg-[#1A1A1A] rounded-full h-1">
                              <div
                                className="h-1 rounded-full bg-[#C9A84C]"
                                style={{ width: `${(val / 10) * 100}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.2em] text-[#C9A84C] mb-2">Coach Notes</p>
                      <p className="text-sm text-[#888] leading-relaxed">{fb.coach_notes ?? '—'}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.2em] text-[#5BB8E8] mb-2">Your Response</p>
                      <p className="text-sm text-[#888] leading-relaxed">{fb.player_response ?? <span className="text-[#333] italic">No response added yet</span>}</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
