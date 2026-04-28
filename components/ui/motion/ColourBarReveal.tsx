'use client'

import { motion } from 'framer-motion'

const DIVISION_COLORS = ['#5BB8E8', '#2E8B35', '#E8641A', '#9B2454', '#CC2222']

const ease = [0.25, 0.1, 0.25, 1] as const

export default function ColourBarReveal() {
  return (
    <div className="flex h-[2px]">
      {DIVISION_COLORS.map((color, i) => (
        <motion.div
          key={color}
          className="flex-1"
          style={{ backgroundColor: color }}
          initial={{ scaleX: 0, transformOrigin: 'left' }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease, delay: i * 0.07 }}
        />
      ))}
    </div>
  )
}
