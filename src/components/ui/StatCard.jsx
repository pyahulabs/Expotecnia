import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { cn } from '@/lib/cn'
import { fadeUp } from '@/lib/motion'
import { formatDecimal } from '@/lib/format'
import { Card } from './Card'
import { AnimatedNumber } from './AnimatedNumber'
import { Sparkline } from './Sparkline'
import { SkeletonStatCard } from './Skeleton'

const TONES = {
  primary: { chip: 'bg-primary-soft text-primary-text border-primary/15', glow: 'var(--primary)', line: 'var(--chart-1)' },
  success: { chip: 'bg-success-soft text-success-text border-success/15', glow: 'var(--success)', line: 'var(--success)' },
  warning: { chip: 'bg-warning-soft text-warning-text border-warning/15', glow: 'var(--warning)', line: 'var(--warning)' },
  danger: { chip: 'bg-danger-soft text-danger-text border-danger/15', glow: 'var(--danger)', line: 'var(--danger)' },
  info: { chip: 'bg-info-soft text-info-text border-info/15', glow: 'var(--info)', line: 'var(--info)' },
}

/** Chip de tendencia: flecha + variación. El color depende de si "subir" es bueno. */
export function Trend({ value, goodWhenUp = true, suffix = '%' }) {
  if (value == null || Number.isNaN(value)) return null
  const flat = Math.abs(value) < 0.05
  const up = value > 0
  const good = flat ? null : up === goodWhenUp
  const Icon = flat ? Minus : up ? ArrowUpRight : ArrowDownRight
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums',
        good === null && 'bg-surface-2 text-fg-muted',
        good === true && 'bg-success-soft text-success-text',
        good === false && 'bg-danger-soft text-danger-text',
      )}
    >
      <Icon size={12} aria-hidden="true" />
      <span className="sr-only">{flat ? 'Sin cambios' : up ? 'Subió' : 'Bajó'}</span>
      {formatDecimal(Math.abs(value))}
      {suffix}
    </span>
  )
}

/**
 * Tarjeta de indicador (KPI): ícono, valor animado, tendencia y mini gráfico.
 * Pensada para ir dentro de un contenedor con `stagger()`.
 */
export function StatCard({ label, value, format, icon: Icon, tone = 'primary', trend, goodWhenUp = true, trendSuffix, hint, sparkline, loading = false, className }) {
  if (loading) return <SkeletonStatCard className={className} />
  const t = TONES[tone] || TONES.primary
  return (
    <Card variants={fadeUp} interactive className={cn('relative flex flex-col overflow-hidden p-4 sm:p-5', className)}>
      {/* Brillo de color en la esquina, según el tono del indicador */}
      <div className="pointer-events-none absolute -right-10 -top-12 size-36 rounded-full opacity-[0.10] blur-2xl dark:opacity-[0.16]" style={{ background: t.glow }} aria-hidden="true" />
      <div className="relative flex min-w-0 items-center gap-2.5">
        <span className={cn('grid size-8 shrink-0 place-items-center rounded-lg border', t.chip)}>{Icon && <Icon size={16} aria-hidden="true" />}</span>
        <span className="truncate text-[13px] font-medium text-fg-muted">{label}</span>
      </div>
      <div className="relative mt-4 flex items-end justify-between gap-2">
        <AnimatedNumber value={value} format={format} className="shrink-0 text-[28px] font-semibold leading-9 tracking-[-0.03em] text-fg sm:text-[30px]" />
        {/* El mini gráfico se achica (nunca baja de línea) para que todas las tarjetas queden iguales */}
        {sparkline?.length > 1 && (
          <div className="mb-1 min-w-9 max-w-24 flex-1">
            <Sparkline data={sparkline} color={t.line} className="h-auto w-full" />
          </div>
        )}
      </div>
      {(hint || trend != null) && (
        <div className="relative mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
          <Trend value={trend} goodWhenUp={goodWhenUp} suffix={trendSuffix} />
          {hint && <p className="min-w-[8.5rem] flex-1 text-xs leading-4 text-fg-subtle">{hint}</p>}
        </div>
      )}
    </Card>
  )
}
