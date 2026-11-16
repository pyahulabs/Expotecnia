// Columnas del Kanban de tareas del proyecto
export const ESTADOS_TAREA = [
  { id: 'pendiente', title: 'Por hacer', tone: 'neutral' },
  { id: 'progreso', title: 'En curso', tone: 'info' },
  { id: 'revision', title: 'En revisión', tone: 'warning' },
  { id: 'hecho', title: 'Hecho', tone: 'success' },
]

export const estadoTarea = (id) => ESTADOS_TAREA.find((e) => e.id === id) || ESTADOS_TAREA[0]

export const ETIQUETAS = ['Frontend', 'Backend', 'Datos', 'Diseño', 'Analítica', 'Documentación', 'Finanzas', 'Evento', 'Análisis']
