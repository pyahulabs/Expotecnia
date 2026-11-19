import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { ease, fadeUp } from '@/lib/motion'
import { Card, Skeleton, Tooltip } from '@/components/ui'

/** Ítem de la matriz: se edita en el lugar (Enter guarda, Esc cancela). */
function FodaItem({ item, cuadrante, onUpdate, onRemove }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(item.texto)
  const input = useRef(null)

  useEffect(() => {
    if (editing) {
      input.current?.focus()
      input.current?.select()
    }
  }, [editing])

  const save = () => {
    const texto = draft.trim()
    if (texto && texto !== item.texto) onUpdate(item.id, texto)
    else setDraft(item.texto)
    setEditing(false)
  }

  const cancel = () => {
    setDraft(item.texto)
    setEditing(false)
  }

  return (
    <motion.li
      layout="position"
      initial={{ opacity: 0, height: 0, y: -8 }}
      animate={{ opacity: 1, height: 'auto', y: 0 }}
      exit={{ opacity: 0, height: 0, x: 24 }}
      transition={{ duration: 0.28, ease }}
      className="overflow-hidden"
    >
      <div className={cn('group flex items-start gap-2.5 rounded-xl px-2.5 py-2 transition-colors', editing ? 'bg-surface-2' : 'hover:bg-surface-2/70')}>
        <span className={cn('mt-[7px] size-1.5 shrink-0 rounded-full', cuadrante.dot)} aria-hidden="true" />
        {editing ? (
          <>
            <textarea
              ref={input}
              rows={2}
              value={draft}
              aria-label={`Editar ${cuadrante.singular}`}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={save}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  save()
                }
                if (e.key === 'Escape') cancel()
              }}
              className="min-w-0 flex-1 resize-none bg-transparent text-[13px] leading-5 text-fg outline-none"
            />
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={save} aria-label="Guardar" className="grid size-7 shrink-0 place-items-center rounded-lg text-success-text hover:bg-success-soft">
              <Check size={15} aria-hidden="true" />
            </button>
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={cancel} aria-label="Cancelar" className="grid size-7 shrink-0 place-items-center rounded-lg text-fg-subtle hover:bg-surface-3">
              <X size={15} aria-hidden="true" />
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setEditing(true)}
              title="Clic para editar"
              className="min-w-0 flex-1 cursor-text rounded-md text-left text-[13px] leading-5 text-fg"
            >
              {item.texto}
            </button>
            <div className="flex shrink-0 gap-0.5 opacity-100 transition-opacity focus-within:opacity-100 group-hover:opacity-100 sm:opacity-0">
              <Tooltip content="Editar">
                <button type="button" onClick={() => setEditing(true)} aria-label={`Editar: ${item.texto}`} className="grid size-7 place-items-center rounded-lg text-fg-subtle hover:bg-surface-3 hover:text-fg">
                  <Pencil size={14} aria-hidden="true" />
                </button>
              </Tooltip>
              <Tooltip content="Eliminar">
                <button type="button" onClick={() => onRemove(item)} aria-label={`Eliminar: ${item.texto}`} className="grid size-7 place-items-center rounded-lg text-fg-subtle hover:bg-danger-soft hover:text-danger-text">
                  <Trash2 size={14} aria-hidden="true" />
                </button>
              </Tooltip>
            </div>
          </>
        )}
      </div>
    </motion.li>
  )
}

/** Un cuadrante de la matriz FODA con su lista y el campo para agregar. */
export function FodaQuadrant({ cuadrante, items, loading, onAdd, onUpdate, onRemove }) {
  const [texto, setTexto] = useState('')
  const Icon = cuadrante.icon

  const submit = (event) => {
    event.preventDefault()
    const value = texto.trim()
    if (!value) return
    onAdd(cuadrante.tipo, value)
    setTexto('')
  }

  return (
    <Card variants={fadeUp} interactive className="group relative flex min-h-[320px] flex-col overflow-hidden">
      <div className={cn('pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b to-transparent opacity-70', cuadrante.glow)} aria-hidden="true" />
      <div className="relative flex items-center gap-3 px-5 pt-5">
        <span className={cn('grid size-10 shrink-0 place-items-center rounded-xl shadow-card transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-6deg]', cuadrante.tile)}>
          <Icon size={19} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[15px] font-semibold leading-5 text-fg">{cuadrante.titulo}</h2>
          <p className="text-xs text-fg-muted">{cuadrante.origen}</p>
        </div>
        <motion.span
          key={items.length}
          initial={{ scale: 1.35 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 18 }}
          aria-label={`${items.length} ${items.length === 1 ? 'ítem' : 'ítems'}`}
          className={cn('grid h-7 min-w-7 place-items-center rounded-full px-2 text-xs font-bold tabular-nums', cuadrante.soft)}
        >
          {items.length}
        </motion.span>
      </div>

      <div className="relative flex-1 px-2.5 pb-1 pt-3">
        {loading ? (
          <div className="space-y-3 px-2.5 py-2" aria-hidden="true">
            <Skeleton className="h-3.5 w-11/12" />
            <Skeleton className="h-3.5 w-4/5" />
            <Skeleton className="h-3.5 w-2/3" />
          </div>
        ) : (
          <>
            <ul>
              <AnimatePresence initial={false}>
                {items.map((item) => (
                  <FodaItem key={item.id} item={item} cuadrante={cuadrante} onUpdate={onUpdate} onRemove={onRemove} />
                ))}
              </AnimatePresence>
            </ul>
            {items.length === 0 && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-2.5 py-6 text-center text-[13px] leading-5 text-fg-subtle">
                {cuadrante.ayuda}
              </motion.p>
            )}
          </>
        )}
      </div>

      <form onSubmit={submit} className="relative p-3 pt-1">
        <div className={cn('flex items-center gap-2 rounded-xl border border-dashed border-line-strong bg-surface px-3 transition-[border-color,box-shadow] focus-within:border-solid focus-within:ring-[3px]', cuadrante.ring)}>
          <Plus size={15} className="shrink-0 text-fg-subtle" aria-hidden="true" />
          <input
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder={`Agregar ${cuadrante.singular}…`}
            aria-label={`Agregar ${cuadrante.singular}`}
            maxLength={160}
            className="h-10 min-w-0 flex-1 bg-transparent text-[13px] text-fg outline-none placeholder:text-fg-subtle"
          />
          <AnimatePresence>
            {texto.trim() && (
              <motion.button
                type="submit"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={cn('h-7 shrink-0 rounded-lg px-2.5 text-xs font-semibold', cuadrante.tile)}
              >
                Agregar
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </form>
    </Card>
  )
}
