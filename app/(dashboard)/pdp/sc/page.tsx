import { requireAuth } from '@/lib/auth/requireRole'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import SCTrainingForm from '@/components/pdp/SCTrainingForm'

export default async function SCPage() {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: sessions } = await supabase
    .from('pdp_sc_sessions')
    .select('*')
    .eq('player_id', user.id)
    .order('session_date', { ascending: false })
    .limit(20)

  return (
    <div>
      <Link href="/pdp" className="text-xs text-[#444] hover:text-white uppercase tracking-wider mb-6 inline-block transition-colors">
        ← Development Plan
      </Link>
      <div className="mb-8">
        <p className="text-[#CC2222] text-[11px] tracking-[0.3em] uppercase mb-2">PDP Section 5</p>
        <h1
          className="text-3xl font-black tracking-wider text-white uppercase"
          style={{ fontFamily: "'Arial Black', sans-serif" }}
        >
          S&amp;C <span style={{ color: '#CC2222' }}>Training</span>
        </h1>
        <p className="text-[#444] mt-1.5 text-sm">Strength &amp; conditioning log, benchmarks, and development summary.</p>
      </div>
      <SCTrainingForm userId={user.id} sessions={sessions ?? []} />
    </div>
  )
}
