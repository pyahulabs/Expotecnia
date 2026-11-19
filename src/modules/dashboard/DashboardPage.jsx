import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight, ChartColumn, ChartLine, DatabaseZap, FolderKanban, PieChart as PieIcon, PlugZap, Radar as RadarIcon, ShieldCheck, Smile, Star, Users, Wallet } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge, Button, Card, CardBody, CardHeader, CargarDemoBoton, EmptyState, Loading, SkeletonChart, StatCard } from '@/components/ui'
import { esAdministrador, useSession } from '@/context/SessionContext'
import { useDemoActions } from '@/lib/useDemoActions'
import { fadeUp, stagger } from '@/lib/motion'
import { formatDecimal, formatNumber, formatPercent, sum } from '@/lib/format'
import { useDashboardData } from './useDashboardData'
import { ESCENARIO_BASE, esEscenarioActivo, proyectarCostos, proyectarPresupuestos, resumirEscenario } from './simulador'
import { BudgetChart, ClimaChart, CostChart, TicketsChart } from './DashboardCharts'
import { ScenarioSimulator } from './ScenarioSimulator'
import { ActivityFeed } from './ActivityFeed'

// Reparto de las 5 tarjetas: 1 col (celular) → 2 (tablet) → 3 + 2 (laptop) → 5 (escritorio)
const KPI_SPAN = 'lg:col-span-2 xl:col-span-1'
const KPI_SPAN_WIDE = 'lg:col-span-3 xl:col-span-1'

const saludo = () => {
  const hora = new Date().getHours()
  if (hora < 12) return 'Buen día'
  if (hora < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

function ChartCard({ icon, title, description, action, loading, empty, emptyText, children, className }) {
  return (
    <Card variants={fadeUp} interactive className={className}>
      <CardHeader icon={icon} title={title} description={description} action={action} />
      <CardBody>
        {loading ? (
          <Loading>
            <SkeletonChart />
          </Loading>
        ) : empty ? (
          <EmptyState compact icon={icon} title="Sin datos para graficar" description={emptyText} />
        ) : (
          children
        )}
      </CardBody>
    </Card>
  )
}

function VerMas({ to, children }) {
  return (
    <Link to={to} className="inline-flex items-center gap-1 rounded-md text-[13px] font-medium text-primary-text hover:underline">
      {children}
      <ArrowUpRight size={14} aria-hidden="true" />
    </Link>
  )
}

export default function DashboardPage() {
  const { user } = useSession()
  const { test, testing } = useDemoActions()
  const { loading, vacio, kpis, tickets, climaPorDimension, respuestasClima, presupuestos, costos } = useDashboardData()
  const [escenario, setEscenario] = useState(ESCENARIO_BASE)

  const activo = esEscenarioActivo(escenario)
  const proyectados = useMemo(() => proyectarPresupuestos(presupuestos, escenario), [presupuestos, escenario])
  const resumen = useMemo(() => resumirEscenario(proyectados), [proyectados])
  const serieCostos = useMemo(() => proyectarCostos(costos, escenario), [costos, escenario])
  const presupuestoMensual = (activo ? resumen.proyectado.presupuesto : resumen.actual.presupuesto) / 12

  const climaOrdenado = [...climaPorDimension].filter((d) => d.valor > 0).sort((a, b) => b.valor - a.valor)
  const climaGlobal = climaOrdenado.length ? sum(climaOrdenado.map((d) => d.valor)) / climaOrdenado.length : 0

  return (
    <>
      <PageHeader
        eyebrow="Sistemas de información gerencial"
        title={`${saludo()}, ${user?.nombre?.split(' ')[0] || 'equipo'}`}
        description="Indicadores clave de toda la organización, actualizados en tiempo real."
        actions={
          <>
            <Button variant="secondary" icon={PlugZap} loading={testing} onClick={test}>
              Probar conexión
            </Button>
            <CargarDemoBoton />
          </>
        }
      />

      {vacio ? (
        <Card>
          <EmptyState
            icon={DatabaseZap}
            title="Tu espacio de trabajo está vacío"
            description={esAdministrador(user) ? "Cargá los datos de demostración para ver el dashboard, los gráficos y todos los módulos con información realista." : "Todavía no hay datos. Pedile a un administrador que cargue los datos de demostración."}
            demo
          />
        </Card>
      ) : (
        <motion.div variants={stagger(0.07)} initial="hidden" animate="show" className="space-y-4 lg:space-y-6">
          {/* Indicadores */}
          <section aria-label="Indicadores clave" className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-6 xl:grid-cols-5">
            <StatCard className={KPI_SPAN} loading={loading} icon={Users} label="Empleados" value={kpis.empleados.value} trend={kpis.empleados.trend} sparkline={kpis.empleados.sparkline} hint={kpis.empleados.hint} />
            <StatCard className={KPI_SPAN} loading={loading} icon={Star} tone="warning" label="Desempeño promedio" value={kpis.desempeno.value} format={formatDecimal} trend={kpis.desempeno.trend} sparkline={kpis.desempeno.sparkline} hint={kpis.desempeno.hint} />
            <StatCard className={KPI_SPAN} loading={loading} icon={ShieldCheck} tone="danger" label="Tickets abiertos" value={kpis.tickets.value} trend={kpis.tickets.trend} goodWhenUp={false} sparkline={kpis.tickets.sparkline} hint={kpis.tickets.hint} />
            <StatCard className={KPI_SPAN_WIDE} loading={loading} icon={Wallet} tone="success" label="Presupuesto ejecutado" value={kpis.presupuesto.value} format={(v) => formatPercent(v, 1)} trend={kpis.presupuesto.trend} trendSuffix=" pts" goodWhenUp={false} sparkline={kpis.presupuesto.sparkline} hint={kpis.presupuesto.hint} />
            <StatCard loading={loading} icon={FolderKanban} tone="info" label="Avance de proyectos" value={kpis.proyectos.value} format={(v) => formatPercent(v)} trend={kpis.proyectos.trend} trendSuffix=" pts" sparkline={kpis.proyectos.sparkline} hint={kpis.proyectos.hint} className={`col-span-2 ${KPI_SPAN_WIDE}`} />
          </section>

          {/* Simulador + presupuesto */}
          <section className="grid grid-cols-1 gap-4 lg:gap-6 xl:grid-cols-3">
            <motion.div variants={fadeUp} className="xl:col-span-1">
              <ScenarioSimulator escenario={escenario} onChange={setEscenario} resumen={resumen} className="h-full" />
            </motion.div>
            <ChartCard
              className="xl:col-span-2"
              icon={ChartColumn}
              title="Presupuesto vs. ejecutado"
              description="Por departamento, en millones de guaraníes."
              action={activo ? <Badge tone="primary">Actual vs. proyectado</Badge> : <VerMas to="/finanzas">Ver finanzas</VerMas>}
              loading={loading}
              empty={!presupuestos.length}
              emptyText="Cargá presupuestos en el módulo de Finanzas."
            >
              <BudgetChart data={proyectados} proyectado={activo} />
            </ChartCard>
          </section>

          {/* Costos + tickets */}
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
            <ChartCard
              className="lg:col-span-2"
              icon={ChartLine}
              title="Evolución de costos"
              description="Últimos 12 meses y proyección a 6 meses."
              action={activo ? <Badge tone="primary">Reducción de {escenario.reduccion}%</Badge> : null}
              loading={loading}
              empty={!costos.length}
              emptyText="No hay costos mensuales registrados."
            >
              <CostChart data={serieCostos} presupuestoMensual={presupuestoMensual} escenarioActivo={activo && escenario.reduccion > 0} />
            </ChartCard>
            <ChartCard
              icon={PieIcon}
              title="Tickets por estado"
              description="No conformidades de calidad."
              action={<VerMas to="/calidad">Ver tablero</VerMas>}
              loading={loading}
              empty={!sum(tickets.map((t) => t.value))}
              emptyText="No hay no conformidades registradas."
            >
              <TicketsChart data={tickets} />
            </ChartCard>
          </section>

          {/* Clima + actividad */}
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
            <ChartCard
              icon={RadarIcon}
              title="Clima organizacional"
              description={`Promedio por dimensión · ${formatNumber(respuestasClima)} respuestas.`}
              loading={loading}
              empty={!respuestasClima}
              emptyText="Todavía nadie respondió la encuesta de clima."
            >
              <ClimaChart data={climaPorDimension} />
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge tone="primary" icon={Smile}>
                  Índice global {formatDecimal(climaGlobal)} / 5
                </Badge>
                {climaOrdenado[0] && <Badge tone="success">Mejor: {climaOrdenado[0].dimension}</Badge>}
                {climaOrdenado.length > 1 && <Badge tone="warning">A mejorar: {climaOrdenado.at(-1).dimension}</Badge>}
              </div>
            </ChartCard>
            <motion.div variants={fadeUp} className="lg:col-span-2">
              <ActivityFeed className="h-full" />
            </motion.div>
          </section>
        </motion.div>
      )}
    </>
  )
}
