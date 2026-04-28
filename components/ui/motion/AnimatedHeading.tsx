'use client'

import { motion } from 'framer-motion'
import { staggerContainer, fadeUp } from '@/lib/animations/variants'
import type { ElementType } from 'react'

interface AnimatedHeadingProps {
  lines: React.ReactNode[]
  as?: ElementType
  className?: string
  lineClassName?: string
}

export default function AnimatedHeading({
  lines,
  as: Tag = 'h1',
  className,
  lineClassName,
}: AnimatedHeadingProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <Tag className={className}>
        {lines.map((line, i) => (
          <motion.span
            key={i}
            variants={fadeUp}
            className={`block ${lineClassName ?? ''}`}
          >
            {line}
          </motion.span>
        ))}
      </Tag>
    </motion.div>
  )
}
