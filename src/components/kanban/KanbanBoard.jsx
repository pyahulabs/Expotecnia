import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/cn'

const DOTS = {
  neutral: 'bg-fg-subtle',
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-info',
}

/**
 * Tablero Kanban genérico con arrastrar y soltar (lo usan Calidad y Proyectos).
 *
 * columns:    [{ id, title, tone, hint? }]
 * items:      documentos con `id`, `orden` y el campo de columna (por defecto `estado`)
 * renderCard: (item, { dragging }) => contenido de la tarjeta
 * onMove:     (item, columnaDestino, nuevoOrden, columnaOrigen) => guardar el cambio
 * onAdd:      (columnaId) => abrir el alta en esa columna (opcional)
 *
 * El orden dentro de la columna se guarda como número: al soltar una tarjeta entre
 * dos vecinas se le asigna el promedio de sus órdenes (no hay que renumerar nada).
 */
export function KanbanBoard({ columns, items, columnKey = 'estado', renderCard, onMove, onAdd, onCardClick, emptyText = 'Soltá una tarjeta acá' }) {
  // Posición "optimista" mientras llega la confirmación de la base de datos
  const [overrides, setOverrides] = useState({})

  useEffect(() => {
    setOverrides((current) => {
      const ids = Object.keys(current)
      if (!ids.length) return current
      const next = { ...current }
      items.forEach((item) => {
        const o = next[item.id]
        if (o && item[columnKey] === o.column && item.orden === o.orden) delete next[item.id]
      })
      return Object.keys(next).length === ids.length ? current : next
    })
  }, [items, columnKey])

  const grouped = useMemo(() => {
    const map = Object.fromEntries(columns.map((c) => [c.id, []]))
    items.forEach((item) => {
      const o = overrides[item.id]
      const column = o?.column ?? item[columnKey]
      ;(map[column] || map[columns[0].id]).push({ item, orden: o?.orden ?? item.orden ?? 0 })
    })
    Object.values(map).forEach((list) => list.sort((a, b) => a.orden - b.orden))
    return map
  }, [columns, items, overrides, columnKey])

  const onDragEnd = ({ source, destination, draggableId }) => {
    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    const vecinos = grouped[destination.droppableId].filter((entry) => entry.item.id !== draggableId)
    const antes = vecinos[destination.index - 1]?.orden
    const despues = vecinos[destination.index]?.orden
    let orden = 1000
    if (antes != null && despues != null) orden = (antes + despues) / 2
    else if (antes != null) orden = antes + 1000
    else if (despues != null) orden = despues - 1000

    setOverrides((current) => ({ ...current, [draggableId]: { column: destination.droppableId, orden } }))
    // Si la escritura falla, se descarta la posición optimista
    window.setTimeout(() => setOverrides(({ [draggableId]: _, ...rest }) => rest), 5000)

    const item = items.find((i) => i.id === draggableId)
    if (item) onMove(item, destination.droppableId, orden, source.droppableId)
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:snap-none lg:overflow-visible lg:px-0"
        style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
      >
        {columns.map((column, columnIndex) => {
          const entries = grouped[column.id]
          return (
            <motion.section
              key={column.id}
              aria-label={`${column.title}: ${entries.length}`}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: columnIndex * 0.07 }}
              className="flex w-[82vw] max-w-sm shrink-0 snap-center flex-col rounded-2xl border border-line bg-surface-2/60 sm:w-80 lg:w-auto lg:max-w-none"
            >
              <header className="flex items-center gap-2.5 px-4 pb-2 pt-3.5">
                <span className={cn('size-2 rounded-full', DOTS[column.tone] || DOTS.neutral)} aria-hidden="true" />
                <h3 className="text-[13px] font-semibold text-fg">{column.title}</h3>
                <span className="rounded-full bg-surface px-2 text-[11px] font-semibold leading-5 tabular-nums text-fg-muted shadow-card">{entries.length}</span>
                {onAdd && (
                  <button
                    type="button"
                    onClick={() => onAdd(column.id)}
                    aria-label={`Agregar en ${column.title}`}
                    className="ml-auto grid size-7 place-items-center rounded-lg text-fg-subtle transition-colors hover:bg-surface hover:text-fg"
                  >
                    <Plus size={15} aria-hidden="true" />
                  </button>
                )}
              </header>

              <Droppable droppableId={column.id}>
                {(dropProvided, dropSnapshot) => (
                  <div
                    ref={dropProvided.innerRef}
                    {...dropProvided.droppableProps}
                    className={cn(
                      'mx-2 mb-2 flex min-h-36 flex-1 flex-col rounded-xl p-1 transition-colors duration-150',
                      dropSnapshot.isDraggingOver && 'bg-primary-soft outline-2 -outline-offset-2 outline-dashed outline-primary/40',
                    )}
                  >
                    {entries.map(({ item }, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(dragProvided, dragSnapshot) => {
                          const card = (
                            <div
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              {...dragProvided.dragHandleProps}
                              style={dragProvided.draggableProps.style}
                              className="rounded-xl pb-2 outline-none focus-visible:[&>div]:ring-2 focus-visible:[&>div]:ring-[var(--ring)]"
                              onClick={() => onCardClick?.(item)}
                              onKeyDown={(event) => {
                                dragProvided.dragHandleProps?.onKeyDown?.(event)
                                if (event.key === 'Enter' && !dragSnapshot.isDragging) onCardClick?.(item)
                              }}
                            >
                              <div
                                className={cn(
                                  'cursor-grab rounded-xl border border-line bg-surface p-3.5 shadow-card transition-[box-shadow,transform,border-color] duration-150 hover:border-line-strong hover:shadow-raised active:cursor-grabbing',
                                  dragSnapshot.isDragging && 'rotate-[2deg] scale-[1.02] border-primary/50 shadow-pop',
                                )}
                              >
                                {renderCard(item, { dragging: dragSnapshot.isDragging })}
                              </div>
                            </div>
                          )
                          // Mientras se arrastra, la tarjeta se dibuja en <body> para que
                          // ningún contenedor con transform/overflow la desplace o recorte.
                          return dragSnapshot.isDragging ? createPortal(card, document.body) : card
                        }}
                      </Draggable>
                    ))}
                    {dropProvided.placeholder}
                    {entries.length === 0 && !dropSnapshot.isDraggingOver && (
                      <p className="m-auto px-4 py-8 text-center text-xs text-fg-subtle">{emptyText}</p>
                    )}
                  </div>
                )}
              </Droppable>
            </motion.section>
          )
        })}
      </div>
    </DragDropContext>
  )
}
