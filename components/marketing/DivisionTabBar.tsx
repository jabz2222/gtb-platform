'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const DIVISIONS = [
  { slug: 'football',  name: 'Football',  color: '#5BB8E8' },
  { slug: 'fitness',   name: 'Fitness',   color: '#2E8B35' },
  { slug: 'sports',    name: 'Sports',    color: '#E8641A' },
  { slug: 'mentoring', name: 'Mentoring', color: '#9B2454' },
  { slug: 'education', name: 'Education', color: '#CC2222' },
]

export default function DivisionTabBar() {
  const pathname = usePathname()
  const currentSlug = pathname.split('/').pop()

  return (
    <div className="sticky top-16 z-30 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-white/5">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex overflow-x-auto no-scrollbar">
          {DIVISIONS.map(d => {
            const isActive = currentSlug === d.slug
            return (
              <Link
                key={d.slug}
                href={`/divisions/${d.slug}`}
                className="flex items-center gap-2 px-4 py-3 text-xs tracking-[0.15em] uppercase whitespace-nowrap
                           transition-colors border-b-2 -mb-px flex-shrink-0"
                style={{
                  borderColor: isActive ? d.color : 'transparent',
                  color: isActive ? d.color : '#555',
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: d.color }}
                />
                {d.name}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
