'use client'

import { useCallback, useSyncExternalStore } from 'react'

// Browser-only state read through useSyncExternalStore: the server render (and hydration)
// uses the fallback, then React re-renders with the real value — no hydration mismatch
// and no setState-in-effect round trip.

const noopSubscribe = () => () => {}

/** false during SSR/hydration, true afterwards in the browser. */
export function useIsClient(): boolean {
  return useSyncExternalStore(noopSubscribe, () => true, () => false)
}

/** The page origin in the browser, `fallback` on the server. */
export function useOrigin(fallback: string): string {
  return useSyncExternalStore(noopSubscribe, () => window.location.origin, () => fallback)
}

// ── localStorage-backed choices (language, theme) ─────────
const listeners = new Set<() => void>()
// Keeps choices working for the session when localStorage is blocked (private mode, etc.)
const memory = new Map<string, string>()

function subscribeStorage(callback: () => void) {
  listeners.add(callback)
  window.addEventListener('storage', callback)
  return () => {
    listeners.delete(callback)
    window.removeEventListener('storage', callback)
  }
}

function readStorage(key: string): string | null {
  if (memory.has(key)) return memory.get(key)!
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

export function useStoredChoice<T extends string>(
  key: string,
  options: readonly T[],
  fallback: T
): [T, (value: T) => void] {
  const stored = useSyncExternalStore(subscribeStorage, () => readStorage(key), () => null)
  const value = stored !== null && (options as readonly string[]).includes(stored) ? (stored as T) : fallback

  const setValue = useCallback(
    (next: T) => {
      memory.set(key, next)
      try {
        window.localStorage.setItem(key, next)
      } catch {
        // Storage unavailable — the in-memory value still applies
      }
      listeners.forEach((listener) => listener())
    },
    [key]
  )

  return [value, setValue]
}
