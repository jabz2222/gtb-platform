interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  color?: string
  icon?: React.ReactNode
}

export default function StatCard({
  label,
  value,
  sub,
  color = '#C9A84C',
  icon,
}: StatCardProps) {
  return (
    <div className="relative bg-[#0D0D0D] p-6">
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: color }} />
      {icon && (
        <div className="w-8 h-8 flex items-center justify-center mb-4" style={{ color }}>
          {icon}
        </div>
      )}
      <div
        className="text-[2.5rem] font-black leading-none mb-1 tabular-nums"
        style={{ color, fontFamily: "'Arial Black', sans-serif" }}
      >
        {value}
      </div>
      <div className="text-xs font-semibold text-white uppercase tracking-wider mb-0.5">
        {label}
      </div>
      {sub && <div className="text-xs text-[#444]">{sub}</div>}
    </div>
  )
}
