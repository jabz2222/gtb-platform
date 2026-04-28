'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface PerformanceDataPoint {
  date: string
  score: number
}

interface PerformanceBarProps {
  data: PerformanceDataPoint[]
  color?: string
}

export default function PerformanceBar({ data, color = '#C9A84C' }: PerformanceBarProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: '#444', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, 10]}
          tick={{ fill: '#444', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#0D0D0D',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '2px',
            fontSize: 12,
            color: '#fff',
          }}
          formatter={(val) => [`${val as number}/10`, 'Score']}
          cursor={{ fill: 'rgba(255,255,255,0.03)' }}
        />
        <Bar dataKey="score" fill={color} radius={[2, 2, 0, 0]} maxBarSize={32} />
      </BarChart>
    </ResponsiveContainer>
  )
}
