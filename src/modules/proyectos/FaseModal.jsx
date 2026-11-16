import { useEffect, useState } from 'react'
import { Check, Trash2 } from 'lucide-react'
import { Button, Field, Input, Modal, Select, Slider } from '@/components/ui'
import { cn } from '@/lib/cn'
import { addDays, diffDays, toISODate, todayISO } from '@/lib/format'
import { dependeDe } from './cpm'

const VACIO = { nombre: '', inicio: '', fin: '', avance: 0, responsable: '', dependencias: [] }

/** Alta y edición de una fase del Gantt (fechas, avance y dependencias). */
export function FaseModal({ open, onClose, fase, fases, responsables, onSave, onDelete }) {
  const [form, setForm] = useState(VACIO)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!open) return
    setForm(fase ? { ...VACIO, ...fase, dependencias: fase.dependencias || [] } : { ...VACIO, inicio: todayISO(), fin: toISODate(addDays(new Date(), 6)) })
    setErrors({})
  }, [open, fase])

  const set = (campo) => (event) => setForm((f) => ({ ...f, [campo]: event.target.value }))
  const duracion = form.inicio && form.fin ? diffDays(form.inicio, form.fin) + 1 : 0

  // No se puede depender de una fase que (directa o indirectamente) depende de esta: formaría un ciclo
  const candidatas = fases.filter((f) => f.id !== fase?.id)
  const bloqueada = (otra) => Boolean(fase) && dependeDe(fases, otra.id, fase.id)

  const alternar = (id) =>
    setForm((f) => ({ ...f, dependencias: f.dependencias.includes(id) ? f.dependencias.filter((d) => d !== id) : [...f.dependencias, id] }))

  const submit = (event) => {
    event.preventDefault()
    const next = {}
    if (!form.nombre.trim()) next.nombre = 'Ingresá el nombre de la fase.'
    if (!form.inicio || !form.fin) next.fechas = 'Completá las dos fechas.'
    else if (form.fin < form.inicio) next.fechas = 'La fecha de fin no puede ser anterior al inicio.'
    setErrors(next)
    if (Object.keys(next).length) return
    const { id, createdAt, updatedAt, ...valores } = form
    onSave({ ...valores, nombre: form.nombre.trim(), avance: Number(form.avance) || 0 }, fase)
    onClose()
  }

  const opciones = form.responsable && !responsables.includes(form.responsable) ? [form.responsable, ...responsables] : responsables

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={fase ? 'Editar fase' : 'Nueva fase'}
      description="Las fechas y dependencias recalculan la ruta crítica automáticamente."
      footer={
        <>
          {fase && (
            <Button variant="ghost" icon={Trash2} className="text-danger-text hover:bg-danger-soft hover:text-danger-text sm:mr-auto" onClick={() => { onDelete(fase); onClose() }}>
              Eliminar
            </Button>
          )}
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="form-fase">
            {fase ? 'Guardar cambios' : 'Crear fase'}
          </Button>
        </>
      }
    >
      <form id="form-fase" onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2" noValidate>
        <Field label="Nombre de la fase" htmlFor="fase-nombre" required error={errors.nombre} className="sm:col-span-2">
          <Input id="fase-nombre" value={form.nombre} onChange={set('nombre')} placeholder="Ej.: Pruebas de aceptación" invalid={!!errors.nombre} maxLength={60} />
        </Field>
        <Field label="Inicio" htmlFor="fase-inicio" required>
          <Input id="fase-inicio" type="date" value={form.inicio} onChange={set('inicio')} invalid={!!errors.fechas} />
        </Field>
        <Field label="Fin" htmlFor="fase-fin" required error={errors.fechas} hint={duracion > 0 ? `Duración: ${duracion} ${duracion === 1 ? 'día' : 'días'}` : undefined}>
          <Input id="fase-fin" type="date" value={form.fin} min={form.inicio} onChange={set('fin')} invalid={!!errors.fechas} />
        </Field>
        <Field label="Responsable" htmlFor="fase-responsable" className="sm:col-span-2">
          <Select id="fase-responsable" value={form.responsable} onChange={set('responsable')} placeholder="Sin asignar" options={opciones} />
        </Field>
        <Slider label="Avance" value={Number(form.avance) || 0} onChange={(avance) => setForm((f) => ({ ...f, avance }))} min={0} max={100} step={5} format={(v) => `${v}%`} className="sm:col-span-2" />

        <fieldset className="sm:col-span-2">
          <legend className="text-[13px] font-medium text-fg">Depende de</legend>
          <p className="mb-2 text-xs text-fg-subtle">Fases que tienen que terminar antes de que empiece esta.</p>
          {candidatas.length === 0 ? (
            <p className="rounded-xl border border-dashed border-line-strong px-3 py-4 text-center text-xs text-fg-subtle">Todavía no hay otras fases.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {candidatas.map((otra) => {
                const marcada = form.dependencias.includes(otra.id)
                const deshabilitada = bloqueada(otra)
                return (
                  <button
                    key={otra.id}
                    type="button"
                    role="checkbox"
                    aria-checked={marcada}
                    disabled={deshabilitada}
                    title={deshabilitada ? 'Esa fase depende de esta: no se puede crear un ciclo' : undefined}
                    onClick={() => alternar(otra.id)}
                    className={cn(
                      'inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[13px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40',
                      marcada ? 'border-transparent bg-primary-soft text-primary-text' : 'border-line bg-surface text-fg-muted hover:border-line-strong hover:text-fg',
                    )}
                  >
                    {marcada && <Check size={13} aria-hidden="true" />}
                    {otra.nombre}
                  </button>
                )
              })}
            </div>
          )}
        </fieldset>
      </form>
    </Modal>
  )
}
