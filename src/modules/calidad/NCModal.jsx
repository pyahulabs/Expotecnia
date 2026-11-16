import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button, Field, Input, Modal, Select, Textarea } from '@/components/ui'
import { DEPARTAMENTOS, LISTA_PRIORIDADES } from '@/config/constants'
import { todayISO } from '@/lib/format'
import { ESTADOS_NC } from './estados'

const VACIO = { titulo: '', descripcion: '', estado: 'abierto', prioridad: 'Media', responsable: '', area: 'Calidad', fecha: '' }

/** Alta y edición de una no conformidad. */
export function NCModal({ open, onClose, nc, estadoInicial, codigo, responsables, onSave, onDelete }) {
  const [form, setForm] = useState(VACIO)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setForm(nc ? { ...VACIO, ...nc } : { ...VACIO, estado: estadoInicial || 'abierto', fecha: todayISO() })
    setError('')
  }, [open, nc, estadoInicial])

  const set = (campo) => (event) => setForm((f) => ({ ...f, [campo]: event.target.value }))

  const submit = (event) => {
    event.preventDefault()
    if (!form.titulo.trim()) return setError('Describí brevemente el problema detectado.')
    const { id, createdAt, updatedAt, ...valores } = form
    onSave({ ...valores, titulo: form.titulo.trim(), descripcion: form.descripcion.trim() }, nc)
    onClose()
  }

  // Si el responsable guardado ya no está en la lista de empleados, igual se muestra
  const opciones = form.responsable && !responsables.includes(form.responsable) ? [form.responsable, ...responsables] : responsables

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={nc ? `Editar ${nc.codigo}` : 'Nueva no conformidad'}
      description={nc ? 'Actualizá el estado, la prioridad o el responsable.' : `Se registrará con el código ${codigo}.`}
      footer={
        <>
          {nc && (
            <Button variant="ghost" icon={Trash2} className="text-danger-text hover:bg-danger-soft hover:text-danger-text sm:mr-auto" onClick={() => { onDelete(nc); onClose() }}>
              Eliminar
            </Button>
          )}
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="form-nc">
            {nc ? 'Guardar cambios' : 'Registrar'}
          </Button>
        </>
      }
    >
      <form id="form-nc" onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2" noValidate>
        <Field label="Título" htmlFor="nc-titulo" required error={error} className="sm:col-span-2">
          <Input id="nc-titulo" value={form.titulo} onChange={set('titulo')} placeholder="Ej.: Producto fuera de especificación" invalid={!!error} maxLength={90} />
        </Field>
        <Field label="Descripción" htmlFor="nc-desc" className="sm:col-span-2">
          <Textarea id="nc-desc" value={form.descripcion} onChange={set('descripcion')} placeholder="¿Qué pasó, dónde y cómo se detectó?" />
        </Field>
        <Field label="Prioridad" htmlFor="nc-prioridad">
          <Select id="nc-prioridad" value={form.prioridad} onChange={set('prioridad')} options={LISTA_PRIORIDADES} />
        </Field>
        <Field label="Estado" htmlFor="nc-estado">
          <Select id="nc-estado" value={form.estado} onChange={set('estado')} options={ESTADOS_NC.map((e) => ({ value: e.id, label: e.title }))} />
        </Field>
        <Field label="Responsable" htmlFor="nc-responsable">
          <Select id="nc-responsable" value={form.responsable} onChange={set('responsable')} placeholder="Sin asignar" options={opciones} />
        </Field>
        <Field label="Área" htmlFor="nc-area">
          <Select id="nc-area" value={form.area} onChange={set('area')} options={DEPARTAMENTOS} />
        </Field>
        <Field label="Fecha de detección" htmlFor="nc-fecha">
          <Input id="nc-fecha" type="date" value={form.fecha} onChange={set('fecha')} max={todayISO()} />
        </Field>
      </form>
    </Modal>
  )
}
