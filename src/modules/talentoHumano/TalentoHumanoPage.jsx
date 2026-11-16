import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Smile, Star, UserPlus, Users } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button, Tabs, toast } from '@/components/ui'
import { COLECCIONES } from '@/config/constants'
import { logActivity, useCollection } from '@/firebase/hooks'
import { formatDecimal } from '@/lib/format'
import { ultimaPorEmpleado } from './desempeno'
import { EmpleadosTab } from './EmpleadosTab'
import { EmpleadoModal } from './EmpleadoModal'
import { EvaluacionModal } from './EvaluacionModal'
import { DesempenoTab } from './DesempenoTab'
import { ClimaTab } from './ClimaTab'

export default function TalentoHumanoPage() {
  const empleados = useCollection(COLECCIONES.empleados, { orderBy: 'nombre' })
  const evaluaciones = useCollection(COLECCIONES.evaluaciones)
  const clima = useCollection(COLECCIONES.clima)

  const [params, setParams] = useSearchParams()
  const tab = ['empleados', 'desempeno', 'clima'].includes(params.get('tab')) ? params.get('tab') : 'empleados'
  const setTab = (id) => setParams(id === 'empleados' ? {} : { tab: id }, { replace: true })

  const [modalEmpleado, setModalEmpleado] = useState({ open: false, empleado: null })
  const [modalEvaluacion, setModalEvaluacion] = useState({ open: false, empleadoId: null })

  const ultimas = useMemo(() => ultimaPorEmpleado(evaluaciones.data), [evaluaciones.data])

  const guardarEmpleado = (valores, id) => {
    if (id) {
      empleados.update(id, valores)
      logActivity('Talento Humano', `actualizó el legajo de ${valores.nombre}`, 'editar')
      toast.success('Cambios guardados', `Se actualizó el legajo de ${valores.nombre}.`)
    } else {
      empleados.add(valores)
      logActivity('Talento Humano', `dio de alta a ${valores.nombre} en ${valores.departamento}`, 'crear')
      toast.success('Empleado creado', `${valores.nombre} ya forma parte de ${valores.departamento}.`)
    }
  }

  const eliminarEmpleado = (empleado) => {
    empleados.remove(empleado.id)
    logActivity('Talento Humano', `dio de baja a ${empleado.nombre}`, 'eliminar')
    toast.info('Empleado eliminado', empleado.nombre)
  }

  const guardarEvaluacion = (evaluacion) => {
    evaluaciones.add(evaluacion)
    logActivity('Talento Humano', `evaluó el desempeño de ${evaluacion.empleado} (${formatDecimal(evaluacion.promedio)} de 5)`, 'crear')
    toast.success('Evaluación guardada', `${evaluacion.empleado}: promedio ${formatDecimal(evaluacion.promedio)} de 5.`)
  }

  const enviarEncuesta = (respuesta) => {
    clima.add(respuesta)
    logActivity('Talento Humano', 'recibió una nueva respuesta de la encuesta de clima', 'crear')
    toast.success('¡Respuesta enviada!', 'Los resultados se actualizaron en tiempo real.')
  }

  const abrirEvaluacion = (empleado) => setModalEvaluacion({ open: true, empleadoId: empleado?.id || null })

  return (
    <>
      <PageHeader
        eyebrow="Unidad 2 · Gestión del talento humano"
        title="Talento Humano"
        description="Legajos del personal, evaluación de desempeño y encuesta de clima organizacional."
        actions={
          <>
            <Button variant="secondary" icon={Star} onClick={() => abrirEvaluacion()}>
              Evaluar
            </Button>
            <Button icon={UserPlus} onClick={() => setModalEmpleado({ open: true, empleado: null })}>
              Nuevo empleado
            </Button>
          </>
        }
      />

      <Tabs
        className="mb-6"
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'empleados', label: 'Empleados', icon: Users, count: empleados.loading ? null : empleados.data.length },
          { id: 'desempeno', label: 'Desempeño', icon: Star, count: evaluaciones.loading ? null : ultimas.size },
          { id: 'clima', label: 'Clima', icon: Smile, count: clima.loading ? null : clima.data.length },
        ]}
      />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={tab} role="tabpanel" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          {tab === 'empleados' && (
            <EmpleadosTab
              empleados={empleados.data}
              loading={empleados.loading}
              ultimas={ultimas}
              busquedaInicial={params.get('q') || ''}
              onNuevo={() => setModalEmpleado({ open: true, empleado: null })}
              onEditar={(empleado) => setModalEmpleado({ open: true, empleado })}
              onEvaluar={abrirEvaluacion}
              onEliminar={eliminarEmpleado}
            />
          )}
          {tab === 'desempeno' && <DesempenoTab empleados={empleados.data} evaluaciones={evaluaciones.data} loading={evaluaciones.loading || empleados.loading} onEvaluar={abrirEvaluacion} />}
          {tab === 'clima' && <ClimaTab respuestas={clima.data} loading={clima.loading} onEnviar={enviarEncuesta} />}
        </motion.div>
      </AnimatePresence>

      <EmpleadoModal open={modalEmpleado.open} empleado={modalEmpleado.empleado} onClose={() => setModalEmpleado((m) => ({ ...m, open: false }))} onSave={guardarEmpleado} />
      <EvaluacionModal
        open={modalEvaluacion.open}
        empleadoId={modalEvaluacion.empleadoId}
        empleados={empleados.data}
        onClose={() => setModalEvaluacion((m) => ({ ...m, open: false }))}
        onSave={guardarEvaluacion}
      />
    </>
  )
}
