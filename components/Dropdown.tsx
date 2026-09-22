'use client'

import { KeyboardEvent, useEffect, useId, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'

export interface DropdownOption<T extends string> {
  value: T
  label: string
}

interface DropdownProps<T extends string> {
  label: string
  value: T
  options: readonly DropdownOption<T>[]
  onChange: (value: T) => void
  size?: 'sm' | 'md'
}

/**
 * Select-only combobox (WAI-ARIA pattern): focus stays on the button, arrow keys move
 * the active option, Enter/Space picks it, Escape or a click outside closes the list.
 * Outside clicks are detected on the document — a `fixed inset-0` backdrop does not
 * cover the page inside `backdrop-filter`/`transform` ancestors like the form cards.
 */
export default function Dropdown<T extends string>({ label, value, options, onChange, size = 'md' }: DropdownProps<T>) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const id = useId()
  const selectedIndex = options.findIndex((o) => o.value === value)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  // Keep the active option visible while navigating with the keyboard
  useEffect(() => {
    if (open) listRef.current?.children[active]?.scrollIntoView({ block: 'nearest' })
  }, [open, active])

  const openList = () => {
    setActive(Math.max(0, selectedIndex))
    setOpen(true)
  }

  const choose = (index: number) => {
    onChange(options[index].value)
    setOpen(false)
  }

  const onKeyDown = (e: KeyboardEvent) => {
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault()
        openList()
      }
      return
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActive((i) => Math.min(options.length - 1, i + 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActive((i) => Math.max(0, i - 1))
        break
      case 'Home':
        e.preventDefault()
        setActive(0)
        break
      case 'End':
        e.preventDefault()
        setActive(options.length - 1)
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        choose(active)
        break
      case 'Escape':
        e.preventDefault()
        setOpen(false)
        break
      case 'Tab':
        setOpen(false)
        break
    }
  }

  const small = size === 'sm'

  return (
    <div ref={rootRef} className="flex flex-col gap-1.5 relative">
      <span
        id={`${id}-label`}
        className={`${small ? 'text-[11px]' : 'text-xs'} font-medium text-[var(--text-muted)] uppercase tracking-wide`}
      >
        {label}
      </span>
      <button
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-labelledby={`${id}-label`}
        aria-activedescendant={open ? `${id}-option-${active}` : undefined}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
        className={`flex items-center justify-between w-full bg-[var(--bg-input)] border border-[var(--border-input)] rounded-lg ${
          small ? 'px-3 py-1.5 text-xs' : 'px-3 py-2 text-sm'
        } text-[var(--text-main)] hover:border-[#7C5CFC]/60 transition-all duration-150 text-left focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/50`}
      >
        <span>{options[selectedIndex]?.label ?? value}</span>
        <ChevronDown
          size={small ? 12 : 14}
          className={`text-[var(--text-muted)] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <ul
          ref={listRef}
          id={`${id}-list`}
          role="listbox"
          aria-labelledby={`${id}-label`}
          className="absolute top-[calc(100%+4px)] left-0 w-full z-20 bg-[var(--bg-input)] border border-[var(--border-input)] rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] py-1.5 max-h-56 overflow-y-auto backdrop-blur-md slide-down"
        >
          {options.map((opt, i) => {
            const isSelected = opt.value === value
            return (
              <li
                key={opt.value}
                id={`${id}-option-${i}`}
                role="option"
                aria-selected={isSelected}
                onPointerEnter={() => setActive(i)}
                onClick={() => choose(i)}
                className={`w-full text-left ${small ? 'px-3.5 py-1.5 text-xs' : 'px-4 py-2 text-sm'} cursor-pointer transition-all duration-150 flex items-center justify-between ${
                  isSelected
                    ? 'bg-[#7C5CFC]/15 text-[var(--text-accent)] font-semibold'
                    : i === active
                      ? 'bg-[#7C5CFC]/10 text-[var(--text-main)]'
                      : 'text-[var(--text-light)]'
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#7C5CFC]" />}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
