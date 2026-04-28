import { Metadata } from 'next'
import ResetPasswordForm from '@/components/auth/ResetPasswordForm'

export const metadata: Metadata = { title: 'Set New Password' }

export default function ResetPasswordPage() {
  return (
    <>
      <div className="mb-6">
        <h2
          className="text-xl font-black tracking-wider text-white uppercase mb-1"
          style={{ fontFamily: "'Arial Black', sans-serif" }}
        >
          New Password
        </h2>
        <p className="text-[#555] text-sm">Choose a strong password for your account</p>
      </div>
      <ResetPasswordForm />
    </>
  )
}
