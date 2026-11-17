import { useEffect, useState } from 'react'
import { Building2, MapPin, Trash2 } from 'lucide-react'
import { Button, Field, Input, Modal, Textarea } from '@/components/ui'

const VACIA = { nombre: '', rubro: '', ciudad: '', descripcion: '' }

/** Alta y edición de una empresa para analizar en la matriz FODA. */
export function EmpresaModal({ open, onClose, empresa, existentes, cantidadItems = 0, onSave, onDelete }) {
  const [form, setForm] = useState(VACIA)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setForm(empresa ? { ...VACIA, ...empresa } : VACIA)
    setError('')
  }, [open, empresa])

  const set = (campo) => (event) => setForm((f) => ({ ...f, [campo]: event.target.value }))

  const submit = (event) => {
    event.preventDefault()
    const nombre = form.nombre.trim()
    if (!nombre) return setError('Ingresá el nombre de la empresa.')
    if (existentes.some((e) => e.id !== empresa?.id && e.nombre.trim().toLowerCase() === nombre.toLowerCase())) return setError('Ya existe una empresa con ese nombre.')
    onSave({ nombre, rubro: form.rubro.trim(), ciudad: form.ciudad.trim(), descripcion: form.descripcion.trim() }, empresa)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={empresa ? 'Editar empresa' : 'Nueva empresa'}
      description={empresa ? 'Actualizá los datos de la empresa analizada.' : 'Se crea con la matriz FODA vacía, lista para completar.'}
      footer={
        <>
          {empresa && (
            <Button variant="ghost" icon={Trash2} className="text-danger-text hover:bg-danger-soft hover:text-danger-text sm:mr-auto" onClick={() => { onDelete(empresa, cantidadItems); onClose() }}>
              Eliminar
            </Button>
          )}
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="form-empresa">
            {empresa ? 'Guardar cambios' : 'Crear empresa'}
          </Button>
        </>
      }
    >
      <form id="form-empresa" onSubmit={submit} className="grid gap-4 sm:grid-cols-2" noValidate>
        <Field label="Nombre de la empresa" htmlFor="empresa-nombre" required error={error} className="sm:col-span-2">
          <Input id="empresa-nombre" icon={Building2} value={form.nombre} onChange={set('nombre')} placeholder="Ej.: Lácteos del Sur S.A." invalid={!!error} maxLength={80} autoComplete="off" />
        </Field>
        <Field label="Rubro" htmlFor="empresa-rubro">
          <Input id="empresa-rubro" value={form.rubro} onChange={set('rubro')} placeholder="Ej.: Industria láctea" maxLength={60} />
        </Field>
        <Field label="Ciudad" htmlFor="empresa-ciudad">
          <Input id="empresa-ciudad" icon={MapPin} value={form.ciudad} onChange={set('ciudad')} placeholder="Ej.: Encarnación" maxLength={40} />
        </Field>
        <Field label="Descripción" htmlFor="empresa-desc" hint="Opcional. Contexto para quien lea el análisis." className="sm:col-span-2">
          <Textarea id="empresa-desc" rows={3} value={form.descripcion} onChange={set('descripcion')} placeholder="¿A qué se dedica y cuál es su situación actual?" maxLength={240} />
        </Field>
      </form>
    </Modal>
  )
}
