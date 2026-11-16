import { cn } from '@/lib/cn'
import { hueFromString, initials } from '@/lib/format'

const SIZES = {
  xs: 'size-6 text-[10px]',
  sm: 'size-7 text-[11px]',
  md: 'size-9 text-[13px]',
  lg: 'size-11 text-[15px]',
  xl: 'size-16 text-xl',
}

/** Avatar con iniciales; el color se genera a partir del nombre (siempre el mismo para la misma persona). */
export function Avatar({ name = '', size = 'md', className }) {
  return (
    <span
      role="img"
      aria-label={name || 'Sin asignar'}
      title={name}
      style={{ '--h': hueFromString(name) }}
      className={cn(
        'avatar-tint inline-grid shrink-0 select-none place-items-center rounded-full font-semibold tracking-wide',
        SIZES[size],
        className,
      )}
    >
      {initials(name)}
    </span>
  )
}

export function AvatarGroup({ names = [], max = 4, size = 'sm' }) {
  const visible = names.slice(0, max)
  const rest = names.length - visible.length
  return (
    <div className="flex -space-x-2">
      {visible.map((name) => (
        <Avatar key={name} name={name} size={size} className="ring-2 ring-surface" />
      ))}
      {rest > 0 && (
        <span className={cn('inline-grid place-items-center rounded-full bg-surface-3 font-semibold text-fg-muted ring-2 ring-surface', SIZES[size])}>
          +{rest}
        </span>
      )}
    </div>
  )
}
