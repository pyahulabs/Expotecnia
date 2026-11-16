import { useId } from 'react'
import { cn } from '@/lib/cn'
import { BRAND } from '@/config/brand'

/** Isotipo: "A" sobre un cuadrado redondeado con gradiente índigo-violeta. */
export function LogoMark({ size = 32, className }) {
  const id = useId()
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={cn('shrink-0', className)} role="img" aria-label={`${BRAND.nombre} ${BRAND.sufijo}`}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7c6cff" />
          <stop offset="1" stopColor="#4a3fe0" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill={`url(#${id})`} />
      <path d="M32 13 49 47h-8.6l-3.1-6.6H26.7L23.6 47H15L32 13Zm0 16.2-2.6 5.6h5.2L32 29.2Z" fill="#fff" />
      <circle cx="47" cy="19" r="4" fill="#fff" fillOpacity="0.55" />
    </svg>
  )
}

export function Logo({ collapsed = false, size = 32, className }) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <LogoMark size={size} />
      {!collapsed && (
        <span className="flex items-baseline gap-1.5 whitespace-nowrap">
          <span className="text-[17px] font-semibold tracking-[-0.02em] text-fg">{BRAND.nombre}</span>
          <span className="rounded-md bg-primary-soft px-1.5 py-px text-[10px] font-bold tracking-wider text-primary-text">{BRAND.sufijo}</span>
        </span>
      )}
    </span>
  )
}
