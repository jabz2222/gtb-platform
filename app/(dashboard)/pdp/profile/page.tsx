import { requireAuth } from '@/lib/auth/requireRole'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import PlayerProfileForm from '@/components/pdp/PlayerProfileForm'

export default async function PlayerProfilePage() {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, position, academy_year, about_me, my_purpose')
    .eq('id', user.id)
    .maybeSingle()

  return (
    <div>
      <Link href="/pdp" className="text-xs text-[#444] hover:text-white uppercase tracking-wider mb-6 inline-block transition-colors">
        ← Development Plan
      </Link>
      <div className="mb-8">
        <p className="text-[#5BB8E8] text-[11px] tracking-[0.3em] uppercase mb-2">PDP Section 1</p>
        <h1
          className="text-3xl font-black tracking-wider text-white uppercase"
          style={{ fontFamily: "'Arial Black', sans-serif" }}
        >
          Player <span style={{ color: '#5BB8E8' }}>Profile</span>
        </h1>
        <p className="text-[#444] mt-1.5 text-sm">Your identity, purpose, and commitment to growth.</p>
      </div>
      <PlayerProfileForm
        userId={user.id}
        profile={{
          full_name: profile?.full_name ?? '',
          position: profile?.position ?? '',
          academy_year: profile?.academy_year ?? '',
          about_me: profile?.about_me ?? '',
          my_purpose: profile?.my_purpose ?? '',
        }}
      />
    </div>
  )
}
