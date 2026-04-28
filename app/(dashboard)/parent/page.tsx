import { requireAuth } from '@/lib/auth/requireRole'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatRelative } from '@/lib/utils/formatters'

export default async function ParentPortalPage() {
  const user = await requireAuth()
  const supabase = await createClient()

  // Find children linked to this parent via profiles.parent_guardian_id
  const { data: children } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, tier_id, created_at')
    .eq('parent_guardian_id', user.id)
    .order('full_name')

  const name = user.user_metadata?.full_name ?? 'Parent'

  return (
    <div>
      <div className="mb-8">
        <p className="text-[#C9A84C] text-[11px] tracking-[0.3em] uppercase mb-2">Parent Portal</p>
        <h1
          className="text-4xl font-black tracking-wider text-white uppercase"
          style={{ fontFamily: "'Arial Black', sans-serif" }}
        >
          Welcome, <span style={{ color: '#C9A84C' }}>{name.split(' ')[0]}</span>
        </h1>
        <p className="text-[#444] mt-1.5 text-sm">
          {(children ?? []).length} child profile{(children ?? []).length !== 1 ? 's' : ''} linked to your account
        </p>
      </div>

      {!children || children.length === 0 ? (
        <div className="bg-[#0D0D0D] border border-white/5 rounded-sm p-12 text-center">
          <p className="text-[#444] text-sm mb-2">No child profiles linked yet</p>
          <p className="text-[#333] text-xs">Contact GTB staff to have your child&apos;s account linked to yours.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {children.map(child => (
            <div
              key={child.id}
              className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden relative"
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#C9A84C]" />
              <div className="p-5">
                <div className="w-12 h-12 rounded-sm bg-[#C9A84C]/10 flex items-center justify-center
                                text-[#C9A84C] text-sm font-black mb-4"
                     style={{ fontFamily: "'Arial Black', sans-serif" }}>
                  {child.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <p className="text-sm font-medium text-white">{child.full_name}</p>
                <p className="text-[11px] text-[#444] mt-0.5">{child.email}</p>
                <div className="flex items-center gap-3 mt-2 text-[11px] text-[#333]">
                  <span className="capitalize">{child.role}</span>
                  {child.tier_id && (
                    <>
                      <span>·</span>
                      <span className="capitalize">{child.tier_id} tier</span>
                    </>
                  )}
                </div>
                <p className="text-[10px] text-[#333] mt-1">Joined {formatRelative(child.created_at)}</p>

                <Link
                  href={`/parent/${child.id}`}
                  className="mt-4 flex items-center justify-center gap-2 bg-white/[0.05] hover:bg-white/[0.08]
                             border border-white/10 text-white/70 hover:text-white py-2 px-4 rounded-sm
                             text-xs uppercase tracking-wider transition-colors"
                >
                  View Dashboard
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
