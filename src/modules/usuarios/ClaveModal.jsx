import { useEffect, useState } from 'react'
import { Lock } from 'lucide-react'
import { Avatar, Button, Field, Input, Modal } from '@/components/ui'
import { verificarClave } from '@/lib/clave'

/** Pide la contraseña de un usuario antes de entrar con su cuenta. */
export function ClaveModal({ open, usuario, onClose, onConfirm }) {
  const [clave, setClave] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setClave('')
      setError('')
    }
  }, [open, usuario])

  const submit = (event) => {
    event.preventDefault()
    if (!verificarClave(usuario, clave)) {
      setError('La contraseña no es correcta.')
      return
    }
    onConfirm(usuario)
  }

  return (
    <Modal
      open={open && Boolean(usuario)}
      onClose={onClose}
      size="sm"
      title="Ingresá tu contraseña"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="form-clave">
            Entrar
          </Button>
        </>
      }
    >
      <form id="form-clave" onSubmit={submit} className="space-y-4" noValidate>
        <div className="flex items-center gap-3 rounded-xl bg-surface-2/70 px-3.5 py-3">
          <Avatar name={usuario?.nombre} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-fg">{usuario?.nombre}</p>
            <p className="truncate text-xs text-fg-subtle">{usuario?.email}</p>
          </div>
        </div>
        <Field label="Contraseña" htmlFor="clave-input" error={error}>
          <Input id="clave-input" data-autofocus icon={Lock} type="password" autoComplete="current-password" value={clave} onChange={(e) => { setClave(e.target.value); setError('') }} invalid={!!error} />
        </Field>
      </form>
    </Modal>
  )
}
