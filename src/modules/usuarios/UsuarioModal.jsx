import { useEffect, useState } from 'react'
import { Briefcase, Mail, ShieldAlert, Trash2, User } from 'lucide-react'
import { Button, Field, Input, Modal, Select } from '@/components/ui'
import { LISTA_ROLES, ROLES } from '@/config/constants'
import { emailEnUso, esUltimoAdmin } from './reglas'

const VACIO = { nombre: '', email: '', cargo: '', rol: 'Editor', estado: 'Activo' }

/** Alta y edición de usuarios del sistema. */
export function UsuarioModal({ open, onClose, usuario, usuarios, esActual, onSave, onDelete }) {
  const [form, setForm] = useState(VACIO)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!open) return
    setForm(usuario ? { ...VACIO, ...usuario } : VACIO)
    setErrors({})
  }, [open, usuario])

  const set = (campo) => (event) => setForm((f) => ({ ...f, [campo]: event.target.value }))
  // El único administrador activo no puede perder el rol ni quedar inactivo
  const protegido = Boolean(usuario) && esUltimoAdmin(usuarios, usuario)
  const bloqueoEliminar = esActual ? 'No podés eliminar tu propio usuario.' : protegido ? 'Es el único administrador activo.' : ''

  const submit = (event) => {
    event.preventDefault()
    const next = {}
    if (!form.nombre.trim()) next.nombre = 'Ingresá el nombre completo.'
    if (!form.email.trim()) next.email = 'Ingresá el correo electrónico.'
    else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = 'El correo no tiene un formato válido.'
    else if (emailEnUso(usuarios, form.email, usuario?.id)) next.email = 'Ya existe un usuario con ese correo.'
    if (protegido && (form.rol !== 'Administrador' || form.estado === 'Inactivo')) next.rol = 'Tiene que quedar al menos un administrador activo.'
    setErrors(next)
    if (Object.keys(next).length) return
    const { id, createdAt, updatedAt, ultimoAcceso, ...valores } = form
    onSave({ ...valores, nombre: form.nombre.trim(), email: form.email.trim(), cargo: form.cargo.trim() }, usuario)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={usuario ? 'Editar usuario' : 'Nuevo usuario'}
      description={usuario ? 'Cambiá los datos, el rol o el estado de la cuenta.' : 'La persona podrá ingresar eligiéndose en la pantalla de bienvenida.'}
      footer={
        <>
          {usuario && (
            <Button
              variant="ghost"
              icon={Trash2}
              disabled={Boolean(bloqueoEliminar)}
              title={bloqueoEliminar || undefined}
              className="text-danger-text hover:bg-danger-soft hover:text-danger-text sm:mr-auto"
              onClick={() => { onDelete(usuario); onClose() }}
            >
              Eliminar
            </Button>
          )}
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="form-usuario">
            {usuario ? 'Guardar cambios' : 'Crear usuario'}
          </Button>
        </>
      }
    >
      <form id="form-usuario" onSubmit={submit} className="grid gap-4 sm:grid-cols-2" noValidate>
        <Field label="Nombre completo" htmlFor="usr-nombre" required error={errors.nombre} className="sm:col-span-2">
          <Input id="usr-nombre" icon={User} value={form.nombre} onChange={set('nombre')} placeholder="Ej.: Lucía Fernández" invalid={!!errors.nombre} autoComplete="off" maxLength={80} />
        </Field>
        <Field label="Correo electrónico" htmlFor="usr-email" required error={errors.email}>
          <Input id="usr-email" icon={Mail} type="email" value={form.email} onChange={set('email')} placeholder="nombre@empresa.com.py" invalid={!!errors.email} autoComplete="off" />
        </Field>
        <Field label="Cargo" htmlFor="usr-cargo">
          <Input id="usr-cargo" icon={Briefcase} value={form.cargo} onChange={set('cargo')} placeholder="Ej.: Analista de Compras" maxLength={60} />
        </Field>
        <Field label="Rol" htmlFor="usr-rol" error={errors.rol} hint={ROLES[form.rol]?.descripcion}>
          <Select id="usr-rol" value={form.rol} onChange={set('rol')} options={LISTA_ROLES} invalid={!!errors.rol} />
        </Field>
        <Field label="Estado" htmlFor="usr-estado" hint="Un usuario inactivo no aparece en la pantalla de ingreso.">
          <Select id="usr-estado" value={form.estado} onChange={set('estado')} options={['Activo', 'Inactivo']} />
        </Field>
        {(protegido || esActual) && (
          <p className="flex items-start gap-2 rounded-xl bg-info-soft px-3 py-2.5 text-xs leading-5 text-info-text sm:col-span-2">
            <ShieldAlert size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
            {esActual ? 'Es tu usuario actual: los cambios se reflejan en tu sesión al guardar.' : 'Es el único administrador activo: no se puede degradar ni desactivar.'}
          </p>
        )}
      </form>
    </Modal>
  )
}
