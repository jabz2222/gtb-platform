import { Metadata } from 'next'
import RegisterForm from '@/components/auth/RegisterForm'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Create Account',
}

export default function RegisterPage() {
  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-black tracking-wider text-white uppercase mb-1"
            style={{ fontFamily: "'Arial Black', sans-serif" }}>
          Create Account
        </h2>
        <p className="text-[#555] text-sm">Join the GTB Development ecosystem</p>
      </div>

      <RegisterForm />

      <div className="mt-4 pt-4 border-t border-white/[0.06] text-center text-xs text-[#444]">
        Already have an account?{' '}
        <Link href="/login" className="text-[#C9A84C] hover:underline">
          Sign in
        </Link>
      </div>
    </>
  )
}
