import { requireAuth } from '@/lib/auth/requireRole'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import BaselinesForm from '@/components/pdp/BaselinesForm'

export default async function BaselinesPage() {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: baselines } = await supabase
    .from('pdp_baselines')
    .select('*')
    .eq('player_id', user.id)
    .order('recorded_at', { ascending: false })

  return (
    <div>
      <Link href="/pdp" className="text-xs text-[#444] hover:text-white uppercase tracking-wider mb-6 inline-block transition-colors">
        ← Development Plan
      </Link>
      <div className="mb-8">
        <p className="text-[#C9A84C] text-[11px] tracking-[0.3em] uppercase mb-2">PDP Section 2</p>
        <h1
          className="text-3xl font-black tracking-wider text-white uppercase"
          style={{ fontFamily: "'Arial Black', sans-serif" }}
        >
          Pre-Season <span style={{ color: '#C9A84C' }}>Baselines</span>
        </h1>
        <p className="text-[#444] mt-1.5 text-sm">Establish your starting benchmarks for the season.</p>
      </div>
      <BaselinesForm userId={user.id} existing={baselines ?? []} />
    </div>
  )
}
