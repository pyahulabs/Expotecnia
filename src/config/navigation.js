import {
  LayoutDashboard,
  Target,
  Users,
  ShieldCheck,
  Wallet,
  FolderKanban,
  Network,
} from 'lucide-react'

// Fuente única de verdad para el sidebar, los breadcrumbs y el buscador.
export const NAV_SECTIONS = [
  {
    titulo: 'General',
    items: [
      { path: '/', label: 'Dashboard', icon: LayoutDashboard, unidad: 'U3 · U4', descripcion: 'Indicadores y simulador' },
    ],
  },
  {
    titulo: 'Gestión',
    items: [
      { path: '/planeacion', label: 'Planeación', icon: Target, unidad: 'U1', descripcion: 'Matriz FODA' },
      { path: '/talento-humano', label: 'Talento Humano', icon: Users, unidad: 'U2', descripcion: 'Empleados, desempeño y clima' },
      { path: '/calidad', label: 'Calidad', icon: ShieldCheck, unidad: 'U5', descripcion: 'No conformidades' },
      { path: '/finanzas', label: 'Finanzas', icon: Wallet, unidad: 'U6', descripcion: 'Presupuesto vs. ejecutado' },
      { path: '/proyectos', label: 'Proyectos', icon: FolderKanban, unidad: 'U7', descripcion: 'Kanban y Gantt' },
    ],
  },
  {
    titulo: 'Sistema',
    items: [
      { path: '/arquitectura', label: 'Arquitectura', icon: Network, unidad: 'U8', descripcion: 'Stack y ciclo de vida' },
    ],
  },
]

export const NAV_ITEMS = NAV_SECTIONS.flatMap((s) => s.items)

export const findNavItem = (pathname) =>
  NAV_ITEMS.find((item) => (item.path === '/' ? pathname === '/' : pathname.startsWith(item.path)))
