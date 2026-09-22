'use client'

import { Sun, Moon } from 'lucide-react'

interface ThemeToggleProps {
  theme: 'light' | 'dark'
  onChange: (theme: 'light' | 'dark') => void
  label: string
}

export default function ThemeToggle({ theme, onChange, label }: ThemeToggleProps) {
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

      // Add temporary class to disable page-wide transitions during transition
      document.documentElement.classList.add('theme-switching')

      // Start view transition
      const transition = document.startViewTransition(() => {
        onChange(nextTheme)
      })

      transition.ready.then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${endRadius}px at ${x}px ${y}px)`
            ]
          },
          {
            duration: 450,
            easing: 'ease-out',
            pseudoElement: '::view-transition-new(root)'
          }
        )
      })

      // Clean up class after transition completes
      transition.finished.then(() => {
        document.documentElement.classList.remove('theme-switching')
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
      aria-label={label}
      title={label}
      className="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center bg-[var(--bg-input)] border border-[var(--border-input)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[#7C5CFC]/40 active:scale-90 transition-all duration-150 relative overflow-hidden group shadow-md"
    >
      <div className="relative w-[18px] h-[18px] transition-transform duration-500 group-hover:rotate-12">
        {theme === 'dark' ? (
          <Sun size={18} className="text-amber-400 transition-all duration-500 scale-100 rotate-0" />
        ) : (
          <Moon size={18} className="text-[#7C5CFC] transition-all duration-500 scale-100 rotate-0" />
        )}
      </div>
    </button>
  )
}
