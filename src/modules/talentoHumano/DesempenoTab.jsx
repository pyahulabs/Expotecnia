import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Award, ClipboardCheck, Star, Target, TrendingUp } from 'lucide-react'
import { Avatar, Badge, Button, Card, CardBody, CardHeader, EmptyState, Loading, ProgressBar, Select, SkeletonList, StarRating, StatCard, Trend } from '@/components/ui'
import { CRITERIOS_DESEMPENO } from '@/config/constants'
import { average, formatDecimal, formatPercent } from '@/lib/format'
import { fadeUp, stagger } from '@/lib/motion'
import { etiquetaPeriodo } from './desempeno'

/** Resultados de las evaluaciones: indicadores, ranking y promedio por criterio. */
export function DesempenoTab({ empleados, evaluaciones, loading, onEvaluar }) {
  const periodos = useMemo(() => [...new Set(evaluaciones.map((e) => e.periodo))].sort().reverse(), [evaluaciones])
  const [periodoElegido, setPeriodoElegido] = useState('')
  const periodo = periodos.includes(periodoElegido) ? periodoElegido : periodos[0]
  const periodoPrevio = periodos[periodos.indexOf(periodo) + 1]

  const { ranking, promedio, porCriterio, evaluados } = useMemo(() => {
    const delPeriodo = evaluaciones.filter((e) => e.periodo === periodo)
    // Si alguien fue evaluado dos veces en el período, vale la más reciente
    const ultima = new Map()
    delPeriodo.forEach((e) => {
      if (!ultima.has(e.empleadoId) || e.createdAt > ultima.get(e.empleadoId).createdAt) ultima.set(e.empleadoId, e)
    })
    const previas = new Map(evaluaciones.filter((e) => e.periodo === periodoPrevio).map((e) => [e.empleadoId, e]))
    const lista = [...ultima.values()]
      .map((ev) => {
        const empleado = empleados.find((e) => e.id === ev.empleadoId)
        const previa = previas.get(ev.empleadoId)
        return {
          ...ev,
          nombre: empleado?.nombre || ev.empleado || 'Empleado eliminado',
          cargo: empleado?.cargo || '—',
          departamento: empleado?.departamento,
          variacion: previa ? ev.promedio - previa.promedio : null,
        }
      })
      .sort((a, b) => b.promedio - a.promedio)
    return {
      ranking: lista,
      evaluados: lista.length,
      promedio: average(lista.map((e) => e.promedio)),
      porCriterio: CRITERIOS_DESEMPENO.map((c) => ({ ...c, valor: average(lista.map((e) => Number(e.criterios?.[c.id]) || 0)) })),
    }
  }, [evaluaciones, empleados, periodo, periodoPrevio])

  if (loading) {
    return (
      <Loading label="Cargando evaluaciones…">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <StatCard key={i} loading />
          ))}
        </div>
        <Card className="mt-6 p-6">
          <SkeletonList rows={6} />
        </Card>
      </Loading>
    )
  }

  if (!evaluaciones.length) {
    return (
      <Card>
        <EmptyState
          icon={ClipboardCheck}
          title="Todavía no hay evaluaciones"
                demo
          description="Evaluá a un empleado con estrellas de 1 a 5 en cada criterio y el promedio se calcula solo."
          action={
            <Button icon={Star} onClick={() => onEvaluar()}>
              Nueva evaluación
            </Button>
          }
        />
      </Card>
    )
  }

  const ordenCriterios = [...porCriterio].sort((a, b) => b.valor - a.valor)
  const cobertura = empleados.length ? (evaluados / empleados.length) * 100 : 0

  return (
    <motion.div variants={stagger(0.06)} initial="hidden" animate="show" className="space-y-4 lg:space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Star} tone="warning" label="Promedio general" value={promedio} format={formatDecimal} hint="sobre 5 puntos" />
        <StatCard icon={ClipboardCheck} tone="info" label="Cobertura" value={cobertura} format={(v) => formatPercent(v)} hint={`${evaluados} de ${empleados.length} empleados evaluados`} />
        <StatCard icon={Award} tone="success" label="Criterio más fuerte" value={ordenCriterios[0]?.valor || 0} format={formatDecimal} hint={ordenCriterios[0]?.label} />
        <StatCard icon={Target} tone="danger" label="Criterio a reforzar" value={ordenCriterios.at(-1)?.valor || 0} format={formatDecimal} hint={ordenCriterios.at(-1)?.label} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:gap-6 xl:grid-cols-3">
        <Card variants={fadeUp} className="xl:col-span-2">
          <CardHeader
            icon={TrendingUp}
            title="Ranking de desempeño"
            description={`${etiquetaPeriodo(periodo)}${periodoPrevio ? ` · variación vs. ${etiquetaPeriodo(periodoPrevio)}` : ''}`}
            action={
              <Select
                aria-label="Período"
                value={periodo}
                onChange={(e) => setPeriodoElegido(e.target.value)}
                options={periodos.map((p) => ({ value: p, label: p }))}
                wrapperClassName="w-32"
              />
            }
          />
          <CardBody className="pt-3 sm:pt-4">
            <ol className="divide-y divide-line">
              {ranking.map((ev, i) => (
                <li key={ev.id} className="flex items-center gap-3 py-3 sm:gap-4">
                  <span className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold tabular-nums ${i < 3 ? 'bg-warning-soft text-warning-text' : 'bg-surface-2 text-fg-subtle'}`}>{i + 1}</span>
                  <Avatar name={ev.nombre} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-fg">{ev.nombre}</p>
                    <p className="truncate text-xs text-fg-subtle">{ev.cargo}</p>
                  </div>
                  {ev.departamento && <Badge className="hidden md:inline-flex">{ev.departamento}</Badge>}
                  <div className="hidden w-16 justify-end sm:flex">{ev.variacion != null && <Trend value={ev.variacion} suffix="" />}</div>
                  <StarRating value={ev.promedio} size={15} label={`Promedio de ${ev.nombre}`} className="hidden sm:inline-flex" />
                  <span className="w-8 text-right text-sm font-semibold tabular-nums text-fg">{formatDecimal(ev.promedio)}</span>
                </li>
              ))}
            </ol>
          </CardBody>
        </Card>

        <Card variants={fadeUp}>
          <CardHeader icon={Target} title="Promedio por criterio" description="Qué tan bien rinde el equipo en cada aspecto." />
          <CardBody>
            <ul className="space-y-5">
              {porCriterio.map((criterio) => (
                <li key={criterio.id}>
                  <div className="mb-2 flex items-baseline justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-fg">{criterio.label}</p>
                      <p className="truncate text-xs text-fg-subtle">{criterio.descripcion}</p>
                    </div>
                    <span className="text-sm font-semibold tabular-nums text-fg">{formatDecimal(criterio.valor)}</span>
                  </div>
                  <ProgressBar value={criterio.valor} max={5} label={criterio.label} />
                </li>
              ))}
            </ul>
            <Button variant="soft" icon={Star} className="mt-6 w-full" onClick={() => onEvaluar()}>
              Nueva evaluación
            </Button>
          </CardBody>
        </Card>
      </div>
    </motion.div>
  )
}
