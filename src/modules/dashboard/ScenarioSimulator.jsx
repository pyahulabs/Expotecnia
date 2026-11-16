import { ArrowRight, PiggyBank, RotateCcw, Scissors, SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/cn'
import { formatGsCompact, formatPercent } from '@/lib/format'
import { Card, CardBody, CardHeader, Chip, IconButton, Slider } from '@/components/ui'
import { ESCENARIO_BASE, PRESETS, esEscenarioActivo } from './simulador'

const millones = (v) => formatGsCompact(v, false)

/** Fila "actual → proyectado" con la variación resaltada. */
function Comparacion({ label, actual, proyectado, format, mejorSiBaja = false, activo }) {
  const delta = proyectado - actual
  const sinCambio = Math.abs(delta) < 1e-6
  const mejora = sinCambio ? null : delta < 0 === mejorSiBaja
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <span className="text-[13px] text-fg-muted">{label}</span>
      <span className="flex shrink-0 items-center gap-1.5 whitespace-nowrap text-[13px] tabular-nums">
        <span className={cn('text-fg-subtle', activo && !sinCambio && 'line-through decoration-fg-subtle/50')}>{format(actual)}</span>
        {activo && !sinCambio && (
          <>
            <ArrowRight size={13} className="text-fg-subtle" aria-hidden="true" />
            <span className={cn('rounded-md px-1.5 py-0.5 font-semibold', mejora ? 'bg-success-soft text-success-text' : 'bg-danger-soft text-danger-text')}>
              {format(proyectado)}
            </span>
          </>
        )}
      </span>
    </div>
  )
}

/** Panel del simulador: sliders + presets + comparación actual vs. proyectado. */
export function ScenarioSimulator({ escenario, onChange, resumen, className }) {
  const activo = esEscenarioActivo(escenario)
  const { actual, proyectado } = resumen
  const ahorro = actual.ejecutado - proyectado.ejecutado

  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader
        icon={SlidersHorizontal}
        title="Simulador de escenarios"
        description="Mové los controles y mirá cómo cambian los gráficos."
        action={<IconButton icon={RotateCcw} label="Restablecer escenario" variant="secondary" size="sm" disabled={!activo} onClick={() => onChange(ESCENARIO_BASE)} />}
      />
      <CardBody className="flex flex-1 flex-col gap-5">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Escenarios predefinidos">
          {PRESETS.map((preset) => (
            <Chip
              key={preset.id}
              active={escenario.aumento === preset.aumento && escenario.reduccion === preset.reduccion}
              onClick={() => onChange({ aumento: preset.aumento, reduccion: preset.reduccion })}
            >
              {preset.label}
            </Chip>
          ))}
        </div>

        <div className="space-y-5">
          <Slider
            label="Aumento de presupuesto"
            icon={PiggyBank}
            value={escenario.aumento}
            min={0}
            max={40}
            onChange={(aumento) => onChange({ ...escenario, aumento })}
            format={(v) => `+${v}%`}
            hint="Se aplica al presupuesto de todos los departamentos."
          />
          <Slider
            label="Reducción de costos"
            icon={Scissors}
            value={escenario.reduccion}
            min={0}
            max={30}
            onChange={(reduccion) => onChange({ ...escenario, reduccion })}
            format={(v) => `−${v}%`}
            hint="Recorta el gasto ejecutado y la proyección de costos."
          />
        </div>

        <div className="mt-auto rounded-xl border border-line bg-surface-2/50 px-4 py-1.5">
          <div className="flex items-center justify-between border-b border-line py-2 text-[11px] font-semibold uppercase tracking-[0.07em] text-fg-subtle">
            <span>Indicador</span>
            <span>Actual {activo && '→ Proyectado'}</span>
          </div>
          <div className="divide-y divide-line">
            <Comparacion label="Presupuesto (Gs.)" actual={actual.presupuesto} proyectado={proyectado.presupuesto} format={millones} activo={activo} />
            <Comparacion label="Ejecutado (Gs.)" actual={actual.ejecutado} proyectado={proyectado.ejecutado} format={millones} mejorSiBaja activo={activo} />
            <Comparacion label="% de ejecución" actual={actual.ejecucion} proyectado={proyectado.ejecucion} format={(v) => formatPercent(v, 1)} mejorSiBaja activo={activo} />
            <Comparacion label="Saldo (Gs.)" actual={actual.saldo} proyectado={proyectado.saldo} format={millones} activo={activo} />
            <Comparacion label="Áreas excedidas" actual={actual.excedidos} proyectado={proyectado.excedidos} format={(v) => String(Math.round(v))} mejorSiBaja activo={activo} />
          </div>
        </div>

        <p className="text-xs leading-5 text-fg-subtle" aria-live="polite">
          {activo
            ? `Con este escenario se liberan ${formatGsCompact(proyectado.saldo - actual.saldo)} de saldo${ahorro > 0 ? ` (${formatGsCompact(ahorro)} por ahorro en costos)` : ''}.`
            : 'Los valores proyectados son una simulación: no modifican los datos guardados.'}
        </p>
      </CardBody>
    </Card>
  )
}
