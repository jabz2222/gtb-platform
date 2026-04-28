import { cache } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Role } from './rolePermissions'
import { getRoleDashboard } from './rolePermissions'

// Cached per-request — all callers in the same server render share one getUser() call
export const getCachedUser = cache(async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
})

export async function requireAuth() {
  const user = await getCachedUser()
  if (!user) redirect('/login')
  return user
}

export async function requireRole(allowedRoles: Role[]) {
  const user = await getCachedUser()
  if (!user) redirect('/login')

  const role = user.user_metadata?.role as Role | undefined
  if (!role) redirect('/register/complete')

  if (!allowedRoles.includes(role)) {
    redirect(getRoleDashboard(role))
  }

  return { user, role }
}

export async function getCurrentUserWithProfile() {
  const user = await getCachedUser()
  if (!user) return null

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return { user, profile }
}
