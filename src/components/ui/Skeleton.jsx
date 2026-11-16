import { cn } from '@/lib/cn'

/** Bloque animado que ocupa el lugar del contenido mientras carga. */
export function Skeleton({ className, style }) {
  return <div className={cn('skeleton h-4', className)} style={style} aria-hidden="true" />
}

export function SkeletonStatCard({ className }) {
  return (
    <div className={cn('rounded-2xl border border-line bg-surface p-5 shadow-card', className)} aria-hidden="true">
      <div className="flex items-center justify-between">
        <Skeleton className="size-9 rounded-xl" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      <Skeleton className="mt-5 h-3.5 w-24" />
      <Skeleton className="mt-2.5 h-7 w-20" />
      <Skeleton className="mt-3 h-3 w-28" />
    </div>
  )
}

export function SkeletonChart({ className }) {
  const bars = [52, 78, 44, 90, 64, 82, 58, 70]
  return (
    <div className={cn('flex h-64 items-end gap-3 px-2', className)} aria-hidden="true">
      {bars.map((h, i) => (
        <div key={i} className="skeleton flex-1 rounded-md" style={{ height: `${h}%` }} />
      ))}
    </div>
  )
}

export function SkeletonTable({ rows = 6, cols = 5 }) {
  return (
    <div className="divide-y divide-line" aria-hidden="true">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 px-5 py-3.5 sm:px-6">
          <Skeleton className="size-9 shrink-0 rounded-full" />
          {Array.from({ length: cols - 1 }).map((__, c) => (
            <Skeleton key={c} className={cn('h-3.5 flex-1', c > 1 && 'hidden sm:block')} style={{ maxWidth: `${28 - c * 4}%` }} />
          ))}
        </div>
      ))}
    </div>
  )
}

export function SkeletonList({ rows = 4 }) {
  return (
    <div className="space-y-4" aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="size-8 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-3/4" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function SkeletonKanban({ columns = 3 }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3" aria-hidden="true">
      {Array.from({ length: columns }).map((_, c) => (
        <div key={c} className="rounded-2xl border border-line bg-surface-2/60 p-3">
          <Skeleton className="mb-4 ml-1 mt-1 h-4 w-28" />
          <div className="space-y-3">
            {Array.from({ length: 3 - (c % 2) }).map((__, i) => (
              <div key={i} className="rounded-xl border border-line bg-surface p-4">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="mt-3 h-4 w-11/12" />
                <Skeleton className="mt-2 h-4 w-2/3" />
                <div className="mt-4 flex items-center justify-between">
                  <Skeleton className="h-5 w-14 rounded-full" />
                  <Skeleton className="size-6 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

/** Envoltorio accesible: anuncia "Cargando" a lectores de pantalla. */
export function Loading({ label = 'Cargando…', children }) {
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">{label}</span>
      {children}
    </div>
  )
}
