// Catálogos compartidos entre módulos.

export const DEPARTAMENTOS = [
  'Dirección',
  'Finanzas',
  'Tecnología',
  'Talento Humano',
  'Calidad',
  'Operaciones',
  'Comercial',
]

export const ESTADOS_EMPLEADO = {
  Activo: 'success',
  Vacaciones: 'info',
  Licencia: 'warning',
}

// Prioridades (Calidad y Proyectos): tono del Badge + orden para ordenar.
export const PRIORIDADES = {
  Baja: { tone: 'neutral', orden: 0 },
  Media: { tone: 'info', orden: 1 },
  Alta: { tone: 'warning', orden: 2 },
  Crítica: { tone: 'danger', orden: 3 },
}
export const LISTA_PRIORIDADES = Object.keys(PRIORIDADES)

// Nombres de las colecciones de Firestore usadas por cada módulo.
export const COLECCIONES = {
  foda: 'foda',
  empleados: 'empleados',
  evaluaciones: 'evaluaciones',
  clima: 'clima_respuestas',
  noConformidades: 'no_conformidades',
  presupuestos: 'presupuestos',
  costos: 'costos_mensuales',
  tareas: 'tareas',
  fases: 'fases',
  actividad: 'actividad',
  empresas: 'empresas',
  usuarios: 'usuarios',
  test: 'test_collection',
}

// Encuesta de clima organizacional: una pregunta por dimensión (escala 1 a 5).
export const CLIMA_PREGUNTAS = [
  { id: 'liderazgo', dimension: 'Liderazgo', pregunta: 'Mi líder directo me da orientación clara y me apoya cuando lo necesito.' },
  { id: 'comunicacion', dimension: 'Comunicación', pregunta: 'La información importante de la empresa me llega a tiempo y de forma clara.' },
  { id: 'equipo', dimension: 'Trabajo en equipo', pregunta: 'En mi área colaboramos y nos ayudamos para lograr los objetivos.' },
  { id: 'reconocimiento', dimension: 'Reconocimiento', pregunta: 'Siento que mi trabajo es valorado y reconocido.' },
  { id: 'desarrollo', dimension: 'Desarrollo', pregunta: 'Tengo oportunidades reales de capacitarme y crecer profesionalmente.' },
  { id: 'ambiente', dimension: 'Condiciones', pregunta: 'Cuento con las herramientas y el espacio adecuados para hacer bien mi trabajo.' },
  { id: 'equilibrio', dimension: 'Equilibrio', pregunta: 'Puedo equilibrar mi vida laboral con mi vida personal.' },
  { id: 'compromiso', dimension: 'Compromiso', pregunta: 'Recomendaría esta empresa como un buen lugar para trabajar.' },
]

// Criterios de la evaluación de desempeño (1 a 5 estrellas cada uno).
export const CRITERIOS_DESEMPENO = [
  { id: 'productividad', label: 'Productividad', descripcion: 'Cumple objetivos y plazos' },
  { id: 'calidad', label: 'Calidad del trabajo', descripcion: 'Precisión y prolijidad' },
  { id: 'trabajoEquipo', label: 'Trabajo en equipo', descripcion: 'Colabora y comunica' },
  { id: 'puntualidad', label: 'Puntualidad', descripcion: 'Asistencia y compromiso' },
  { id: 'iniciativa', label: 'Iniciativa', descripcion: 'Propone mejoras' },
]

// Roles de usuario. Hoy el rol controla la gestión de usuarios (solo Administrador);
// el resto de los permisos se aplicará cuando se sume autenticación real y reglas de Firestore.
export const ROLES = {
  Administrador: { tone: 'primary', descripcion: 'Gestiona usuarios y empresas, y trabaja en todos los módulos.' },
  Editor: { tone: 'info', descripcion: 'Crea y modifica registros en los módulos.' },
  Lector: { tone: 'neutral', descripcion: 'Consulta la información sin modificar la configuración.' },
}
export const LISTA_ROLES = Object.keys(ROLES)

// Empresas de ejemplo para practicar la matriz FODA (se cargan con los datos de demo).
export const EMPRESAS = [
  { id: 'yvoty', nombre: 'Yvoty Alimentos S.A.', rubro: 'Industria alimenticia', ciudad: 'Luque', descripcion: 'Elaboración y distribución de yerba mate, harinas y snacks con presencia en todo el país.' },
  { id: 'tecnopar', nombre: 'TecnoPar Soluciones S.R.L.', rubro: 'Desarrollo de software', ciudad: 'Asunción', descripcion: 'Fábrica de software a medida para cooperativas y pymes.' },
  { id: 'nanduti', nombre: 'Transportes Ñandutí S.A.', rubro: 'Logística y transporte', ciudad: 'Ciudad del Este', descripcion: 'Transporte de cargas por ruta en la región de la triple frontera.' },
]
