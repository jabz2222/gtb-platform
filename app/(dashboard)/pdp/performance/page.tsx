import { requireAuth } from '@/lib/auth/requireRole'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import SessionReflectionForm from '@/components/pdp/SessionReflectionForm'

export default async function PerformancePage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const user = await requireAuth()
  const supabase = await createClient()
  const params = await searchParams
  const defaultTab = params.tab === 'match' ? 'match' : params.tab === 'technical' ? 'technical' : 'training'

  const { data: reflections } = await supabase
    .from('pdp_session_reflections')
    .select('*')
    .eq('player_id', user.id)
    .order('session_date', { ascending: false })
    .limit(30)

  return (
    <div>
      <Link href="/pdp" className="text-xs text-[#444] hover:text-white uppercase tracking-wider mb-6 inline-block transition-colors">
        ← Development Plan
      </Link>
      <div className="mb-8">
        <p className="text-[#9B2454] text-[11px] tracking-[0.3em] uppercase mb-2">PDP Section 8–10</p>
        <h1
          className="text-3xl font-black tracking-wider text-white uppercase"
          style={{ fontFamily: "'Arial Black', sans-serif" }}
        >
          Session <span style={{ color: '#9B2454' }}>Reflections</span>
        </h1>
        <p className="text-[#444] mt-1.5 text-sm">Training, match, and technical development tracking.</p>
      </div>
      <SessionReflectionForm
        userId={user.id}
        defaultTab={defaultTab as 'training' | 'match' | 'technical'}
        reflections={reflections ?? []}
      />
    </div>
  )
}
