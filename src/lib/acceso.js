// Ingreso con correo y contraseña (control de acceso de DEMOSTRACIÓN en el cliente;
// ver la advertencia en src/config/usuarios.js).
import { CLAVE_DEMO_HASH, USUARIOS_BASE } from '@/config/usuarios'
import { hashClave } from './clave'

const normalizar = (email = '') => String(email).trim().toLowerCase()

/** Busca la cuenta por correo: primero en la colección `usuarios`, después en los usuarios base del código. */
export function buscarCuenta(email, usuariosColeccion = []) {
  const correo = normalizar(email)
  return usuariosColeccion.find((u) => normalizar(u.email) === correo) || USUARIOS_BASE.find((u) => normalizar(u.email) === correo) || null
}

/**
 * Valida correo y contraseña.
 * @returns {{ ok: true, usuario } | { ok: false, motivo: 'credenciales' | 'inactivo' }}
 * Una cuenta sin contraseña propia usa la contraseña de demostración.
 */
export function autenticar(email, clave, usuariosColeccion = []) {
  const usuario = buscarCuenta(email, usuariosColeccion)
  // Mismo mensaje para "no existe" y "contraseña incorrecta": no revela qué correos existen
  if (!usuario || hashClave(clave) !== (usuario.claveHash || CLAVE_DEMO_HASH)) return { ok: false, motivo: 'credenciales' }
  if (usuario.estado === 'Inactivo') return { ok: false, motivo: 'inactivo' }
  return { ok: true, usuario }
}

/** Cuentas que se muestran en «Cuentas de la demostración» (activas, sin duplicar correos). */
export function cuentasDemostracion(usuariosColeccion = []) {
  const vistas = new Map()
  ;[...USUARIOS_BASE, ...usuariosColeccion].forEach((u) => {
    const correo = normalizar(u.email)
    if (!correo) return
    vistas.set(correo, { ...(vistas.get(correo) || {}), ...u })
  })
  return [...vistas.values()].filter((u) => u.estado !== 'Inactivo')
}
