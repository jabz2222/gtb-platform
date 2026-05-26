'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

interface ScrollReveal3DProps {
  children: React.ReactNode
  className?: string
  /** Perspective depth (px). Higher = more dramatic. Default 1200 */
  perspective?: number
  /** Starting rotateX in degrees. Default 14 */
  rotateXFrom?: number
  /** Starting Y offset in px. Default 60 */
  yFrom?: number
  /** Starting scale. Default 0.92 */
  scaleFrom?: number
  /**
   * Where to start/end the animation relative to the viewport.
   * Uses Framer Motion scroll offset syntax.
   * Default: ['start end', 'center center']
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  offset?: any[]
}

/**
 * Scroll-linked 3D perspective reveal.
 * Elements rotate from a tilted depth angle into their natural flat position as the user scrolls.
 */
export default function ScrollReveal3D({
  children,
  className,
  perspective = 1200,
  rotateXFrom = 14,
  yFrom = 60,
  scaleFrom = 0.92,
  offset = ['start end', 'center center'],
}: ScrollReveal3DProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset })

  const rotateX = useTransform(scrollYProgress, [0, 1], [rotateXFrom, 0])
  const y       = useTransform(scrollYProgress, [0, 1], [yFrom, 0])
  const opacity = useTransform(scrollYProgress, [0, 0.35], [0, 1])
  const scale   = useTransform(scrollYProgress, [0, 1], [scaleFrom, 1])

  return (
    <div ref={ref} style={{ perspective }} className={className}>
      <motion.div style={{ rotateX, y, opacity, scale, transformOrigin: 'top center' }}>
        {children}
      </motion.div>
    </div>
  )
}
