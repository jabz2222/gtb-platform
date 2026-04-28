interface PageHeaderProps {
  eyebrow: string
  title: string
  accent?: string
  subtitle?: string
  color?: string
}

export default function PageHeader({
  eyebrow,
  title,
  accent,
  subtitle,
  color = '#C9A84C',
}: PageHeaderProps) {
  return (
    <div className="mb-10">
      <p className="text-[11px] tracking-[0.3em] uppercase mb-2" style={{ color }}>
        {eyebrow}
      </p>
      <h1
        className="text-4xl font-black tracking-wider text-white uppercase"
        style={{ fontFamily: "'Arial Black', sans-serif" }}
      >
        {accent ? (
          <>
            {title} <span style={{ color }}>{accent}</span>
          </>
        ) : (
          title
        )}
      </h1>
      {subtitle && (
        <p className="text-[#444] mt-1.5 text-sm tracking-wide">{subtitle}</p>
      )}
    </div>
  )
}
