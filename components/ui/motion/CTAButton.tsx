'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import type { ComponentProps } from 'react'

type CTAButtonProps = ComponentProps<typeof Link> & {
  children: React.ReactNode
  className?: string
}

export default function CTAButton({ children, className, href, ...props }: CTAButtonProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
      className="inline-flex"
    >
      <Link href={href} className={className} {...props}>
        {children}
      </Link>
    </motion.div>
  )
}
