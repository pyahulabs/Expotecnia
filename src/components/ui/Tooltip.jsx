import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/cn'

const OFFSET = 8

const place = (rect, side) => {
  switch (side) {
    case 'right':
      return { left: rect.right + OFFSET, top: rect.top + rect.height / 2, x: '0%', y: '-50%' }
    case 'left':
      return { left: rect.left - OFFSET, top: rect.top + rect.height / 2, x: '-100%', y: '-50%' }
    case 'bottom':
      return { left: rect.left + rect.width / 2, top: rect.bottom + OFFSET, x: '-50%', y: '0%' }
    default:
      return { left: rect.left + rect.width / 2, top: rect.top - OFFSET, x: '-50%', y: '-100%' }
  }
}

/** Tooltip accesible renderizado en un portal (no lo recorta ningún overflow). */
export function Tooltip({ content, side = 'top', disabled = false, className, style, children }) {
  const [pos, setPos] = useState(null)
  const anchor = useRef(null)
  const id = useId()

  const show = useCallback(() => {
    if (disabled || !content || !anchor.current) return
    setPos(place(anchor.current.getBoundingClientRect(), side))
  }, [content, disabled, side])
  const hide = useCallback(() => setPos(null), [])

  useEffect(() => {
    if (!pos) return undefined
    window.addEventListener('scroll', hide, true)
    return () => window.removeEventListener('scroll', hide, true)
  }, [pos, hide])

  return (
    <span
      ref={anchor}
      className={cn('inline-flex', className)}
      style={style}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      onPointerDown={hide}
      aria-describedby={pos ? id : undefined}
    >
      {children}
      {createPortal(
        <AnimatePresence>
          {pos && (
            <motion.span
              id={id}
              role="tooltip"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.12 }}
              style={{ position: 'fixed', left: pos.left, top: pos.top, x: pos.x, y: pos.y, zIndex: 100 }}
              className="pointer-events-none max-w-72 rounded-lg bg-fg px-2.5 py-1.5 text-xs font-medium text-canvas shadow-raised"
            >
              {content}
            </motion.span>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </span>
  )
}
