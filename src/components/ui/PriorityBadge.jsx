import { ChevronDown, ChevronsUp, Equal, Flame } from 'lucide-react'
import { PRIORIDADES } from '@/config/constants'
import { Badge } from './Badge'

const ICONS = { Baja: ChevronDown, Media: Equal, Alta: ChevronsUp, Crítica: Flame }

/** Badge de prioridad (Baja / Media / Alta / Crítica) con ícono + color. */
export function PriorityBadge({ prioridad = 'Media', size = 'sm' }) {
  return (
    <Badge tone={PRIORIDADES[prioridad]?.tone || 'neutral'} size={size}>
      {(() => {
        const Icono = ICONS[prioridad]
        return Icono ? <Icono size={12} aria-hidden="true" className={prioridad === 'Crítica' ? 'animate-flame' : undefined} /> : null
      })()}
      {prioridad}
    </Badge>
  )
}
