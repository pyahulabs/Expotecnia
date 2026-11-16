// Flujo de una no conformidad: Abierto → En análisis → Resuelto
export const ESTADOS_NC = [
  { id: 'abierto', title: 'Abierto', tone: 'danger' },
  { id: 'analisis', title: 'En análisis', tone: 'warning' },
  { id: 'resuelto', title: 'Resuelto', tone: 'success' },
]

export const estadoNC = (id) => ESTADOS_NC.find((e) => e.id === id) || ESTADOS_NC[0]

/** Siguiente código correlativo: NC-042 */
export const siguienteCodigo = (noConformidades) => {
  const max = noConformidades.reduce((n, nc) => Math.max(n, Number(String(nc.codigo || '').replace(/\D/g, '')) || 0), 0)
  return `NC-${String(max + 1).padStart(3, '0')}`
}
