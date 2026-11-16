import { cn } from '@/lib/cn'

const TONES = {
  neutral: 'bg-surface-2 text-fg-muted',
  primary: 'bg-primary-soft text-primary-text',
  success: 'bg-success-soft text-success-text',
  warning: 'bg-warning-soft text-warning-text',
  danger: 'bg-danger-soft text-danger-text',
  info: 'bg-info-soft text-info-text',
}

const DOTS = {
  neutral: 'bg-fg-subtle',
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-info',
}

/** Etiqueta de estado/prioridad. tone: neutral | primary | success | warning | danger | info */
export function Badge({ tone = 'neutral', dot = false, icon: Icon, size = 'md', className, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full font-medium',
        size === 'sm' ? 'px-2 py-px text-[11px] leading-[18px]' : 'px-2.5 py-0.5 text-xs leading-5',
        TONES[tone],
        className,
      )}
    >
      {dot && <span className={cn('size-1.5 rounded-full', DOTS[tone])} aria-hidden="true" />}
      {Icon && <Icon size={12} aria-hidden="true" />}
      {children}
    </span>
  )
}

/** Chip seleccionable (filtros). */
export function Chip({ active = false, className, children, ...props }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        'inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 text-[13px] font-medium transition-colors duration-150',
        active
          ? 'border-transparent bg-primary-soft text-primary-text'
          : 'border-line bg-surface text-fg-muted hover:border-line-strong hover:text-fg',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
