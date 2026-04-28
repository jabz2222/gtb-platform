type BadgeVariant =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'no_show'
  | 'admin'
  | 'staff'
  | 'mentor'
  | 'educator'
  | 'client'
  | 'minor'
  | string

const VARIANT_STYLES: Record<string, { bg: string; text: string }> = {
  // Booking statuses
  pending:   { bg: 'bg-[#C9A84C]/15', text: 'text-[#C9A84C]' },
  confirmed: { bg: 'bg-[#2E8B35]/15', text: 'text-[#2E8B35]' },
  cancelled: { bg: 'bg-[#CC2222]/15', text: 'text-[#CC2222]' },
  completed: { bg: 'bg-white/8',      text: 'text-[#888]'    },
  no_show:   { bg: 'bg-[#E8641A]/15', text: 'text-[#E8641A]' },
  // Roles
  admin:     { bg: 'bg-[#C9A84C]/15', text: 'text-[#C9A84C]' },
  staff:     { bg: 'bg-[#5BB8E8]/15', text: 'text-[#5BB8E8]' },
  mentor:    { bg: 'bg-[#9B2454]/20', text: 'text-[#C06080]' },
  educator:  { bg: 'bg-[#CC2222]/15', text: 'text-[#CC2222]' },
  client:    { bg: 'bg-white/8',      text: 'text-[#888]'    },
  minor:     { bg: 'bg-white/5',      text: 'text-[#666]'    },
}

interface StatusBadgeProps {
  variant: BadgeVariant
  label?: string
}

export default function StatusBadge({ variant, label }: StatusBadgeProps) {
  const styles = VARIANT_STYLES[variant] ?? { bg: 'bg-white/8', text: 'text-[#888]' }
  const displayLabel = label ?? variant.replace('_', ' ')

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-bold
                  uppercase tracking-wider ${styles.bg} ${styles.text}`}
    >
      {displayLabel}
    </span>
  )
}
