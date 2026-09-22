'use client'

import { useCallback, useSyncExternalStore } from 'react'
import { DEFAULT_DATA, normalizeProfileData, ProfileData } from './readme-generator'

// The form survives reloads and the GitHub OAuth redirect (which leaves the page):
// it lives in a small external store that is persisted to localStorage.

const STORAGE_KEY = 'readme_form_v1'
const SAVE_DELAY_MS = 300

let current: ProfileData | null = null
let saveTimer: ReturnType<typeof setTimeout> | undefined
const listeners = new Set<() => void>()

function load(): ProfileData {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? normalizeProfileData(JSON.parse(raw)) : DEFAULT_DATA
  } catch {
    return DEFAULT_DATA
  }
}

function getSnapshot(): ProfileData {
  if (!current) current = load()
  return current
}

function flush() {
  if (saveTimer === undefined) return
  clearTimeout(saveTimer)
  saveTimer = undefined
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current))
  } catch {
    // Storage full or blocked — the form still works for this visit
  }
}

function subscribe(listener: () => void) {
  if (listeners.size === 0) {
    // Save pending edits before the page is left (e.g. "Connect GitHub")
    window.addEventListener('pagehide', flush)
  }
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) window.removeEventListener('pagehide', flush)
  }
}

function setProfileData(next: ProfileData) {
  current = next
  clearTimeout(saveTimer)
  saveTimer = setTimeout(flush, SAVE_DELAY_MS)
  listeners.forEach((listener) => listener())
}

export function useProfileData() {
  const data = useSyncExternalStore(subscribe, getSnapshot, () => DEFAULT_DATA)

  const setData = useCallback((next: ProfileData | ((prev: ProfileData) => ProfileData)) => {
    setProfileData(typeof next === 'function' ? next(getSnapshot()) : next)
  }, [])

  const resetData = useCallback(() => {
    clearTimeout(saveTimer)
    saveTimer = undefined
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
    current = DEFAULT_DATA
    listeners.forEach((listener) => listener())
  }, [])

  return [data, setData, resetData] as const
}
