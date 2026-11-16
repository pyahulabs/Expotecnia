import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { ease } from '@/lib/motion'

// --- API imperativa -----------------------------------------------------------
// Se puede llamar desde cualquier lado (componentes o capa de datos):
//   toast.success('Empleado guardado', 'Se sincronizó con Firestore')
const listeners = new Set()
let counter = 0

const push = (type, title, description, options = {}) => {
  const item = { id: ++counter, type, title, description, duration: options.duration ?? 4200 }
  listeners.forEach((listener) => listener(item))
  return item.id
}

export const toast = {
  success: (title, description, options) => push('success', title, description, options),
  error: (title, description, options) => push('error', title, description, { duration: 6500, ...options }),
  warning: (title, description, options) => push('warning', title, description, options),
  info: (title, description, options) => push('info', title, description, options),
}

/** Hook por comodidad: `const toast = useToast()` */
export const useToast = () => toast

const STYLES = {
  success: { icon: CircleCheck, className: 'text-success-text bg-success-soft', bar: 'bg-success' },
  error: { icon: CircleAlert, className: 'text-danger-text bg-danger-soft', bar: 'bg-danger' },
  warning: { icon: TriangleAlert, className: 'text-warning-text bg-warning-soft', bar: 'bg-warning' },
  info: { icon: Info, className: 'text-info-text bg-info-soft', bar: 'bg-info' },
}

function ToastItem({ item, onDismiss }) {
  const style = STYLES[item.type]
  const Icon = style.icon

  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(item.id), item.duration)
    return () => window.clearTimeout(timer)
  }, [item, onDismiss])

  return (
    <motion.li
      layout
      role={item.type === 'error' ? 'alert' : 'status'}
      initial={{ opacity: 0, y: 24, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.96, transition: { duration: 0.18 } }}
      transition={{ duration: 0.32, ease }}
      className="glass-strong pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-2xl border border-line p-3.5 pr-10 shadow-pop sm:w-[380px]"
    >
      <span className={cn('grid size-8 shrink-0 place-items-center rounded-full', style.className)}>
        <Icon size={17} aria-hidden="true" />
      </span>
      <div className="min-w-0 pt-0.5">
        <p className="text-sm font-semibold leading-5 text-fg">{item.title}</p>
        {item.description && <p className="mt-0.5 break-words text-[13px] leading-5 text-fg-muted">{item.description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(item.id)}
        aria-label="Cerrar notificación"
        className="absolute right-2.5 top-2.5 grid size-7 place-items-center rounded-lg text-fg-subtle transition-colors hover:bg-surface-2 hover:text-fg"
      >
        <X size={14} aria-hidden="true" />
      </button>
      <motion.span
        aria-hidden="true"
        className={cn('absolute inset-x-0 bottom-0 h-0.5 origin-left', style.bar)}
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: item.duration / 1000, ease: 'linear' }}
      />
    </motion.li>
  )
}

/** Montar una sola vez (en App). Muestra la pila de toasts abajo a la derecha. */
export function Toaster() {
  const [items, setItems] = useState([])

  useEffect(() => {
    const listener = (item) => setItems((current) => [...current.slice(-3), item])
    listeners.add(listener)
    return () => listeners.delete(listener)
  }, [])

  const dismiss = useCallback((id) => setItems((current) => current.filter((t) => t.id !== id)), [])

  return createPortal(
    <ol aria-label="Notificaciones" className="pointer-events-none fixed inset-x-4 bottom-4 z-[90] flex flex-col items-end gap-2.5 sm:inset-x-auto sm:bottom-6 sm:right-6">
      <AnimatePresence initial={false}>
        {items.map((item) => (
          <ToastItem key={item.id} item={item} onDismiss={dismiss} />
        ))}
      </AnimatePresence>
    </ol>,
    document.body,
  )
}
