'use client'

import { motion } from 'framer-motion'
import { slideInLeft, slideInRight } from '@/lib/animations/variants'
import type { Variants } from 'framer-motion'

interface SlideInProps {
  children: React.ReactNode
  direction?: 'left' | 'right'
  delay?: number
  className?: string
  once?: boolean
}

export default function SlideIn({
  children,
  direction = 'left',
  delay = 0,
  className,
  once = true,
}: SlideInProps) {
  const base = direction === 'right' ? slideInRight : slideInLeft

  const variant: Variants = delay
    ? {
        hidden:  base.hidden,
        visible: {
          ...(base.visible as object),
          transition: {
            duration: 0.45,
            ease: [0.25, 0.1, 0.25, 1],
            delay,
          },
        },
      }
    : base

  return (
    <motion.div
      className={className}
      variants={variant}
      initial="hidden"
      whileInView="visible"
      viewport={{ once }}
    >
      {children}
    </motion.div>
  )
}
