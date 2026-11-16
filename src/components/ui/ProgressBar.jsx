import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'
import { ease } from '@/lib/motion'

const TONES = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-info',
}

const SIZES = { sm: 'h-1.5', md: 'h-2', lg: 'h-2.5' }

/**
 * Barra de progreso animada. `value` va de 0 a `max`.
 * Con tone="auto" cambia sola: primario → ámbar (≥ 90%) → rojo (> 100%).
 */
export function ProgressBar({ value = 0, max = 100, tone = 'primary', size = 'md', label, className }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  const resolved = tone === 'auto' ? (pct > 100 ? 'danger' : pct >= 90 ? 'warning' : 'primary') : tone
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn('w-full overflow-hidden rounded-full bg-surface-3', SIZES[size], className)}
    >
      <motion.div
        className={cn('h-full rounded-full', TONES[resolved])}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
        transition={{ duration: 0.9, ease }}
      />
    </div>
  )
}
