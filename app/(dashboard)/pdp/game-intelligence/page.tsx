import { requireAuth } from '@/lib/auth/requireRole'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import GameIntelligenceForm from '@/components/pdp/GameIntelligenceForm'

export default async function GameIntelligencePage() {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: entries } = await supabase
    .from('pdp_game_intelligence')
    .select('*')
    .eq('player_id', user.id)
    .order('game_date', { ascending: false })
    .limit(20)

  return (
    <div>
      <Link href="/pdp" className="text-xs text-[#444] hover:text-white uppercase tracking-wider mb-6 inline-block transition-colors">
        ← Development Plan
      </Link>
      <div className="mb-8">
        <p className="text-[#CC2222] text-[11px] tracking-[0.3em] uppercase mb-2">PDP Section 11</p>
        <h1
          className="text-3xl font-black tracking-wider text-white uppercase"
          style={{ fontFamily: "'Arial Black', sans-serif" }}
        >
          Game <span style={{ color: '#CC2222' }}>Intelligence</span>
        </h1>
        <p className="text-[#444] mt-1.5 text-sm">Log your decisions, analyse patterns, and develop football intelligence.</p>
      </div>
      <GameIntelligenceForm userId={user.id} entries={entries ?? []} />
    </div>
  )
}
