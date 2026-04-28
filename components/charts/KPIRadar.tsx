'use client'

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

interface KPIDataPoint {
  subject: string
  value: number
  fullMark: number
}

interface KPIRadarProps {
  data: KPIDataPoint[]
  color?: string
}

export default function KPIRadar({ data, color = '#C9A84C' }: KPIRadarProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
        <PolarGrid stroke="#1E1E1E" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fill: '#555', fontSize: 11, fontFamily: 'sans-serif' }}
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
        />
        <Radar
          name="KPI"
          dataKey="value"
          stroke={color}
          fill={color}
          fillOpacity={0.15}
          strokeWidth={1.5}
          dot={{ fill: color, r: 3 }}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
