import { Metadata } from 'next'
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'

export const metadata: Metadata = { title: 'Forgot Password' }

export default function ForgotPasswordPage() {
  return (
    <>
      <div className="mb-6">
        <h2
          className="text-xl font-black tracking-wider text-white uppercase mb-1"
          style={{ fontFamily: "'Arial Black', sans-serif" }}
        >
          Reset Password
        </h2>
        <p className="text-[#555] text-sm">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>
      <ForgotPasswordForm />
    </>
  )
}
