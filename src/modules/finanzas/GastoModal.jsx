import { useEffect, useState } from 'react'
import { Button, Field, Input, Modal, MoneyInput, ProgressBar } from '@/components/ui'
import { formatGs, formatPercent } from '@/lib/format'

/** Registro rápido de un gasto: suma al ejecutado del departamento. */
export function GastoModal({ open, onClose, registro, onSave }) {
  const [monto, setMonto] = useState(0)
  const [concepto, setConcepto] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setMonto(0)
    setConcepto('')
    setError('')
  }, [open])

  if (!registro) return null
  const nuevoEjecutado = registro.ejecutado + monto
  const pct = registro.presupuesto ? (nuevoEjecutado / registro.presupuesto) * 100 : 0
  const excede = nuevoEjecutado > registro.presupuesto

  const submit = (event) => {
    event.preventDefault()
    if (!monto) return setError('Ingresá el monto del gasto.')
    onSave(registro, monto, concepto.trim())
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title="Registrar gasto"
      description={`Se suma al ejecutado de ${registro.departamento}.`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="form-gasto">
            Registrar gasto
          </Button>
        </>
      }
    >
      <form id="form-gasto" onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Monto" htmlFor="gasto-monto" required error={error}>
          <MoneyInput id="gasto-monto" value={monto} onChange={(v) => { setMonto(v); setError('') }} invalid={!!error} />
        </Field>
        <Field label="Concepto" htmlFor="gasto-concepto" hint="Opcional. Aparece en la actividad reciente.">
          <Input id="gasto-concepto" value={concepto} onChange={(e) => setConcepto(e.target.value)} placeholder="Ej.: Compra de insumos" maxLength={60} />
        </Field>
        <div className={`rounded-xl border p-4 ${excede ? 'border-danger/40 bg-danger-soft' : 'border-line bg-surface-2/60'}`} aria-live="polite">
          <div className="mb-2 flex items-center justify-between text-[13px]">
            <span className="text-fg-muted">Ejecución después del gasto</span>
            <span className={`font-semibold tabular-nums ${excede ? 'text-danger-text' : 'text-fg'}`}>{formatPercent(pct, 1)}</span>
          </div>
          <ProgressBar value={pct} tone="auto" label="Ejecución después del gasto" />
          <p className={`mt-2 text-xs ${excede ? 'font-medium text-danger-text' : 'text-fg-subtle'}`}>
            {excede ? `Atención: el departamento queda excedido en ${formatGs(nuevoEjecutado - registro.presupuesto)}.` : `Saldo restante: ${formatGs(registro.presupuesto - nuevoEjecutado)}`}
          </p>
        </div>
      </form>
    </Modal>
  )
}
