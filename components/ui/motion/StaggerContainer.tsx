'use client'

import { motion } from 'framer-motion'
import { staggerContainer } from '@/lib/animations/variants'

interface StaggerContainerProps {
  children: React.ReactNode
  className?: string
  once?: boolean
}

export default function StaggerContainer({
  children,
  className,
  once = true,
}: StaggerContainerProps) {
  return (
    <motion.div
      className={className}
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once }}
    >
      {children}
    </motion.div>
  )
}
