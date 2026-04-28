'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import type { Role } from '@/lib/auth/rolePermissions'
import { DIVISIONS } from '@/lib/utils/constants'
import { createClient } from '@/lib/supabase/client'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  badge?: string
}

function getNavItems(role: Role): NavItem[] {
  const home: NavItem = {
    label: role === 'parent' ? 'Parent Portal' : 'Dashboard',
    href: role === 'admin' ? '/admin' : role === 'staff' ? '/staff' : role === 'mentor' ? '/mentor' : role === 'educator' ? '/educator' : role === 'parent' ? '/parent' : '/dashboard',
    icon: <HomeIcon />,
  }

  const pdp: NavItem =   { label: 'My PDP',     href: '/pdp',       icon: <ChartIcon /> }
  const bookings: NavItem = { label: 'Bookings', href: '/bookings',  icon: <CalendarIcon /> }
  const education: NavItem = { label: 'Education', href: '/education', icon: <BookIcon /> }
  const calendar: NavItem = { label: 'Calendar',  href: '/calendar',  icon: <ClockIcon /> }
  const credits: NavItem =        { label: 'Credits',        href: '/credits',        icon: <CoinIcon /> }
  const messages: NavItem =       { label: 'Messages',       href: '/messages',       icon: <MessageIcon /> }
  const notifications: NavItem =  { label: 'Notifications',  href: '/notifications',  icon: <BellIcon /> }
  const parent: NavItem =         { label: 'Parent Portal',  href: '/parent',         icon: <ShieldIcon /> }
  const achievements: NavItem =   { label: 'Achievements',   href: '/achievements',   icon: <TrophyIcon /> }

  const adminItems: NavItem[] = [
    { label: 'Users',     href: '/admin/users',     icon: <UsersIcon /> },
    { label: 'Analytics', href: '/admin/analytics', icon: <BarChartIcon /> },
    { label: 'Tiers',     href: '/admin/tiers',     icon: <LayersIcon /> },
    { label: 'Settings',  href: '/admin/settings',  icon: <SettingsIcon /> },
  ]

  const staffItems: NavItem[] = [
    { label: 'Availability', href: '/staff/availability', icon: <ClockIcon /> },
    { label: 'Clients',      href: '/staff/clients',      icon: <UsersIcon /> },
    { label: 'Sessions',     href: '/staff/sessions',     icon: <CalendarIcon /> },
    { label: 'Inquiries',    href: '/staff/inquiries',    icon: <BellIcon /> },
    { label: 'My Portfolio', href: '/staff/cdp',          icon: <TrophyIcon /> },
  ]

  const mentorItems: NavItem[] = [
    { label: 'Mentees',  href: '/mentor/mentees',  icon: <UsersIcon /> },
    { label: 'Sessions', href: '/mentor/sessions', icon: <CalendarIcon /> },
  ]

  const educatorItems: NavItem[] = [
    { label: 'Content',      href: '/educator/content',        icon: <BookIcon /> },
    { label: 'Live Sessions', href: '/educator/live-sessions', icon: <PlayIcon /> },
    { label: 'Programmes',   href: '/education/programmes',    icon: <ChartIcon /> },
  ]

  const base = [home]

  switch (role) {
    case 'admin':
      return [...base, ...adminItems, pdp, bookings, education, calendar, messages, notifications]
    case 'staff':
      return [...base, ...staffItems, pdp, education, calendar, messages, notifications]
    case 'mentor':
      return [...base, ...mentorItems, pdp, education, calendar, messages, notifications]
    case 'educator':
      return [...base, ...educatorItems, education, calendar, messages, notifications]
    case 'parent':
      return [home, bookings, calendar, credits, messages, notifications]
    default:
      return [home, pdp, bookings, education, calendar, credits, achievements, messages, notifications]
  }
}

interface SidebarProps {
  role: Role
  userName: string
}

export default function Sidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const navItems = getNavItems(role)
  const initials = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-[#080808] border-r border-white/[0.06] flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/[0.06]">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="text-xl font-black tracking-[0.2em] text-[#C9A84C]"
                style={{ fontFamily: "'Arial Black', sans-serif" }}>
            GTB
          </span>
          <div className="w-px h-4 bg-white/10" />
          <span className="text-[10px] text-[#444] tracking-widest uppercase">
            Development
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-3 space-y-px overflow-y-auto">
        {navItems.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex items-center gap-3 px-3 py-2.5 text-[13px] transition-colors group rounded-sm',
                isActive
                  ? 'text-[#C9A84C] bg-[#C9A84C]/8'
                  : 'text-[#666] hover:text-[#CCC] hover:bg-white/[0.04]'
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-[#C9A84C] rounded-full" />
              )}
              <span className={cn(
                'w-4 h-4 flex-shrink-0 transition-colors',
                isActive ? 'text-[#C9A84C]' : 'text-[#444] group-hover:text-[#777]'
              )}>
                {item.icon}
              </span>
              <span className="tracking-wide">{item.label}</span>
              {item.badge && (
                <span className="ml-auto bg-[#C9A84C] text-black text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Division color strip */}
      <div className="flex h-[2px] mx-3 mb-3">
        {Object.values(DIVISIONS).map(d => (
          <div key={d.color} className="flex-1" style={{ backgroundColor: d.color }} />
        ))}
      </div>

      {/* User footer */}
      <div className="px-3 py-3 border-t border-white/[0.06] space-y-1">
        <Link href="/profile" className="flex items-center gap-3 px-2 py-2 rounded-sm hover:bg-white/[0.04] transition-colors">
          <div className="w-7 h-7 rounded-sm bg-[#C9A84C]/15 flex items-center justify-center text-[#C9A84C] text-[10px] font-black flex-shrink-0"
               style={{ fontFamily: "'Arial Black', sans-serif" }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] text-white font-medium truncate leading-tight">{userName}</p>
            <p className="text-[10px] text-[#444] capitalize tracking-wider">{role}</p>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-[#2E8B35] flex-shrink-0" />
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-2 py-2 rounded-sm text-[#555] hover:text-red-400 hover:bg-red-500/[0.06] transition-colors text-[13px] tracking-wide"
        >
          <LogoutIcon />
          Sign out
        </button>
      </div>
    </aside>
  )
}

// Icon components
function HomeIcon() { return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg> }
function ChartIcon() { return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg> }
function CalendarIcon() { return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg> }
function BookIcon() { return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg> }
function ClockIcon() { return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> }
function CoinIcon() { return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> }
function UsersIcon() { return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg> }
function BarChartIcon() { return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" /></svg> }
function LayersIcon() { return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" /></svg> }
function SettingsIcon() { return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> }
function PlayIcon() { return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" /></svg> }
function MessageIcon() { return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg> }
function BellIcon() { return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg> }
function ShieldIcon() { return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg> }
function LogoutIcon() { return <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg> }
function TrophyIcon() { return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" /></svg> }
