import { requireRole } from '@/lib/auth/requireRole'
import { CANCELLATION_POLICY } from '@/lib/utils/constants'

export default async function AdminSettingsPage() {
  await requireRole(['admin'])

  return (
    <div>
      <div className="mb-8">
        <p className="text-[#C9A84C] text-[11px] tracking-[0.3em] uppercase mb-2">Admin</p>
        <h1
          className="text-4xl font-black tracking-wider text-white uppercase"
          style={{ fontFamily: "'Arial Black', sans-serif" }}
        >
          Platform <span style={{ color: '#C9A84C' }}>Settings</span>
        </h1>
        <p className="text-[#444] mt-1.5 text-sm">Platform configuration and policies</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cancellation policy */}
        <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">Cancellation Policy</span>
          </div>
          <div className="p-5 space-y-4">
            {[
              {
                label: 'Notice Period',
                value: `${CANCELLATION_POLICY.noticePeriodHours} hours`,
                description: 'Minimum notice required for a full credit refund',
              },
              {
                label: 'Full Refund',
                value: `${CANCELLATION_POLICY.fullRefundPercent}% credit`,
                description: `Given when cancelled with ${CANCELLATION_POLICY.noticePeriodHours}+ hours notice`,
              },
              {
                label: 'Late Cancellation',
                value: `${CANCELLATION_POLICY.breachRefundPercent}% credit`,
                description: `Given when cancelled with under ${CANCELLATION_POLICY.noticePeriodHours} hours notice`,
              },
              {
                label: 'No Show',
                value: '0% refund',
                description: 'Full deposit retained on no-show',
              },
            ].map(row => (
              <div key={row.label} className="flex items-start justify-between gap-4 pb-4 border-b border-white/[0.04] last:border-0 last:pb-0">
                <div>
                  <p className="text-xs font-medium text-white">{row.label}</p>
                  <p className="text-[11px] text-[#444] mt-0.5">{row.description}</p>
                </div>
                <span className="text-sm text-[#C9A84C] flex-shrink-0 font-medium">{row.value}</span>
              </div>
            ))}
            <p className="text-[11px] text-[#333] mt-2">
              Policy values are defined in <code className="text-[#555]">lib/utils/constants.ts</code> and updated via code deployment.
            </p>
          </div>
        </div>

        {/* Platform info */}
        <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">Platform Info</span>
          </div>
          <div className="p-5 space-y-3">
            {[
              { label: 'Organisation', value: 'GTB Development Ltd' },
              { label: 'Location', value: 'South East London, UK' },
              { label: 'Contact', value: 'info@gtbdevelopment.co.uk' },
              { label: 'Environment', value: process.env.NODE_ENV ?? 'development' },
              { label: 'Auth Provider', value: 'Supabase' },
              { label: 'Hosting', value: 'Vercel' },
            ].map(row => (
              <div key={row.label} className="flex justify-between text-sm">
                <span className="text-[#444]">{row.label}</span>
                <span className="text-white">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Divisions config */}
        <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">Active Divisions</span>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {[
              { name: 'GTB Football',  color: '#5BB8E8', status: 'Active' },
              { name: 'GTB Fitness',   color: '#2E8B35', status: 'Active' },
              { name: 'GTB Sports',    color: '#E8641A', status: 'Active' },
              { name: 'GTB Mentoring', color: '#9B2454', status: 'Active' },
              { name: 'GTB Education', color: '#CC2222', status: 'Active' },
            ].map(d => (
              <div key={d.name} className="px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                  <span className="text-sm text-white">{d.name}</span>
                </div>
                <span className="text-[11px] text-[#2E8B35] uppercase tracking-wider">{d.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tier config */}
        <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">Tier Configuration</span>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {[
              { name: 'Free',   color: '#888',    description: 'Public access, basic features' },
              { name: 'Bronze', color: '#CD7F32', description: 'Entry-level programme access' },
              { name: 'Silver', color: '#C9A84C', description: 'Full platform access' },
              { name: 'Gold',   color: '#FFD700', description: 'Elite development access' },
            ].map(t => (
              <div key={t.name} className="px-5 py-3">
                <div className="flex items-center gap-2 mb-0.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: t.color }} />
                  <span className="text-xs font-medium text-white">{t.name}</span>
                </div>
                <p className="text-[11px] text-[#444] ml-3.5">{t.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
