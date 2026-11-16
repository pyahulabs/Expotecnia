import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button, Field, Input, Modal, Select, Textarea } from '@/components/ui'
import { LISTA_PRIORIDADES } from '@/config/constants'
import { addDays, toISODate } from '@/lib/format'
import { ESTADOS_TAREA, ETIQUETAS } from './estados'

const VACIO = { titulo: '', descripcion: '', estado: 'pendiente', prioridad: 'Media', responsable: '', etiqueta: 'Frontend', fechaLimite: '' }

/** Alta y edición de una tarea del tablero. */
export function TareaModal({ open, onClose, tarea, estadoInicial, responsables, onSave, onDelete }) {
  const [form, setForm] = useState(VACIO)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setForm(tarea ? { ...VACIO, ...tarea } : { ...VACIO, estado: estadoInicial || 'pendiente', fechaLimite: toISODate(addDays(new Date(), 7)) })
    setError('')
  }, [open, tarea, estadoInicial])

  const set = (campo) => (event) => setForm((f) => ({ ...f, [campo]: event.target.value }))

  const submit = (event) => {
    event.preventDefault()
    if (!form.titulo.trim()) return setError('Escribí un título para la tarea.')
    const { id, createdAt, updatedAt, ...valores } = form
    onSave({ ...valores, titulo: form.titulo.trim(), descripcion: form.descripcion.trim() }, tarea)
    onClose()
  }

  const opciones = form.responsable && !responsables.includes(form.responsable) ? [form.responsable, ...responsables] : responsables

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={tarea ? 'Editar tarea' : 'Nueva tarea'}
      description="Las tareas se organizan en el tablero Kanban del proyecto."
      footer={
        <>
          {tarea && (
            <Button variant="ghost" icon={Trash2} className="text-danger-text hover:bg-danger-soft hover:text-danger-text sm:mr-auto" onClick={() => { onDelete(tarea); onClose() }}>
              Eliminar
            </Button>
          )}
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="form-tarea">
            {tarea ? 'Guardar cambios' : 'Crear tarea'}
          </Button>
        </>
      }
    >
      <form id="form-tarea" onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2" noValidate>
        <Field label="Título" htmlFor="tarea-titulo" required error={error} className="sm:col-span-2">
          <Input id="tarea-titulo" value={form.titulo} onChange={set('titulo')} placeholder="Ej.: Preparar la demo para la feria" invalid={!!error} maxLength={80} />
        </Field>
        <Field label="Descripción" htmlFor="tarea-desc" className="sm:col-span-2">
          <Textarea id="tarea-desc" rows={2} value={form.descripcion} onChange={set('descripcion')} placeholder="Detalle o criterio de aceptación" />
        </Field>
        <Field label="Estado" htmlFor="tarea-estado">
          <Select id="tarea-estado" value={form.estado} onChange={set('estado')} options={ESTADOS_TAREA.map((e) => ({ value: e.id, label: e.title }))} />
        </Field>
        <Field label="Prioridad" htmlFor="tarea-prioridad">
          <Select id="tarea-prioridad" value={form.prioridad} onChange={set('prioridad')} options={LISTA_PRIORIDADES} />
        </Field>
        <Field label="Responsable" htmlFor="tarea-responsable">
          <Select id="tarea-responsable" value={form.responsable} onChange={set('responsable')} placeholder="Sin asignar" options={opciones} />
        </Field>
        <Field label="Etiqueta" htmlFor="tarea-etiqueta">
          <Select id="tarea-etiqueta" value={form.etiqueta} onChange={set('etiqueta')} options={ETIQUETAS.includes(form.etiqueta) ? ETIQUETAS : [form.etiqueta, ...ETIQUETAS]} />
        </Field>
        <Field label="Fecha límite" htmlFor="tarea-fecha">
          <Input id="tarea-fecha" type="date" value={form.fechaLimite} onChange={set('fechaLimite')} />
        </Field>
      </form>
    </Modal>
  )
}
