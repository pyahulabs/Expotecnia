import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ChevronRight, DatabaseZap, LogOut, Menu, PlugZap, Search, Trash2 } from 'lucide-react'
import { NAV_SECTIONS, findNavItem } from '@/config/navigation'
import { BRAND } from '@/config/brand'
import { useSession } from '@/context/SessionContext'
import { useDemoActions } from '@/lib/useDemoActions'
import { Avatar, ConfirmDialog, Dropdown, DropdownItem, DropdownSeparator, IconButton, ThemeToggle } from '@/components/ui'

function Breadcrumbs() {
  const { pathname } = useLocation()
  const current = findNavItem(pathname)
  const section = NAV_SECTIONS.find((s) => s.items.includes(current))

  return (
    <nav aria-label="Ruta de navegación" className="min-w-0">
      <ol className="flex items-center gap-1.5 text-[13px]">
        <li className="hidden items-center gap-1.5 md:flex">
          <Link to="/" className="rounded-md px-1 font-medium text-fg-subtle transition-colors hover:text-fg">
            {BRAND.organizacion}
          </Link>
          <ChevronRight size={14} className="text-fg-subtle/70" aria-hidden="true" />
        </li>
        {section && (
          <li className="hidden items-center gap-1.5 sm:flex">
            <span className="px-1 text-fg-subtle">{section.titulo}</span>
            <ChevronRight size={14} className="text-fg-subtle/70" aria-hidden="true" />
          </li>
        )}
        <li className="truncate px-1 font-semibold text-fg" aria-current="page">
          {current?.label || 'Página no encontrada'}
        </li>
      </ol>
    </nav>
  )
}

function UserMenu() {
  const { user, logout } = useSession()
  const navigate = useNavigate()
  const { seed, seeding, test, testing, clear } = useDemoActions()
  const [confirmClear, setConfirmClear] = useState(false)

  return (
    <>
      <Dropdown
        trigger={({ open, toggle }) => (
          <button
            type="button"
            onClick={toggle}
            aria-haspopup="menu"
            aria-expanded={open}
            aria-label={`Menú de usuario: ${user?.nombre}`}
            className="rounded-full ring-offset-2 ring-offset-canvas transition-shadow hover:ring-2 hover:ring-line-strong"
          >
            <Avatar name={user?.nombre} size="md" />
          </button>
        )}
      >
        {({ close }) => (
          <>
            <div className="flex items-center gap-3 px-2.5 py-2.5">
              <Avatar name={user?.nombre} size="md" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-fg">{user?.nombre}</p>
                <p className="truncate text-xs text-fg-subtle">{user?.email}</p>
              </div>
            </div>
            <DropdownSeparator />
            <DropdownItem icon={DatabaseZap} disabled={seeding} onClick={() => { close(); seed() }}>
              Cargar datos de demo
            </DropdownItem>
            <DropdownItem icon={PlugZap} disabled={testing} onClick={() => { close(); test() }}>
              Probar conexión
            </DropdownItem>
            <DropdownItem icon={Trash2} tone="danger" onClick={() => { close(); setConfirmClear(true) }}>
              Vaciar todos los datos
            </DropdownItem>
            <DropdownSeparator />
            <DropdownItem
              icon={LogOut}
              onClick={() => {
                close()
                logout()
                navigate('/login')
              }}
            >
              Cerrar sesión
            </DropdownItem>
          </>
        )}
      </Dropdown>
      <ConfirmDialog
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={clear}
        title="¿Vaciar todos los datos?"
        description="Se eliminan los documentos de todas las colecciones del ERP. Podés volver a cargarlos con «Cargar datos de demo»."
        confirmLabel="Sí, vaciar"
      />
    </>
  )
}

/** Barra superior con efecto vidrio: menú, breadcrumbs, buscador, tema y usuario. */
export function Header({ onOpenMenu, onOpenSearch }) {
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)
  return (
    <header className="glass sticky top-0 z-30 border-b border-line">
      <div className="flex h-16 items-center gap-2 px-4 sm:gap-3 sm:px-6 lg:px-8">
        <IconButton icon={Menu} label="Abrir menú" tooltip={false} onClick={onOpenMenu} className="-ml-1.5 lg:hidden" />
        <Breadcrumbs />
        <div className="flex-1" />

        <button
          type="button"
          onClick={onOpenSearch}
          aria-label="Abrir buscador"
          aria-keyshortcuts="Control+K Meta+K"
          className="hidden h-9 w-56 items-center gap-2 rounded-[10px] border border-line bg-surface/70 px-3 text-[13px] text-fg-subtle shadow-card transition-colors hover:border-line-strong hover:text-fg-muted md:flex xl:w-72"
        >
          <Search size={15} aria-hidden="true" />
          <span className="flex-1 text-left">Buscar…</span>
          <kbd className="rounded-md border border-line bg-surface-2 px-1.5 py-px font-sans text-[11px] font-medium text-fg-subtle">{isMac ? '⌘' : 'Ctrl'} K</kbd>
        </button>
        <IconButton icon={Search} label="Buscar" onClick={onOpenSearch} className="md:hidden" />

        <ThemeToggle />
        <div className="ml-1">
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
