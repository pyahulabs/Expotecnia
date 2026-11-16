import { useEffect, useRef } from 'react'
import { animate } from 'framer-motion'
import { ease } from '@/lib/motion'
import { formatNumber } from '@/lib/format'

/** Número que "cuenta" hasta su valor. `format` recibe el número y devuelve el texto. */
export function AnimatedNumber({ value = 0, format = formatNumber, duration = 1.2, className }) {
  const node = useRef(null)
  const current = useRef(0)
  const formatRef = useRef(format)
  formatRef.current = format

  useEffect(() => {
    const controls = animate(current.current, Number(value) || 0, {
      duration,
      ease,
      onUpdate: (latest) => {
        current.current = latest
        if (node.current) node.current.textContent = formatRef.current(latest)
      },
    })
    return () => controls.stop()
  }, [value, duration])

  return (
    <span className={className}>
      <span ref={node} aria-hidden="true">
        {format(0)}
      </span>
      <span className="sr-only">{format(value)}</span>
    </span>
  )
}
