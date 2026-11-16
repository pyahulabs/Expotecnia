import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { cn } from '@/lib/cn'
import { clamp } from '@/lib/format'

const LABELS = ['', 'Insuficiente', 'Regular', 'Bueno', 'Muy bueno', 'Excelente']

/**
 * Calificación de 1 a 5 estrellas.
 * - Interactiva (con onChange): grupo de radios accesible con vista previa al pasar el mouse.
 * - Solo lectura: admite decimales (ej. 4.3) y rellena la última estrella parcialmente.
 */
export function StarRating({ value = 0, onChange, size = 20, label = 'Calificación', showLabel = false, className }) {
  const [hover, setHover] = useState(0)

  if (!onChange) {
    return (
      <span role="img" aria-label={`${label}: ${Number(value).toFixed(1)} de 5`} className={cn('inline-flex items-center gap-0.5', className)}>
        {[0, 1, 2, 3, 4].map((i) => {
          const fill = clamp(value - i, 0, 1)
          return (
            <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
              <Star size={size} className="absolute inset-0 text-surface-3" fill="currentColor" strokeWidth={0} />
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Star size={size} className="text-warning" fill="currentColor" strokeWidth={0} />
              </span>
            </span>
          )
        })}
      </span>
    )
  }

  const shown = hover || value
  return (
    <div className={cn('inline-flex items-center gap-3', className)}>
      <div role="radiogroup" aria-label={label} className="inline-flex items-center" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <motion.button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} ${n === 1 ? 'estrella' : 'estrellas'}: ${LABELS[n]}`}
            whileTap={{ scale: 0.8 }}
            whileHover={{ scale: 1.15 }}
            onMouseEnter={() => setHover(n)}
            onFocus={() => setHover(n)}
            onBlur={() => setHover(0)}
            onClick={() => onChange(n)}
            className="rounded-md p-0.5"
          >
            <Star
              size={size}
              strokeWidth={0}
              fill="currentColor"
              className={cn('transition-colors duration-100', n <= shown ? 'text-warning' : 'text-line-strong')}
            />
          </motion.button>
        ))}
      </div>
      {showLabel && <span className="min-w-20 text-xs font-medium text-fg-muted">{LABELS[shown] || 'Sin calificar'}</span>}
    </div>
  )
}
