import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Atom, Database, MonitorSmartphone } from 'lucide-react'
import { AnimatedNumber, Badge, Card } from '@/components/ui'
import { NAV_ITEMS } from '@/config/navigation'
import { COLECCIONES } from '@/config/constants'
import { useCollection, useConnectionStatus } from '@/firebase/hooks'
import { projectId } from '@/firebase/config'
import { cn } from '@/lib/cn'
import { ease } from '@/lib/motion'

// Solo los 7 módulos del ERP (no Usuarios ni Documentación)
const MODULOS = NAV_ITEMS.filter((item) => item.modulo)

// Qué colecciones de Firestore usa cada módulo
const COLECCIONES_POR_MODULO = {
  '/': ['actividad', '+ lectura de todas'],
  '/planeacion': [COLECCIONES.foda],
  '/talento-humano': [COLECCIONES.empleados, COLECCIONES.evaluaciones, COLECCIONES.clima],
  '/calidad': [COLECCIONES.noConformidades],
  '/finanzas': [COLECCIONES.presupuestos, COLECCIONES.costos],
  '/proyectos': [COLECCIONES.tareas, COLECCIONES.fases],
  '/arquitectura': [COLECCIONES.test],
}

/** Cuenta en vivo los documentos de cada colección. */
function useConteos() {
  const conteos = {
    [COLECCIONES.foda]: useCollection(COLECCIONES.foda).data.length,
    [COLECCIONES.empleados]: useCollection(COLECCIONES.empleados).data.length,
    [COLECCIONES.evaluaciones]: useCollection(COLECCIONES.evaluaciones).data.length,
    [COLECCIONES.clima]: useCollection(COLECCIONES.clima).data.length,
    [COLECCIONES.noConformidades]: useCollection(COLECCIONES.noConformidades).data.length,
    [COLECCIONES.presupuestos]: useCollection(COLECCIONES.presupuestos).data.length,
    [COLECCIONES.costos]: useCollection(COLECCIONES.costos).data.length,
    [COLECCIONES.tareas]: useCollection(COLECCIONES.tareas).data.length,
    [COLECCIONES.fases]: useCollection(COLECCIONES.fases).data.length,
    [COLECCIONES.actividad]: useCollection(COLECCIONES.actividad).data.length,
    [COLECCIONES.test]: useCollection(COLECCIONES.test).data.length,
  }
  return { conteos, total: Object.values(conteos).reduce((a, b) => a + b, 0) }
}

/** Línea vertical con guiones que "fluyen" y un punto que viaja en la dirección indicada. */
function FlowLine({ direction = 'down', color, title, detail, side = 'left', height = 88 }) {
  const down = direction === 'down'
  return (
    <div className="relative" style={{ height, width: 12 }}>
      <svg width="12" height={height} className="overflow-visible" aria-hidden="true">
        <line x1="6" y1={down ? 0 : height} x2="6" y2={down ? height : 0} stroke={color} strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4" className="animate-dash" opacity="0.55" />
      </svg>
      <motion.span
        aria-hidden="true"
        className="absolute left-1/2 size-2.5 -translate-x-1/2 rounded-full"
        style={{ background: color, boxShadow: `0 0 0 4px color-mix(in srgb, ${color} 22%, transparent)` }}
        animate={{ top: down ? [-4, height - 6] : [height - 6, -4], opacity: [0, 1, 1, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'linear', times: [0, 0.15, 0.85, 1] }}
      />
      {title && (
        <div className={cn('absolute top-1/2 w-36 -translate-y-1/2', side === 'left' ? 'right-6 text-right' : 'left-6 text-left')}>
          <p className="text-xs font-semibold text-fg">{title}</p>
          <p className="font-mono text-[11px] text-fg-subtle">{detail}</p>
        </div>
      )}
    </div>
  )
}

/** Nodo grande de una capa del stack. */
function Nodo({ icon: Icon, capa, titulo, descripcion, chips, tile, delay = 0, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, ease }}
      className="relative w-full max-w-xl rounded-2xl border border-line bg-surface p-5 shadow-raised"
    >
      <p className="absolute -top-2.5 left-5 rounded-full border border-line bg-surface px-2.5 text-[10px] font-bold uppercase leading-5 tracking-[0.09em] text-fg-subtle">{capa}</p>
      <div className="flex items-start gap-4">
        <span className={cn('grid size-12 shrink-0 place-items-center rounded-2xl text-white shadow-card', tile)}>
          <Icon size={24} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold tracking-[-0.01em] text-fg">{titulo}</h3>
          <p className="mt-0.5 text-[13px] leading-5 text-fg-muted">{descripcion}</p>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {chips.map((chip) => (
              <li key={chip} className="rounded-md border border-line bg-surface-2/70 px-2 py-0.5 text-[11px] font-medium text-fg-muted">
                {chip}
              </li>
            ))}
          </ul>
          {children}
        </div>
      </div>
    </motion.div>
  )
}

/** Diagrama animado del stack: React → Firebase → módulos. */
export function StackDiagram() {
  const { conteos, total } = useConteos()
  const conexion = useConnectionStatus()
  const live = conexion === 'vivo'

  return (
    <Card className="relative overflow-hidden px-4 py-8 sm:px-8 sm:py-10">
      {/* Fondo: grilla de puntos difuminada */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage: 'radial-gradient(var(--border-strong) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black 20%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black 20%, transparent 75%)',
        }}
      />

      <div className="relative flex flex-col items-center">
        {/* Usuario */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 text-xs font-medium text-fg-muted shadow-card">
          <MonitorSmartphone size={15} aria-hidden="true" />
          Navegador del usuario · compu, tablet o celular
        </motion.div>
        <FlowLine color="var(--fg-subtle)" height={36} />

        {/* Capa 1: React */}
        <Nodo
          icon={Atom}
          capa="1 · Presentación"
          titulo="Aplicación React"
          descripcion="Interfaz de una sola página (SPA). Cada módulo es una carpeta independiente que se carga bajo demanda."
          chips={['React 19', 'Vite', 'React Router', 'Tailwind CSS', 'Framer Motion', 'Recharts']}
          tile="bg-primary"
          delay={0.1}
        />

        {/* Conexión bidireccional */}
        <div className="flex items-center gap-12 sm:gap-16">
          <FlowLine direction="down" color="var(--chart-1)" title="Escrituras" detail="add · update · delete" side="left" />
          <FlowLine direction="up" color="var(--chart-2)" title="Tiempo real" detail="onSnapshot()" side="right" />
        </div>

        {/* Capa 2: Firebase */}
        <Nodo
          icon={Database}
          capa="2 · Datos"
          titulo="Firebase · Cloud Firestore"
          descripcion="Base de datos NoSQL en la nube. Cada cambio se propaga al instante a todas las pantallas conectadas."
          chips={['Colecciones y documentos', 'southamerica-east1', 'Caché sin conexión', 'hook useCollection']}
          tile="bg-[#f5820b]"
          delay={0.25}
        >
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge tone={live ? 'success' : conexion === 'error' ? 'danger' : 'warning'} dot>
              {{ vivo: `En vivo · ${projectId}`, local: 'Modo local (sin .env)', conectando: `Conectando · ${projectId}`, cache: 'Sin conexión · datos guardados', error: 'Error de conexión' }[conexion]}
            </Badge>
            <span className="text-xs text-fg-muted">
              <AnimatedNumber value={total} duration={0.8} className="font-semibold text-fg" /> documentos
            </span>
          </div>
        </Nodo>

        {/* Abanico hacia los módulos (escritorio) */}
        <svg viewBox="0 0 700 72" preserveAspectRatio="none" className="hidden h-[72px] w-full lg:block" aria-hidden="true">
          {MODULOS.map((item, i) => {
            const x = i * 100 + 50
            const d = `M350,0 C350,44 ${x},30 ${x},72`
            return (
              <g key={item.path}>
                <path d={d} fill="none" stroke="var(--border-strong)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
                <path d={d} fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeDasharray="5 11" vectorEffect="non-scaling-stroke" className="animate-dash" style={{ animationDelay: `${i * -0.17}s` }} />
              </g>
            )
          })}
        </svg>
        <div className="lg:hidden">
          <FlowLine color="var(--primary)" height={44} />
        </div>

        {/* Capa 3: módulos */}
        <div className="relative w-full">
          <p className="mb-3 text-center text-[10px] font-bold uppercase tracking-[0.09em] text-fg-subtle lg:hidden">3 · Módulos del ERP</p>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
            {MODULOS.map((item, i) => {
              const colecciones = COLECCIONES_POR_MODULO[item.path] || []
              const docs = colecciones.reduce((n, c) => n + (conteos[c] || 0), 0)
              return (
                <motion.li key={item.path} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.45 + i * 0.06, ease }}>
                  <Link
                    to={item.path}
                    className="group flex h-full flex-col items-center rounded-2xl border border-line bg-surface px-2 py-4 text-center shadow-card transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-raised"
                  >
                    <span className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary-text transition-colors group-hover:bg-primary group-hover:text-white">
                      <item.icon size={19} aria-hidden="true" />
                    </span>
                    <span className="mt-2.5 text-[13px] font-semibold leading-4 text-fg">{item.label}</span>
                    <span className="mt-2 space-y-0.5">
                      {colecciones.map((c) => (
                        <span key={c} className="block break-all font-mono text-[10px] leading-4 text-fg-muted">
                          {c}
                        </span>
                      ))}
                    </span>
                    <span className="mt-auto pt-2 text-[11px] tabular-nums text-fg-subtle">
                      <AnimatedNumber value={docs} duration={0.8} className="font-semibold text-fg" /> docs
                    </span>
                  </Link>
                </motion.li>
              )
            })}
          </ul>
        </div>
      </div>
    </Card>
  )
}
