import { Metadata } from 'next'
import LoginForm from '@/components/auth/LoginForm'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Sign In',
}

const ROLE_COPY = {
  player: {
    eyebrow: 'Player Portal',
    accent: '#5BB8E8',
    subtitle: 'Sign in to your GTB Player account',
  },
  parent: {
    eyebrow: 'Parent Portal',
    accent: '#C9A84C',
    subtitle: 'Sign in to view your child\u2019s GTB development',
  },
  coach: {
    eyebrow: 'Coach Portal',
    accent: '#9B2454',
    subtitle: 'Sign in to your GTB Development staff account',
  },
} as const

type RoleKey = keyof typeof ROLE_COPY

interface PageProps {
  searchParams: Promise<{ role?: string; redirectTo?: string }>
}

export default async function LoginPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const roleKey: RoleKey | null =
    sp.role === 'player' || sp.role === 'parent' || sp.role === 'coach' ? sp.role : null
  const copy = roleKey ? ROLE_COPY[roleKey] : null

  return (
    <>
      <div className="mb-6">
        {copy && (
          <p
            className="text-[10px] tracking-[0.35em] uppercase mb-2"
            style={{ color: copy.accent }}
          >
            {copy.eyebrow}
          </p>
        )}
        <h2 className="text-xl font-black tracking-wider text-white uppercase mb-1"
            style={{ fontFamily: "'Arial Black', sans-serif" }}>
          Welcome Back
        </h2>
        <p className="text-[#555] text-sm">{copy?.subtitle ?? 'Sign in to your GTB account'}</p>
      </div>

      <LoginForm />

      <div className="mt-5 text-center text-xs text-[#444]">
        <Link href="/forgot-password" className="hover:text-[#C9A84C] transition-colors">
          Forgot your password?
        </Link>
      </div>

      <div className="mt-4 pt-4 border-t border-white/[0.06] text-center text-xs text-[#444]">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-[#C9A84C] hover:underline">
          Register
        </Link>
      </div>
    </>
  )
}
