import { requireAuth } from '@/lib/auth/requireRole'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import PillarGoals from '@/components/pdp/PillarGoals'

export default async function GoalsPage() {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: goals } = await supabase
    .from('goals')
    .select('*')
    .eq('player_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  return (
    <div>
      <Link href="/pdp" className="text-xs text-[#444] hover:text-white uppercase tracking-wider mb-6 inline-block transition-colors">
        ← Development Plan
      </Link>
      <div className="mb-8">
        <p className="text-[#9B2454] text-[11px] tracking-[0.3em] uppercase mb-2">PDP Section 3</p>
        <h1
          className="text-3xl font-black tracking-wider text-white uppercase"
          style={{ fontFamily: "'Arial Black', sans-serif" }}
        >
          Goal <span style={{ color: '#9B2454' }}>Setting</span>
        </h1>
        <p className="text-[#444] mt-1.5 text-sm">Five pillars of development — short and long term.</p>
      </div>
      <PillarGoals userId={user.id} goals={goals ?? []} />
    </div>
  )
}
