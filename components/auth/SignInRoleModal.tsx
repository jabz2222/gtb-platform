'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

const PORTALS = [
  {
    role: 'parents-players',
    label: 'Parents / Players Login',
    description: 'Players and their parents/guardians',
    href: '/login?role=parents-players',
    accent: '#C9A84C',
  },
  {
    role: 'coach',
    label: 'Coach Login',
    description: 'GTB Development staff — coach, mentor, educator, or admin',
    href: '/login?role=coach',
    accent: '#9B2454',
  },
] as const

interface Props {
  /** Optional render-prop to control how the trigger button looks. */
  trigger?: (open: () => void) => React.ReactNode
  className?: string
}

export default function SignInRoleModal({ trigger, className }: Props) {
  const [open, setOpen] = useState(false)

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const triggerNode = trigger ? (
    trigger(() => setOpen(true))
  ) : (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className={
        className ??
        'text-sm text-[#888] hover:text-white transition-colors px-3 py-1.5'
      }
    >
      Sign In
    </button>
  )

  return (
    <>
      {triggerNode}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-start justify-center p-4 pt-32"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.18 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#0D0D0D] border border-white/[0.08] rounded-sm w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between">
                <div>
                  <p className="text-[#C9A84C] text-[10px] tracking-[0.35em] uppercase mb-1">
                    GTB Development
                  </p>
                  <h2
                    className="text-xl font-black tracking-wider text-white uppercase"
                    style={{ fontFamily: "'Arial Black', sans-serif" }}
                  >
                    Sign In
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-[#555] hover:text-white p-2 -mr-2"
                  aria-label="Close"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-5 space-y-2">
                <p className="text-xs text-[#666] mb-4">
                  Choose your portal to sign in.
                </p>
                {PORTALS.map(p => (
                  <Link
                    key={p.role}
                    href={p.href}
                    onClick={() => setOpen(false)}
                    className="group flex items-center gap-4 px-4 py-3.5 rounded-sm border border-white/[0.06]
                               hover:border-white/[0.16] hover:bg-white/[0.02] transition-colors"
                  >
                    <div
                      className="w-1 h-9 rounded-full flex-shrink-0"
                      style={{ backgroundColor: p.accent }}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-bold tracking-wider uppercase text-white group-hover:text-white"
                        style={{ fontFamily: "'Arial Black', sans-serif" }}
                      >
                        {p.label}
                      </p>
                      <p className="text-[11px] text-[#555] mt-0.5">{p.description}</p>
                    </div>
                    <svg
                      className="w-3.5 h-3.5 text-[#444] group-hover:text-[#C9A84C] transition-colors flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </Link>
                ))}
              </div>

              <div className="px-5 py-4 border-t border-white/[0.06] text-center">
                <p className="text-[11px] text-[#444]">
                  Don&apos;t have an account?{' '}
                  <Link
                    href="/register"
                    onClick={() => setOpen(false)}
                    className="text-[#C9A84C] hover:underline"
                  >
                    Register
                  </Link>
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
