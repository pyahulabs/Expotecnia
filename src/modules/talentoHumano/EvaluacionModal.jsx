import { useEffect, useState } from 'react'
import { AnimatedNumber, Avatar, Button, Field, Modal, Select, StarRating, Textarea } from '@/components/ui'
import { CRITERIOS_DESEMPENO } from '@/config/constants'
import { formatDecimal } from '@/lib/format'
import { etiquetaPeriodo, periodoActual, promedioCriterios } from './desempeno'

const criteriosVacios = () => Object.fromEntries(CRITERIOS_DESEMPENO.map((c) => [c.id, 0]))

const nivel = (promedio) => {
  if (!promedio) return 'Sin calificar'
  if (promedio >= 4.5) return 'Sobresaliente'
  if (promedio >= 3.5) return 'Cumple con creces'
  if (promedio >= 2.5) return 'Cumple'
  return 'Necesita mejorar'
}

/** Evaluación de desempeño: estrellas 1 a 5 por criterio y promedio calculado al instante. */
export function EvaluacionModal({ open, onClose, empleados, empleadoId, onSave }) {
  const [seleccionado, setSeleccionado] = useState('')
  const [criterios, setCriterios] = useState(criteriosVacios)
  const [comentario, setComentario] = useState('')
  const [error, setError] = useState('')
  const periodo = periodoActual()

  useEffect(() => {
    if (!open) return
    setSeleccionado(empleadoId || '')
    setCriterios(criteriosVacios())
    setComentario('')
    setError('')
  }, [open, empleadoId])

  const empleado = empleados.find((e) => e.id === seleccionado)
  const promedio = promedioCriterios(criterios)
  const completos = CRITERIOS_DESEMPENO.every((c) => criterios[c.id] > 0)

  const submit = (event) => {
    event.preventDefault()
    if (!empleado) return setError('Elegí a quién vas a evaluar.')
    if (!completos) return setError('Calificá los 5 criterios para guardar.')
    onSave({ empleadoId: empleado.id, empleado: empleado.nombre, periodo, criterios, promedio, comentario: comentario.trim() })
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="Evaluación de desempeño"
      description={`Período: ${etiquetaPeriodo(periodo)}`}
      footer={
        <>
          {error && <p className="mr-auto text-[13px] text-danger-text" role="alert">{error}</p>}
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="form-evaluacion">
            Guardar evaluación
          </Button>
        </>
      }
    >
      <form id="form-evaluacion" onSubmit={submit} className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_200px]">
        <div className="space-y-5">
          <Field label="Empleado" htmlFor="eval-empleado" required>
            <Select
              id="eval-empleado"
              value={seleccionado}
              onChange={(e) => {
                setSeleccionado(e.target.value)
                setError('')
              }}
              placeholder="Seleccionar empleado…"
              options={empleados.map((e) => ({ value: e.id, label: `${e.nombre} — ${e.cargo}` }))}
            />
          </Field>

          <fieldset>
            <legend className="mb-1 text-[13px] font-medium text-fg">Criterios</legend>
            <ul className="divide-y divide-line">
              {CRITERIOS_DESEMPENO.map((criterio) => (
                <li key={criterio.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3">
                  <div>
                    <p className="text-sm font-medium text-fg">{criterio.label}</p>
                    <p className="text-xs text-fg-subtle">{criterio.descripcion}</p>
                  </div>
                  <StarRating
                    size={24}
                    label={criterio.label}
                    value={criterios[criterio.id]}
                    onChange={(valor) => {
                      setCriterios((c) => ({ ...c, [criterio.id]: valor }))
                      setError('')
                    }}
                  />
                </li>
              ))}
            </ul>
          </fieldset>

          <Field label="Comentarios" htmlFor="eval-comentario" hint="Opcional: logros, puntos a mejorar, compromisos.">
            <Textarea id="eval-comentario" value={comentario} onChange={(e) => setComentario(e.target.value)} placeholder="Escribí una devolución breve…" />
          </Field>
        </div>

        {/* Resumen en vivo */}
        <aside className="flex flex-col items-center justify-center rounded-2xl border border-line bg-surface-2/60 p-5 text-center md:sticky md:top-0 md:self-start" aria-live="polite">
          {empleado ? <Avatar name={empleado.nombre} size="lg" /> : <div className="size-11 rounded-full border-2 border-dashed border-line-strong" aria-hidden="true" />}
          <p className="mt-2 max-w-full truncate text-sm font-semibold text-fg">{empleado?.nombre || 'Sin seleccionar'}</p>
          <p className="max-w-full truncate text-xs text-fg-subtle">{empleado?.cargo || 'Elegí un empleado'}</p>
          <AnimatedNumber value={promedio} format={formatDecimal} duration={0.4} className="mt-4 text-5xl font-semibold leading-none tracking-[-0.03em] text-fg" />
          <StarRating value={promedio} size={18} label="Promedio" className="mt-3" />
          <p className="mt-2 text-xs font-medium text-fg-muted">{nivel(promedio)}</p>
        </aside>
      </form>
    </Modal>
  )
}
