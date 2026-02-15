import { useCallback, useEffect, useSyncExternalStore } from 'react'

type Theme = 'light' | 'dark'

const STORAGE_KEY = 'fixacv-theme'
const DARK_CLASS = 'dark'

let listeners: Array<() => void> = []

function emitChange() {
  for (const listener of listeners) {
    listener()
  }
}

function getSystemPreference(): Theme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getStoredPreference(): Theme | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    // localStorage unavailable
  }
  return null
}

function getEffectiveTheme(): Theme {
  return getStoredPreference() ?? getSystemPreference()
}

const THEME_COLORS: Record<Theme, string> = {
  light: '#ffffff',
  dark: '#101828', // Tailwind v4 gray-900 oklch(21% .034 264.665) → hex
}

function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add(DARK_CLASS)
  } else {
    root.classList.remove(DARK_CLASS)
  }

  const metaTag = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
  if (metaTag) {
    metaTag.setAttribute('content', THEME_COLORS[theme])
  }
}

// Apply on load (before React hydrates) so there's no flash
if (typeof document !== 'undefined') {
  applyTheme(getEffectiveTheme())
}

function subscribe(callback: () => void) {
  listeners = [...listeners, callback]
  return () => {
    listeners = listeners.filter((l) => l !== callback)
  }
}

function getSnapshot(): Theme {
  return getEffectiveTheme()
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, () => 'light' as Theme)

  // Listen to OS preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      applyTheme(getEffectiveTheme())
      emitChange()
    }

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }

    mediaQuery.addListener(handleChange)
    return () => mediaQuery.removeListener(handleChange)
  }, [])

  // Keep DOM in sync
  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    const current = getEffectiveTheme()
    const next: Theme = current === 'dark' ? 'light' : 'dark'
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // localStorage unavailable
    }
    applyTheme(next)
    emitChange()

    // iOS Safari only reads theme-color / status-bar tint at page load.
    // A soft reload after a tiny delay lets the new theme take effect
    // for the status bar while keeping the transition feeling snappy.
    const isSafariMobile =
      typeof navigator !== 'undefined' &&
      /iPhone|iPad|iPod/.test(navigator.userAgent) &&
      /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    if (isSafariMobile) {
      setTimeout(() => window.location.reload(), 50)
    }
  }, [])

  return { theme, toggleTheme } as const
}
