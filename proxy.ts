import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/auth/callback',
  '/about',
  '/pricing',
  '/booking',
  '/contact',
  '/divisions',
]

const ROLE_ROUTES: Record<string, string[]> = {
  '/admin':    ['admin'],
  '/staff':    ['admin', 'staff'],
  '/mentor':   ['admin', 'mentor'],
  '/educator': ['admin', 'educator'],
  '/parent':   ['admin', 'parent'],
}

function getRoleDashboard(role: string): string {
  const map: Record<string, string> = {
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

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isPublicRoute = PUBLIC_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'))
  if (isPublicRoute) {
    if (user && (pathname === '/login' || pathname === '/register')) {
      const role = user.user_metadata?.role as string | undefined
      return NextResponse.redirect(new URL(role ? getRoleDashboard(role) : '/dashboard', request.url))
    }
    return supabaseResponse
  }

  if (!user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const role = user.user_metadata?.role as string | undefined

  if (!role) {
    return NextResponse.redirect(new URL('/register/complete', request.url))
  }

  for (const [routePrefix, allowedRoles] of Object.entries(ROLE_ROUTES)) {
    if (pathname.startsWith(routePrefix) && !allowedRoles.includes(role)) {
      return NextResponse.redirect(new URL(getRoleDashboard(role), request.url))
    }
  }

  if (role === 'minor') {
    const restrictedForMinors = ['/credits/deposit', '/account/minors', '/admin', '/staff']
    if (restrictedForMinors.some(r => pathname.startsWith(r))) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
