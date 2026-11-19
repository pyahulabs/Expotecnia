import { lazy, useEffect } from 'react'
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import { Compass } from 'lucide-react'
import { ThemeProvider } from '@/context/ThemeContext'
import { DemoRouter } from '@/lib/DemoRouter'
import { SessionProvider, useSession } from '@/context/SessionContext'
import { describeError, onDataError } from '@/firebase/hooks'
import { AsegurarUsuarios } from '@/modules/usuarios/AsegurarUsuarios'
import { Button, EmptyState, Toaster, toast } from '@/components/ui'
import { Layout } from '@/components/layout/Layout'
import LoginPage from '@/modules/login/LoginPage'

// Cada módulo se carga por separado (code splitting): un archivo por integrante.
const DashboardPage = lazy(() => import('@/modules/dashboard/DashboardPage'))
const PlaneacionPage = lazy(() => import('@/modules/planeacion/PlaneacionPage'))
const TalentoHumanoPage = lazy(() => import('@/modules/talentoHumano/TalentoHumanoPage'))
const CalidadPage = lazy(() => import('@/modules/calidad/CalidadPage'))
const FinanzasPage = lazy(() => import('@/modules/finanzas/FinanzasPage'))
const ProyectosPage = lazy(() => import('@/modules/proyectos/ProyectosPage'))
const ArquitecturaPage = lazy(() => import('@/modules/arquitectura/ArquitecturaPage'))
const UsuariosPage = lazy(() => import('@/modules/usuarios/UsuariosPage'))
const DocumentacionPage = lazy(() => import('@/modules/documentacion/DocumentacionPage'))

/** Sin sesión (simulada) se redirige a la pantalla de bienvenida. */
function RequireSession({ children }) {
  const { user } = useSession()
  const location = useLocation()
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return children
}

function NotFound() {
  return (
    <EmptyState
      icon={Compass}
      title="No encontramos esta página"
      description="El enlace puede estar mal escrito o la página fue movida."
      action={
        <Link to="/">
          <Button>Volver al dashboard</Button>
        </Link>
      }
    />
  )
}

/** Muestra un toast cuando falla cualquier lectura o escritura de datos. */
function DataErrorToasts() {
  useEffect(() => {
    let ultimo = { mensaje: '', hora: 0 }
    return onDataError((error, context) => {
      const mensaje = describeError(error)
      // Si fallan varias colecciones por la misma causa (ej.: sin internet), se avisa una sola vez
      if (mensaje === ultimo.mensaje && Date.now() - ultimo.hora < 8000) return
      ultimo = { mensaje, hora: Date.now() }
      const titulo = context?.op === 'leer' ? 'No se pudieron leer los datos' : `No se pudo ${context?.op || 'guardar'} el registro`
      toast.error(titulo, mensaje)
    })
  }, [])
  return null
}

// `npm run build:demo` genera un único HTML sin servidor: ahí se navega en memoria
const Router = import.meta.env.MODE === 'demo' ? DemoRouter : BrowserRouter

// Al abrir la app no se carga nada automáticamente: siempre aparece el login y los datos de
// demo se cargan a mano (botón «Cargar datos de demo», solo para el rol Administrador).
export default function App() {
  return (
    <ThemeProvider>
      <SessionProvider>
        <MotionConfig reducedMotion="user">
          <Router>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                element={
                  <RequireSession>
                    <Layout />
                  </RequireSession>
                }
              >
                <Route index element={<DashboardPage />} />
                <Route path="planeacion" element={<PlaneacionPage />} />
                <Route path="talento-humano" element={<TalentoHumanoPage />} />
                <Route path="calidad" element={<CalidadPage />} />
                <Route path="finanzas" element={<FinanzasPage />} />
                <Route path="proyectos" element={<ProyectosPage />} />
                <Route path="arquitectura" element={<ArquitecturaPage />} />
                <Route path="usuarios" element={<UsuariosPage />} />
                <Route path="documentacion" element={<DocumentacionPage />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Router>
          <Toaster />
          <DataErrorToasts />
          <AsegurarUsuarios />
        </MotionConfig>
      </SessionProvider>
    </ThemeProvider>
  )
}
