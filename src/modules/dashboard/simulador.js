// Lógica pura del simulador de escenarios (sin React): fácil de explicar y de probar.
//
//   aumento   → % que se suma al presupuesto de cada departamento
//   reduccion → % que se recorta del gasto (ejecutado y costos futuros)

import { sum } from '@/lib/format'

export const ESCENARIO_BASE = { aumento: 0, reduccion: 0 }

export const PRESETS = [
  { id: 'eficiencia', label: 'Eficiencia', aumento: 0, reduccion: 15 },
  { id: 'equilibrio', label: 'Equilibrio', aumento: 10, reduccion: 8 },
  { id: 'expansion', label: 'Expansión', aumento: 25, reduccion: 0 },
]

export const esEscenarioActivo = (e) => e.aumento !== 0 || e.reduccion !== 0

/** Agrega a cada departamento sus valores proyectados. */
export function proyectarPresupuestos(presupuestos, { aumento, reduccion }) {
  return presupuestos.map((p) => ({
    ...p,
    presupuestoProy: Math.round(p.presupuesto * (1 + aumento / 100)),
    ejecutadoProy: Math.round(p.ejecutado * (1 - reduccion / 100)),
  }))
}

/** Totales actuales y proyectados para la comparación del panel. */
export function resumirEscenario(proyectados) {
  const presupuesto = sum(proyectados.map((p) => p.presupuesto))
  const ejecutado = sum(proyectados.map((p) => p.ejecutado))
  const presupuestoProy = sum(proyectados.map((p) => p.presupuestoProy))
  const ejecutadoProy = sum(proyectados.map((p) => p.ejecutadoProy))
  return {
    actual: {
      presupuesto,
      ejecutado,
      saldo: presupuesto - ejecutado,
      ejecucion: presupuesto ? (ejecutado / presupuesto) * 100 : 0,
      excedidos: proyectados.filter((p) => p.ejecutado > p.presupuesto).length,
    },
    proyectado: {
      presupuesto: presupuestoProy,
      ejecutado: ejecutadoProy,
      saldo: presupuestoProy - ejecutadoProy,
      ejecucion: presupuestoProy ? (ejecutadoProy / presupuestoProy) * 100 : 0,
      excedidos: proyectados.filter((p) => p.ejecutadoProy > p.presupuestoProy).length,
    },
  }
}

/** Pendiente de la recta de regresión lineal (mínimos cuadrados). */
const pendiente = (valores) => {
  const n = valores.length
  if (n < 2) return 0
  const mediaX = (n - 1) / 2
  const mediaY = sum(valores) / n
  let num = 0
  let den = 0
  valores.forEach((y, x) => {
    num += (x - mediaX) * (y - mediaY)
    den += (x - mediaX) ** 2
  })
  return den ? num / den : 0
}

const siguientePeriodo = (periodo, pasos) => {
  const [y, m] = periodo.split('-').map(Number)
  const fecha = new Date(y, m - 1 + pasos, 1)
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`
}

/**
 * Serie para el gráfico de evolución de costos:
 * meses reales + `meses` futuros con dos proyecciones:
 *   tendencia → continúa la recta de los meses reales
 *   escenario → la tendencia con el recorte aplicado gradualmente (llega al 100% en 3 meses)
 */
export function proyectarCostos(costos, { reduccion }, meses = 6) {
  if (!costos.length) return []
  const reales = costos.map((c) => ({ periodo: c.periodo, real: c.costo }))
  const ultimo = costos[costos.length - 1]
  const m = pendiente(costos.map((c) => c.costo))

  // El último mes real sirve de "empalme" para que las líneas proyectadas arranquen ahí
  reales[reales.length - 1] = { ...reales[reales.length - 1], tendencia: ultimo.costo, escenario: ultimo.costo }

  const futuros = Array.from({ length: meses }, (_, i) => {
    const paso = i + 1
    const tendencia = ultimo.costo + m * paso
    const rampa = Math.min(1, paso / 3)
    return {
      periodo: siguientePeriodo(ultimo.periodo, paso),
      tendencia: Math.round(tendencia),
      escenario: Math.round(tendencia * (1 - (reduccion / 100) * rampa)),
    }
  })
  return [...reales, ...futuros]
}
