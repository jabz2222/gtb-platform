'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils/cn'
import SignInRoleModal from '@/components/auth/SignInRoleModal'
import {
  navEntrance,
  staggerContainer,
  mobileMenuOverlay,
  mobileMenuItem,
  dropdownVariant,
} from '@/lib/animations/variants'

const NAV_LINKS = [
  { href: '/about',    label: 'About'     },
  { href: '/booking',  label: 'Booking'   },
  { href: '/divisions',label: 'Divisions' },
  { href: '/contact',  label: 'Contact'   },
]

const DIVISION_LINKS = [
  { href: '/divisions/football',  label: 'Football',  color: '#5BB8E8' },
  { href: '/divisions/fitness',   label: 'Fitness',   color: '#2E8B35' },
  { href: '/divisions/sports',    label: 'Sports',    color: '#E8641A' },
  { href: '/divisions/mentoring', label: 'Mentoring', color: '#9B2454' },
  { href: '/divisions/education', label: 'Education', color: '#CC2222' },
]

export default function MarketingNav() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [divisionsOpen, setDivisionsOpen] = useState(false)

  return (
    <>
      <motion.nav
        variants={navEntrance}
        initial="hidden"
        animate="visible"
        className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0A0A0A]/90 backdrop-blur-md px-6 py-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
            <span
              className="text-xl font-black tracking-[0.2em] text-[#C9A84C]"
              style={{ fontFamily: "'Arial Black', sans-serif" }}
            >
              GTB
            </span>
            <span className="hidden sm:block text-[#333] text-xs tracking-widest uppercase">
              Development
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(link => {
              const isDivisions = link.href === '/divisions'
              if (isDivisions) {
                return (
                  <div
                    key={link.href}
                    className="relative"
                    onMouseEnter={() => setDivisionsOpen(true)}
                    onMouseLeave={() => setDivisionsOpen(false)}
                  >
                    <button
                      className={cn(
                        'px-3 py-1.5 text-xs tracking-wider uppercase transition-colors rounded-sm flex items-center gap-1',
                        pathname === link.href || pathname.startsWith(link.href + '/')
                          ? 'text-[#C9A84C]'
                          : 'text-[#555] hover:text-[#CCC]'
                      )}
                    >
                      {link.label}
                      <svg className="w-2.5 h-2.5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    <AnimatePresence>
                      {divisionsOpen && (
                        <motion.div
                          variants={dropdownVariant}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className="absolute top-full left-0 mt-1 w-44 bg-[#0D0D0D] border border-white/10 rounded-sm overflow-hidden shadow-xl"
                        >
                          {DIVISION_LINKS.map(d => (
                            <Link
                              key={d.href}
                              href={d.href}
                              onClick={() => setDivisionsOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-[#666] hover:text-white hover:bg-white/[0.04] transition-colors"
                            >
                              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                              {d.label}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              }

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'px-3 py-1.5 text-xs tracking-wider uppercase transition-colors rounded-sm',
                    pathname === link.href || pathname.startsWith(link.href + '/')
                      ? 'text-[#C9A84C]'
                      : 'text-[#555] hover:text-[#CCC]'
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <SignInRoleModal
              className="text-sm text-[#888] hover:text-white transition-colors px-3 py-1.5"
            />
          </div>
          <Link
            href="/register"
            className="btn-shimmer hidden sm:block bg-[#C9A84C] hover:bg-[#d4b055] text-black font-bold px-5 py-2 text-xs
                       tracking-[0.12em] uppercase transition-colors rounded-sm"
            style={{ fontFamily: "'Arial Black', sans-serif" }}
          >
            Get Started
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden flex flex-col gap-[5px] p-2"
            aria-label="Toggle menu"
          >
            <span className={cn(
              'block w-5 h-[1.5px] bg-white/70 transition-all duration-200',
              mobileOpen && 'rotate-45 translate-y-[6.5px]'
            )} />
            <span className={cn(
              'block w-5 h-[1.5px] bg-white/70 transition-all duration-200',
              mobileOpen && 'opacity-0'
            )} />
            <span className={cn(
              'block w-5 h-[1.5px] bg-white/70 transition-all duration-200',
              mobileOpen && '-rotate-45 -translate-y-[6.5px]'
            )} />
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            variants={mobileMenuOverlay}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-40 bg-[#0A0A0A] pt-[72px]"
          >
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="px-6 py-6 space-y-1"
            >
              {NAV_LINKS.map(link => (
                <motion.div key={link.href} variants={mobileMenuItem}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'block px-4 py-3 text-sm tracking-wider uppercase transition-colors rounded-sm',
                      pathname === link.href || pathname.startsWith(link.href + '/')
                        ? 'text-[#C9A84C] bg-[#C9A84C]/8'
                        : 'text-[#888] hover:text-white hover:bg-white/[0.04]'
                    )}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              {/* Division sub-links */}
              <motion.div variants={mobileMenuItem} className="pt-3 pb-1 px-4">
                <p className="text-[10px] tracking-[0.3em] uppercase text-[#444] mb-2">Divisions</p>
              </motion.div>
              {DIVISION_LINKS.map(d => (
                <motion.div key={d.href} variants={mobileMenuItem}>
                  <Link
                    href={d.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#666] hover:text-white transition-colors rounded-sm"
                  >
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                    {d.label}
                  </Link>
                </motion.div>
              ))}

              {/* Auth links */}
              <motion.div variants={mobileMenuItem} className="pt-6 space-y-3 px-4">
                <SignInRoleModal
                  trigger={open => (
                    <button
                      type="button"
                      onClick={() => { setMobileOpen(false); open() }}
                      className="w-full block text-center border border-white/10 text-white/70 px-5 py-3 text-xs tracking-[0.15em] uppercase rounded-sm"
                    >
                      Sign In
                    </button>
                  )}
                />
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="block text-center bg-[#C9A84C] hover:bg-[#d4b055] text-black font-bold px-5 py-3 text-xs tracking-[0.12em] uppercase rounded-sm"
                  style={{ fontFamily: "'Arial Black', sans-serif" }}
                >
                  Get Started
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
