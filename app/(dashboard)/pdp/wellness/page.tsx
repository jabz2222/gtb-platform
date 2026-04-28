import { requireAuth } from '@/lib/auth/requireRole'
import Link from 'next/link'
import WellnessCheckIn from '@/components/pdp/WellnessCheckIn'

export default async function TrainingReadinessPage({ searchParams }: { searchParams: Promise<{ sessionId?: string }> }) {
  const user = await requireAuth()
  const params = await searchParams
  const sessionId = params.sessionId

  return (
    <div>
      <Link href="/pdp" className="text-xs text-[#444] hover:text-white uppercase tracking-wider mb-6 inline-block transition-colors">
        ← Development Plan
      </Link>
      <div className="mb-8">
        <p className="text-[#C9A84C] text-[11px] tracking-[0.3em] uppercase mb-2">
          {sessionId ? 'Training Readiness' : 'PDP — Wellness'}
        </p>
        <h1
          className="text-3xl font-black tracking-wider text-white uppercase"
          style={{ fontFamily: "'Arial Black', sans-serif" }}
        >
          Training <span style={{ color: '#C9A84C' }}>Readiness</span>
        </h1>
        <p className="text-[#444] mt-1.5 text-sm">
          {sessionId
            ? 'Complete your pre-session readiness check before today\'s training.'
            : 'Log your daily wellness and readiness to train.'}
        </p>
      </div>
      <WellnessCheckIn userId={user.id} sessionId={sessionId} />
    </div>
  )
}
