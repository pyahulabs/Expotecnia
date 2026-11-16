import { useEffect, useState } from 'react'
import { Briefcase, Mail, Phone, User } from 'lucide-react'
import { Button, Field, Input, Modal, Select } from '@/components/ui'
import { DEPARTAMENTOS, ESTADOS_EMPLEADO } from '@/config/constants'
import { todayISO } from '@/lib/format'

const VACIO = { nombre: '', cargo: '', departamento: DEPARTAMENTOS[5], email: '', telefono: '', fechaIngreso: '', estado: 'Activo' }

/** Alta y edición de empleados (ABM). Si recibe `empleado`, edita; si no, crea. */
export function EmpleadoModal({ open, onClose, empleado, onSave }) {
  const [form, setForm] = useState(VACIO)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!open) return
    setForm(empleado ? { ...VACIO, ...empleado } : { ...VACIO, fechaIngreso: todayISO() })
    setErrors({})
  }, [open, empleado])

  const set = (campo) => (event) => setForm((f) => ({ ...f, [campo]: event.target.value }))

  const submit = (event) => {
    event.preventDefault()
    const next = {}
    if (!form.nombre.trim()) next.nombre = 'Ingresá el nombre completo.'
    if (!form.cargo.trim()) next.cargo = 'Ingresá el cargo.'
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'El correo no tiene un formato válido.'
    setErrors(next)
    if (Object.keys(next).length) return
    const { id, createdAt, updatedAt, ...valores } = form
    onSave({ ...valores, nombre: form.nombre.trim(), cargo: form.cargo.trim() }, empleado?.id)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={empleado ? 'Editar empleado' : 'Nuevo empleado'}
      description={empleado ? 'Actualizá los datos del legajo.' : 'Completá los datos para dar de alta el legajo.'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="form-empleado">
            {empleado ? 'Guardar cambios' : 'Crear empleado'}
          </Button>
        </>
      }
    >
      <form id="form-empleado" onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2" noValidate>
        <Field label="Nombre completo" htmlFor="emp-nombre" required error={errors.nombre} className="sm:col-span-2">
          <Input id="emp-nombre" icon={User} value={form.nombre} onChange={set('nombre')} placeholder="Ej.: Ana Lucía Fernández" invalid={!!errors.nombre} autoComplete="off" />
        </Field>
        <Field label="Cargo" htmlFor="emp-cargo" required error={errors.cargo}>
          <Input id="emp-cargo" icon={Briefcase} value={form.cargo} onChange={set('cargo')} placeholder="Ej.: Analista de Compras" invalid={!!errors.cargo} />
        </Field>
        <Field label="Departamento" htmlFor="emp-depto">
          <Select id="emp-depto" value={form.departamento} onChange={set('departamento')} options={DEPARTAMENTOS} />
        </Field>
        <Field label="Correo electrónico" htmlFor="emp-email" error={errors.email}>
          <Input id="emp-email" icon={Mail} type="email" value={form.email} onChange={set('email')} placeholder="nombre@empresa.com.py" invalid={!!errors.email} />
        </Field>
        <Field label="Teléfono" htmlFor="emp-tel">
          <Input id="emp-tel" icon={Phone} value={form.telefono} onChange={set('telefono')} placeholder="0981 123 456" inputMode="tel" />
        </Field>
        <Field label="Fecha de ingreso" htmlFor="emp-ingreso">
          <Input id="emp-ingreso" type="date" value={form.fechaIngreso} onChange={set('fechaIngreso')} max={todayISO()} />
        </Field>
        <Field label="Estado" htmlFor="emp-estado">
          <Select id="emp-estado" value={form.estado} onChange={set('estado')} options={Object.keys(ESTADOS_EMPLEADO)} />
        </Field>
      </form>
    </Modal>
  )
}
