'use client'

import { useState, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'

interface ThemeToggleProps {
  theme: 'light' | 'dark'
  onChange: (theme: 'light' | 'dark') => void
}

export default function ThemeToggle({ theme, onChange }: ThemeToggleProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="w-9 h-9" /> // placeholder to prevent layout shifts
  }

  const toggleTheme = (e: React.MouseEvent<HTMLButtonElement>) => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'

    // Check if View Transition API is supported (modern Chrome/Safari/Edge)
    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      const x = e.clientX
      const y = e.clientY
      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      )

      // Start view transition
      // @ts-ignore
      const transition = document.startViewTransition(() => {
        onChange(nextTheme)
      })

      transition.ready.then(() => {
        const clipPath = [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`
        ]
        document.documentElement.animate(
          {
            clipPath: nextTheme === 'dark' ? [...clipPath].reverse() : clipPath
          },
          {
            duration: 500,
            easing: 'ease-in-out',
            pseudoElement: nextTheme === 'dark' ? '::view-transition-old(root)' : '::view-transition-new(root)'
          }
        )
      })
    } else {
      // Fallback: normal theme toggle
      onChange(nextTheme)
    }
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#15151f] dark:bg-[#15151f] light:bg-[#f1f5f9] border border-[#2a2a3a] dark:border-[#2a2a3a] light:border-[#e2e8f0] text-gray-400 hover:text-gray-200 dark:hover:text-gray-200 light:hover:text-gray-700 hover:border-[#7C5CFC]/40 active:scale-90 transition-all duration-150 relative overflow-hidden group shadow-md"
    >
      <div className="relative w-4.5 h-4.5 transition-transform duration-500 group-hover:rotate-12">
        {theme === 'dark' ? (
          <Sun size={18} className="text-amber-400 transition-all duration-500 scale-100 rotate-0" />
        ) : (
          <Moon size={18} className="text-[#7C5CFC] transition-all duration-500 scale-100 rotate-0" />
        )}
      </div>
    </button>
  )
}
