'use client'

import { useEffect } from 'react'

const INTERACTIVE = 'button, a, label, [role="option"], [role="tab"]'
const RIPPLE_MS = 400

/**
 * Minimal click feedback: a small accent ring that fades out where a button,
 * link or option is pressed. No canvas and no animation loop; skipped entirely
 * when the user prefers reduced motion.
 */
export default function ClickRipple() {
  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

    const onPointerDown = (e: PointerEvent) => {
      if (reducedMotion.matches || e.button !== 0) return
      if (!(e.target instanceof Element) || !e.target.closest(INTERACTIVE)) return

      const ring = document.createElement('span')
      ring.className = 'click-ripple'
      ring.setAttribute('aria-hidden', 'true')
      ring.style.left = `${e.clientX}px`
      ring.style.top = `${e.clientY}px`
      document.body.appendChild(ring)
      setTimeout(() => ring.remove(), RIPPLE_MS + 50)
    }

    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  return null
}
