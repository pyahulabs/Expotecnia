// ============================================================================
// USUARIOS BASE Y CONTROL DE ACCESO DE DEMOSTRACIÓN
// ----------------------------------------------------------------------------
// IMPORTANTE: este es un control de acceso de DEMOSTRACIÓN que funciona solo en
// el cliente (navegador). La contraseña se compara contra un hash SHA-256 que
// se guarda en la colección `usuarios`, y esa colección la puede leer cualquiera
// con acceso a la base (las reglas de Firestore están en modo de prueba).
// NO protege datos reales. Para producción hay que usar Firebase Authentication
// y reglas de seguridad en Firestore.
//
// Estos usuarios existen desde el inicio: al abrir la app se crean en Firestore
// los que falten (ver asegurarUsuariosBase en firebase/seed.js), aunque no se
// hayan cargado los datos de demo.
// ============================================================================

/** Rol que reciben los usuarios nuevos agregados para la exposición (cambialo acá). */
export const ROL_USUARIOS_NUEVOS = 'Editor'

/**
 * Hash SHA-256 de la contraseña de demostración que comparten todas las cuentas
 * (se calcula con hashClave() de src/lib/clave.js). En el código nunca se guarda
 * la contraseña en texto.
 */
export const CLAVE_DEMO_HASH = 'aed75789182ca58d2949966a880b2301bb6d67eafe1ab834e5dcd54ccdf93294'

/** Versión del formato de correo (nombre.apellido@gmail.com). Sirve para migrar una sola vez. */
export const VERSION_CORREOS = 2

const equipo = (id, nombre, email, extra = {}) => ({ id, nombre, email, cargo: 'Integrante del equipo', rol: ROL_USUARIOS_NUEVOS, estado: 'Activo', ...extra })

export const USUARIOS_BASE = [
  // Equipo del proyecto
  { id: 'usr-nico', nombre: 'Nicolás Batta Piccinini', email: 'nicolas.batta@gmail.com', cargo: 'Integrante del equipo', rol: 'Administrador', estado: 'Activo' },
  { id: 'usr-wilson', nombre: 'Wilson Bogado', email: 'wilson.bogado@gmail.com', cargo: 'Integrante del equipo', rol: 'Editor', estado: 'Activo' },
  equipo('usr-bethania', 'Bethania Benítez', 'bethania.benitez@gmail.com'),
  equipo('usr-jazmin', 'Jazmín Benítez', 'jazmin.benitez@gmail.com'),
  equipo('usr-augusto', 'Augusto Benítez', 'augusto.benitez@gmail.com'),
  equipo('usr-isaias', 'Isaías Colmán', 'isaias.colman@gmail.com'),

  // Empresa de ejemplo (Yvoty Alimentos S.A.) · datos de perfil ficticios
  { id: 'usr-01', nombre: 'María José Benítez', email: 'maria.benitez@gmail.com', cargo: 'Gerente General', rol: 'Administrador', estado: 'Activo', telefono: '0981 345 210', departamento: 'Dirección', fechaIngreso: '2015-03-02' },
  { id: 'usr-02', nombre: 'Derlis Ayala', email: 'derlis.ayala@gmail.com', cargo: 'Jefe de Tecnología', rol: 'Administrador', estado: 'Activo', telefono: '0971 288 456', departamento: 'Tecnología', fechaIngreso: '2018-09-17' },
  { id: 'usr-03', nombre: 'Carlos Giménez', email: 'carlos.gimenez@gmail.com', cargo: 'Jefe de Finanzas', rol: 'Editor', estado: 'Activo', telefono: '0961 512 387', departamento: 'Finanzas', fechaIngreso: '2017-06-12' },
  { id: 'usr-04', nombre: 'Nathalia Duarte', email: 'nathalia.duarte@gmail.com', cargo: 'Jefa de Talento Humano', rol: 'Editor', estado: 'Activo', telefono: '0991 604 125', departamento: 'Talento Humano', fechaIngreso: '2016-11-07' },
  { id: 'usr-05', nombre: 'Gloria Ortiz', email: 'gloria.ortiz@gmail.com', cargo: 'Jefa de Calidad', rol: 'Editor', estado: 'Activo', telefono: '0982 739 840', departamento: 'Calidad', fechaIngreso: '2019-01-14' },
  { id: 'usr-06', nombre: 'Andrea Galeano', email: 'andrea.galeano@gmail.com', cargo: 'Jefa Comercial', rol: 'Lector', estado: 'Activo', telefono: '0972 415 963', departamento: 'Comercial', fechaIngreso: '2018-02-19' },
  { id: 'usr-07', nombre: 'Óscar Cabañas', email: 'oscar.cabanas@gmail.com', cargo: 'Analista de Soporte', rol: 'Lector', estado: 'Inactivo', telefono: '0983 270 518', departamento: 'Tecnología', fechaIngreso: '2023-08-21' },
]
