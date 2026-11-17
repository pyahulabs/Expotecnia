// Reglas de negocio de la gestión de usuarios (puras, sin React).

export const normalizarEmail = (email = '') => email.trim().toLowerCase()

export const emailEnUso = (usuarios, email, excluirId) =>
  usuarios.some((u) => u.id !== excluirId && normalizarEmail(u.email) === normalizarEmail(email))

export const esAdminActivo = (u) => u.rol === 'Administrador' && u.estado !== 'Inactivo'

/** ¿Este usuario es el único administrador activo? (no se puede borrar ni degradar) */
export const esUltimoAdmin = (usuarios, usuario) => esAdminActivo(usuario) && usuarios.filter(esAdminActivo).length <= 1

/** ¿El usuario de la lista es la persona que tiene la sesión abierta? */
export const esUsuarioActual = (sesion, usuario) => Boolean(sesion) && (sesion.id ? sesion.id === usuario.id : normalizarEmail(sesion.email) === normalizarEmail(usuario.email))
