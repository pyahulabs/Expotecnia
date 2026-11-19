import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/cn'

/** Divide una lista en páginas. Vuelve a la página 1 cuando cambian los filtros (la lista). */
export function usePaginacion(items, porPagina = 10) {
  const [pagina, setPagina] = useState(1)
  const totalPaginas = Math.max(1, Math.ceil(items.length / porPagina))
  useEffect(() => setPagina(1), [items.length, porPagina])
  useEffect(() => {
    if (pagina > totalPaginas) setPagina(totalPaginas)
  }, [pagina, totalPaginas])
  const visibles = useMemo(() => items.slice((pagina - 1) * porPagina, pagina * porPagina), [items, pagina, porPagina])
  return { pagina, setPagina, totalPaginas, visibles, desde: items.length ? (pagina - 1) * porPagina + 1 : 0, hasta: Math.min(items.length, pagina * porPagina), total: items.length }
}

/** Pie de tabla con el rango mostrado y los controles de página. */
export function Pagination({ pagina, totalPaginas, setPagina, desde, hasta, total, nombre = 'registros', className }) {
  const paginas = Array.from({ length: totalPaginas }, (_, i) => i + 1)
  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3 sm:px-6', className)}>
      <p className="text-xs text-fg-subtle" aria-live="polite">
        Mostrando <span className="font-semibold tabular-nums text-fg-muted">{desde}–{hasta}</span> de <span className="tabular-nums">{total}</span> {nombre}
      </p>
      {totalPaginas > 1 && (
        <nav className="flex items-center gap-1" aria-label="Paginación">
          <button
            type="button"
            onClick={() => setPagina(pagina - 1)}
            disabled={pagina === 1}
            aria-label="Página anterior"
            className="grid size-8 place-items-center rounded-lg border border-line text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg disabled:opacity-40"
          >
            <ChevronLeft size={15} aria-hidden="true" />
          </button>
          {paginas.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setPagina(n)}
              aria-current={n === pagina ? 'page' : undefined}
              aria-label={`Página ${n}`}
              className={cn(
                'grid h-8 min-w-8 place-items-center rounded-lg px-2 text-xs font-semibold tabular-nums transition-colors',
                n === pagina ? 'bg-primary-soft text-primary-text' : 'text-fg-muted hover:bg-surface-2 hover:text-fg',
              )}
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPagina(pagina + 1)}
            disabled={pagina === totalPaginas}
            aria-label="Página siguiente"
            className="grid size-8 place-items-center rounded-lg border border-line text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg disabled:opacity-40"
          >
            <ChevronRight size={15} aria-hidden="true" />
          </button>
        </nav>
      )}
    </div>
  )
}
