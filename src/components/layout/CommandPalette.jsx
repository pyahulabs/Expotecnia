import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { CornerDownLeft, DatabaseZap, FolderKanban, Moon, PlugZap, Search, ShieldCheck, Sun, User } from 'lucide-react'
import { cn } from '@/lib/cn'
import { ease } from '@/lib/motion'
import { normalize } from '@/lib/format'
import { NAV_ITEMS } from '@/config/navigation'
import { COLECCIONES } from '@/config/constants'
import { useCollection } from '@/firebase/hooks'
import { useTheme } from '@/context/ThemeContext'
import { useDemoActions } from '@/lib/useDemoActions'

/** Buscador global (Ctrl/⌘ + K): páginas, acciones y registros de los módulos. */
export function CommandPalette({ open, onClose }) {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const { seed, test } = useDemoActions()
  const { data: empleados } = useCollection(COLECCIONES.empleados)
  const { data: noConformidades } = useCollection(COLECCIONES.noConformidades)
  const { data: tareas } = useCollection(COLECCIONES.tareas)

  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const list = useRef(null)
  const input = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    setQuery('')
    setActive(0)
    const timer = setTimeout(() => input.current?.focus(), 40)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      clearTimeout(timer)
      document.body.style.overflow = previous
    }
  }, [open])

  const groups = useMemo(() => {
    const q = normalize(query.trim())
    const match = (...texts) => !q || texts.some((t) => normalize(t).includes(q))
    const go = (path) => () => navigate(path)

    const paginas = NAV_ITEMS.filter((item) => match(item.label, item.descripcion, item.unidad)).map((item) => ({
      id: `nav-${item.path}`,
      icon: item.icon,
      title: item.label,
      subtitle: item.descripcion,
      meta: item.unidad,
      run: go(item.path),
    }))

    const acciones = [
      { id: 'act-theme', icon: theme === 'dark' ? Sun : Moon, title: theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro', subtitle: 'Apariencia', run: toggleTheme },
      { id: 'act-seed', icon: DatabaseZap, title: 'Cargar datos de demo', subtitle: 'Rellena todos los módulos', run: seed },
      { id: 'act-test', icon: PlugZap, title: 'Probar conexión', subtitle: 'Escribe en test_collection', run: test },
    ].filter((a) => match(a.title, a.subtitle))

    // Los registros solo aparecen cuando se escribe algo
    const registros = q
      ? [
          ...empleados.filter((e) => match(e.nombre, e.cargo, e.departamento)).slice(0, 4).map((e) => ({
            id: `emp-${e.id}`,
            icon: User,
            title: e.nombre,
            subtitle: `${e.cargo} · ${e.departamento}`,
            meta: 'Empleado',
            run: go(`/talento-humano?q=${encodeURIComponent(e.nombre)}`),
          })),
          ...noConformidades.filter((n) => match(n.titulo, n.codigo, n.responsable)).slice(0, 4).map((n) => ({
            id: `nc-${n.id}`,
            icon: ShieldCheck,
            title: n.titulo,
            subtitle: `${n.codigo} · ${n.responsable}`,
            meta: 'No conformidad',
            run: go(`/calidad?q=${encodeURIComponent(n.codigo)}`),
          })),
          ...tareas.filter((t) => match(t.titulo, t.responsable, t.etiqueta)).slice(0, 4).map((t) => ({
            id: `tarea-${t.id}`,
            icon: FolderKanban,
            title: t.titulo,
            subtitle: `${t.etiqueta || 'Tarea'} · ${t.responsable}`,
            meta: 'Tarea',
            run: go(`/proyectos?q=${encodeURIComponent(t.titulo)}`),
          })),
        ]
      : []

    return [
      { title: 'Páginas', items: paginas },
      { title: 'Registros', items: registros },
      { title: 'Acciones', items: acciones },
    ].filter((g) => g.items.length)
  }, [query, empleados, noConformidades, tareas, theme, toggleTheme, seed, test, navigate])

  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups])

  useEffect(() => setActive(0), [query])
  useEffect(() => {
    list.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [active])

  const run = (item) => {
    onClose()
    item?.run()
  }

  const onKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive((i) => (i + 1) % Math.max(1, flat.length))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((i) => (i - 1 + flat.length) % Math.max(1, flat.length))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      run(flat[active])
    } else if (event.key === 'Escape') {
      onClose()
    }
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-[10vh] sm:pt-[14vh]">
          <motion.div
            className="absolute inset-0 bg-[var(--overlay)] backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Buscador"
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.22, ease }}
            className="glass-strong relative flex max-h-[70dvh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-line shadow-pop"
            onKeyDown={onKeyDown}
          >
            <div className="flex items-center gap-3 border-b border-line px-4">
              <Search size={18} className="shrink-0 text-fg-subtle" aria-hidden="true" />
              <input
                ref={input}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar páginas, empleados, no conformidades, tareas…"
                aria-label="Buscar"
                role="combobox"
                aria-expanded="true"
                aria-controls="palette-list"
                className="h-14 w-full bg-transparent text-[15px] text-fg outline-none placeholder:text-fg-subtle"
              />
              <kbd className="hidden rounded-md border border-line bg-surface-2 px-1.5 py-0.5 text-[11px] font-medium text-fg-subtle sm:block">Esc</kbd>
            </div>

            <div ref={list} id="palette-list" role="listbox" className="min-h-0 flex-1 overflow-y-auto p-2">
              {flat.length === 0 && (
                <p className="px-4 py-10 text-center text-sm text-fg-muted">
                  No hay resultados para <span className="font-semibold text-fg">«{query}»</span>
                </p>
              )}
              {groups.map((group) => (
                <div key={group.title} className="mb-1">
                  <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-fg-subtle">{group.title}</p>
                  {group.items.map((item) => {
                    const index = flat.indexOf(item)
                    const isActive = index === active
                    return (
                      <button
                        key={item.id}
                        type="button"
                        role="option"
                        aria-selected={isActive}
                        data-active={isActive}
                        onMouseMove={() => setActive(index)}
                        onClick={() => run(item)}
                        className={cn('flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors duration-75', isActive ? 'bg-primary-soft' : 'hover:bg-surface-2')}
                      >
                        <span className={cn('grid size-8 shrink-0 place-items-center rounded-lg', isActive ? 'bg-primary text-white' : 'bg-surface-2 text-fg-muted')}>
                          <item.icon size={16} aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-fg">{item.title}</span>
                          <span className="block truncate text-xs text-fg-subtle">{item.subtitle}</span>
                        </span>
                        {item.meta && <span className="shrink-0 rounded-md bg-surface-2 px-1.5 py-0.5 text-[11px] font-medium text-fg-subtle">{item.meta}</span>}
                        {isActive && <CornerDownLeft size={14} className="shrink-0 text-primary-text" aria-hidden="true" />}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>

            <div className="hidden items-center gap-4 border-t border-line px-4 py-2.5 text-[11px] text-fg-subtle sm:flex">
              <span><kbd className="font-sans font-semibold">↑↓</kbd> navegar</span>
              <span><kbd className="font-sans font-semibold">Enter</kbd> abrir</span>
              <span><kbd className="font-sans font-semibold">Esc</kbd> cerrar</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
