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

export default function ClickSpark() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const particlesRef = useRef<Particle[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Colors for the sparks (neon theme)
    const colors = ['#7C5CFC', '#a855f7', '#00f2fe', '#4facfe', '#00ff87', '#f39c12', '#ff007f']

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
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          decay: 0.015 + Math.random() * 0.02,
        })
      }
    }

    const handleWindowClick = (e: MouseEvent) => {
      createSparks(e.clientX, e.clientY)
    }

    window.addEventListener('click', handleWindowClick)

    let animationId: number

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

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

      animationId = requestAnimationFrame(tick)
    }

    tick()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('click', handleWindowClick)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999]"
      style={{ mixBlendMode: 'screen' }}
    />
  )
}
