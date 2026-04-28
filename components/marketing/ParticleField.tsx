'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  gold: boolean
}

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Respect reduced motion — skip animation entirely
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const count = 55
    const particles: Particle[] = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 1.8 + 0.4,
      opacity: Math.random() * 0.45 + 0.08,
      gold: Math.random() > 0.6,
    }))

    // Static render for reduced-motion users — draw once and stop
    if (prefersReduced) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.gold
          ? `rgba(201, 168, 76, ${p.opacity})`
          : `rgba(255, 255, 255, ${p.opacity * 0.35})`
        ctx.fill()
      })
      return () => window.removeEventListener('resize', resize)
    }

    // Throttle to ~30fps to keep CPU usage low
    let lastTime = 0
    const FPS = 30
    const interval = 1000 / FPS

    const draw = (now: number) => {
      animRef.current = requestAnimationFrame(draw)

      if (now - lastTime < interval) return
      lastTime = now

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach(p => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.gold
          ? `rgba(201, 168, 76, ${p.opacity})`
          : `rgba(255, 255, 255, ${p.opacity * 0.35})`
        ctx.fill()

        p.x += p.vx
        p.y += p.vy
        if (p.x < -2) p.x = canvas.width + 2
        if (p.x > canvas.width + 2) p.x = -2
        if (p.y < -2) p.y = canvas.height + 2
        if (p.y > canvas.height + 2) p.y = -2
      })
    }

    animRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  )
}
