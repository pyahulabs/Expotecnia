import { useEffect, useState } from 'react'
import { Briefcase, Phone, User } from 'lucide-react'
import { Avatar, Badge, Button, Field, Input, Modal, Select } from '@/components/ui'
import { DEPARTAMENTOS, ROLES } from '@/config/constants'

const CAMPOS = ['nombre', 'cargo', 'departamento', 'telefono', 'fechaIngreso']

/** «Mi perfil»: cada persona completa sus propios datos (el correo y el rol los define un Administrador). */
export function PerfilModal({ open, usuario, onClose, onSave }) {
  const [form, setForm] = useState({})
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open || !usuario) return
    setForm(Object.fromEntries(CAMPOS.map((c) => [c, usuario[c] || ''])))
    setError('')
  }, [open, usuario])

  const set = (campo) => (event) => setForm((f) => ({ ...f, [campo]: event.target.value }))

  const submit = (event) => {
    event.preventDefault()
    if (!form.nombre?.trim()) return setError('Ingresá tu nombre.')
    onSave({ ...form, nombre: form.nombre.trim(), cargo: form.cargo.trim(), telefono: form.telefono.trim() })
    onClose()
  }

  return (
    <Modal
      open={open && Boolean(usuario)}
      onClose={onClose}
      title="Mi perfil"
      description="Estos datos se ven en la página Usuarios."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="form-perfil">
            Guardar perfil
          </Button>
        </>
      }
    >
      <form id="form-perfil" onSubmit={submit} className="grid gap-4 sm:grid-cols-2" noValidate>
        <div className="flex items-center gap-3 rounded-xl bg-surface-2/70 px-3.5 py-3 sm:col-span-2">
          <Avatar name={form.nombre || usuario?.nombre} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-fg">{usuario?.email}</p>
            <p className="mt-1">
              <Badge tone={ROLES[usuario?.rol]?.tone || 'neutral'} size="sm">
                {usuario?.rol}
              </Badge>
            </p>
          </div>
        </div>
        <Field label="Nombre completo" htmlFor="perfil-nombre" required error={error} className="sm:col-span-2">
          <Input id="perfil-nombre" icon={User} value={form.nombre || ''} onChange={set('nombre')} invalid={!!error} maxLength={80} autoComplete="off" />
        </Field>
        <Field label="Cargo" htmlFor="perfil-cargo">
          <Input id="perfil-cargo" icon={Briefcase} value={form.cargo || ''} onChange={set('cargo')} placeholder="Ej.: Analista" maxLength={60} />
        </Field>
        <Field label="Departamento" htmlFor="perfil-depto">
          <Select id="perfil-depto" value={form.departamento || ''} onChange={set('departamento')} placeholder="Sin asignar" options={DEPARTAMENTOS} />
        </Field>
        <Field label="Teléfono" htmlFor="perfil-tel">
          <Input id="perfil-tel" icon={Phone} value={form.telefono || ''} onChange={set('telefono')} placeholder="0981 123 456" inputMode="tel" maxLength={20} />
        </Field>
        <Field label="Fecha de ingreso" htmlFor="perfil-ingreso">
          <Input id="perfil-ingreso" type="date" value={form.fechaIngreso || ''} onChange={set('fechaIngreso')} max={new Date().toISOString().slice(0, 10)} />
        </Field>
      </form>
    </Modal>
  )
}
