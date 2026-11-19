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
import { useSession } from '@/context/SessionContext'
import { Avatar, Tooltip } from '@/components/ui'
import { LogoMark } from './Logo'

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

/** Estado de la conexión de datos: Firestore en vivo, conectando, sin conexión o modo local. */
function ConnectionStatus({ collapsed }) {
  const estado = ESTADOS_CONEXION[useConnectionStatus()]
  if (collapsed) {
    return (
      <Tooltip content={`${estado.title} — ${estado.detail}`} side="right" className="mx-auto">
        <span className="grid size-10 place-items-center rounded-xl" tabIndex={0} aria-label={estado.title}>
          <StatusDot estado={estado} />
        </span>
      </Tooltip>
    )
  }
  return (
    <div className="flex items-center gap-2.5 px-3 py-1" aria-live="polite">
      <StatusDot estado={estado} />
      <p className="min-w-0 truncate text-xs text-fg-muted">
        <span className="font-medium text-fg">{estado.title}</span>
        {estado.detail && <span className="text-fg-subtle"> · {estado.detail}</span>}
      </p>
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
          'group relative flex h-9 w-full items-center gap-3 rounded-lg text-[13.5px] font-medium transition-colors duration-150',
          collapsed ? 'justify-center px-0' : 'px-2.5',
          isActive ? 'text-fg' : 'text-fg-muted hover:bg-surface-2 hover:text-fg',
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.span layoutId={`nav-active-${layoutScope}`} className="absolute inset-0 rounded-lg border border-line bg-surface shadow-card dark:bg-surface-2" transition={{ type: 'spring', stiffness: 460, damping: 36 }}>
              {/* Barra de color que marca la sección activa */}
              <span className="absolute -left-3 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-gradient-to-b from-primary to-primary-2 shadow-[0_0_12px_var(--primary)]" />
            </motion.span>
          )}
          <Icon size={17} strokeWidth={isActive ? 2.2 : 1.9} className={cn('hover-wiggle relative shrink-0 transition-colors', isActive ? 'text-primary-text' : 'text-fg-subtle group-hover:text-fg-muted')} aria-hidden="true" />
          {!collapsed && (
            <>
              <span className="relative flex-1 truncate transition-transform duration-200 group-hover:translate-x-0.5">{item.label}</span>
            </>
          )}
        </>
      )}
    </NavLink>
  )
  if (!collapsed) return link
  return (
    <Tooltip content={item.label} side="right" className="w-full">
      {link}
    </Tooltip>
  )
}

function SidebarContent({ collapsed, onNavigate, onToggle, onClose, layoutScope }) {
  const { user } = useSession()
  return (
    <div className="flex h-full flex-col">
      {/* Espacio de trabajo */}
      <div className={cn('flex h-16 shrink-0 items-center gap-2', collapsed ? 'justify-center px-0' : 'justify-between px-4')}>
        <NavLink to="/" onClick={onNavigate} aria-label="Ir al dashboard" className="flex min-w-0 items-center gap-2.5 rounded-lg">
          <LogoMark size={30} className="shadow-[0_6px_16px_-6px_var(--primary)] transition-transform duration-300 hover:rotate-[-8deg] hover:scale-110" />
          {!collapsed && (
            <span className="min-w-0">
              <span className="block truncate text-[14px] font-semibold leading-4 tracking-[-0.02em] text-fg">
                {BRAND.nombre} <span className="font-normal text-fg-subtle">{BRAND.sufijo}</span>
              </span>
              <span className="block truncate text-[11px] leading-4 text-fg-subtle">{BRAND.organizacion}</span>
            </span>
          )}
        </NavLink>
        {onClose && (
          <button type="button" onClick={onClose} aria-label="Cerrar menú" className="grid size-9 place-items-center rounded-lg text-fg-muted hover:bg-surface-2 hover:text-fg">
            <X size={18} aria-hidden="true" />
          </button>
        )}
      </div>

      <nav aria-label="Navegación principal" className="no-scrollbar flex-1 space-y-5 overflow-y-auto px-3 pb-4 pt-2">
        {NAV_SECTIONS.map((section) => (
          <div key={section.titulo}>
            {collapsed ? (
              <div className="mx-auto mb-2 h-px w-6 bg-line" aria-hidden="true" />
            ) : (
              <p className="mb-1 px-2.5 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-fg-subtle/90">{section.titulo}</p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <li key={item.path}>
                  <NavItem item={item} collapsed={collapsed} onNavigate={onNavigate} layoutScope={layoutScope} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 space-y-2 border-t border-line p-3">
        <ConnectionStatus collapsed={collapsed} />
        {!collapsed && user && (
          <div className="flex items-center gap-2.5 rounded-xl border border-line bg-surface-2/60 p-2">
            <Avatar name={user.nombre} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold leading-4 text-fg">{user.nombre}</p>
              <p className="truncate text-[11px] leading-4 text-fg-subtle">{user.rol}</p>
            </div>
          </div>
        )}
        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            aria-label={collapsed ? 'Expandir menú lateral' : 'Colapsar menú lateral'}
            aria-expanded={!collapsed}
            className={cn('flex h-8 w-full items-center gap-2.5 rounded-lg text-[12.5px] font-medium text-fg-subtle transition-colors hover:bg-surface-2 hover:text-fg', collapsed ? 'justify-center' : 'px-2.5')}
          >
            {collapsed ? <PanelLeftOpen size={16} aria-hidden="true" /> : <PanelLeftClose size={16} aria-hidden="true" />}
            {!collapsed && 'Colapsar menú'}
          </button>
        )}
      </div>
    </div>
  )
}

/** Sidebar: fijo y colapsable en escritorio; cajón con overlay en tablet/celular. */
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
        animate={{ width: collapsed ? 68 : 256 }}
        transition={{ duration: 0.28, ease }}
        className="sticky top-0 z-40 hidden h-dvh shrink-0 overflow-hidden border-r border-line bg-surface/80 backdrop-blur-xl lg:block dark:bg-[color-mix(in_srgb,var(--surface)_70%,var(--bg))]"
      >
        <SidebarContent collapsed={collapsed} onToggle={onToggle} layoutScope="desktop" />
      </motion.aside>

      {/* Tablet y celular */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div className="absolute inset-0 bg-[var(--overlay)] backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onMobileClose} aria-hidden="true" />
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
