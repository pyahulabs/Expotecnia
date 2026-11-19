import { createContext, useCallback, useContext, useMemo, useState } from 'react'

// Sesión SIMULADA: guarda quién está usando el sistema. Vive en sessionStorage, así que
// dura solo mientras la pestaña está abierta: al abrir la app de nuevo siempre aparece el login.
// (Control de acceso de demostración: ver la advertencia en src/config/usuarios.js.)
//
// session = { id?, nombre, email, rol, cargo? }  ·  id = documento de la colección `usuarios`
const SessionContext = createContext({ user: null, login: () => {}, switchUser: () => {}, updateSession: () => {}, logout: () => {} })
const STORAGE_KEY = 'erp.session'

// Versiones anteriores guardaban la sesión en localStorage (sobrevivía al cerrar el navegador)
// y tenían ingreso automático: se limpia para que no se restaure nada.
try {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem('erp.sinAutoIngreso')
  localStorage.removeItem('erp.usuariosPrincipales.v1')
  localStorage.removeItem('erp.usuariosPrincipales.v2')
} catch {
  /* almacenamiento no disponible */
}

const readSession = () => {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || null
  } catch {
    return null
  }
}

const writeSession = (session) => {
  try {
    if (session) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    else sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    /* almacenamiento no disponible: la sesión dura mientras la página esté abierta */
  }
}

/** Nombre del usuario actual para usar fuera de React (registro de actividad). */
export const getCurrentUserName = () => readSession()?.nombre || 'Invitado'

const normalizar = (data) => ({
  id: data?.id || null,
  nombre: data?.nombre?.trim() || 'Invitado',
  email: data?.email?.trim() || 'invitado@arandu.com.py',
  rol: data?.rol === 'Visitante' ? 'Lector' : data?.rol || 'Lector',
  cargo: data?.cargo || '',
})

export function SessionProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = readSession()
    return saved ? normalizar(saved) : null
  })

  /** Inicia sesión con los datos de un usuario (o de un invitado). */
  const login = useCallback((data) => {
    const session = normalizar(data)
    writeSession(session)
    setUser(session)
    return session
  }, [])

  /** Cambia a otro usuario sin pasar por la pantalla de ingreso. */
  const switchUser = login

  /** Actualiza los datos de la sesión actual (ej.: se editó el propio usuario). */
  const updateSession = useCallback((patch) => {
    setUser((current) => {
      if (!current) return current
      const next = normalizar({ ...current, ...patch })
      writeSession(next)
      return next
    })
  }, [])

  const logout = useCallback(() => {
    writeSession(null)
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, login, switchUser, updateSession, logout }), [user, login, switchUser, updateSession, logout])
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export const useSession = () => useContext(SessionContext)

export const esAdministrador = (user) => user?.rol === 'Administrador'
