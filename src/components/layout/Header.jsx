import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ChevronRight, DatabaseZap, IdCard, LogOut, Menu, PlugZap, Search, Trash2, UserCog } from 'lucide-react'
import { NAV_SECTIONS, findNavItem } from '@/config/navigation'
import { BRAND } from '@/config/brand'
import { COLECCIONES, ROLES } from '@/config/constants'
import { esAdministrador, useSession } from '@/context/SessionContext'
import { PerfilModal } from '@/modules/usuarios/PerfilModal'
import { toast } from '@/components/ui'
import { updateItem, logActivity } from '@/firebase/hooks'
import { useCollection } from '@/firebase/hooks'
import { useCambiarUsuario } from '@/lib/useCambiarUsuario'
import { esUsuarioActual } from '@/modules/usuarios/reglas'
import { useDemoActions } from '@/lib/useDemoActions'
import { Avatar, Badge, ConfirmDialog, Dropdown, DropdownItem, DropdownSeparator, IconButton, ThemeToggle } from '@/components/ui'

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
        <li className="flex min-w-0 items-center gap-2 px-1 font-semibold text-fg" aria-current="page">
          {current?.icon && (
            <span className="grid size-6 shrink-0 place-items-center rounded-md border border-primary/15 bg-primary-soft text-primary-text">
              <current.icon size={13} aria-hidden="true" />
            </span>
          )}
          <span className="truncate">{current?.label || 'Página no encontrada'}</span>
        </li>
      </ol>
    </nav>
  )
}

function UserMenu() {
  const { user, logout, updateSession } = useSession()
  const navigate = useNavigate()
  const [perfilAbierto, setPerfilAbierto] = useState(false)
  const { seed, seeding, test, testing, clear } = useDemoActions()
  const { cambiar: cambiarUsuario, claveModal } = useCambiarUsuario()
  const { data: usuarios } = useCollection(COLECCIONES.usuarios, { orderBy: 'nombre' })
  const [confirmClear, setConfirmClear] = useState(false)

  // Usuarios activos distintos del actual: se puede saltar a cualquiera con un clic
  const miUsuario = usuarios.find((u) => esUsuarioActual(user, u))
  const guardarPerfil = (valores) => {
    updateItem(COLECCIONES.usuarios, miUsuario.id, valores)
    updateSession(valores)
    logActivity('Usuarios', 'actualizó su perfil', 'editar')
    toast.success('Perfil actualizado', valores.nombre)
  }
  const otros = usuarios.filter((u) => u.estado !== 'Inactivo' && !esUsuarioActual(user, u))

  return (
    <>
      {claveModal}
      <PerfilModal open={perfilAbierto} usuario={miUsuario} onClose={() => setPerfilAbierto(false)} onSave={guardarPerfil} />
      <Dropdown
        className="w-72"
        trigger={({ open, toggle }) => (
          <button
            type="button"
            onClick={toggle}
            aria-haspopup="menu"
            aria-expanded={open}
            aria-label={`Menú de usuario: ${user?.nombre}`}
            className="flex items-center gap-2.5 rounded-full p-0.5 pr-0.5 transition-colors hover:bg-surface-2 lg:rounded-xl lg:pr-3"
          >
            <Avatar name={user?.nombre} size="md" />
            <span className="hidden min-w-0 text-left lg:block">
              <span className="block max-w-36 truncate text-[13px] font-semibold leading-4 text-fg">{user?.nombre}</span>
              <span className="block text-[11px] leading-4 text-fg-subtle">{user?.rol}</span>
            </span>
          </button>
        )}
      >
        {({ close }) => (
          <>
            <div className="flex items-center gap-3 px-2.5 py-2.5">
              <Avatar name={user?.nombre} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-fg">{user?.nombre}</p>
                <p className="truncate text-xs text-fg-subtle">{user?.email}</p>
              </div>
              <Badge tone={ROLES[user?.rol]?.tone || 'neutral'} size="sm">
                {user?.rol}
              </Badge>
            </div>
            <DropdownSeparator />
            {otros.length > 0 && (
              <>
                <p className="px-2.5 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-fg-subtle">Cambiar de usuario</p>
                <div className="max-h-[248px] overflow-y-auto">
                  {otros.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        close()
                        cambiarUsuario(u)
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left transition-colors hover:bg-surface-2"
                    >
                      <Avatar name={u.nombre} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-medium text-fg">{u.nombre}</span>
                        <span className="block truncate text-[11px] text-fg-subtle">{u.rol}{u.cargo ? ` · ${u.cargo}` : ''}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
            {miUsuario && (
              <DropdownItem icon={IdCard} onClick={() => { close(); setPerfilAbierto(true) }}>
                Mi perfil
              </DropdownItem>
            )}
            <DropdownItem icon={UserCog} onClick={() => { close(); navigate('/usuarios') }}>
              Gestionar usuarios
            </DropdownItem>
            <DropdownSeparator />
            {esAdministrador(user) && (
              <DropdownItem icon={DatabaseZap} disabled={seeding} onClick={() => { close(); seed() }}>
                Cargar datos de demo
              </DropdownItem>
            )}
            <DropdownItem icon={PlugZap} disabled={testing} onClick={() => { close(); test() }}>
              Probar conexión
            </DropdownItem>
            {esAdministrador(user) && (
              <DropdownItem icon={Trash2} tone="danger" onClick={() => { close(); setConfirmClear(true) }}>
                Vaciar datos de los módulos
              </DropdownItem>
            )}
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
        title="¿Vaciar los datos de los módulos?"
        description="Se eliminan empleados, evaluaciones, no conformidades, presupuestos, tareas y demás registros. Los usuarios y las empresas se conservan. Podés volver a cargar todo con «Cargar datos de demo»."
        confirmLabel="Sí, vaciar"
      />
    </>
  )
}

/** Barra superior con efecto vidrio: menú, breadcrumbs, buscador, tema y usuario. */
export function Header({ onOpenMenu, onOpenSearch }) {
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)
  return (
    <header className="glass sticky top-0 z-30 border-b border-line/80">
      <div className="flex h-16 items-center gap-2 px-4 sm:gap-3 sm:px-6 lg:px-8">
        <IconButton icon={Menu} label="Abrir menú" tooltip={false} onClick={onOpenMenu} className="-ml-1.5 lg:hidden" />
        <Breadcrumbs />
        <div className="flex-1" />

        <button
          type="button"
          onClick={onOpenSearch}
          aria-label="Abrir buscador"
          aria-keyshortcuts="Control+K Meta+K"
          className="group hidden h-9 w-60 items-center gap-2.5 rounded-xl border border-line bg-surface/70 px-3 text-[13px] text-fg-subtle shadow-card transition-colors hover:border-primary/40 hover:text-fg-muted md:flex xl:w-80"
        >
          <Search size={15} className="transition-colors group-hover:text-primary-text" aria-hidden="true" />
          <span className="flex-1 text-left">Buscar o ir a…</span>
          <kbd className="flex items-center gap-0.5 rounded-md border border-line bg-surface-2 px-1.5 py-px font-sans text-[11px] font-medium text-fg-subtle">{isMac ? '⌘' : 'Ctrl'} K</kbd>
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
