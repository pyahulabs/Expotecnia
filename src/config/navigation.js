import {
  LayoutDashboard,
  Target,
  Users,
  ShieldCheck,
  Wallet,
  FolderKanban,
  Network,
  UserCog,
  BookOpen,
} from 'lucide-react'

// Fuente única de verdad para el sidebar, los breadcrumbs y el buscador.
export const NAV_SECTIONS = [
  {
    titulo: 'General',
    items: [
      { path: '/', label: 'Dashboard', icon: LayoutDashboard, modulo: true, descripcion: 'Indicadores y simulador' },
    ],
  },
  {
    titulo: 'Gestión',
    items: [
      { path: '/planeacion', label: 'Planeación', icon: Target, modulo: true, descripcion: 'Matriz FODA' },
      { path: '/talento-humano', label: 'Talento Humano', icon: Users, modulo: true, descripcion: 'Empleados, desempeño y clima' },
      { path: '/calidad', label: 'Calidad', icon: ShieldCheck, modulo: true, descripcion: 'No conformidades' },
      { path: '/finanzas', label: 'Finanzas', icon: Wallet, modulo: true, descripcion: 'Presupuesto vs. ejecutado' },
      { path: '/proyectos', label: 'Proyectos', icon: FolderKanban, modulo: true, descripcion: 'Kanban y Gantt' },
    ],
  },
  {
    titulo: 'Sistema',
    items: [
      { path: '/arquitectura', label: 'Arquitectura', icon: Network, modulo: true, descripcion: 'Stack y ciclo de vida' },
      { path: '/usuarios', label: 'Usuarios', icon: UserCog, descripcion: 'Cuentas, roles y cambio de usuario' },
      { path: '/documentacion', label: 'Documentación', icon: BookOpen, descripcion: 'Guía de uso y documentación técnica' },
    ],
  },
]

export const NAV_ITEMS = NAV_SECTIONS.flatMap((s) => s.items)

export const findNavItem = (pathname) =>
  NAV_ITEMS.find((item) => (item.path === '/' ? pathname === '/' : pathname.startsWith(item.path)))
