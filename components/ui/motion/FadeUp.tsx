'use client'

import { motion } from 'framer-motion'
import { fadeUp } from '@/lib/animations/variants'
import type { Variants } from 'framer-motion'

interface FadeUpProps {
  children: React.ReactNode
  delay?: number
  className?: string
  once?: boolean
}

export default function FadeUp({ children, delay = 0, className, once = true }: FadeUpProps) {
  const variant: Variants = delay
    ? {
        hidden:  fadeUp.hidden,
        visible: {
          ...(fadeUp.visible as object),
          transition: {
            duration: 0.45,
            ease: [0.25, 0.1, 0.25, 1],
            delay,
          },
        },
      }
    : fadeUp

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
