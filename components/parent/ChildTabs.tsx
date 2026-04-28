'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'

interface Props {
  childId: string
}

export default function ChildTabs({ childId }: Props) {
  const pathname = usePathname()
  const base = `/parent/${childId}`

  const tabs = [
    { href: base,                  label: 'Summary'      },
    { href: `${base}/pdp`,         label: 'PDP'          },
    { href: `${base}/achievements`,label: 'Achievements' },
    { href: `${base}/calendar`,    label: 'Calendar'     },
  ] as const

  return (
    <div className="flex gap-1 border-b border-white/5 mb-6 -mx-1 px-1 overflow-x-auto">
      {tabs.map(t => {
        const active = pathname === t.href
        return (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              'px-4 py-2.5 text-[11px] tracking-wider uppercase whitespace-nowrap transition-colors border-b-2 -mb-px',
              active
                ? 'text-[#C9A84C] border-[#C9A84C]'
                : 'text-[#666] border-transparent hover:text-white'
            )}
          >
            {t.label}
          </Link>
        )
      })}
    </div>
  )
}
