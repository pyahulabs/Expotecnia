import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { PanelLeftClose, PanelLeftOpen, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { ease } from '@/lib/motion'
import { NAV_SECTIONS } from '@/config/navigation'
import { BRAND } from '@/config/brand'
import { useConnectionStatus } from '@/firebase/hooks'
import { projectId } from '@/firebase/config'
import { Tooltip } from '@/components/ui'
import { Logo } from './Logo'

const ESTADOS_CONEXION = {
  local: { title: 'Modo local', detail: 'Sin .env: datos en el navegador', dot: 'bg-warning' },
  conectando: { title: 'Conectando…', detail: projectId, dot: 'bg-warning', pulse: true },
  vivo: { title: 'Firestore · en vivo', detail: projectId, dot: 'bg-success', pulse: true },
  cache: { title: 'Sin conexión', detail: 'Mostrando datos guardados', dot: 'bg-warning' },
  error: { title: 'Error de Firestore', detail: 'Revisá las reglas y el .env', dot: 'bg-danger' },
}

function StatusDot({ estado }) {
  return (
    <span className="relative grid size-2.5 shrink-0 place-items-center">
      {estado.pulse && <span className={cn('absolute size-2.5 animate-pulse-ring rounded-full', estado.dot)} aria-hidden="true" />}
      <span className={cn('relative size-2 rounded-full', estado.dot)} />
    </span>
  )
}

/** Estado de la conexión de datos: Firestore en vivo o modo local. */
function ConnectionStatus({ collapsed }) {
  const estado = ESTADOS_CONEXION[useConnectionStatus()]
  const { title, detail } = estado

  if (collapsed) {
    return (
      <Tooltip content={`${title} — ${detail}`} side="right" className="mx-auto">
        <span className="grid size-10 place-items-center rounded-xl" tabIndex={0} aria-label={title}>
          <StatusDot estado={estado} />
        </span>
      </Tooltip>
    )
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-surface-2/60 px-3 py-2.5">
      <StatusDot estado={estado} />
      <div className="min-w-0" aria-live="polite">
        <p className="truncate text-xs font-semibold text-fg">{title}</p>
        <p className="truncate text-[11px] text-fg-subtle">{detail}</p>
      </div>
    </div>
  )
}

function NavItem({ item, collapsed, onNavigate, layoutScope }) {
  const Icon = item.icon
  const link = (
    <NavLink
      to={item.path}
      end={item.path === '/'}
      onClick={onNavigate}
      aria-label={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        cn(
          'group relative flex h-10 w-full items-center gap-3 rounded-xl text-sm font-medium transition-colors duration-150',
          collapsed ? 'justify-center px-0' : 'px-3',
          isActive ? 'text-primary-text' : 'text-fg-muted hover:bg-surface-2 hover:text-fg',
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.span
              layoutId={`nav-active-${layoutScope}`}
              className="absolute inset-0 rounded-xl bg-primary-soft"
              transition={{ type: 'spring', stiffness: 420, damping: 34 }}
            />
          )}
          <Icon size={18} strokeWidth={isActive ? 2.2 : 1.9} className="relative shrink-0" aria-hidden="true" />
          {!collapsed && (
            <>
              <span className="relative flex-1 truncate">{item.label}</span>
              <span
                className={cn(
                  'relative rounded-md px-1.5 py-px text-[10px] font-semibold tracking-wide',
                  isActive ? 'bg-surface/70 text-primary-text' : 'bg-surface-2 text-fg-subtle group-hover:bg-surface-3',
                )}
              >
                {item.unidad}
              </span>
            </>
          )}
        </>
      )}
    </NavLink>
  )
  if (!collapsed) return link
  return (
    <Tooltip content={`${item.label} · ${item.unidad}`} side="right" className="w-full">
      {link}
    </Tooltip>
  )
}

function SidebarContent({ collapsed, onNavigate, onToggle, onClose, layoutScope }) {
  return (
    <div className="flex h-full flex-col">
      <div className={cn('flex h-16 shrink-0 items-center', collapsed ? 'justify-center px-0' : 'justify-between px-5')}>
        <NavLink to="/" onClick={onNavigate} aria-label="Ir al dashboard" className="rounded-lg">
          <Logo collapsed={collapsed} />
        </NavLink>
        {onClose && (
          <button type="button" onClick={onClose} aria-label="Cerrar menú" className="grid size-9 place-items-center rounded-lg text-fg-muted hover:bg-surface-2 hover:text-fg">
            <X size={18} aria-hidden="true" />
          </button>
        )}
      </div>

      <nav aria-label="Navegación principal" className={cn('no-scrollbar flex-1 space-y-6 overflow-y-auto py-4', collapsed ? 'px-3' : 'px-3')}>
        {NAV_SECTIONS.map((section) => (
          <div key={section.titulo}>
            {collapsed ? (
              <div className="mx-auto mb-2 h-px w-6 bg-line" aria-hidden="true" />
            ) : (
              <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-fg-subtle">{section.titulo}</p>
            )}
            <ul className="space-y-1">
              {section.items.map((item) => (
                <li key={item.path}>
                  <NavItem item={item} collapsed={collapsed} onNavigate={onNavigate} layoutScope={layoutScope} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 space-y-3 border-t border-line p-3">
        <ConnectionStatus collapsed={collapsed} />
        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            aria-label={collapsed ? 'Expandir menú lateral' : 'Colapsar menú lateral'}
            aria-expanded={!collapsed}
            className={cn(
              'flex h-9 w-full items-center gap-3 rounded-xl text-[13px] font-medium text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg',
              collapsed ? 'justify-center' : 'px-3',
            )}
          >
            {collapsed ? <PanelLeftOpen size={17} aria-hidden="true" /> : <PanelLeftClose size={17} aria-hidden="true" />}
            {!collapsed && 'Colapsar'}
          </button>
        )}
        {!collapsed && (
          <p className="px-3 pb-1 text-[11px] leading-4 text-fg-subtle">
            {BRAND.evento} · {BRAND.carrera}
          </p>
        )}
      </div>
    </div>
  )
}

/**
 * Sidebar: fijo y colapsable en escritorio; cajón con overlay en tablet/celular.
 */
export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  useEffect(() => {
    if (!mobileOpen) return undefined
    const onKey = (event) => event.key === 'Escape' && onMobileClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [mobileOpen, onMobileClose])

  return (
    <>
      {/* Escritorio */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 68 : 260 }}
        transition={{ duration: 0.28, ease }}
        className="sticky top-0 z-40 hidden h-dvh shrink-0 overflow-hidden border-r border-line bg-surface lg:block"
      >
        <SidebarContent collapsed={collapsed} onToggle={onToggle} layoutScope="desktop" />
      </motion.aside>

      {/* Tablet y celular */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              className="absolute inset-0 bg-[var(--overlay)] backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
              aria-hidden="true"
            />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Menú de navegación"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease }}
              className="absolute inset-y-0 left-0 w-[284px] max-w-[86vw] border-r border-line bg-surface shadow-pop"
            >
              <SidebarContent collapsed={false} onNavigate={onMobileClose} onClose={onMobileClose} layoutScope="mobile" />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
