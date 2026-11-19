import { useEffect, useRef } from 'react'
import { COLECCIONES } from '@/config/constants'
import { dataMode, useCollection, useConnectionStatus } from '@/firebase/hooks'
import { asegurarUsuariosBase } from '@/firebase/seed'

/**
 * Al abrir la app, crea en la colección `usuarios` los usuarios base que falten
 * (src/config/usuarios.js), para poder ingresar aunque no se hayan cargado los datos de demo.
 * No dibuja nada.
 *
 * Con Firestore espera a que la lectura venga del servidor (estado "en vivo"): si se decidiera
 * con una copia vacía de la caché, se crearían de nuevo usuarios que en realidad ya existen.
 */
export function AsegurarUsuarios() {
  const { data, loading } = useCollection(COLECCIONES.usuarios)
  const conexion = useConnectionStatus()
  const hecho = useRef(false)

  useEffect(() => {
    if (hecho.current || loading) return
    if (dataMode === 'firestore' && conexion !== 'vivo') return
    hecho.current = true
    asegurarUsuariosBase(data).catch(() => {
      hecho.current = false
    })
  }, [data, loading, conexion])

  return null
}
