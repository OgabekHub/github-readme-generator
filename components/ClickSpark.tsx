'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  alpha: number
  decay: number
}

// Colors for the sparks (neon theme)
const COLORS = ['#7C5CFC', '#a855f7', '#00f2fe', '#4facfe', '#00ff87', '#f39c12', '#ff007f']

export default function ClickSpark() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const particlesRef = useRef<Particle[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let animationId = 0

    // Draw in device pixels so sparks stay crisp on HiDPI screens
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const createSparks = (x: number, y: number) => {
      const particleCount = 12 + Math.floor(Math.random() * 8)
      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = 2 + Math.random() * 4
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1, // slight upward bias
          size: 2 + Math.random() * 3,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          alpha: 1,
          decay: 0.015 + Math.random() * 0.02,
        })
      }
    }

    const tick = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

      const particles = particlesRef.current
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.08 // gravity
        p.vx *= 0.98 // air resistance
        p.vy *= 0.98
        p.alpha -= p.decay

        if (p.alpha <= 0) {
          particles.splice(i, 1)
          continue
        }

        ctx.save()
        ctx.globalAlpha = p.alpha
        ctx.shadowBlur = 8
        ctx.shadowColor = p.color
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      // Only keep the frame loop running while there is something to draw
      animationId = particles.length > 0 ? requestAnimationFrame(tick) : 0
    }

    const handleWindowClick = (e: MouseEvent) => {
      if (reducedMotion.matches) return
      createSparks(e.clientX, e.clientY)
      if (!animationId) animationId = requestAnimationFrame(tick)
    }

    window.addEventListener('click', handleWindowClick)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('click', handleWindowClick)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="click-spark fixed inset-0 w-full h-full pointer-events-none z-[9999]"
    />
  )
}
