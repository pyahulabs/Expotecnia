import { useId } from 'react'
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ChartLegend, ChartTooltip, axisProps, cursorBar, cursorLine, gridProps } from '@/components/charts/ChartKit'
import { formatDecimal, formatGs, formatGsCompact, formatMonth, formatPercent, sum } from '@/lib/format'

const ANIM = { animationDuration: 900, animationEasing: 'ease-out' }

const CORTOS = { 'Talento Humano': 'T. Humano', Operaciones: 'Operaciones', Tecnología: 'Tecnología' }

const mesDe = (periodo) => {
  const [y, m] = String(periodo).split('-').map(Number)
  const etiqueta = formatMonth(new Date(y, m - 1, 1))
  return m === 1 || m === 12 ? `${etiqueta} ${String(y).slice(2)}` : etiqueta
}

// ---------------------------------------------------------------------------
// Barras: presupuesto vs. ejecutado por departamento (+ proyección del simulador)
// ---------------------------------------------------------------------------
export function BudgetChart({ data, proyectado }) {
  const rows = data.map((d) => ({ ...d, corto: CORTOS[d.departamento] || d.departamento }))
  const colors = { presupuesto: 'var(--chart-1)', presupuestoProy: 'var(--chart-1)', ejecutado: 'var(--chart-2)', ejecutadoProy: 'var(--chart-2)' }
  const barSize = proyectado ? 12 : 20

  return (
    <div>
      <ChartLegend
        className="mb-4"
        items={[
          { label: 'Presupuesto', color: 'var(--chart-1)' },
          { label: 'Ejecutado', color: 'var(--chart-2)' },
          ...(proyectado ? [{ label: 'Proyectado (tono claro)', color: 'var(--chart-axis)', variant: 'soft' }] : []),
        ]}
      />
      <div className="no-scrollbar overflow-x-auto">
        <div
          className="h-72 min-w-[560px] xl:h-[26.5rem]"
          role="img"
          aria-label={`Gráfico de barras: presupuesto y ejecutado por departamento. ${rows.map((r) => `${r.departamento}: presupuesto ${formatGsCompact(r.presupuesto)}, ejecutado ${formatGsCompact(r.ejecutado)}`).join('. ')}.`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} barGap={2} barCategoryGap="22%" margin={{ top: 8, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="corto" {...axisProps} interval={0} tickMargin={8} />
              <YAxis {...axisProps} width={56} tickFormatter={(v) => formatGsCompact(v, false)} />
              <Tooltip
                cursor={cursorBar}
                content={
                  <ChartTooltip
                    colors={colors}
                    formatter={(v) => formatGs(v)}
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.departamento}
                    footer={(payload) => {
                      const d = payload[0]?.payload
                      if (!d) return null
                      const pres = proyectado ? d.presupuestoProy : d.presupuesto
                      const ejec = proyectado ? d.ejecutadoProy : d.ejecutado
                      const pct = pres ? (ejec / pres) * 100 : 0
                      return `Ejecución${proyectado ? ' proyectada' : ''}: ${formatPercent(pct, 1)}${pct > 100 ? ' · excedido' : ''}`
                    }}
                  />
                }
              />
              <Bar dataKey="presupuesto" name="Presupuesto" fill="var(--chart-1)" radius={[4, 4, 0, 0]} maxBarSize={barSize} {...ANIM} />
              {proyectado && <Bar dataKey="presupuestoProy" name="Presupuesto proyectado" fill="var(--chart-1)" fillOpacity={0.4} radius={[4, 4, 0, 0]} maxBarSize={barSize} {...ANIM} animationDuration={450} />}
              <Bar dataKey="ejecutado" name="Ejecutado" fill="var(--chart-2)" radius={[4, 4, 0, 0]} maxBarSize={barSize} {...ANIM} />
              {proyectado && <Bar dataKey="ejecutadoProy" name="Ejecutado proyectado" fill="var(--chart-2)" fillOpacity={0.4} radius={[4, 4, 0, 0]} maxBarSize={barSize} {...ANIM} animationDuration={450} />}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Líneas con área: evolución de costos + proyección a 6 meses
// ---------------------------------------------------------------------------
export function CostChart({ data, presupuestoMensual, escenarioActivo }) {
  const gradient = useId()
  const colors = { real: 'var(--chart-1)', tendencia: 'var(--chart-axis)', escenario: 'var(--chart-2)' }
  const hoy = data.findLast?.((d) => d.real != null)?.periodo

  return (
    <div>
      <ChartLegend
        className="mb-4"
        items={[
          { label: 'Costo real', color: 'var(--chart-1)', variant: 'line' },
          { label: 'Tendencia', color: 'var(--chart-axis)', variant: 'dashed' },
          ...(escenarioActivo ? [{ label: 'Con escenario', color: 'var(--chart-2)', variant: 'line' }] : []),
          { label: 'Presupuesto mensual', color: 'var(--chart-3)', variant: 'dashed' },
        ]}
      />
      <div className="h-72" role="img" aria-label="Gráfico de líneas: evolución mensual de costos de los últimos 12 meses y proyección a 6 meses.">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.28} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="periodo" {...axisProps} tickFormatter={mesDe} tickMargin={8} interval="equidistantPreserveStart" />
            <YAxis {...axisProps} width={56} tickFormatter={(v) => formatGsCompact(v, false)} domain={[0, (max) => Math.ceil((max * 1.12) / 1e8) * 1e8]} />
            <Tooltip
              cursor={cursorLine}
              content={<ChartTooltip colors={colors} formatter={(v) => formatGs(v)} labelFormatter={(periodo) => mesDe(periodo)} />}
            />
            {presupuestoMensual > 0 && (
              <ReferenceLine y={presupuestoMensual} stroke="var(--chart-3)" strokeDasharray="5 4" strokeWidth={1.5} ifOverflow="extendDomain" />
            )}
            {hoy && <ReferenceLine x={hoy} stroke="var(--border-strong)" label={{ value: 'Hoy', position: 'insideTopRight', fill: 'var(--chart-axis)', fontSize: 11, offset: 8 }} />}
            <Area type="monotone" dataKey="real" name="Costo real" stroke="var(--chart-1)" strokeWidth={2} fill={`url(#${gradient})`} dot={false} activeDot={{ r: 5, stroke: 'var(--surface)', strokeWidth: 2 }} {...ANIM} animationDuration={1200} />
            <Line type="monotone" dataKey="tendencia" name="Tendencia" stroke="var(--chart-axis)" strokeWidth={2} strokeDasharray="5 4" dot={false} activeDot={{ r: 4, stroke: 'var(--surface)', strokeWidth: 2 }} {...ANIM} />
            {escenarioActivo && (
              <Line type="monotone" dataKey="escenario" name="Con escenario" stroke="var(--chart-2)" strokeWidth={2} dot={false} activeDot={{ r: 5, stroke: 'var(--surface)', strokeWidth: 2 }} {...ANIM} animationDuration={450} />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Donut: tickets (no conformidades) por estado
// ---------------------------------------------------------------------------
export function TicketsChart({ data }) {
  const total = sum(data.map((d) => d.value))
  const abiertos = total - (data.find((d) => d.estado === 'Resuelto')?.value || 0)
  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row lg:flex-col">
      <div className="relative size-44 shrink-0" role="img" aria-label={`Gráfico de dona: ${data.map((d) => `${d.estado} ${d.value}`).join(', ')}.`}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<ChartTooltip formatter={(v) => `${v} (${formatPercent(total ? (v / total) * 100 : 0)})`} labelFormatter={() => 'No conformidades'} />} />
            <Pie data={data} dataKey="value" nameKey="estado" innerRadius="68%" outerRadius="100%" paddingAngle={3} cornerRadius={5} stroke="none" startAngle={90} endAngle={-270} {...ANIM} animationDuration={1100}>
              {data.map((d) => (
                <Cell key={d.estado} fill={d.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-semibold leading-none tracking-tight text-fg">{abiertos}</span>
          <span className="mt-1 text-xs text-fg-muted">sin resolver</span>
        </div>
      </div>
      <ul className="w-full min-w-0 flex-1 space-y-3">
        {data.map((d) => {
          const pct = total ? (d.value / total) * 100 : 0
          return (
            <li key={d.estado}>
              <div className="flex items-center justify-between gap-3 text-[13px]">
                <span className="flex items-center gap-2 text-fg-muted">
                  <span className="size-2.5 rounded-[3px]" style={{ background: d.color }} aria-hidden="true" />
                  {d.estado}
                </span>
                <span className="tabular-nums text-fg">
                  <span className="font-semibold">{d.value}</span>
                  <span className="ml-1.5 text-xs text-fg-subtle">{formatPercent(pct)}</span>
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-3">
                <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${pct}%`, background: d.color }} />
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Radar: clima organizacional por dimensión (escala 1 a 5)
// ---------------------------------------------------------------------------
export function ClimaChart({ data }) {
  const gradient = useId()
  return (
    <div className="h-80" role="img" aria-label={`Gráfico de radar del clima organizacional. ${data.map((d) => `${d.dimension}: ${formatDecimal(d.valor)}`).join(', ')}.`}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="68%" margin={{ top: 8, right: 36, bottom: 8, left: 36 }}>
          <defs>
            <radialGradient id={gradient}>
              <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.08} />
              <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.32} />
            </radialGradient>
          </defs>
          <PolarGrid stroke="var(--chart-grid)" />
          <PolarAngleAxis dataKey="dimension" tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} tickFormatter={(d) => (d === 'Trabajo en equipo' ? 'Equipo' : d)} />
          <PolarRadiusAxis domain={[0, 5]} tickCount={6} tick={false} axisLine={false} />
          <Tooltip content={<ChartTooltip formatter={(v) => `${formatDecimal(v)} / 5`} colors={{ valor: 'var(--chart-1)' }} />} />
          <Radar dataKey="valor" name="Promedio" stroke="var(--chart-1)" strokeWidth={2} fill={`url(#${gradient})`} dot={{ r: 3, fill: 'var(--chart-1)', stroke: 'var(--surface)', strokeWidth: 2 }} {...ANIM} animationDuration={1100} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
