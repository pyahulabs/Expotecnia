// Piezas compartidas por todos los gráficos de Recharts: tooltip, leyenda y estilos de ejes.
import { cn } from '@/lib/cn'

/** Props comunes para XAxis / YAxis: sin líneas, texto discreto. */
export const axisProps = {
  tickLine: false,
  axisLine: false,
  tick: { fill: 'var(--chart-axis)', fontSize: 12 },
}

/** Grilla horizontal sólida y muy sutil. */
export const gridProps = { vertical: false, stroke: 'var(--chart-grid)' }

export const cursorBar = { fill: 'var(--surface-2)', opacity: 0.7 }
export const cursorLine = { stroke: 'var(--border-strong)', strokeWidth: 1 }

/**
 * Tooltip personalizado.
 * - formatter(value, entry): texto del valor
 * - colors: { [dataKey]: color } para el cuadradito (si la serie usa gradiente)
 */
export function ChartTooltip({ active, payload, label, formatter = (v) => v, labelFormatter, colors = {}, footer }) {
  if (!active || !payload?.length) return null
  const rows = payload.filter((entry) => entry.value != null)
  if (!rows.length) return null
  return (
    <div className="glass-strong min-w-40 rounded-xl border border-line px-3 py-2.5 shadow-pop">
      <p className="mb-1.5 text-xs font-semibold text-fg">{labelFormatter ? labelFormatter(label, payload) : label}</p>
      <ul className="space-y-1">
        {rows.map((entry) => (
          <li key={entry.dataKey ?? entry.name} className="flex items-center justify-between gap-6 text-xs">
            <span className="flex items-center gap-2 text-fg-muted">
              <span className="size-2 shrink-0 rounded-[3px]" style={{ background: colors[entry.dataKey] ?? entry.payload?.color ?? entry.color }} aria-hidden="true" />
              {entry.name}
            </span>
            <span className="font-semibold tabular-nums text-fg">{formatter(entry.value, entry)}</span>
          </li>
        ))}
      </ul>
      {footer && <div className="mt-2 border-t border-line pt-2 text-xs text-fg-muted">{typeof footer === 'function' ? footer(payload) : footer}</div>}
    </div>
  )
}

/** Leyenda limpia en HTML. items: [{ label, color, variant?: 'solid' | 'soft' | 'dashed' | 'line' }] */
export function ChartLegend({ items, className }) {
  return (
    <ul className={cn('flex flex-wrap items-center gap-x-4 gap-y-1.5', className)}>
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5 text-xs text-fg-muted">
          {item.variant === 'dashed' || item.variant === 'line' ? (
            <svg width="16" height="8" aria-hidden="true">
              <line x1="1" y1="4" x2="15" y2="4" stroke={item.color} strokeWidth="2" strokeLinecap="round" strokeDasharray={item.variant === 'dashed' ? '4 3' : undefined} />
            </svg>
          ) : (
            <span className="size-2.5 rounded-[3px]" style={{ background: item.color, opacity: item.variant === 'soft' ? 0.4 : 1 }} aria-hidden="true" />
          )}
          {item.label}
        </li>
      ))}
    </ul>
  )
}
