import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Building2, MapPin, Pencil, Plus } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button, Card, ConfirmDialog, EmptyState, IconButton, Select, Skeleton, Tooltip, toast } from '@/components/ui'
import { COLECCIONES } from '@/config/constants'
import { logActivity, useCollection } from '@/firebase/hooks'
import { useLocalStorage } from '@/lib/useLocalStorage'
import { fadeUp, stagger } from '@/lib/motion'
import { CUADRANTES } from './foda'
import { FodaQuadrant } from './FodaQuadrant'
import { EmpresaModal } from './EmpresaModal'

/** Barra segmentada: cuánto pesa cada cuadrante en la matriz. */
function Distribucion({ conteo, total }) {
  return (
    <div className="w-full sm:max-w-md">
      <div className="flex h-2 gap-0.5 overflow-hidden rounded-full" role="img" aria-label={CUADRANTES.map((c) => `${c.titulo}: ${conteo[c.tipo]}`).join(', ')}>
        {total === 0 && <div className="h-full w-full rounded-full bg-surface-3" />}
        {CUADRANTES.map((c) =>
          conteo[c.tipo] ? (
            <motion.div key={c.tipo} layout className="h-full rounded-full" style={{ background: c.color }} initial={false} animate={{ flexGrow: conteo[c.tipo] }} transition={{ duration: 0.4 }} />
          ) : null,
        )}
      </div>
      <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1">
        {CUADRANTES.map((c) => (
          <li key={c.tipo} className="flex items-center gap-1.5 text-xs text-fg-muted">
            <span className="size-2 rounded-[3px]" style={{ background: c.color }} aria-hidden="true" />
            {c.titulo}
            <span className="font-semibold tabular-nums text-fg">{conteo[c.tipo]}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function EjeLabel({ children, className }) {
  return <p className={`text-center text-[11px] font-semibold uppercase tracking-[0.09em] text-fg-subtle ${className || ''}`}>{children}</p>
}

export default function PlaneacionPage() {
  const { data, loading: cargandoItems, add, update, remove } = useCollection(COLECCIONES.foda)
  const empresas = useCollection(COLECCIONES.empresas)
  const [empresaId, setEmpresaId] = useLocalStorage('erp.foda.empresa', '')
  const [modal, setModal] = useState({ open: false, empresa: null })
  const [aEliminar, setAEliminar] = useState(null)

  const loading = cargandoItems || empresas.loading
  // Si la empresa elegida ya no existe (se borró), se muestra la primera de la lista
  const empresa = empresas.data.find((e) => e.id === empresaId) || empresas.data[0] || null

  const porTipo = useMemo(() => {
    const grupos = Object.fromEntries(CUADRANTES.map((c) => [c.tipo, []]))
    data.filter((item) => item.empresaId === empresa?.id).forEach((item) => grupos[item.tipo]?.push(item))
    return grupos
  }, [data, empresa?.id])

  const conteo = Object.fromEntries(CUADRANTES.map((c) => [c.tipo, porTipo[c.tipo].length]))
  const total = Object.values(conteo).reduce((a, b) => a + b, 0)

  const onAdd = (tipo, texto) => {
    const cuadrante = CUADRANTES.find((c) => c.tipo === tipo)
    add({ empresaId: empresa.id, tipo, texto })
    logActivity('Planeación', `agregó una ${cuadrante.singular} a la matriz FODA de ${empresa.nombre}`, 'crear')
    toast.success(`${cuadrante.singular.charAt(0).toUpperCase() + cuadrante.singular.slice(1)} agregada`, texto)
  }

  const onUpdate = (id, texto) => {
    update(id, { texto })
    toast.success('Ítem actualizado')
  }

  const onRemove = (item) => {
    remove(item.id)
    toast.info('Ítem eliminado', item.texto)
  }

  const guardarEmpresa = (valores, original) => {
    if (original) {
      empresas.update(original.id, valores)
      logActivity('Planeación', `actualizó los datos de la empresa ${valores.nombre}`, 'editar')
      toast.success('Empresa actualizada', valores.nombre)
    } else {
      const id = empresas.add(valores)
      setEmpresaId(id)
      logActivity('Planeación', `agregó la empresa ${valores.nombre} para analizar su FODA`, 'crear')
      toast.success('Empresa creada', `${valores.nombre} ya está seleccionada: completá su matriz FODA.`)
    }
  }

  // Al borrar una empresa también se borran los ítems de su matriz FODA
  const eliminarEmpresa = (original) => {
    data.filter((item) => item.empresaId === original.id).forEach((item) => remove(item.id))
    empresas.remove(original.id)
    logActivity('Planeación', `eliminó la empresa ${original.nombre} y su matriz FODA`, 'eliminar')
    toast.info('Empresa eliminada', original.nombre)
  }

  const itemsDe = (id) => data.filter((item) => item.empresaId === id).length

  return (
    <>
      <PageHeader
        eyebrow="Unidad 1 · Planeación estratégica"
        title="Matriz FODA"
        description="Analizá la situación de una empresa: factores internos y externos, positivos y negativos."
        actions={
          <>
            {empresa && (
              <div className="w-full sm:w-72">
                <label htmlFor="empresa" className="sr-only">
                  Empresa
                </label>
                <Select id="empresa" icon={Building2} value={empresa.id} onChange={(e) => setEmpresaId(e.target.value)} options={empresas.data.map((e) => ({ value: e.id, label: e.nombre }))} />
              </div>
            )}
            <Button icon={Plus} onClick={() => setModal({ open: true, empresa: null })}>
              Nueva empresa
            </Button>
          </>
        }
      />

      {!empresa ? (
        loading ? (
          <Skeleton className="h-96 w-full rounded-2xl" />
        ) : (
          <Card>
            <EmptyState
              icon={Building2}
              title="Todavía no hay empresas"
                demo
              description="Creá la primera empresa para armar su matriz FODA, o cargá los datos de demo."
              action={
                <Button icon={Plus} onClick={() => setModal({ open: true, empresa: null })}>
                  Nueva empresa
                </Button>
              }
            />
          </Card>
        )
      ) : (
      <motion.div variants={stagger(0.07)} initial="hidden" animate="show" className="space-y-4 lg:space-y-6">
        <Card variants={fadeUp} className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex min-w-0 items-center gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary-text">
              <Building2 size={22} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-fg-subtle">Empresa analizada</p>
              <h2 className="truncate text-lg font-semibold tracking-[-0.01em] text-fg">{empresa.nombre}</h2>
              <p className="flex flex-wrap items-center gap-x-3 text-[13px] text-fg-muted">
                {empresa.rubro}
                {empresa.ciudad && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={13} aria-hidden="true" />
                    {empresa.ciudad}
                  </span>
                )}
              </p>
              {empresa.descripcion && <p className="mt-1 line-clamp-2 max-w-xl text-xs leading-5 text-fg-subtle">{empresa.descripcion}</p>}
            </div>
            <IconButton icon={Pencil} label={`Editar ${empresa.nombre}`} variant="secondary" size="sm" className="shrink-0 self-start" onClick={() => setModal({ open: true, empresa })} />
          </div>
          <Distribucion conteo={conteo} total={total} />
        </Card>

        {/* Matriz 2 × 2: filas = origen (interno / externo), columnas = efecto (positivo / negativo) */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[28px_minmax(0,1fr)_minmax(0,1fr)] lg:gap-x-4 lg:gap-y-3">
          <div className="hidden lg:block" />
          <EjeLabel className="hidden lg:block">Aspectos positivos · ayudan</EjeLabel>
          <EjeLabel className="hidden lg:block">Aspectos negativos · dificultan</EjeLabel>

          {['Origen interno', 'Origen externo'].map((eje, fila) => (
            <div key={eje} className="contents">
              <div className="hidden items-center justify-center lg:flex">
                <Tooltip content={fila === 0 ? 'Depende de la empresa' : 'Depende del entorno'} side="right">
                  <EjeLabel className="-rotate-90 whitespace-nowrap">{eje}</EjeLabel>
                </Tooltip>
              </div>
              {CUADRANTES.slice(fila * 2, fila * 2 + 2).map((cuadrante) => (
                <FodaQuadrant
                  key={`${empresa.id}-${cuadrante.tipo}`}
                  cuadrante={cuadrante}
                  items={porTipo[cuadrante.tipo]}
                  loading={loading}
                  onAdd={onAdd}
                  onUpdate={onUpdate}
                  onRemove={onRemove}
                />
              ))}
            </div>
          ))}
        </div>
      </motion.div>
      )}

      <EmpresaModal
        open={modal.open}
        empresa={modal.empresa}
        existentes={empresas.data}
        cantidadItems={modal.empresa ? itemsDe(modal.empresa.id) : 0}
        onClose={() => setModal((m) => ({ ...m, open: false }))}
        onSave={guardarEmpresa}
        onDelete={(e) => setAEliminar(e)}
      />
      <ConfirmDialog
        open={!!aEliminar}
        onClose={() => setAEliminar(null)}
        onConfirm={() => eliminarEmpresa(aEliminar)}
        title={`¿Eliminar ${aEliminar?.nombre}?`}
        description={`Se borra la empresa y los ${aEliminar ? itemsDe(aEliminar.id) : 0} ítems de su matriz FODA. Esta acción no se puede deshacer.`}
      />
    </>
  )
}
