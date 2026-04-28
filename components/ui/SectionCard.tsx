interface SectionCardProps {
  title: string
  titleColor?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
  noPadding?: boolean
}

export default function SectionCard({
  title,
  titleColor = '#C9A84C',
  action,
  children,
  className = '',
  noPadding = false,
}: SectionCardProps) {
  return (
    <div className={`bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden ${className}`}>
      <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
        <span
          className="text-[11px] tracking-[0.3em] uppercase"
          style={{ color: titleColor }}
        >
          {title}
        </span>
        {action && <div>{action}</div>}
      </div>
      <div className={noPadding ? '' : 'p-5'}>{children}</div>
    </div>
  )
}
