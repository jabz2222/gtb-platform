import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Verify Email' }

export default function VerifyEmailPage() {
  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-[#C9A84C]/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-[#C9A84C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-white mb-2">Check your inbox</h2>
      <p className="text-[#CCCCCC] text-sm mb-6">
        We&apos;ve sent a verification link to your email address. Click the link to activate your GTB account.
      </p>
      <Link href="/login" className="text-[#C9A84C] hover:underline text-sm">
        Back to sign in
      </Link>
    </div>
  )
}
