import { useMemo } from 'react'
import { CLIMA_PREGUNTAS, COLECCIONES } from '@/config/constants'
import { useCollection } from '@/firebase/hooks'
import { average, clamp, diffDays, parseISODate, sum, todayISO } from '@/lib/format'

const DAY = 86_400_000

/** Lee todas las colecciones que alimentan el dashboard y calcula los indicadores. */
export function useDashboardData() {
  const empleados = useCollection(COLECCIONES.empleados)
  const evaluaciones = useCollection(COLECCIONES.evaluaciones)
  const clima = useCollection(COLECCIONES.clima)
  const noConformidades = useCollection(COLECCIONES.noConformidades)
  const presupuestos = useCollection(COLECCIONES.presupuestos, { orderBy: 'presupuesto', direction: 'desc' })
  const costos = useCollection(COLECCIONES.costos, { orderBy: 'periodo' })
  const fases = useCollection(COLECCIONES.fases, { orderBy: 'orden' })

  const fuentes = [empleados, evaluaciones, clima, noConformidades, presupuestos, costos, fases]
  const loading = fuentes.some((f) => f.loading)
  const vacio = !loading && fuentes.every((f) => f.data.length === 0)

  const kpis = useMemo(() => {
    const hoy = new Date()

    // 1) Empleados: dotación al cierre de cada uno de los últimos 8 meses
    const dotacion = Array.from({ length: 8 }, (_, i) => {
      const cierre = new Date(hoy.getFullYear(), hoy.getMonth() - (7 - i) + 1, 0)
      return empleados.data.filter((e) => !e.fechaIngreso || parseISODate(e.fechaIngreso) <= cierre).length
    })
    const totalEmpleados = empleados.data.length
    const base = dotacion[0] || totalEmpleados

    // 2) Desempeño: promedio por período (el último es el vigente)
    const porPeriodo = {}
    evaluaciones.data.forEach((ev) => {
      ;(porPeriodo[ev.periodo || 'actual'] ||= []).push(Number(ev.promedio) || 0)
    })
    const periodos = Object.keys(porPeriodo).sort()
    const serieDesempeno = periodos.map((p) => average(porPeriodo[p]))
    const desempeno = serieDesempeno.at(-1) || 0
    const desempenoPrevio = serieDesempeno.at(-2)

    // 3) Tickets abiertos (no conformidades sin resolver)
    const abiertos = noConformidades.data.filter((n) => n.estado !== 'resuelto')
    const porSemana = Array.from({ length: 8 }, (_, i) => {
      const desde = hoy.getTime() - (8 - i) * 7 * DAY
      const hasta = desde + 7 * DAY
      return noConformidades.data.filter((n) => {
        const t = parseISODate(n.fecha).getTime()
        return t > desde && t <= hasta
      }).length
    })
    const ultimas2 = sum(porSemana.slice(-2))
    const previas2 = sum(porSemana.slice(-4, -2))

    // 4) Presupuesto ejecutado vs. ritmo esperado del año
    const totalPresupuesto = sum(presupuestos.data.map((p) => p.presupuesto))
    const totalEjecutado = sum(presupuestos.data.map((p) => p.ejecutado))
    const ejecucion = totalPresupuesto ? (totalEjecutado / totalPresupuesto) * 100 : 0
    const inicioAnio = new Date(hoy.getFullYear(), 0, 1)
    const ritmoEsperado = ((hoy - inicioAnio) / (365 * DAY)) * 100
    let acumulado = 0
    const totalCostos = sum(costos.data.map((c) => c.costo)) || 1
    const serieEjecucion = costos.data.map((c) => {
      acumulado += c.costo
      return (acumulado / totalCostos) * ejecucion
    })

    // 5) Avance de proyectos: real (ponderado por duración) vs. planificado a hoy
    const hoyISO = todayISO()
    const duraciones = fases.data.map((f) => Math.max(1, diffDays(f.inicio, f.fin) + 1))
    const totalDias = sum(duraciones) || 1
    const avance = sum(fases.data.map((f, i) => (Number(f.avance) || 0) * duraciones[i])) / totalDias
    const planificadoA = (fechaISO) =>
      (sum(fases.data.map((f, i) => clamp((diffDays(f.inicio, fechaISO) + 1) / duraciones[i], 0, 1) * duraciones[i])) / totalDias) * 100
    const planHoy = planificadoA(hoyISO)
    const factor = planHoy ? avance / planHoy : 1
    const serieAvance = Array.from({ length: 8 }, (_, i) => {
      const fecha = new Date(hoy.getTime() - (7 - i) * 7 * DAY)
      return planificadoA(fecha) * factor
    })

    return {
      empleados: {
        value: totalEmpleados,
        trend: base ? ((totalEmpleados - base) / base) * 100 : null,
        sparkline: dotacion,
        hint: `${empleados.data.filter((e) => e.estado === 'Activo').length} activos · vs. hace 7 meses`,
      },
      desempeno: {
        value: desempeno,
        trend: desempenoPrevio ? ((desempeno - desempenoPrevio) / desempenoPrevio) * 100 : null,
        sparkline: serieDesempeno,
        hint: `sobre 5 · ${porPeriodo[periodos.at(-1)]?.length || 0} evaluaciones`,
      },
      tickets: {
        value: abiertos.length,
        trend: previas2 ? ((ultimas2 - previas2) / previas2) * 100 : null,
        sparkline: porSemana,
        hint: `${abiertos.filter((n) => n.prioridad === 'Crítica').length} críticos · nuevos últ. 14 días`,
      },
      presupuesto: {
        value: ejecucion,
        trend: totalPresupuesto ? ejecucion - ritmoEsperado : null,
        sparkline: serieEjecucion,
        hint: `Ritmo esperado a hoy: ${ritmoEsperado.toFixed(0)}%`,
      },
      proyectos: {
        value: avance,
        trend: fases.data.length ? avance - planHoy : null,
        sparkline: serieAvance,
        hint: `${fases.data.filter((f) => Number(f.avance) >= 100).length} de ${fases.data.length} fases completas · vs. plan`,
      },
    }
  }, [empleados.data, evaluaciones.data, noConformidades.data, presupuestos.data, costos.data, fases.data])

  const tickets = useMemo(() => {
    const contar = (estado) => noConformidades.data.filter((n) => n.estado === estado).length
    return [
      { estado: 'Abierto', value: contar('abierto'), color: 'var(--danger)' },
      { estado: 'En análisis', value: contar('analisis'), color: 'var(--warning)' },
      { estado: 'Resuelto', value: contar('resuelto'), color: 'var(--success)' },
    ]
  }, [noConformidades.data])

  const climaPorDimension = useMemo(
    () =>
      CLIMA_PREGUNTAS.map((p) => ({
        dimension: p.dimension,
        valor: Number(average(clima.data.map((r) => Number(r.respuestas?.[p.id])).filter(Boolean)).toFixed(2)),
      })),
    [clima.data],
  )

  return {
    loading,
    vacio,
    kpis,
    tickets,
    climaPorDimension,
    respuestasClima: clima.data.length,
    presupuestos: presupuestos.data,
    costos: costos.data,
  }
}
