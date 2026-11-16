import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Activity, ArrowRightLeft, Database, Pencil, Plus, Trash2 } from 'lucide-react'
import { COLECCIONES } from '@/config/constants'
import { useCollection } from '@/firebase/hooks'
import { timeAgo } from '@/lib/format'
import { ease } from '@/lib/motion'
import { Avatar, Badge, Card, CardBody, CardHeader, EmptyState, Loading, SkeletonList } from '@/components/ui'

const TIPOS = {
  crear: { icon: Plus, className: 'bg-success-soft text-success-text' },
  editar: { icon: Pencil, className: 'bg-info-soft text-info-text' },
  mover: { icon: ArrowRightLeft, className: 'bg-primary-soft text-primary-text' },
  eliminar: { icon: Trash2, className: 'bg-danger-soft text-danger-text' },
  sistema: { icon: Database, className: 'bg-surface-2 text-fg-muted' },
}

/** Feed "Actividad reciente": escucha la colección `actividad` en tiempo real. */
export function ActivityFeed({ limit = 7, className }) {
  const { data, loading } = useCollection(COLECCIONES.actividad, { orderBy: 'createdAt', direction: 'desc' })
  const [, setTick] = useState(0)

  // Refresca los "hace X min" cada 30 segundos
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 30_000)
    return () => clearInterval(timer)
  }, [])

  const items = data.slice(0, limit)

  return (
    <Card className={className}>
      <CardHeader
        icon={Activity}
        title="Actividad reciente"
        description="Lo último que pasó en todos los módulos."
        action={
          <span className="flex items-center gap-2 text-xs font-medium text-fg-muted">
            <span className="relative grid size-2.5 place-items-center">
              <span className="absolute size-2.5 animate-pulse-ring rounded-full bg-success" aria-hidden="true" />
              <span className="relative size-2 rounded-full bg-success" />
            </span>
            En vivo
          </span>
        }
      />
      <CardBody>
        {loading ? (
          <Loading label="Cargando actividad…">
            <SkeletonList rows={5} />
          </Loading>
        ) : items.length === 0 ? (
          <EmptyState compact icon={Activity} title="Todavía no hay actividad" description="Cuando alguien cree o modifique un registro, va a aparecer acá al instante." />
        ) : (
          <ol className="relative space-y-1">
            <AnimatePresence initial={false}>
              {items.map((item) => {
                const tipo = TIPOS[item.tipo] || TIPOS.editar
                return (
                  <motion.li
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: -16, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.35, ease }}
                    className="flex items-start gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-surface-2/60"
                  >
                    <span className="relative shrink-0">
                      <Avatar name={item.usuario} size="sm" />
                      <span className={`absolute -bottom-1 -right-1 grid size-4 place-items-center rounded-full ring-2 ring-surface ${tipo.className}`}>
                        <tipo.icon size={9} strokeWidth={3} aria-hidden="true" />
                      </span>
                    </span>
                    <p className="min-w-0 flex-1 text-[13px] leading-5 text-fg-muted">
                      <span className="font-semibold text-fg">{item.usuario}</span> {item.mensaje}
                    </p>
                    <span className="flex shrink-0 flex-col items-end gap-1">
                      <Badge size="sm">{item.modulo}</Badge>
                      <time className="text-[11px] text-fg-subtle" dateTime={new Date(item.createdAt).toISOString()}>
                        {timeAgo(item.createdAt)}
                      </time>
                    </span>
                  </motion.li>
                )
              })}
            </AnimatePresence>
          </ol>
        )}
      </CardBody>
    </Card>
  )
}
