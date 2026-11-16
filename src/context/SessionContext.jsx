import { createContext, useCallback, useContext, useMemo, useState } from 'react'

// Sesión SIMULADA (sin autenticación real): solo guarda el nombre en localStorage
// para personalizar la interfaz. Cuando se agregue Firebase Auth, se reemplaza acá.
const SessionContext = createContext({ user: null, login: () => {}, logout: () => {} })
const STORAGE_KEY = 'erp.session'

const readSession = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null
  } catch {
    return null
  }
}

/** Nombre del usuario actual para usar fuera de React (registro de actividad). */
export const getCurrentUserName = () => readSession()?.nombre || 'Invitado'

export function SessionProvider({ children }) {
  const [user, setUser] = useState(readSession)

  const login = useCallback((data) => {
    const session = {
      nombre: data?.nombre?.trim() || 'Invitado',
      email: data?.email?.trim() || 'invitado@arandu.com.py',
      rol: data?.rol || 'Administrador',
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    } catch {
      /* almacenamiento no disponible */
    }
    setUser(session)
  }, [])

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* almacenamiento no disponible */
    }
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout])
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export const useSession = () => useContext(SessionContext)
