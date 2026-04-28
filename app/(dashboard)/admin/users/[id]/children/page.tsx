import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireRole } from '@/lib/auth/requireRole'
import { createClient } from '@/lib/supabase/server'
import LinkChildForm from '@/components/admin/LinkChildForm'

export const metadata: Metadata = { title: 'Link children · Admin' }

interface Props { params: Promise<{ id: string }> }

export default async function ManageChildrenPage({ params }: Props) {
  await requireRole(['admin'])
  const { id: parentId } = await params

  const supabase = await createClient()

  const { data: parent } = await supabase
    .from('profiles')
    .select('id, full_name, email, role')
    .eq('id', parentId)
    .single()

  if (!parent || parent.role !== 'parent') notFound()

  const [{ data: linked }, { data: candidates }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, email, role, date_of_birth')
      .eq('parent_guardian_id', parentId)
      .order('full_name'),
    supabase
      .from('profiles')
      .select('id, full_name, email, role, date_of_birth')
      .in('role', ['client', 'minor'])
      .is('parent_guardian_id', null)
      .is('deleted_at', null)
      .order('full_name')
      .limit(100),
  ])

  return (
    <div>
      <div className="mb-8">
        <p className="text-[#C9A84C] text-[11px] tracking-[0.3em] uppercase mb-2">Admin · Link Children</p>
        <h1
          className="text-4xl font-black tracking-wider text-white uppercase"
          style={{ fontFamily: "'Arial Black', sans-serif" }}
        >
          Manage <span style={{ color: '#C9A84C' }}>{parent.full_name?.split(' ')[0] ?? 'Parent'}</span>&apos;s Children
        </h1>
        <p className="text-[#444] mt-1.5 text-sm">
          {parent.full_name} · {parent.email}
        </p>
        <Link
          href={`/admin/users/${parentId}`}
          className="inline-block mt-3 text-xs text-[#C9A84C] hover:underline tracking-wider uppercase"
        >
          ← Back to user
        </Link>
      </div>

      <LinkChildForm
        parentId={parentId}
        linked={linked ?? []}
        candidates={candidates ?? []}
      />
    </div>
  )
}
