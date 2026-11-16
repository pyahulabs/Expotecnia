import { useState } from 'react'
import { motion } from 'framer-motion'
import { CloudUpload, Database, MousePointerClick, Radio, RefreshCw, Zap } from 'lucide-react'
import { Badge, Button, Card, CardBody, CardHeader, toast } from '@/components/ui'
import { describeError, testConnection } from '@/firebase/hooks'
import { cn } from '@/lib/cn'
import { fadeUp } from '@/lib/motion'

const PASOS = [
  { icon: MousePointerClick, titulo: 'Acción', texto: 'El usuario crea, edita o arrastra un registro.' },
  { icon: CloudUpload, titulo: 'Escritura', texto: 'El hook llama a add / update / remove.' },
  { icon: Database, titulo: 'Firestore', texto: 'Guarda el documento y lo sincroniza.' },
  { icon: Radio, titulo: 'onSnapshot', texto: 'Avisa a todas las pantallas conectadas.' },
  { icon: RefreshCw, titulo: 'Render', texto: 'React redibuja solo lo que cambió.' },
]

const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/** Explica el flujo en tiempo real y permite dispararlo con una escritura de prueba. */
export function RealtimeFlow() {
  const [activo, setActivo] = useState(-1)
  const [corriendo, setCorriendo] = useState(false)
  const [resultado, setResultado] = useState(null)

  const probar = async () => {
    setCorriendo(true)
    setResultado(null)
    try {
      setActivo(0)
      await esperar(450)
      setActivo(1)
      const inicio = performance.now()
      const { mode, id } = await testConnection()
      const ms = Math.max(1, Math.round(performance.now() - inicio))
      for (const paso of [2, 3, 4]) {
        setActivo(paso)
        await esperar(450)
      }
      setResultado({ ms, mode })
      toast.success('Ciclo completo', `Documento ${id.slice(0, 8)}… escrito en test_collection en ${ms} ms.`)
    } catch (error) {
      toast.error('No se pudo completar la prueba', describeError(error))
    } finally {
      setCorriendo(false)
      setTimeout(() => setActivo(-1), 1600)
    }
  }

  return (
    <Card variants={fadeUp}>
      <CardHeader
        icon={Zap}
        title="¿Cómo viaja un cambio en tiempo real?"
        description="Del clic del usuario a todas las pantallas, sin recargar la página."
        action={
          <Button variant="soft" icon={Zap} loading={corriendo} onClick={probar}>
            Probar en vivo
          </Button>
        }
      />
      <CardBody>
        <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {PASOS.map((paso, i) => {
            const encendido = activo >= i
            return (
              <li key={paso.titulo} className="relative">
                <motion.div
                  animate={{ scale: activo === i ? 1.03 : 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                  className={cn(
                    'h-full rounded-2xl border p-4 transition-colors duration-300',
                    encendido ? 'border-primary/50 bg-primary-soft' : 'border-line bg-surface-2/50',
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={cn('grid size-8 place-items-center rounded-lg transition-colors duration-300', encendido ? 'bg-primary text-white' : 'bg-surface text-fg-muted shadow-card')}>
                      <paso.icon size={16} aria-hidden="true" />
                    </span>
                    <span className="text-[11px] font-bold tabular-nums text-fg-subtle">0{i + 1}</span>
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-fg">{paso.titulo}</h3>
                  <p className="mt-1 text-xs leading-[18px] text-fg-muted">{paso.texto}</p>
                </motion.div>
              </li>
            )
          })}
        </ol>
        <div className="mt-4 flex min-h-6 flex-wrap items-center gap-2 text-xs text-fg-muted" aria-live="polite">
          {resultado ? (
            <>
              <Badge tone="success" dot>
                Ida y vuelta en {resultado.ms} ms
              </Badge>
              <span>{resultado.mode === 'firestore' ? 'Escritura confirmada por el servidor de Firestore.' : 'Escritura en el almacén local (configurá el .env para medir contra Firestore).'}</span>
            </>
          ) : (
            <span>Tocá «Probar en vivo» para escribir un documento de prueba y ver el recorrido paso a paso.</span>
          )}
        </div>
      </CardBody>
    </Card>
  )
}
