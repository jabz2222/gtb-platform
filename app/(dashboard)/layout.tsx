import { redirect } from 'next/navigation'
import { getCachedUser } from '@/lib/auth/requireRole'
import Sidebar from '@/components/layout/Sidebar'
import type { Role } from '@/lib/auth/rolePermissions'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCachedUser()

  if (!user) redirect('/login')

  const role = (user.user_metadata?.role ?? 'client') as Role
  const fullName = user.user_metadata?.full_name ?? user.email ?? 'User'

  return (
    <div className="flex h-screen bg-[#0A0A0A] overflow-hidden">
      <Sidebar role={role} userName={fullName} />

      {/* Main content */}
      <main className="flex-1 ml-64 overflow-y-auto bg-[#0A0A0A]">
        <div className="max-w-5xl mx-auto px-8 py-8 min-h-full">
          {children}
        </div>
      </main>
    </div>
  )
}
