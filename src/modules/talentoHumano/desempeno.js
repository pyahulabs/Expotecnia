import { CRITERIOS_DESEMPENO } from '@/config/constants'
import { average } from '@/lib/format'

/** Período vigente según la fecha: "2026-S2" */
export const periodoActual = () => {
  const hoy = new Date()
  return `${hoy.getFullYear()}-S${hoy.getMonth() < 6 ? 1 : 2}`
}

export const etiquetaPeriodo = (periodo = '') => {
  const [anio, semestre] = periodo.split('-S')
  return semestre ? `${semestre === '1' ? '1.er' : '2.º'} semestre ${anio}` : periodo
}

/** Promedio simple de los criterios calificados (ignora los que están en 0). */
export const promedioCriterios = (criterios = {}) => {
  const valores = CRITERIOS_DESEMPENO.map((c) => Number(criterios[c.id]) || 0).filter(Boolean)
  return valores.length ? Number(average(valores).toFixed(2)) : 0
}

/** Última evaluación de cada empleado: Map(empleadoId → evaluación) */
export const ultimaPorEmpleado = (evaluaciones) => {
  const mapa = new Map()
  evaluaciones.forEach((ev) => {
    const actual = mapa.get(ev.empleadoId)
    const esMasNueva = !actual || ev.periodo > actual.periodo || (ev.periodo === actual.periodo && ev.createdAt > actual.createdAt)
    if (esMasNueva) mapa.set(ev.empleadoId, ev)
  })
  return mapa
}

/** Antigüedad legible: "3 años", "8 meses" */
export const antiguedad = (fechaIngreso) => {
  if (!fechaIngreso) return '—'
  const [y, m, d] = fechaIngreso.split('-').map(Number)
  const hoy = new Date()
  let meses = (hoy.getFullYear() - y) * 12 + (hoy.getMonth() + 1 - m) - (hoy.getDate() < d ? 1 : 0)
  meses = Math.max(0, meses)
  if (meses < 1) return 'Menos de 1 mes'
  if (meses < 12) return `${meses} ${meses === 1 ? 'mes' : 'meses'}`
  const anios = Math.floor(meses / 12)
  return `${anios} ${anios === 1 ? 'año' : 'años'}`
}
