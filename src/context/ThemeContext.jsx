import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const ThemeContext = createContext({ theme: 'light', toggleTheme: () => {}, setTheme: () => {} })
const STORAGE_KEY = 'erp.theme'

/** Tema que pide el entorno: atributo data-theme del visor o, si no hay, el del sistema operativo. */
const hostTheme = () => {
  const attr = document.documentElement.getAttribute('data-theme')
  if (attr === 'dark' || attr === 'light') return attr
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const getInitialTheme = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'dark' || saved === 'light') return saved
  } catch {
    /* almacenamiento no disponible */
  }
  return hostTheme()
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitialTheme)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    document.querySelector('meta[name="theme-color"]')?.remove()
    const meta = document.createElement('meta')
    meta.name = 'theme-color'
    meta.content = theme === 'dark' ? '#0e0d0c' : '#f7f6f3'
    document.head.appendChild(meta)
  }, [theme])

  const setTheme = useCallback((next) => {
    setThemeState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* almacenamiento no disponible */
    }
  }, [])

  const toggleTheme = useCallback(() => setTheme(theme === 'dark' ? 'light' : 'dark'), [theme, setTheme])

  // Si el visor o el sistema cambian de tema mientras la app está abierta, se los sigue
  useEffect(() => {
    const follow = () => setTheme(hostTheme())
    const observer = new MutationObserver(follow)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    const media = window.matchMedia?.('(prefers-color-scheme: dark)')
    media?.addEventListener?.('change', follow)
    return () => {
      observer.disconnect()
      media?.removeEventListener?.('change', follow)
    }
  }, [setTheme])

  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, setTheme, toggleTheme])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
