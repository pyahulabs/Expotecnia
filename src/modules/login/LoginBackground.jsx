import { useEffect, useMemo } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'

/**
 * Fondo animado del login: gradiente "mesh" que se mueve lento, partículas sutiles y un
 * brillo que sigue al cursor. Todo se anima solo con transform y opacity (60 fps) y se
 * detiene si el sistema pide reducir el movimiento.
 */

// Generador con semilla: las partículas quedan siempre en el mismo lugar entre renders
const aleatorio = (semilla) => () => {
  semilla = (semilla * 16807) % 2147483647
  return (semilla - 1) / 2147483646
}

function Particulas() {
  const particulas = useMemo(() => {
    const r = aleatorio(7)
    return Array.from({ length: 28 }, (_, i) => ({
      id: i,
      left: `${r() * 100}%`,
      size: 1.5 + r() * 2.5,
      duration: 16 + r() * 18,
      delay: -r() * 30,
      dx: `${(r() - 0.5) * 120}px`,
      opacity: 0.25 + r() * 0.45,
    }))
  }, [])
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {particulas.map((p) => (
        <span
          key={p.id}
          className="absolute -bottom-4 rounded-full bg-primary-text"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            '--dx': p.dx,
            '--o': p.opacity,
            opacity: 0,
            animation: `particle-rise ${p.duration}s linear ${p.delay}s infinite`,
            willChange: 'transform, opacity',
          }}
        />
      ))}
    </div>
  )
}

function BrilloCursor() {
  const reducir = useReducedMotion()
  const x = useMotionValue(-1000)
  const y = useMotionValue(-1000)
  const sx = useSpring(x, { stiffness: 120, damping: 24, mass: 0.6 })
  const sy = useSpring(y, { stiffness: 120, damping: 24, mass: 0.6 })

  useEffect(() => {
    if (reducir || window.matchMedia?.('(pointer: coarse)').matches) return undefined
    const mover = (e) => {
      x.set(e.clientX - 300)
      y.set(e.clientY - 300)
    }
    window.addEventListener('pointermove', mover, { passive: true })
    return () => window.removeEventListener('pointermove', mover)
  }, [reducir, x, y])

  if (reducir) return null
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-0 size-[600px] rounded-full opacity-70 dark:opacity-60"
      style={{ x: sx, y: sy, background: 'radial-gradient(closest-side, color-mix(in srgb, var(--primary) 22%, transparent), transparent)', willChange: 'transform' }}
    />
  )
}

export function LoginBackground() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {/* Manchas del mesh */}
        <div className="absolute -left-[15%] -top-[20%] size-[70vmax] rounded-full opacity-[0.28] blur-[110px] dark:opacity-[0.32]" style={{ background: 'var(--primary)', animation: 'mesh-a 22s ease-in-out infinite', willChange: 'transform' }} />
        <div className="absolute -right-[20%] top-[10%] size-[60vmax] rounded-full opacity-[0.22] blur-[120px] dark:opacity-[0.26]" style={{ background: 'var(--primary-2)', animation: 'mesh-b 26s ease-in-out infinite', willChange: 'transform' }} />
        <div className="absolute -bottom-[30%] left-[25%] size-[55vmax] rounded-full opacity-[0.18] blur-[120px] dark:opacity-[0.2]" style={{ background: 'var(--accent)', animation: 'mesh-c 30s ease-in-out infinite', willChange: 'transform' }} />
        <div className="absolute bottom-[5%] -left-[10%] size-[35vmax] rounded-full opacity-[0.14] blur-[100px]" style={{ background: 'var(--info)', animation: 'mesh-b 34s ease-in-out infinite reverse', willChange: 'transform' }} />
        {/* Grilla tenue que se desvanece hacia los bordes */}
        <div
          className="absolute inset-0 opacity-[0.5] dark:opacity-[0.35]"
          style={{
            backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
            maskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent 75%)',
          }}
        />
      </div>
      <Particulas />
      <BrilloCursor />
    </>
  )
}
