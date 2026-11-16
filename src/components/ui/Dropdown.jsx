import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/cn'

/**
 * Menú desplegable simple.
 * `trigger` es una función que recibe { open, toggle } y devuelve el botón.
 * `children` puede ser una función que recibe { close }.
 */
export function Dropdown({ trigger, children, align = 'end', className }) {
  const [open, setOpen] = useState(false)
  const root = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const onPointer = (event) => {
      if (!root.current?.contains(event.target)) setOpen(false)
    }
    const onKey = (event) => event.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const close = () => setOpen(false)

  return (
    <div ref={root} className="relative">
      {trigger({ open, toggle: () => setOpen((v) => !v) })}
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'glass-strong absolute top-full z-50 mt-2 w-64 origin-top rounded-2xl border border-line p-1.5 shadow-pop',
              align === 'end' ? 'right-0' : 'left-0',
              className,
            )}
          >
            {typeof children === 'function' ? children({ close }) : children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function DropdownItem({ icon: Icon, tone = 'default', className, children, ...props }) {
  return (
    <button
      type="button"
      role="menuitem"
      className={cn(
        'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium transition-colors duration-100',
        tone === 'danger' ? 'text-danger-text hover:bg-danger-soft' : 'text-fg hover:bg-surface-2',
        className,
      )}
      {...props}
    >
      {Icon && <Icon size={16} className={tone === 'danger' ? undefined : 'text-fg-subtle'} aria-hidden="true" />}
      {children}
    </button>
  )
}

export function DropdownSeparator() {
  return <div className="my-1.5 h-px bg-line" role="separator" />
}
