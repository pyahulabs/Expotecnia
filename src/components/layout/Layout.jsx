import { Suspense, useCallback, useEffect, useState } from 'react'
import { useLocation, useOutlet } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { pageTransition } from '@/lib/motion'
import { useLocalStorage } from '@/lib/useLocalStorage'
import { Loading, Skeleton, SkeletonStatCard } from '@/components/ui'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { CommandPalette } from './CommandPalette'

function PageSkeleton() {
  return (
    <Loading label="Cargando página…">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-3 h-8 w-64" />
      <Skeleton className="mt-3 h-4 w-96 max-w-full" />
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>
      <Skeleton className="mt-6 h-80 w-full rounded-2xl" />
    </Loading>
  )
}

/** Estructura general: sidebar + header + contenido con transición entre páginas. */
export function Layout() {
  const location = useLocation()
  const outlet = useOutlet()
  const [collapsed, setCollapsed] = useLocalStorage('erp.sidebar.collapsed', false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  const closeMobile = useCallback(() => setMobileOpen(false), [])
  const closeSearch = useCallback(() => setSearchOpen(false), [])

  // Atajo global del buscador
  useEffect(() => {
    const onKey = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen((open) => !open)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [location.pathname])

  return (
    <div className="flex min-h-dvh bg-canvas">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        Saltar al contenido
      </a>

      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} mobileOpen={mobileOpen} onMobileClose={closeMobile} />

      <div className="relative flex min-w-0 flex-1 flex-col">
        {/* Brillo tenue de la marca en la parte superior del área de trabajo */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] overflow-hidden" aria-hidden="true">
          <div className="absolute -top-40 left-[10%] size-[520px] rounded-full opacity-[0.10] blur-[90px] dark:opacity-[0.16]" style={{ background: 'var(--primary)', animation: 'mesh-a 18s ease-in-out infinite', willChange: 'transform' }} />
          <div className="absolute -top-48 right-[8%] size-[440px] rounded-full opacity-[0.07] blur-[90px] dark:opacity-[0.12]" style={{ background: 'var(--accent)', animation: 'mesh-c 24s ease-in-out infinite', willChange: 'transform' }} />
        </div>
        <Header onOpenMenu={() => setMobileOpen(true)} onOpenSearch={() => setSearchOpen(true)} />
        <main id="contenido" tabIndex={-1} className="relative flex-1 outline-none">
          <div className="mx-auto w-full max-w-[1480px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={location.pathname} {...pageTransition}>
                <Suspense fallback={<PageSkeleton />}>{outlet}</Suspense>
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      <CommandPalette open={searchOpen} onClose={closeSearch} />
    </div>
  )
}
