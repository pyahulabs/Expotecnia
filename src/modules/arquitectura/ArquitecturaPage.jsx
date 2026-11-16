import { motion } from 'framer-motion'
import { Layers, Workflow } from 'lucide-react'
import pkg from '../../../package.json'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardBody, CardHeader } from '@/components/ui'
import { fadeUp, stagger } from '@/lib/motion'
import { StackDiagram } from './StackDiagram'
import { RealtimeFlow } from './RealtimeFlow'
import { Lifecycle } from './Lifecycle'

const version = (nombre) => (pkg.dependencies?.[nombre] || pkg.devDependencies?.[nombre] || '').replace(/^[^\d]*/, '')

const TECNOLOGIAS = [
  { nombre: 'React', paquete: 'react', rol: 'Componentes de interfaz' },
  { nombre: 'Vite', paquete: 'vite', rol: 'Servidor de desarrollo y build' },
  { nombre: 'React Router', paquete: 'react-router-dom', rol: 'Navegación entre módulos' },
  { nombre: 'Tailwind CSS', paquete: 'tailwindcss', rol: 'Estilos y tokens de diseño' },
  { nombre: 'Firebase', paquete: 'firebase', rol: 'Firestore en tiempo real' },
  { nombre: 'Recharts', paquete: 'recharts', rol: 'Gráficos del dashboard' },
  { nombre: 'Framer Motion', paquete: 'framer-motion', rol: 'Animaciones y transiciones' },
  { nombre: 'hello-pangea/dnd', paquete: '@hello-pangea/dnd', rol: 'Arrastrar y soltar (Kanban)' },
  { nombre: 'Lucide', paquete: 'lucide-react', rol: 'Íconos' },
]

export default function ArquitecturaPage() {
  return (
    <>
      <PageHeader
        eyebrow="Unidad 8 · Transformación digital"
        title="Arquitectura del sistema"
        description="Cómo está construido el ERP: las capas del stack, el recorrido de los datos en tiempo real y el ciclo de vida del sistema."
      />

      <motion.div variants={stagger(0.08)} initial="hidden" animate="show" className="space-y-4 lg:space-y-6">
        <motion.section variants={fadeUp} aria-label="Diagrama del stack tecnológico">
          <StackDiagram />
        </motion.section>

        <RealtimeFlow />

        <Card variants={fadeUp}>
          <CardHeader icon={Layers} title="Tecnologías utilizadas" description="Versiones instaladas en este proyecto (package.json)." />
          <CardBody>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {TECNOLOGIAS.map((tec) => (
                <li key={tec.paquete} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface-2/40 px-4 py-3 transition-colors hover:bg-surface-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-fg">{tec.nombre}</p>
                    <p className="truncate text-xs text-fg-muted">{tec.rol}</p>
                  </div>
                  <span className="shrink-0 rounded-md bg-surface px-2 py-0.5 font-mono text-[11px] font-medium text-fg-muted shadow-card">v{version(tec.paquete)}</span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

        <motion.section variants={fadeUp} aria-labelledby="ciclo-titulo" className="pt-4">
          <div className="mb-8 flex flex-col items-center text-center">
            <span className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary-text">
              <Workflow size={19} aria-hidden="true" />
            </span>
            <h2 id="ciclo-titulo" className="mt-3 text-xl font-semibold tracking-[-0.02em] text-fg">
              Ciclo de vida del sistema
            </h2>
            <p className="mt-1 max-w-xl text-sm leading-6 text-fg-muted">Las seis etapas que recorre un sistema de información, desde la idea hasta su mejora permanente.</p>
          </div>
          <Lifecycle />
        </motion.section>
      </motion.div>
    </>
  )
}
