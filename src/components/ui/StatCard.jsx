import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { cn } from '@/lib/cn'
import { fadeUp } from '@/lib/motion'
import { formatDecimal } from '@/lib/format'
import { Card } from './Card'
import { AnimatedNumber } from './AnimatedNumber'
import { Sparkline } from './Sparkline'
import { SkeletonStatCard } from './Skeleton'

const TONES = {
  primary: 'bg-primary-soft text-primary-text',
  success: 'bg-success-soft text-success-text',
  warning: 'bg-warning-soft text-warning-text',
  danger: 'bg-danger-soft text-danger-text',
  info: 'bg-info-soft text-info-text',
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
        'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-semibold tabular-nums',
        good === null && 'bg-surface-2 text-fg-muted',
        good === true && 'bg-success-soft text-success-text',
        good === false && 'bg-danger-soft text-danger-text',
      )}
    >
      <Icon size={13} aria-hidden="true" />
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
  return (
    <Card variants={fadeUp} interactive className={cn('flex flex-col p-4 sm:p-5', className)}>
      <div className="flex items-center justify-between gap-3">
        <span className={cn('grid size-9 place-items-center rounded-xl', TONES[tone])}>{Icon && <Icon size={18} aria-hidden="true" />}</span>
        <Trend value={trend} goodWhenUp={goodWhenUp} suffix={trendSuffix} />
      </div>
      <p className="mt-4 text-[13px] font-medium leading-5 text-fg-muted">{label}</p>
      <div className="mt-1 flex items-end justify-between gap-2">
        <AnimatedNumber value={value} format={format} className="shrink-0 text-[26px] font-semibold leading-9 tracking-[-0.02em] text-fg sm:text-[28px]" />
        {/* El mini gráfico se achica (nunca baja de línea) para que todas las tarjetas queden iguales */}
        {sparkline?.length > 1 && (
          <div className="mb-1 min-w-9 max-w-24 flex-1">
            <Sparkline data={sparkline} className="h-auto w-full" />
          </div>
        )}
      </div>
      {hint && <p className="mt-1.5 text-xs leading-4 text-fg-subtle">{hint}</p>}
    </Card>
  )
}
