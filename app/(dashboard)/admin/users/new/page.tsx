import { Metadata } from 'next'
import Link from 'next/link'
import { requireRole } from '@/lib/auth/requireRole'
import { createClient } from '@/lib/supabase/server'
import CreateUserForm from '@/components/admin/CreateUserForm'

export const metadata: Metadata = { title: 'Create User · Admin' }

export default async function CreateUserPage() {
  await requireRole(['admin'])

  // Fetch divisions for the form's division-membership selector.
  const supabase = await createClient()
  const { data: divisions } = await supabase
    .from('divisions')
    .select('id, slug, name, color_hex')
    .eq('is_active', true)
    .order('name')

  return (
    <div>
      <div className="mb-8">
        <p className="text-[#C9A84C] text-[11px] tracking-[0.3em] uppercase mb-2">Admin · Users</p>
        <h1
          className="text-4xl font-black tracking-wider text-white uppercase"
          style={{ fontFamily: "'Arial Black', sans-serif" }}
        >
          Create <span style={{ color: '#C9A84C' }}>User</span>
        </h1>
        <p className="text-[#444] mt-1.5 text-sm">
          Create a staff, coach, mentor, or educator account. Players and parents self-register.
        </p>
        <Link
          href="/admin/users"
          className="inline-block mt-3 text-xs text-[#C9A84C] hover:underline tracking-wider uppercase"
        >
          ← Back to users
        </Link>
      </div>

      <CreateUserForm divisions={divisions ?? []} />
    </div>
  )
}
