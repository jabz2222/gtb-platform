import { notFound } from 'next/navigation'
import Link from 'next/link'
import { requireAuth } from '@/lib/auth/requireRole'
import { createClient } from '@/lib/supabase/server'
import ChildTabs from '@/components/parent/ChildTabs'

interface Props {
  children: React.ReactNode
  params: Promise<{ childId: string }>
}

export default async function ChildLayout({ children, params }: Props) {
  const { childId } = await params
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: child } = await supabase
    .from('profiles')
    .select('id, full_name, role, tier_id')
    .eq('id', childId)
    .eq('parent_guardian_id', user.id)
    .single()

  if (!child) notFound()

  const initials = (child.full_name ?? '')
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div>
      <div className="mb-4">
        <Link
          href="/parent"
          className="text-xs text-[#444] hover:text-white uppercase tracking-wider mb-3 inline-block transition-colors"
        >
          ← Back to Parent Portal
        </Link>
        <div className="flex items-center gap-4 mb-4">
          <div
            className="w-12 h-12 rounded-sm bg-[#C9A84C]/10 flex items-center justify-center
                       text-[#C9A84C] text-base font-black flex-shrink-0"
            style={{ fontFamily: "'Arial Black', sans-serif" }}
          >
            {initials}
          </div>
          <div>
            <p className="text-[#C9A84C] text-[10px] tracking-[0.3em] uppercase mb-0.5">
              Read-Only View
            </p>
            <h1
              className="text-2xl font-black tracking-wider text-white uppercase"
              style={{ fontFamily: "'Arial Black', sans-serif" }}
            >
              {child.full_name}
            </h1>
            <p className="text-[#444] text-xs mt-0.5 capitalize">
              {child.role} · {child.tier_id ? `${child.tier_id} tier` : 'Free tier'}
            </p>
          </div>
        </div>
      </div>

      <ChildTabs childId={childId} />

      {children}
    </div>
  )
}
