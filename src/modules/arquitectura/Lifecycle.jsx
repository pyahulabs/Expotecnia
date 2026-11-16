import { motion } from 'framer-motion'
import { ClipboardList, FlaskConical, Hammer, LifeBuoy, PenLine, Repeat, Rocket } from 'lucide-react'
import { cn } from '@/lib/cn'
import { ease } from '@/lib/motion'

const ETAPAS = [
  {
    icon: ClipboardList,
    titulo: 'Análisis',
    texto: 'Relevamos los procesos de cada área, detectamos los problemas y definimos qué tiene que resolver el sistema.',
    entregables: ['Requisitos', 'Matriz FODA', 'Alcance'],
  },
  {
    icon: PenLine,
    titulo: 'Diseño',
    texto: 'Definimos la arquitectura, el modelo de datos en Firestore y el sistema de diseño de la interfaz.',
    entregables: ['Modelo de datos', 'Tokens de diseño', 'Prototipo'],
  },
  {
    icon: Hammer,
    titulo: 'Desarrollo',
    texto: 'Construimos el sistema por módulos, una carpeta por integrante, reutilizando los mismos componentes.',
    entregables: ['7 módulos', 'Componentes UI', 'Repositorio Git'],
  },
  {
    icon: FlaskConical,
    titulo: 'Pruebas',
    texto: 'Verificamos cada pantalla en modo claro y oscuro, en celular, y la sincronización entre dispositivos.',
    entregables: ['Casos de prueba', 'Corrección de errores'],
  },
  {
    icon: Rocket,
    titulo: 'Implementación',
    texto: 'Publicamos la aplicación, cargamos los datos iniciales y capacitamos a las personas que la van a usar.',
    entregables: ['Despliegue', 'Carga de datos', 'Capacitación'],
  },
  {
    icon: LifeBuoy,
    titulo: 'Mantenimiento y mejora continua',
    texto: 'Atendemos incidentes, medimos el uso y planificamos mejoras: cada hallazgo alimenta un nuevo análisis.',
    entregables: ['Soporte', 'Nuevas versiones', 'Indicadores'],
  },
]

/** Línea de tiempo del ciclo de vida del sistema. Se anima al entrar en pantalla. */
export function Lifecycle() {
  return (
    <div className="relative">
      {/* Riel central (izquierda en celular) */}
      <div className="absolute bottom-6 left-5 top-2 w-px bg-line lg:left-1/2" aria-hidden="true">
        <motion.div
          className="w-full origin-top bg-gradient-to-b from-primary via-primary to-[var(--chart-2)]"
          style={{ height: '100%' }}
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true, margin: '-15% 0px' }}
          transition={{ duration: 1.6, ease }}
        />
      </div>

      <ol className="space-y-6 lg:space-y-2">
        {ETAPAS.map((etapa, i) => {
          const derecha = i % 2 === 1
          return (
            <li key={etapa.titulo} className="relative lg:grid lg:grid-cols-2 lg:gap-16">
              {/* Nodo numerado */}
              <motion.span
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true, margin: '-12% 0px' }}
                transition={{ type: 'spring', stiffness: 320, damping: 18, delay: 0.1 }}
                className="absolute left-5 top-5 z-10 grid size-10 -translate-x-1/2 place-items-center rounded-full border-4 border-canvas bg-primary text-sm font-bold text-white shadow-raised lg:left-1/2"
                aria-hidden="true"
              >
                {i + 1}
              </motion.span>

              <motion.div
                initial={{ opacity: 0, x: derecha ? 28 : -28 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-12% 0px' }}
                transition={{ duration: 0.5, ease }}
                className={cn('ml-12 rounded-2xl border border-line bg-surface p-5 shadow-card transition-shadow hover:shadow-raised lg:ml-0', derecha ? 'lg:col-start-2' : 'lg:text-right')}
              >
                <div className={cn('flex items-center gap-3', !derecha && 'lg:flex-row-reverse')}>
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary-text">
                    <etapa.icon size={18} aria-hidden="true" />
                  </span>
                  <h3 className="text-[15px] font-semibold text-fg">
                    <span className="sr-only">Etapa {i + 1}: </span>
                    {etapa.titulo}
                  </h3>
                </div>
                <p className="mt-2.5 text-[13px] leading-5 text-fg-muted">{etapa.texto}</p>
                <ul className={cn('mt-3 flex flex-wrap gap-1.5', !derecha && 'lg:justify-end')}>
                  {etapa.entregables.map((entregable) => (
                    <li key={entregable} className="rounded-md bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-fg-muted">
                      {entregable}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </li>
          )
        })}
      </ol>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative mt-6 flex justify-start pl-0 lg:justify-center"
      >
        <span className="relative z-10 ml-0 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-xs font-medium text-fg-muted shadow-card">
          <motion.span animate={{ rotate: 360 }} transition={{ duration: 6, repeat: Infinity, ease: 'linear' }} className="text-primary-text">
            <Repeat size={15} aria-hidden="true" />
          </motion.span>
          El ciclo vuelve a empezar: mejora continua
        </span>
      </motion.div>
    </div>
  )
}
