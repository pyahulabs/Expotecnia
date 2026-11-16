import { useId } from 'react'
import { motion } from 'framer-motion'
import { ease } from '@/lib/motion'

/** Mini gráfico de tendencia (SVG propio, liviano) para las StatCards. */
export function Sparkline({ data = [], width = 96, height = 36, color = 'var(--chart-1)', className }) {
  const id = useId()
  if (data.length < 2) return <div style={{ width, height }} aria-hidden="true" />

  const pad = 4
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const points = data.map((value, i) => [
    pad + (i / (data.length - 1)) * (width - pad * 2),
    pad + (1 - (value - min) / range) * (height - pad * 2),
  ])

  // Curva suave (Catmull-Rom → Bézier)
  const line = points.reduce((path, [x, y], i, arr) => {
    if (i === 0) return `M ${x},${y}`
    const [px, py] = arr[i - 1]
    const [ppx, ppy] = arr[i - 2] || arr[i - 1]
    const [nx, ny] = arr[i + 1] || arr[i]
    const c1x = px + (x - ppx) / 6
    const c1y = py + (y - ppy) / 6
    const c2x = x - (nx - px) / 6
    const c2y = y - (ny - py) / 6
    return `${path} C ${c1x},${c1y} ${c2x},${c2y} ${x},${y}`
  }, '')
  const [lastX, lastY] = points[points.length - 1]
  const area = `${line} L ${lastX},${height} L ${points[0][0]},${height} Z`

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={className} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path d={area} fill={`url(#${id})`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.5 }} />
      <motion.path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.1, ease, delay: 0.15 }}
      />
      <motion.circle
        cx={lastX}
        cy={lastY}
        r="3.5"
        fill={color}
        stroke="var(--surface)"
        strokeWidth="2"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, delay: 1.1 }}
      />
    </svg>
  )
}
