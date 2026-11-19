import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Banknote, HandCoins, Landmark, Pencil, PiggyBank, Plus, ReceiptText, TriangleAlert, Wallet } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge, Button, Card, EmptyState, IconButton, Loading, ProgressBar, SkeletonTable, StatCard, Table, TBody, TD, TH, THead, Tooltip, toast } from '@/components/ui'
import { COLECCIONES } from '@/config/constants'
import { logActivity, useCollection } from '@/firebase/hooks'
import { cn } from '@/lib/cn'
import { formatGs, formatGsCompact, formatPercent, sum } from '@/lib/format'
import { ease, fadeUp, stagger } from '@/lib/motion'
import { PresupuestoModal } from './PresupuestoModal'
import { GastoModal } from './GastoModal'

/** Estado de un departamento según su % de ejecución. */
const estadoDe = (pct) => {
  if (pct > 100) return { label: 'Excedido', tone: 'danger' }
  if (pct >= 90) return { label: 'Al límite', tone: 'warning' }
  return { label: 'En regla', tone: 'success' }
}

function Diferencia({ valor, className }) {
  return (
    <span className={cn('whitespace-nowrap tabular-nums', valor < 0 ? 'font-semibold text-danger-text' : 'text-success-text', className)}>
      {valor > 0 ? '+' : ''}
      {formatGs(valor)}
    </span>
  )
}

function Ejecucion({ pct, departamento }) {
  return (
    <div className="flex min-w-36 items-center gap-3">
      <ProgressBar value={pct} tone="auto" label={`Ejecución de ${departamento}`} className="flex-1" />
      <span className={cn('w-14 text-right text-[13px] font-semibold tabular-nums', pct > 100 ? 'text-danger-text' : 'text-fg')}>{formatPercent(pct, 1)}</span>
    </div>
  )
}

export default function FinanzasPage() {
  const { data, loading, add, update, remove } = useCollection(COLECCIONES.presupuestos, { orderBy: 'presupuesto', direction: 'desc' })
  const [modal, setModal] = useState({ open: false, registro: null })
  const [gasto, setGasto] = useState({ open: false, registro: null })

  const filas = useMemo(
    () =>
      data.map((p) => {
        const presupuesto = Number(p.presupuesto) || 0
        const ejecutado = Number(p.ejecutado) || 0
        return { ...p, presupuesto, ejecutado, diferencia: presupuesto - ejecutado, pct: presupuesto ? (ejecutado / presupuesto) * 100 : 0 }
      }),
    [data],
  )

  const totales = useMemo(() => {
    const presupuesto = sum(filas.map((f) => f.presupuesto))
    const ejecutado = sum(filas.map((f) => f.ejecutado))
    return { presupuesto, ejecutado, diferencia: presupuesto - ejecutado, pct: presupuesto ? (ejecutado / presupuesto) * 100 : 0 }
  }, [filas])

  const excedidos = filas.filter((f) => f.pct > 100)

  const guardar = (valores, original) => {
    if (original) {
      update(original.id, valores)
      logActivity('Finanzas', `actualizó el presupuesto de ${valores.departamento}`, 'editar')
      toast.success('Presupuesto actualizado', `${valores.departamento}: ${formatGs(valores.presupuesto)}`)
    } else {
      add({ ...valores, periodo: String(new Date().getFullYear()) })
      logActivity('Finanzas', `asignó ${formatGs(valores.presupuesto)} de presupuesto a ${valores.departamento}`, 'crear')
      toast.success('Presupuesto creado', `${valores.departamento}: ${formatGs(valores.presupuesto)}`)
    }
  }

  const eliminar = (registro) => {
    remove(registro.id)
    logActivity('Finanzas', `eliminó el presupuesto de ${registro.departamento}`, 'eliminar')
    toast.info('Presupuesto eliminado', registro.departamento)
  }

  const registrarGasto = (registro, monto, concepto) => {
    const ejecutado = registro.ejecutado + monto
    update(registro.id, { ejecutado })
    logActivity('Finanzas', `registró un gasto de ${formatGs(monto)} en ${registro.departamento}${concepto ? ` (${concepto})` : ''}`, 'editar')
    if (ejecutado > registro.presupuesto) {
      toast.warning(`${registro.departamento} superó su presupuesto`, `Excedido en ${formatGs(ejecutado - registro.presupuesto)}.`)
    } else {
      toast.success('Gasto registrado', `${registro.departamento}: ${formatGs(monto)}`)
    }
  }

  const acciones = (fila) => (
    <div className="flex justify-end">
      <IconButton icon={ReceiptText} size="sm" label={`Registrar gasto en ${fila.departamento}`} onClick={() => setGasto({ open: true, registro: fila })} />
      <IconButton icon={Pencil} size="sm" label={`Editar ${fila.departamento}`} onClick={() => setModal({ open: true, registro: fila })} />
    </div>
  )

  return (
    <>
      <PageHeader
        eyebrow="Gestión financiera"
        title="Presupuesto vs. ejecutado"
        description={`Control presupuestario por departamento del ejercicio ${new Date().getFullYear()}, en guaraníes.`}
        actions={
          <Button icon={Plus} onClick={() => setModal({ open: true, registro: null })}>
            Nuevo presupuesto
          </Button>
        }
      />

      <motion.div variants={stagger(0.06)} initial="hidden" animate="show" className="space-y-4 lg:space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard loading={loading} icon={Landmark} label="Presupuesto total" value={totales.presupuesto} format={formatGsCompact} hint={`${filas.length} departamentos`} />
          <StatCard loading={loading} icon={Banknote} tone="info" label="Ejecutado" value={totales.ejecutado} format={formatGsCompact} hint={`${formatPercent(totales.pct, 1)} del presupuesto`} />
          <StatCard loading={loading} icon={PiggyBank} tone="success" label="Saldo disponible" value={totales.diferencia} format={formatGsCompact} hint="Presupuesto menos ejecutado" />
          <StatCard loading={loading} icon={TriangleAlert} tone={excedidos.length ? 'danger' : 'success'} label="Áreas excedidas" value={excedidos.length} hint={excedidos.length ? 'Requieren reasignación' : 'Todo dentro del presupuesto'} />
        </div>

        {/* Alerta de exceso */}
        <AnimatePresence initial={false}>
          {!loading && excedidos.length > 0 && (
            <motion.div
              role="alert"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease }}
              className="overflow-hidden"
            >
              <div className="flex items-start gap-3 rounded-2xl border border-danger/30 bg-danger-soft px-4 py-3.5 sm:px-5">
                <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-danger text-white">
                  <TriangleAlert size={16} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-danger-text">
                    {excedidos.length === 1 ? '1 departamento superó su presupuesto' : `${excedidos.length} departamentos superaron su presupuesto`}
                  </p>
                  <p className="mt-0.5 text-[13px] leading-5 text-fg-muted">
                    {excedidos.map((f, i) => (
                      <span key={f.id}>
                        {i > 0 && ' · '}
                        <span className="font-medium text-fg">{f.departamento}</span> excedido en {formatGs(Math.abs(f.diferencia))}
                      </span>
                    ))}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Card variants={fadeUp} className="overflow-hidden">
          <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6">
            <div>
              <h2 className="text-[15px] font-semibold text-fg">Detalle por departamento</h2>
              <p className="mt-0.5 text-[13px] text-fg-muted">Los totales y porcentajes se calculan automáticamente.</p>
            </div>
            <Badge tone={totales.pct > 100 ? 'danger' : totales.pct >= 90 ? 'warning' : 'success'} dot className="hidden sm:inline-flex">
              Ejecución global {formatPercent(totales.pct, 1)}
            </Badge>
          </div>

          <div className="border-t border-line">
            {loading ? (
              <Loading label="Cargando presupuestos…">
                <SkeletonTable rows={6} />
              </Loading>
            ) : filas.length === 0 ? (
              <EmptyState
                icon={Wallet}
                title="Todavía no hay presupuestos"
                demo
                description="Asigná un presupuesto anual a cada departamento para controlar su ejecución."
                action={
                  <Button icon={Plus} onClick={() => setModal({ open: true, registro: null })}>
                    Nuevo presupuesto
                  </Button>
                }
              />
            ) : (
              <>
                {/* Escritorio y tablet: tabla */}
                <div className="hidden md:block">
                  <Table aria-label="Presupuesto y ejecución por departamento">
                    <THead>
                      <tr>
                        <TH>Departamento</TH>
                        <TH align="right">Presupuesto</TH>
                        <TH align="right">Ejecutado</TH>
                        <TH align="right" className="hidden lg:table-cell">Diferencia</TH>
                        <TH>% de ejecución</TH>
                        <TH className="hidden xl:table-cell">Estado</TH>
                        <TH align="right">
                          <span className="sr-only">Acciones</span>
                        </TH>
                      </tr>
                    </THead>
                    <TBody>
                      {filas.map((fila) => {
                        const estado = estadoDe(fila.pct)
                        const excedido = fila.pct > 100
                        return (
                          <tr key={fila.id} className={cn('transition-colors duration-100', excedido ? 'bg-danger-soft/50 hover:bg-danger-soft' : 'hover:bg-surface-2/60')}>
                            <TD className={cn(excedido && 'shadow-[inset_3px_0_0_var(--danger)]')}>
                              <span className="flex items-center gap-2 font-medium text-fg">
                                {fila.departamento}
                                {excedido && (
                                  <Tooltip content={`Excedido en ${formatGs(Math.abs(fila.diferencia))}`}>
                                    <TriangleAlert size={15} className="text-danger-text" aria-label="Presupuesto excedido" tabIndex={0} />
                                  </Tooltip>
                                )}
                              </span>
                            </TD>
                            <TD align="right" className="whitespace-nowrap text-fg-muted">{formatGs(fila.presupuesto)}</TD>
                            <TD align="right" className={cn('whitespace-nowrap', excedido ? 'font-semibold text-danger-text' : 'text-fg')}>{formatGs(fila.ejecutado)}</TD>
                            <TD align="right" className="hidden lg:table-cell">
                              <Diferencia valor={fila.diferencia} />
                            </TD>
                            <TD>
                              <Ejecucion pct={fila.pct} departamento={fila.departamento} />
                            </TD>
                            <TD className="hidden xl:table-cell">
                              <Badge tone={estado.tone} dot>
                                {estado.label}
                              </Badge>
                            </TD>
                            <TD align="right">{acciones(fila)}</TD>
                          </tr>
                        )
                      })}
                    </TBody>
                    <tfoot className="border-t-2 border-line-strong bg-surface-2/60">
                      <tr>
                        <TD className="font-semibold">Total general</TD>
                        <TD align="right" className="whitespace-nowrap font-semibold">{formatGs(totales.presupuesto)}</TD>
                        <TD align="right" className="whitespace-nowrap font-semibold">{formatGs(totales.ejecutado)}</TD>
                        <TD align="right" className="hidden lg:table-cell">
                          <Diferencia valor={totales.diferencia} className="font-semibold" />
                        </TD>
                        <TD>
                          <Ejecucion pct={totales.pct} departamento="total general" />
                        </TD>
                        <TD className="hidden xl:table-cell" />
                        <TD />
                      </tr>
                    </tfoot>
                  </Table>
                </div>

                {/* Celular: una tarjeta por departamento */}
                <ul className="divide-y divide-line md:hidden">
                  {filas.map((fila) => {
                    const estado = estadoDe(fila.pct)
                    return (
                      <li key={fila.id} className={cn('px-5 py-4', fila.pct > 100 && 'bg-danger-soft/50 shadow-[inset_3px_0_0_var(--danger)]')}>
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-medium text-fg">{fila.departamento}</p>
                          <div className="flex items-center gap-1">
                            <Badge tone={estado.tone} dot size="sm">
                              {estado.label}
                            </Badge>
                            {acciones(fila)}
                          </div>
                        </div>
                        <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[13px]">
                          <dt className="text-fg-subtle">Presupuesto</dt>
                          <dd className="text-right tabular-nums text-fg-muted">{formatGs(fila.presupuesto)}</dd>
                          <dt className="text-fg-subtle">Ejecutado</dt>
                          <dd className={cn('text-right tabular-nums', fila.pct > 100 ? 'font-semibold text-danger-text' : 'text-fg')}>{formatGs(fila.ejecutado)}</dd>
                          <dt className="text-fg-subtle">Diferencia</dt>
                          <dd className="text-right">
                            <Diferencia valor={fila.diferencia} />
                          </dd>
                        </dl>
                        <div className="mt-3">
                          <Ejecucion pct={fila.pct} departamento={fila.departamento} />
                        </div>
                      </li>
                    )
                  })}
                  <li className="bg-surface-2/60 px-5 py-4">
                    <p className="font-semibold text-fg">Total general</p>
                    <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[13px]">
                      <dt className="text-fg-subtle">Presupuesto</dt>
                      <dd className="text-right font-semibold tabular-nums">{formatGs(totales.presupuesto)}</dd>
                      <dt className="text-fg-subtle">Ejecutado</dt>
                      <dd className="text-right font-semibold tabular-nums">{formatGs(totales.ejecutado)}</dd>
                      <dt className="text-fg-subtle">Diferencia</dt>
                      <dd className="text-right">
                        <Diferencia valor={totales.diferencia} className="font-semibold" />
                      </dd>
                    </dl>
                    <div className="mt-3">
                      <Ejecucion pct={totales.pct} departamento="total general" />
                    </div>
                  </li>
                </ul>
              </>
            )}
          </div>
        </Card>

        <motion.p variants={fadeUp} className="flex items-center gap-2 text-xs text-fg-subtle">
          <HandCoins size={14} aria-hidden="true" />
          Usá el ícono de recibo para registrar un gasto: se suma al ejecutado y, si supera el presupuesto, la fila se marca en rojo.
        </motion.p>
      </motion.div>

      <PresupuestoModal
        open={modal.open}
        registro={modal.registro}
        existentes={filas.map((f) => f.departamento)}
        onClose={() => setModal((m) => ({ ...m, open: false }))}
        onSave={guardar}
        onDelete={eliminar}
      />
      <GastoModal open={gasto.open} registro={gasto.registro} onClose={() => setGasto((g) => ({ ...g, open: false }))} onSave={registrarGasto} />
    </>
  )
}
