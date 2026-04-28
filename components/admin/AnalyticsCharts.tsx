'use client'

import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

interface MonthlyData {
  month: string
  count: number
  revenue: number
}

export default function AnalyticsCharts({ monthlyData }: { monthlyData: MonthlyData[] }) {
  const tooltipStyle = {
    contentStyle: {
      backgroundColor: '#0D0D0D',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '2px',
      fontSize: 12,
      color: '#fff',
    },
    cursor: { fill: 'rgba(255,255,255,0.03)' },
  }

  const axisProps = {
    tick: { fill: '#444', fontSize: 10 },
    axisLine: false,
    tickLine: false,
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Bookings per month */}
      <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5">
          <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">Bookings per Month</span>
        </div>
        <div className="p-5">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" vertical={false} />
              <XAxis dataKey="month" {...axisProps} />
              <YAxis {...axisProps} />
              <Tooltip {...tooltipStyle} formatter={(v) => [v as number, 'Bookings']} />
              <Bar dataKey="count" fill="#5BB8E8" radius={[2, 2, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue per month */}
      <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5">
          <span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A84C]">Revenue per Month (£)</span>
        </div>
        <div className="p-5">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlyData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" vertical={false} />
              <XAxis dataKey="month" {...axisProps} />
              <YAxis {...axisProps} tickFormatter={(v: number) => `£${v / 100}`} />
              <Tooltip
                {...tooltipStyle}
                formatter={(v) => [`£${((v as number) / 100).toFixed(2)}`, 'Revenue']}
              />
              <Line
                dataKey="revenue"
                stroke="#C9A84C"
                strokeWidth={1.5}
                dot={{ fill: '#C9A84C', r: 3 }}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
