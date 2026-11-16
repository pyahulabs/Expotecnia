import { useEffect, useState } from 'react'
import { Building2, Trash2 } from 'lucide-react'
import { Button, Field, Input, Modal, MoneyInput, ProgressBar } from '@/components/ui'
import { DEPARTAMENTOS } from '@/config/constants'
import { formatGs, formatPercent } from '@/lib/format'

const VACIO = { departamento: '', presupuesto: 0, ejecutado: 0 }

/** Alta y edición del presupuesto de un departamento. */
export function PresupuestoModal({ open, onClose, registro, existentes, onSave, onDelete }) {
  const [form, setForm] = useState(VACIO)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!open) return
    setForm(registro ? { ...VACIO, ...registro } : VACIO)
    setErrors({})
  }, [open, registro])

  const pct = form.presupuesto > 0 ? (form.ejecutado / form.presupuesto) * 100 : 0
  const diferencia = form.presupuesto - form.ejecutado
  const sugerencias = DEPARTAMENTOS.filter((d) => !existentes.includes(d))

  const submit = (event) => {
    event.preventDefault()
    const next = {}
    const nombre = form.departamento.trim()
    if (!nombre) next.departamento = 'Ingresá el nombre del departamento.'
    else if (!registro && existentes.some((d) => d.toLowerCase() === nombre.toLowerCase())) next.departamento = 'Ese departamento ya tiene presupuesto asignado.'
    if (!form.presupuesto) next.presupuesto = 'Ingresá un monto mayor a cero.'
    setErrors(next)
    if (Object.keys(next).length) return
    onSave({ departamento: nombre, presupuesto: form.presupuesto, ejecutado: form.ejecutado || 0 }, registro)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={registro ? `Editar ${registro.departamento}` : 'Nuevo presupuesto'}
      description="Montos anuales en guaraníes."
      footer={
        <>
          {registro && (
            <Button variant="ghost" icon={Trash2} className="text-danger-text hover:bg-danger-soft hover:text-danger-text sm:mr-auto" onClick={() => { onDelete(registro); onClose() }}>
              Eliminar
            </Button>
          )}
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="form-presupuesto">
            {registro ? 'Guardar cambios' : 'Crear presupuesto'}
          </Button>
        </>
      }
    >
      <form id="form-presupuesto" onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2" noValidate>
        <Field label="Departamento" htmlFor="pres-depto" required error={errors.departamento} className="sm:col-span-2">
          <Input id="pres-depto" icon={Building2} list="pres-deptos" value={form.departamento} onChange={(e) => setForm((f) => ({ ...f, departamento: e.target.value }))} placeholder="Ej.: Logística" invalid={!!errors.departamento} autoComplete="off" />
          <datalist id="pres-deptos">
            {sugerencias.map((d) => (
              <option key={d} value={d} />
            ))}
          </datalist>
        </Field>
        <Field label="Presupuesto anual" htmlFor="pres-monto" required error={errors.presupuesto}>
          <MoneyInput id="pres-monto" value={form.presupuesto} onChange={(presupuesto) => setForm((f) => ({ ...f, presupuesto }))} invalid={!!errors.presupuesto} />
        </Field>
        <Field label="Ejecutado a la fecha" htmlFor="pres-ejecutado">
          <MoneyInput id="pres-ejecutado" value={form.ejecutado} onChange={(ejecutado) => setForm((f) => ({ ...f, ejecutado }))} />
        </Field>

        <div className="rounded-xl border border-line bg-surface-2/60 p-4 sm:col-span-2" aria-live="polite">
          <div className="mb-2 flex items-center justify-between text-[13px]">
            <span className="text-fg-muted">Ejecución</span>
            <span className={`font-semibold tabular-nums ${pct > 100 ? 'text-danger-text' : 'text-fg'}`}>{formatPercent(pct, 1)}</span>
          </div>
          <ProgressBar value={pct} tone="auto" label="Porcentaje de ejecución" />
          <p className="mt-2 text-xs text-fg-subtle">
            {diferencia >= 0 ? `Saldo disponible: ${formatGs(diferencia)}` : `Excedido en ${formatGs(Math.abs(diferencia))}`}
          </p>
        </div>
      </form>
    </Modal>
  )
}
