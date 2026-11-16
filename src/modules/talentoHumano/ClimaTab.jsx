import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Angry, ArrowLeft, ArrowRight, BarChart3, Check, Frown, Laugh, Meh, PartyPopper, Send, Smile, Users } from 'lucide-react'
import { Bar, BarChart, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartTooltip, axisProps } from '@/components/charts/ChartKit'
import { AnimatedNumber, Badge, Button, Card, CardBody, CardHeader, EmptyState, Field, Loading, ProgressBar, Select, SkeletonChart } from '@/components/ui'
import { CLIMA_PREGUNTAS, DEPARTAMENTOS } from '@/config/constants'
import { cn } from '@/lib/cn'
import { average, formatDecimal, formatPercent } from '@/lib/format'
import { ease, fadeUp, stagger } from '@/lib/motion'

const ESCALA = [
  { valor: 1, label: 'Muy en desacuerdo', icon: Angry },
  { valor: 2, label: 'En desacuerdo', icon: Frown },
  { valor: 3, label: 'Neutral', icon: Meh },
  { valor: 4, label: 'De acuerdo', icon: Smile },
  { valor: 5, label: 'Muy de acuerdo', icon: Laugh },
]

const TOTAL = CLIMA_PREGUNTAS.length

/** Encuesta paso a paso: una pregunta por pantalla con barra de progreso. */
function Encuesta({ onEnviar }) {
  // paso: -1 = bienvenida · 0..TOTAL-1 = preguntas · TOTAL = agradecimiento
  const [paso, setPaso] = useState(-1)
  const [direccion, setDireccion] = useState(1)
  const [departamento, setDepartamento] = useState('')
  const [respuestas, setRespuestas] = useState({})

  const ir = (siguiente) => {
    setDireccion(siguiente > paso ? 1 : -1)
    setPaso(siguiente)
  }

  const responder = (valor) => {
    const pregunta = CLIMA_PREGUNTAS[paso]
    setRespuestas((r) => ({ ...r, [pregunta.id]: valor }))
    // Avanza sola a la siguiente pregunta (la última espera el botón "Enviar")
    if (paso < TOTAL - 1) window.setTimeout(() => ir(paso + 1), 280)
  }

  const enviar = () => {
    onEnviar({ respuestas, departamento: departamento || 'Sin especificar' })
    ir(TOTAL)
  }

  const reiniciar = () => {
    setRespuestas({})
    setDepartamento('')
    ir(-1)
  }

  const pregunta = CLIMA_PREGUNTAS[paso]
  const respondidas = Object.keys(respuestas).length
  const variants = {
    enter: (d) => ({ opacity: 0, x: d * 48 }),
    center: { opacity: 1, x: 0 },
    exit: (d) => ({ opacity: 0, x: d * -48 }),
  }

  return (
    <Card variants={fadeUp} className="flex min-h-[500px] flex-col overflow-hidden">
      <div className="px-5 pt-5 sm:px-6 sm:pt-6">
        <div className="flex items-center justify-between gap-3 text-xs font-medium text-fg-muted">
          <span>{paso < 0 ? 'Encuesta de clima' : paso >= TOTAL ? '¡Completada!' : `Pregunta ${paso + 1} de ${TOTAL}`}</span>
          <span className="tabular-nums">{formatPercent((Math.min(respondidas, TOTAL) / TOTAL) * 100)}</span>
        </div>
        <ProgressBar value={paso >= TOTAL ? TOTAL : respondidas} max={TOTAL} tone={paso >= TOTAL ? 'success' : 'primary'} label="Progreso de la encuesta" className="mt-2" />
      </div>

      <div className="relative flex flex-1 flex-col overflow-hidden">
        <AnimatePresence mode="wait" custom={direccion} initial={false}>
          <motion.div
            key={paso}
            custom={direccion}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.26, ease }}
            className="flex flex-1 flex-col p-5 sm:p-6"
          >
            {paso < 0 && (
              <div className="flex flex-1 flex-col justify-center">
                <span className="grid size-12 place-items-center rounded-2xl bg-primary-soft text-primary-text">
                  <Smile size={24} aria-hidden="true" />
                </span>
                <h2 className="mt-5 text-xl font-semibold tracking-[-0.02em] text-fg">¿Cómo te sentís en el trabajo?</h2>
                <p className="mt-2 text-sm leading-6 text-fg-muted">
                  Son {TOTAL} preguntas y lleva menos de un minuto. Tus respuestas son <span className="font-medium text-fg">anónimas</span> y ayudan a mejorar el clima de la empresa.
                </p>
                <Field label="¿En qué área trabajás?" htmlFor="clima-depto" hint="Opcional. Solo se usa para agrupar resultados." className="mt-6">
                  <Select id="clima-depto" value={departamento} onChange={(e) => setDepartamento(e.target.value)} placeholder="Prefiero no decirlo" options={DEPARTAMENTOS} />
                </Field>
                <Button size="lg" iconRight={ArrowRight} className="mt-6 self-start" onClick={() => ir(0)}>
                  Comenzar encuesta
                </Button>
              </div>
            )}

            {pregunta && (
              <fieldset className="flex flex-1 flex-col">
                <Badge tone="primary" className="self-start">
                  {pregunta.dimension}
                </Badge>
                <legend className="float-left mt-4 w-full text-lg font-semibold leading-7 tracking-[-0.01em] text-fg sm:text-xl">{pregunta.pregunta}</legend>
                <div className="mt-6 grid grid-cols-5 gap-2" role="radiogroup" aria-label={pregunta.pregunta}>
                  {ESCALA.map((opcion) => {
                    const elegido = respuestas[pregunta.id] === opcion.valor
                    return (
                      <motion.button
                        key={opcion.valor}
                        type="button"
                        role="radio"
                        aria-checked={elegido}
                        aria-label={`${opcion.valor}: ${opcion.label}`}
                        whileHover={{ y: -3 }}
                        whileTap={{ scale: 0.94 }}
                        onClick={() => responder(opcion.valor)}
                        className={cn(
                          'flex flex-col items-center gap-2 rounded-2xl border px-1 py-4 transition-colors duration-150',
                          elegido ? 'border-primary bg-primary-soft text-primary-text shadow-card' : 'border-line bg-surface text-fg-muted hover:border-line-strong hover:text-fg',
                        )}
                      >
                        <opcion.icon size={26} strokeWidth={1.8} aria-hidden="true" />
                        <span className="text-sm font-semibold tabular-nums">{opcion.valor}</span>
                      </motion.button>
                    )
                  })}
                </div>
                <div className="mt-2 flex justify-between text-xs text-fg-subtle">
                  <span>Muy en desacuerdo</span>
                  <span>Muy de acuerdo</span>
                </div>
                <div className="mt-auto flex items-center justify-between gap-3 pt-8">
                  <Button variant="ghost" icon={ArrowLeft} onClick={() => ir(paso - 1)}>
                    {paso === 0 ? 'Inicio' : 'Anterior'}
                  </Button>
                  {paso < TOTAL - 1 ? (
                    <Button variant="secondary" iconRight={ArrowRight} disabled={!respuestas[pregunta.id]} onClick={() => ir(paso + 1)}>
                      Siguiente
                    </Button>
                  ) : (
                    <Button icon={Send} disabled={respondidas < TOTAL} onClick={enviar}>
                      Enviar respuestas
                    </Button>
                  )}
                </div>
              </fieldset>
            )}

            {paso >= TOTAL && (
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <motion.span
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.1 }}
                  className="grid size-16 place-items-center rounded-full bg-success-soft text-success-text"
                >
                  <Check size={30} strokeWidth={2.5} aria-hidden="true" />
                </motion.span>
                <h2 className="mt-5 text-xl font-semibold tracking-[-0.02em] text-fg">¡Gracias por participar!</h2>
                <p className="mt-2 max-w-xs text-sm leading-6 text-fg-muted">Tu respuesta ya se sumó a los resultados. Mirá cómo se actualizó el gráfico.</p>
                <Button variant="secondary" icon={PartyPopper} className="mt-6" onClick={reiniciar}>
                  Responder otra vez
                </Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </Card>
  )
}

/** Resultados agregados: índice global + barras por dimensión. */
function Resultados({ respuestas, loading }) {
  const [area, setArea] = useState('Todas')
  const areas = useMemo(() => ['Todas', ...new Set(respuestas.map((r) => r.departamento).filter(Boolean))], [respuestas])
  const filtradas = area === 'Todas' ? respuestas : respuestas.filter((r) => r.departamento === area)

  const dimensiones = useMemo(
    () =>
      CLIMA_PREGUNTAS.map((p) => ({
        dimension: p.dimension,
        valor: Number(average(filtradas.map((r) => Number(r.respuestas?.[p.id])).filter(Boolean)).toFixed(2)),
      })).sort((a, b) => b.valor - a.valor),
    [filtradas],
  )
  const indice = average(dimensiones.map((d) => d.valor).filter(Boolean))
  const favorables = filtradas.length
    ? (filtradas.filter((r) => average(Object.values(r.respuestas || {}).map(Number)) >= 4).length / filtradas.length) * 100
    : 0

  return (
    <Card variants={fadeUp} className="flex flex-col">
      <CardHeader
        icon={BarChart3}
        title="Resultados de la encuesta"
        description="Promedio por dimensión, de 1 a 5."
        action={<Select aria-label="Filtrar por área" value={areas.includes(area) ? area : 'Todas'} onChange={(e) => setArea(e.target.value)} options={areas} wrapperClassName="w-40" />}
      />
      <CardBody className="flex flex-1 flex-col">
        {loading ? (
          <Loading label="Cargando resultados…">
            <SkeletonChart />
          </Loading>
        ) : !filtradas.length ? (
          <EmptyState compact icon={Users} title="Todavía no hay respuestas" description="Completá la encuesta y los resultados aparecen acá en tiempo real." />
        ) : (
          <>
            <div className="grid grid-cols-3 divide-x divide-line rounded-xl border border-line bg-surface-2/50">
              {[
                { label: 'Respuestas', value: filtradas.length, format: (v) => String(Math.round(v)) },
                { label: 'Índice global', value: indice, format: (v) => `${formatDecimal(v)} / 5` },
                { label: 'Favorables', value: favorables, format: (v) => formatPercent(v) },
              ].map((stat) => (
                <div key={stat.label} className="px-3 py-3 text-center sm:px-4">
                  <AnimatedNumber value={stat.value} format={stat.format} duration={0.8} className="text-xl font-semibold tracking-tight text-fg" />
                  <p className="mt-0.5 text-xs text-fg-muted">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 h-[300px]" role="img" aria-label={`Gráfico de barras del clima. ${dimensiones.map((d) => `${d.dimension}: ${formatDecimal(d.valor)}`).join(', ')}.`}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dimensiones} layout="vertical" margin={{ top: 0, right: 36, bottom: 0, left: 0 }} barCategoryGap="28%">
                  <XAxis type="number" domain={[0, 5]} hide />
                  <YAxis type="category" dataKey="dimension" width={132} {...axisProps} tick={{ fill: 'var(--fg-muted)', fontSize: 12 }} />
                  <Tooltip cursor={{ fill: 'var(--surface-2)', opacity: 0.6 }} content={<ChartTooltip formatter={(v) => `${formatDecimal(v)} / 5`} colors={{ valor: 'var(--chart-1)' }} />} />
                  <Bar dataKey="valor" name="Promedio" fill="var(--chart-1)" radius={[0, 4, 4, 0]} maxBarSize={16} background={{ fill: 'var(--surface-2)', radius: 4 }} animationDuration={900} animationEasing="ease-out">
                    <LabelList dataKey="valor" position="right" offset={8} formatter={(v) => formatDecimal(v)} style={{ fill: 'var(--fg)', fontSize: 12, fontWeight: 600 }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Badge tone="success">Mejor: {dimensiones[0].dimension}</Badge>
              <Badge tone="warning">A mejorar: {dimensiones.at(-1).dimension}</Badge>
            </div>
          </>
        )}
      </CardBody>
    </Card>
  )
}

export function ClimaTab({ respuestas, loading, onEnviar }) {
  return (
    <motion.div variants={stagger(0.08)} initial="hidden" animate="show" className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
      <Encuesta onEnviar={onEnviar} />
      <Resultados respuestas={respuestas} loading={loading} />
    </motion.div>
  )
}
