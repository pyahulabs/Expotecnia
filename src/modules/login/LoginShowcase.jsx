import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion'
import { Activity, ArrowUpRight, CheckCircle2, Flame, Lightbulb, Radio, ShieldCheck, Star, TrendingDown } from 'lucide-react'
import { Avatar } from '@/components/ui'
import { ease } from '@/lib/motion'

/**
 * Panel lateral del login: un flujo continuo de tarjetas del sistema.
 * Cada tarjeta entra abajo con un fundido rápido, sube en línea recta y se desvanece arriba,
 * mientras van apareciendo otras. Cada una tiene su propio ritmo: velocidad, vaivén lateral e
 * inclinación distintos. Al terminar la tanda, se repite en otro orden y en otras posiciones.
 * Solo se anima transform y opacity (animaciones CSS).
 */

const ALTO = 560 // alto del panel (px)
const SALIDA = -230 // posición final (px): la tarjeta termina de salir por arriba
const RECORRIDO = ALTO - SALIDA
const DURACION = [15, 24] // segundos (mín., máx.) que tarda una tarjeta en recorrer el panel
const ESPERA = [2.2, 3.4] // segundos (mín., máx.) entre una tarjeta y la siguiente
const SEPARACION = 200 // px mínimos entre dos tarjetas del mismo carril
const CARRILES = [
  { left: 0, width: 262 },
  { left: 292, width: 252 },
]

// ---- Contenido de las tarjetas ------------------------------------------------
function MiniBarras() {
  const barras = [42, 58, 47, 71, 63, 86, 78]
  return (
    <div className="mt-3 flex h-12 items-end gap-1.5" aria-hidden="true">
      {barras.map((h, i) => (
        <motion.span key={i} className="flex-1 origin-bottom rounded-t-[4px] bg-brand" style={{ height: `${h}%`, opacity: 0.45 + i * 0.08 }} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 0.7, delay: 0.2 + i * 0.06, ease }} />
      ))}
    </div>
  )
}

function MiniArea() {
  const linea = 'M0,46 C18,40 26,44 40,34 C54,24 62,30 76,22 C90,14 100,20 112,12 C124,6 134,10 150,4'
  return (
    <svg viewBox="0 0 150 56" className="mt-2 h-12 w-full" aria-hidden="true">
      <path d={`${linea} L150,56 L0,56 Z`} fill="var(--chart-2)" fillOpacity="0.14" />
      <motion.path d={linea} fill="none" stroke="var(--chart-2)" strokeWidth="2.2" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, delay: 0.2, ease }} />
      <circle cx="150" cy="4" r="3.5" fill="var(--chart-2)" stroke="var(--surface)" strokeWidth="2" />
    </svg>
  )
}

const Etiqueta = ({ className, children }) => <span className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${className}`}>{children}</span>

const TARJETAS = [
  {
    id: 'presupuesto',
    render: () => (
      <>
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-fg-muted">Presupuesto ejecutado</p>
          <Etiqueta className="bg-success-soft text-success-text"><ArrowUpRight size={11} /> 4,2%</Etiqueta>
        </div>
        <p className="mt-1 text-[26px] font-semibold leading-8 tracking-[-0.03em] text-fg">90,6%</p>
        <MiniBarras />
      </>
    ),
  },
  {
    id: 'costos',
    render: () => (
      <>
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-fg-muted">Evolución de costos</p>
          <Etiqueta className="bg-success-soft text-success-text"><TrendingDown size={11} /> 8%</Etiqueta>
        </div>
        <p className="mt-1 text-lg font-semibold tracking-tight text-fg">Gs. 604 M</p>
        <MiniArea />
      </>
    ),
  },
  {
    id: 'ticket',
    render: () => (
      <>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold tracking-wide text-fg-subtle">NC-041</span>
          <Etiqueta className="bg-danger-soft text-danger-text"><Flame size={11} /> Crítica</Etiqueta>
        </div>
        <p className="mt-2 text-[13px] font-medium leading-5 text-fg">Temperatura de cámara fría fuera de rango</p>
        <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
          <span className="flex items-center gap-2 text-xs text-fg-muted"><Avatar name="Arnaldo Vera" size="xs" /> Arnaldo Vera</span>
          <span className="flex items-center gap-1 text-[11px] text-fg-subtle"><ShieldCheck size={12} /> En análisis</span>
        </div>
      </>
    ),
  },
  {
    id: 'equipo',
    render: () => (
      <>
        <p className="text-xs font-medium text-fg-muted">Equipo conectado</p>
        <div className="mt-3 flex -space-x-1">
          {['María José Benítez', 'Derlis Ayala', 'Gloria Ortiz', 'Carlos Giménez'].map((n) => (
            <Avatar key={n} name={n} size="sm" className="ring-2 ring-surface" />
          ))}
          <span className="grid size-7 place-items-center rounded-full bg-surface-3 text-[10px] font-semibold text-fg-muted ring-2 ring-surface">+9</span>
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-[11px] text-fg-subtle"><Activity size={12} /> 12 cambios en la última hora</p>
      </>
    ),
  },
  {
    id: 'evaluacion',
    render: () => (
      <>
        <p className="text-xs font-medium text-fg-muted">Evaluación de desempeño</p>
        <div className="mt-3 flex items-center gap-3">
          <Avatar name="Fabiola Rojas" size="md" />
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-fg">Fabiola Rojas</p>
            <p className="flex items-center gap-0.5 text-warning" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((i) => <Star key={i} size={12} fill="currentColor" strokeWidth={0} className={i === 4 ? 'opacity-35' : ''} />)}
              <span className="ml-1.5 text-xs font-semibold text-fg">4,4</span>
            </p>
          </div>
        </div>
      </>
    ),
  },
  {
    id: 'tarea',
    render: () => (
      <>
        <div className="flex items-center justify-between">
          <span className="rounded-md bg-surface-2 px-1.5 py-0.5 text-[10px] font-medium text-fg-muted">Frontend</span>
          <Etiqueta className="bg-success-soft text-success-text"><CheckCircle2 size={11} /> Hecho</Etiqueta>
        </div>
        <p className="mt-2 text-[13px] font-medium leading-5 text-fg">Diagrama de Gantt con ruta crítica</p>
        <p className="mt-2 flex items-center gap-2 text-[11px] text-fg-subtle"><Avatar name="Fabiola Rojas" size="xs" /> movida a Hecho · recién</p>
      </>
    ),
  },
  {
    id: 'clima',
    render: () => (
      <>
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-fg-muted">Clima organizacional</p>
          <span className="text-xs font-semibold text-fg">3,9 / 5</span>
        </div>
        <div className="mt-3 space-y-2" aria-hidden="true">
          {[['Trabajo en equipo', 0.88], ['Liderazgo', 0.82], ['Reconocimiento', 0.66]].map(([d, v]) => (
            <div key={d}>
              <p className="mb-1 text-[10px] text-fg-subtle">{d}</p>
              <div className="h-1.5 overflow-hidden rounded-full bg-surface-3">
                <motion.div className="h-full w-full origin-left rounded-full bg-gradient-to-r from-primary to-primary-2" initial={{ scaleX: 0 }} animate={{ scaleX: v }} transition={{ duration: 0.9, delay: 0.2, ease }} />
              </div>
            </div>
          ))}
        </div>
      </>
    ),
  },
  {
    id: 'foda',
    render: () => (
      <>
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-lg bg-info text-white"><Lightbulb size={14} /></span>
          <p className="text-xs font-medium text-fg-muted">Nueva oportunidad · FODA</p>
        </div>
        <p className="mt-2 text-[13px] font-medium leading-5 text-fg">Crecimiento de la demanda de yerba mate en la región</p>
      </>
    ),
  },
  {
    id: 'vivo',
    render: () => (
      <p className="flex items-center gap-2.5 text-xs font-medium text-fg">
        <span className="relative grid size-2.5 place-items-center">
          <span className="absolute size-2.5 animate-pulse-ring rounded-full bg-success" />
          <span className="relative size-2 rounded-full bg-success" />
        </span>
        Sincronizado en tiempo real
        <Radio size={13} className="text-fg-subtle" />
      </p>
    ),
  },
]

const mezclar = (lista, distintaDe) => {
  for (let intento = 0; intento < 8; intento++) {
    const copia = [...lista]
    for (let i = copia.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[copia[i], copia[j]] = [copia[j], copia[i]]
    }
    // Que la tanda nueva no empiece igual que terminó la anterior
    if (!distintaDe || copia[0].id !== distintaDe) return copia
  }
  return [...lista]
}

const entre = ([min, max]) => min + Math.random() * (max - min)

function Tarjeta({ item, onFin }) {
  const carril = CARRILES[item.carril]
  return (
    <div
      className="absolute top-0"
      style={{
        left: carril.left + item.dx,
        width: carril.width - 14,
        '--from': `${ALTO}px`,
        '--to': `${SALIDA}px`,
        animation: `stream-up ${item.duracion}s linear ${item.delay}s forwards`,
        opacity: 0,
        willChange: 'transform, opacity',
      }}
      onAnimationEnd={(e) => e.animationName === 'stream-up' && e.target === e.currentTarget && onFin(item.key)}
    >
      <div
        className="glass-strong rounded-2xl border border-line p-4 shadow-pop"
        style={{ '--sx': `${item.sx}px`, '--r': `${item.r}deg`, animation: `stream-sway ${item.vaiven}s ease-in-out ${-item.fase}s infinite alternate`, willChange: 'transform' }}
      >
        {item.tarjeta.render()}
      </div>
    </div>
  )
}

export function LoginShowcase() {
  const reducir = useReducedMotion()
  const [items, setItems] = useState([])
  const cola = useRef([])
  const contador = useRef(0)
  const ultima = useRef(null)
  // Cuántas copias de cada tarjeta hay ahora en pantalla (para no repetir una que todavía se ve)
  const enPantalla = useRef(new Map())

  // Parallax suave del conjunto según el mouse
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const px = useSpring(mx, { stiffness: 60, damping: 18 })
  const py = useSpring(my, { stiffness: 60, damping: 18 })
  const x0 = useTransform(px, (v) => v * -10)
  const y0 = useTransform(py, (v) => v * -8)
  const x1 = useTransform(px, (v) => v * 14)
  const y1 = useTransform(py, (v) => v * 10)

  useEffect(() => {
    if (reducir) return undefined
    const mover = (e) => {
      mx.set((e.clientX / window.innerWidth - 0.5) * 2)
      my.set((e.clientY / window.innerHeight - 0.5) * 2)
    }
    window.addEventListener('pointermove', mover, { passive: true })
    return () => window.removeEventListener('pointermove', mover)
  }, [reducir, mx, my])

  // Último lanzamiento de cada carril: { inicio (s), duracion (s) }
  const carriles = useRef([null, null])

  /**
   * Duración mínima (s) que puede tener una tarjeta nueva en un carril para no alcanzar nunca a la
   * anterior (mantiene al menos SEPARACION px). Devuelve null si el carril todavía no tiene lugar.
   */
  const duracionMinima = (previa, ahora) => {
    if (!previa) return DURACION[0]
    const avance = Math.min(1, (ahora - previa.inicio) / previa.duracion)
    const ventaja = avance * RECORRIDO
    if (ventaja < SEPARACION) return null
    const restante = (1 - avance) * previa.duracion
    if (restante <= 0) return DURACION[0]
    // ventaja − (R/D − R/D₀)·restante ≥ SEPARACION  ⇒  D ≥ R / (R/D₀ + (ventaja − SEPARACION)/restante)
    return Math.max(DURACION[0], RECORRIDO / (RECORRIDO / previa.duracion + (ventaja - SEPARACION) / restante))
  }

  /** Arma la próxima tarjeta, o devuelve null si ningún carril tiene lugar todavía. */
  const siguiente = useCallback((delay = 0) => {
    const ahora = performance.now() / 1000 + delay
    // Carriles con lugar, ordenados por el que tiene más espacio; cada tarjeta tiene su propia velocidad
    const opciones = [0, 1]
      .map((c) => ({ c, min: duracionMinima(carriles.current[c], ahora) }))
      .filter((o) => o.min !== null && o.min <= DURACION[1])
      .sort((a, b) => a.min - b.min)
    if (!opciones.length) return null
    const { c, min } = opciones[Math.random() < 0.75 ? 0 : opciones.length - 1]
    const duracion = Math.max(min, entre(DURACION))
    carriles.current[c] = { inicio: ahora, duracion }

    if (!cola.current.length) cola.current = mezclar(TARJETAS, ultima.current)
    const libre = cola.current.findIndex((t) => !enPantalla.current.get(t.id))
    const [tarjeta] = cola.current.splice(libre === -1 ? 0 : libre, 1)
    enPantalla.current.set(tarjeta.id, (enPantalla.current.get(tarjeta.id) || 0) + 1)
    ultima.current = tarjeta.id

    const n = contador.current++
    return {
      key: `${tarjeta.id}-${n}`,
      tarjeta,
      carril: c,
      delay,
      duracion: Number(duracion.toFixed(2)),
      dx: Math.round(Math.random() * 18), // corrimiento: cada vuelta queda "desordenada"
      sx: Number(entre([4, 14]).toFixed(1)), // vaivén lateral propio
      r: Number(entre([0.3, 1.6]).toFixed(2)) * (Math.random() < 0.5 ? -1 : 1), // inclinación propia
      vaiven: Number(entre([3.2, 6.5]).toFixed(2)), // período del vaivén
      fase: Number(entre([0, 3]).toFixed(2)),
    }
  }, [])

  useEffect(() => {
    if (reducir) return undefined
    // Estado limpio en cada montaje (en desarrollo React monta dos veces)
    cola.current = []
    carriles.current = [null, null]
    enPantalla.current = new Map()
    // Arranca con algunas tarjetas ya en camino, para que el panel no empiece vacío
    setItems([-12, -9, -6, -3].map((d) => siguiente(d)).filter(Boolean))
    let timer
    const programar = () => {
      timer = setTimeout(() => {
        if (!document.hidden) {
          // Se calcula afuera del actualizador: React puede llamarlo dos veces y se desordenaría la cola
          const nuevo = siguiente(0)
          if (nuevo) setItems((actuales) => [...actuales, nuevo])
        }
        programar()
      }, entre(ESPERA) * 1000)
    }
    programar()
    return () => clearTimeout(timer)
  }, [reducir, siguiente])

  const quitar = useCallback((key) => {
    const id = key.slice(0, key.lastIndexOf('-'))
    enPantalla.current.set(id, Math.max(0, (enPantalla.current.get(id) || 1) - 1))
    setItems((actuales) => actuales.filter((i) => i.key !== key))
  }, [])

  if (reducir) {
    // Sin movimiento: una grilla quieta con algunas tarjetas
    return (
      <div className="grid max-w-[560px] grid-cols-2 gap-4" aria-hidden="true">
        {TARJETAS.slice(0, 4).map((t) => (
          <div key={t.id} className="glass-strong rounded-2xl border border-line p-4 shadow-pop">{t.render()}</div>
        ))}
      </div>
    )
  }

  return (
    <div
      className="relative mx-auto w-full max-w-[560px] overflow-hidden"
      style={{ height: ALTO, maskImage: 'linear-gradient(to bottom, transparent, black 12%, black 82%, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 12%, black 82%, transparent)' }}
      aria-hidden="true"
    >
      {[0, 1].map((c) => (
        <motion.div key={c} className="absolute inset-0" style={{ x: c ? x1 : x0, y: c ? y1 : y0 }}>
          {items.filter((i) => i.carril === c).map((item) => (
            <Tarjeta key={item.key} item={item} onFin={quitar} />
          ))}
        </motion.div>
      ))}
    </div>
  )
}
