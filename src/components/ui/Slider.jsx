import { useId } from 'react'
import { cn } from '@/lib/cn'

/** Control deslizante con etiqueta y valor actual. */
export function Slider({ label, value, onChange, min = 0, max = 100, step = 1, format = (v) => v, hint, icon: Icon, className }) {
  const id = useId()
  const fill = ((value - min) / (max - min)) * 100
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="flex items-center gap-2 text-[13px] font-medium text-fg">
          {Icon && <Icon size={15} className="text-fg-subtle" aria-hidden="true" />}
          {label}
        </label>
        <output htmlFor={id} className="rounded-md bg-primary-soft px-2 py-0.5 text-xs font-semibold tabular-nums text-primary-text">
          {format(value)}
        </output>
      </div>
      <input
        id={id}
        type="range"
        className="slider"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ '--fill': `${fill}%` }}
        aria-valuetext={String(format(value))}
      />
      {hint && <p className="text-xs leading-4 text-fg-subtle">{hint}</p>}
    </div>
  )
}
