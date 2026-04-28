export type Role = 'admin' | 'staff' | 'mentor' | 'educator' | 'client' | 'minor' | 'parent'

export const ROLE_PERMISSIONS = {
  canViewAnyPDP:           ['admin', 'staff', 'mentor'] as Role[],
  canEditAnyPDP:           ['admin', 'staff'] as Role[],
  canManageUsers:          ['admin'] as Role[],
  canSetAvailability:      ['admin', 'staff'] as Role[],
  canUploadContent:        ['admin', 'educator'] as Role[],
  canBookForMinor:         ['client'] as Role[],
  canViewCreditLedger:     ['admin', 'client', 'minor'] as Role[],
  canDepositCredits:       ['admin', 'client'] as Role[],
  canManageTiers:          ['admin'] as Role[],
  canViewAnalytics:        ['admin'] as Role[],
  canJoinPublicClasses:    ['client', 'minor', 'staff', 'mentor', 'educator'] as Role[],
  canManageGroupClasses:   ['admin', 'staff'] as Role[],
  canViewMenteeProfiles:   ['admin', 'mentor'] as Role[],
  canEditGoals:            ['admin', 'staff', 'mentor'] as Role[],
  canViewAllBookings:      ['admin', 'staff'] as Role[],
  canIssueCredits:         ['admin'] as Role[],
} as const

export function hasPermission(role: Role, permission: keyof typeof ROLE_PERMISSIONS): boolean {
  return (ROLE_PERMISSIONS[permission] as Role[]).includes(role)
}

export function getRoleDashboard(role: Role): string {
  const map: Record<Role, string> = {
    admin:    '/admin',
    staff:    '/staff',
    mentor:   '/mentor',
    educator: '/educator',
    client:   '/dashboard',
    minor:    '/dashboard',
    parent:   '/parent',
  }
  return map[role] ?? '/dashboard'
}
