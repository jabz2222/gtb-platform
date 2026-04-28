import Image from 'next/image'
import Link from 'next/link'

const FOOTER_LINKS = [
  { href: '/about',              label: 'About'       },
  { href: '/booking',            label: 'Booking'     },
  { href: '/contact',            label: 'Contact'     },
  { href: '/divisions/football', label: 'Football'    },
  { href: '/divisions/fitness',  label: 'Fitness'     },
  { href: '/divisions/sports',   label: 'Sports'      },
  { href: '/divisions/mentoring',label: 'Mentoring'   },
  { href: '/divisions/education',label: 'Education'   },
]

const DIVISION_COLORS = ['#5BB8E8', '#2E8B35', '#E8641A', '#9B2454', '#CC2222']

export default function MarketingFooter() {
  return (
    <footer className="border-t border-white/5 bg-[#080808]">
      {/* Division colour bar */}
      <div className="flex h-[2px]">
        {DIVISION_COLORS.map(c => (
          <div key={c} className="flex-1" style={{ backgroundColor: c }} />
        ))}
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row gap-8 justify-between mb-10">
          {/* Brand */}
          <div>
            <Image
              src="/logos/gtb-development.png"
              alt="GTB Development"
              width={180}
              height={113}
              className="rounded-sm mb-3"
              style={{ width: 180, height: 'auto' }}
            />
            <p className="text-[#2E2E2E] text-xs max-w-[200px] leading-relaxed">
              South East London&apos;s premier youth sports, fitness &amp; mentoring ecosystem.
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-x-12 gap-y-2">
            {FOOTER_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-[#444] hover:text-[#C9A84C] transition-colors tracking-wide"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="border-t border-white/[0.04] pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[#2A2A2A] text-[11px]">
            © 2026 GTB Development Ltd · gtbdevelopment.co.uk
          </p>
          <div className="flex gap-4">
            <Link href="/privacy" className="text-[11px] text-[#2A2A2A] hover:text-[#444] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-[11px] text-[#2A2A2A] hover:text-[#444] transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
