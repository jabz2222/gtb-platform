'use client'

import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

interface TiltCardProps {
  children: React.ReactNode
  className?: string
  /** Maximum tilt in degrees. Default 8 */
  maxTilt?: number
  /** Spring stiffness for smoothness. Default 150 */
  stiffness?: number
  /** Spring damping. Default 20 */
  damping?: number
  /** Perspective depth (px). Default 800 */
  perspective?: number
  /** Subtle shine overlay on hover. Default true */
  shine?: boolean
}

/**
 * Mouse-tracking 3D tilt card. Responds to cursor position over the card
 * with a natural rotateX/Y perspective tilt. Snaps back on mouse leave.
 */
export default function TiltCard({
  children,
  className = '',
  maxTilt = 8,
  stiffness = 150,
  damping = 20,
  perspective = 800,
  shine = true,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)

  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)

  const rotateX = useSpring(useTransform(rawY, [-0.5, 0.5], [maxTilt, -maxTilt]), { stiffness, damping })
  const rotateY = useSpring(useTransform(rawX, [-0.5, 0.5], [-maxTilt, maxTilt]), { stiffness, damping })

  const shineX = useTransform(rawX, [-0.5, 0.5], ['0%', '100%'])
  const shineY = useTransform(rawY, [-0.5, 0.5], ['0%', '100%'])
  const shineOpacity = useSpring(0, { stiffness, damping })

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    rawX.set((e.clientX - rect.left) / rect.width - 0.5)
    rawY.set((e.clientY - rect.top)  / rect.height - 0.5)
    shineOpacity.set(0.12)
  }

  function onMouseLeave() {
    rawX.set(0)
    rawY.set(0)
    shineOpacity.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ perspective, rotateX, rotateY, transformStyle: 'preserve-3d' }}
      className={`relative ${className}`}
    >
      {children}
      {shine && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{
            opacity: shineOpacity,
            background: useTransform(
              [shineX, shineY],
              ([x, y]) =>
                `radial-gradient(circle at ${x} ${y}, rgba(201,168,76,0.3) 0%, transparent 60%)`
            ),
          }}
        />
      )}
    </motion.div>
  )
}
