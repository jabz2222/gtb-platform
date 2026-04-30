import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      {/* Ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px]
                      bg-[#C9A84C]/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Back-to-home link, top-left of viewport */}
      <Link
        href="/"
        className="fixed top-5 left-5 z-20 flex items-center gap-2 px-3 py-2 text-[11px] uppercase tracking-[0.2em]
                   text-[#888] hover:text-white border border-white/[0.06] hover:border-white/[0.15]
                   bg-[#0D0D0D]/60 backdrop-blur-sm rounded-sm transition-colors"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="hidden sm:inline">Back to home</span>
        <span className="sm:hidden">Home</span>
      </Link>

      {/* Auth card */}
      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block group" aria-label="GTB Development home">
            <div className="flex items-center gap-2 justify-center mb-3">
              <div className="h-px w-6 bg-[#C9A84C]" />
              <span className="text-[#C9A84C] text-[10px] tracking-[0.35em] uppercase font-medium">
                GTB Development Ltd
              </span>
              <div className="h-px w-6 bg-[#C9A84C]" />
            </div>
            <span
              className="text-3xl font-black tracking-[0.2em] text-[#C9A84C] group-hover:text-[#d4b055] transition-colors"
              style={{ fontFamily: "'Arial Black', sans-serif" }}
            >
              GTB
            </span>
          </Link>
        </div>

        <div className="bg-[#0D0D0D] border border-white/[0.07] rounded-sm p-8">
          {children}
        </div>

        <p className="text-center text-[#333] text-[11px] mt-5 tracking-wide">
          © 2026 GTB Development Ltd
        </p>
      </div>
    </div>
  )
}
