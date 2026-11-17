import { useEffect } from 'react'
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom'

// Router del build "demo": la app viaja en un solo archivo HTML (sin servidor), así que
// las rutas viven en memoria. La página actual se refleja en un #nombre simple para
// poder compartir un enlace directo a un módulo.
const RUTAS = {
  dashboard: '/',
  planeacion: '/planeacion',
  'talento-humano': '/talento-humano',
  calidad: '/calidad',
  finanzas: '/finanzas',
  proyectos: '/proyectos',
  arquitectura: '/arquitectura',
  usuarios: '/usuarios',
  documentacion: '/documentacion',
}

const rutaDelHash = () => RUTAS[(window.location.hash || '').slice(1)]

function HashSync() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const nombre = Object.keys(RUTAS).find((clave) => RUTAS[clave] === pathname)
    if (!nombre || window.location.hash.slice(1) === nombre) return
    try {
      // replaceState cambia solo el #nombre de la dirección, sin recargar ni navegar
      window.history.replaceState(null, '', `#${nombre}`)
    } catch {
      /* algunos visores no permiten tocar la URL: la navegación sigue funcionando */
    }
  }, [pathname])

  useEffect(() => {
    const onHashChange = () => {
      const ruta = rutaDelHash()
      if (ruta && ruta !== pathname) navigate(ruta)
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [navigate, pathname])

  return null
}

export function DemoRouter({ children }) {
  return (
    <MemoryRouter initialEntries={[rutaDelHash() || '/']}>
      <HashSync />
      {children}
    </MemoryRouter>
  )
}
