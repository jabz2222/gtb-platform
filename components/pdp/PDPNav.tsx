'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/pdp',             label: 'Overview'    },
  { href: '/pdp/goals',       label: 'Goals'       },
  { href: '/pdp/kpis',        label: 'KPIs'        },
  { href: '/pdp/performance', label: 'Performance' },
  { href: '/pdp/wellness',    label: 'Wellness'    },
]

export default function PDPNav() {
  const pathname = usePathname()

  return (
    <div className="flex gap-1 mb-8 flex-wrap border-b border-white/5 pb-0">
      {TABS.map(tab => {
        const isActive = pathname === tab.href
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-4 py-2.5 text-xs tracking-wider uppercase transition-colors border-b-2 -mb-px ${
              isActive
                ? 'text-[#C9A84C] border-[#C9A84C]'
                : 'text-[#444] border-transparent hover:text-[#888]'
            }`}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
