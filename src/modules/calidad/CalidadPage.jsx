import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowDown, ArrowUp, ArrowUpDown, CalendarDays, CircleCheckBig, CircleDot, Columns3, FilterX, Flame, Pencil, Plus, SearchCheck, SearchX, ShieldCheck, Table2 } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'
import { Avatar, Badge, Button, Card, EmptyState, IconButton, Loading, PriorityBadge, SearchInput, Select, SkeletonKanban, StatCard, Table, TBody, TD, TH, THead, TR, Tabs, toast } from '@/components/ui'
import { COLECCIONES, LISTA_PRIORIDADES, PRIORIDADES } from '@/config/constants'
import { logActivity, useCollection } from '@/firebase/hooks'
import { diffDays, formatDate, formatPercent, normalize, todayISO } from '@/lib/format'
import { fadeUp, stagger } from '@/lib/motion'
import { useLocalStorage } from '@/lib/useLocalStorage'
import { ESTADOS_NC, estadoNC, siguienteCodigo } from './estados'
import { NCModal } from './NCModal'

/** Contenido de la tarjeta del tablero. */
function NCCard({ nc }) {
  const dias = diffDays(nc.fecha, todayISO())
  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold tracking-wide text-fg-subtle">{nc.codigo}</span>
        <PriorityBadge prioridad={nc.prioridad} />
      </div>
      <p className="mt-2 text-[13px] font-medium leading-5 text-fg">{nc.titulo}</p>
      {nc.descripcion && <p className="mt-1 line-clamp-2 text-xs leading-[18px] text-fg-muted">{nc.descripcion}</p>}
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-3">
        <span className="flex min-w-0 items-center gap-2">
          <Avatar name={nc.responsable || 'Sin asignar'} size="xs" />
          <span className="truncate text-xs text-fg-muted">{nc.responsable || 'Sin asignar'}</span>
        </span>
        <span className="flex shrink-0 items-center gap-1 text-[11px] text-fg-subtle" title={`Detectada hace ${dias} ${dias === 1 ? 'día' : 'días'}`}>
          <CalendarDays size={12} aria-hidden="true" />
          {formatDate(nc.fecha)}
        </span>
      </div>
    </>
  )
}

/** Encabezado de columna ordenable de la vista tabla. */
function SortTH({ campo, orden, onSort, children, ...props }) {
  const activo = orden.campo === campo
  const Icon = !activo ? ArrowUpDown : orden.asc ? ArrowUp : ArrowDown
  return (
    <TH aria-sort={activo ? (orden.asc ? 'ascending' : 'descending') : 'none'} {...props}>
      <button type="button" onClick={() => onSort(campo)} className="inline-flex items-center gap-1 rounded uppercase tracking-[0.06em] hover:text-fg">
        {children}
        <Icon size={12} className={activo ? 'text-primary-text' : 'opacity-50'} aria-hidden="true" />
      </button>
    </TH>
  )
}

export default function CalidadPage() {
  const { data, loading, add, update, remove } = useCollection(COLECCIONES.noConformidades, { orderBy: 'orden' })
  const { data: empleados } = useCollection(COLECCIONES.empleados, { orderBy: 'nombre' })
  const [params] = useSearchParams()

  const [vista, setVista] = useLocalStorage('erp.calidad.vista', 'tablero')
  const [busqueda, setBusqueda] = useState(params.get('q') || '')
  const [prioridad, setPrioridad] = useState('')
  const [responsable, setResponsable] = useState('')
  const [orden, setOrden] = useState({ campo: 'fecha', asc: false })
  const [modal, setModal] = useState({ open: false, nc: null, estado: 'abierto' })

  const responsables = useMemo(() => [...new Set([...empleados.map((e) => e.nombre), ...data.map((n) => n.responsable).filter(Boolean)])].sort((a, b) => a.localeCompare(b, 'es')), [empleados, data])
  const hayFiltros = Boolean(busqueda || prioridad || responsable)

  const filtradas = useMemo(() => {
    const q = normalize(busqueda.trim())
    return data.filter(
      (nc) =>
        (!prioridad || nc.prioridad === prioridad) &&
        (!responsable || nc.responsable === responsable) &&
        (!q || [nc.titulo, nc.codigo, nc.descripcion, nc.responsable, nc.area].some((campo) => normalize(campo).includes(q))),
    )
  }, [data, busqueda, prioridad, responsable])

  const ordenadas = useMemo(() => {
    const valor = (nc) => {
      if (orden.campo === 'prioridad') return PRIORIDADES[nc.prioridad]?.orden ?? 0
      if (orden.campo === 'estado') return ESTADOS_NC.findIndex((e) => e.id === nc.estado)
      return nc[orden.campo] ?? ''
    }
    const lista = [...filtradas].sort((a, b) => (valor(a) > valor(b) ? 1 : valor(a) < valor(b) ? -1 : 0))
    return orden.asc ? lista : lista.reverse()
  }, [filtradas, orden])

  const stats = useMemo(() => {
    const contar = (estado) => data.filter((n) => n.estado === estado).length
    return {
      abiertas: contar('abierto'),
      analisis: contar('analisis'),
      resueltas: contar('resuelto'),
      criticas: data.filter((n) => n.prioridad === 'Crítica' && n.estado !== 'resuelto').length,
      tasa: data.length ? (contar('resuelto') / data.length) * 100 : 0,
    }
  }, [data])

  const limpiar = () => {
    setBusqueda('')
    setPrioridad('')
    setResponsable('')
  }

  const onSort = (campo) => setOrden((o) => ({ campo, asc: o.campo === campo ? !o.asc : true }))

  const guardar = (valores, original) => {
    if (original) {
      update(original.id, valores)
      if (original.estado !== valores.estado) logActivity('Calidad', `movió ${original.codigo} a ${estadoNC(valores.estado).title}`, 'mover')
      toast.success('Cambios guardados', `${original.codigo} · ${valores.titulo}`)
    } else {
      const codigo = siguienteCodigo(data)
      const enColumna = data.filter((n) => n.estado === valores.estado)
      const primerOrden = enColumna.length ? Math.min(...enColumna.map((n) => n.orden || 0)) : 2000
      add({ ...valores, codigo, orden: primerOrden - 1000 })
      logActivity('Calidad', `registró la no conformidad ${codigo}: ${valores.titulo}`, 'crear')
      toast.success('No conformidad registrada', `${codigo} · ${valores.titulo}`)
    }
  }

  const eliminar = (nc) => {
    remove(nc.id)
    logActivity('Calidad', `eliminó la no conformidad ${nc.codigo}`, 'eliminar')
    toast.info('No conformidad eliminada', `${nc.codigo} · ${nc.titulo}`)
  }

  const mover = (nc, estado, nuevoOrden, origen) => {
    update(nc.id, { estado, orden: nuevoOrden })
    if (estado !== origen) {
      const destino = estadoNC(estado)
      logActivity('Calidad', `${estado === 'resuelto' ? 'resolvió' : 'movió a ' + destino.title} la no conformidad ${nc.codigo}: ${nc.titulo}`, 'mover')
      toast.success(`${nc.codigo} → ${destino.title}`, nc.titulo)
    }
  }

  const abrirNueva = (estado = 'abierto') => setModal({ open: true, nc: null, estado })

  return (
    <>
      <PageHeader
        eyebrow="Unidad 5 · Calidad y mejora continua"
        title="No conformidades"
        description="Registrá los desvíos detectados y seguí su tratamiento hasta el cierre. Arrastrá las tarjetas para cambiar su estado."
        actions={
          <>
            <Tabs
              variant="pill"
              label="Cambiar vista"
              value={vista}
              onChange={setVista}
              tabs={[
                { id: 'tablero', label: 'Tablero', icon: Columns3 },
                { id: 'tabla', label: 'Tabla', icon: Table2 },
              ]}
            />
            <Button icon={Plus} onClick={() => abrirNueva()}>
              Nueva
            </Button>
          </>
        }
      />

      <motion.div variants={stagger(0.06)} initial="hidden" animate="show" className="space-y-4 lg:space-y-6">
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <StatCard loading={loading} icon={CircleDot} tone="danger" label="Abiertas" value={stats.abiertas} hint="Esperan análisis" />
          <StatCard loading={loading} icon={SearchCheck} tone="warning" label="En análisis" value={stats.analisis} hint="Con causa raíz en estudio" />
          <StatCard loading={loading} icon={CircleCheckBig} tone="success" label="Resueltas" value={stats.resueltas} hint={`Tasa de cierre: ${formatPercent(stats.tasa)}`} />
          <StatCard loading={loading} icon={Flame} tone="danger" label="Críticas pendientes" value={stats.criticas} hint="Requieren acción inmediata" />
        </div>

        {/* Filtros (valen para las dos vistas) */}
        <motion.div variants={fadeUp} className="flex flex-col gap-3 md:flex-row md:items-center">
          <SearchInput value={busqueda} onChange={setBusqueda} placeholder="Buscar por título, código o área…" className="w-full md:w-80" />
          <div className="grid grid-cols-2 gap-3 md:flex">
            <Select aria-label="Filtrar por prioridad" value={prioridad} onChange={(e) => setPrioridad(e.target.value)} placeholder="Todas las prioridades" options={LISTA_PRIORIDADES} wrapperClassName="md:w-52" />
            <Select aria-label="Filtrar por responsable" value={responsable} onChange={(e) => setResponsable(e.target.value)} placeholder="Todos los responsables" options={responsables} wrapperClassName="md:w-56" />
          </div>
          {hayFiltros && (
            <Button variant="ghost" size="sm" icon={FilterX} onClick={limpiar}>
              Limpiar
            </Button>
          )}
          <p className="text-xs text-fg-subtle md:ml-auto" aria-live="polite">
            {loading ? '' : `${filtradas.length} de ${data.length} registros`}
          </p>
        </motion.div>

        {loading ? (
          <Loading label="Cargando no conformidades…">
            <SkeletonKanban />
          </Loading>
        ) : data.length === 0 ? (
          <Card>
            <EmptyState
              icon={ShieldCheck}
              title="No hay no conformidades registradas"
              description="¡Buena señal! Cuando se detecte un desvío de calidad, registralo acá para darle seguimiento."
              action={
                <Button icon={Plus} onClick={() => abrirNueva()}>
                  Registrar la primera
                </Button>
              }
            />
          </Card>
        ) : (
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={vista} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              {vista === 'tablero' ? (
                <KanbanBoard
                  columns={ESTADOS_NC}
                  items={filtradas}
                  onMove={mover}
                  onAdd={abrirNueva}
                  onCardClick={(nc) => setModal({ open: true, nc, estado: nc.estado })}
                  renderCard={(nc) => <NCCard nc={nc} />}
                  emptyText={hayFiltros ? 'Sin resultados con estos filtros' : 'Soltá una tarjeta acá'}
                />
              ) : (
                <Card className="overflow-hidden">
                  {ordenadas.length === 0 ? (
                    <EmptyState
                      icon={SearchX}
                      title="Sin resultados"
                      description="Ninguna no conformidad coincide con los filtros."
                      action={
                        <Button variant="secondary" onClick={limpiar}>
                          Limpiar filtros
                        </Button>
                      }
                    />
                  ) : (
                    <Table aria-label="No conformidades">
                      <THead>
                        <tr>
                          <SortTH campo="codigo" orden={orden} onSort={onSort}>Código</SortTH>
                          <TH>Título</TH>
                          <SortTH campo="estado" orden={orden} onSort={onSort}>Estado</SortTH>
                          <SortTH campo="prioridad" orden={orden} onSort={onSort} className="hidden sm:table-cell">Prioridad</SortTH>
                          <TH className="hidden lg:table-cell">Responsable</TH>
                          <TH className="hidden min-[1500px]:table-cell">Área</TH>
                          <SortTH campo="fecha" orden={orden} onSort={onSort} className="hidden md:table-cell">Fecha</SortTH>
                          <TH align="right">
                            <span className="sr-only">Acciones</span>
                          </TH>
                        </tr>
                      </THead>
                      <TBody>
                        {ordenadas.map((nc) => {
                          const estado = estadoNC(nc.estado)
                          return (
                            <TR key={nc.id}>
                              <TD className="whitespace-nowrap text-xs font-semibold tracking-wide text-fg-muted">{nc.codigo}</TD>
                              <TD>
                                <p className="max-w-sm font-medium text-fg">{nc.titulo}</p>
                                {nc.descripcion && <p className="hidden max-w-sm truncate text-xs text-fg-subtle sm:block">{nc.descripcion}</p>}
                              </TD>
                              <TD>
                                <Badge tone={estado.tone} dot>
                                  {estado.title}
                                </Badge>
                              </TD>
                              <TD className="hidden sm:table-cell">
                                <PriorityBadge prioridad={nc.prioridad} size="md" />
                              </TD>
                              <TD className="hidden lg:table-cell">
                                <span className="flex items-center gap-2 whitespace-nowrap text-fg-muted">
                                  <Avatar name={nc.responsable || 'Sin asignar'} size="xs" />
                                  {nc.responsable || 'Sin asignar'}
                                </span>
                              </TD>
                              <TD className="hidden text-fg-muted min-[1500px]:table-cell">{nc.area}</TD>
                              <TD className="hidden whitespace-nowrap text-fg-muted md:table-cell">{formatDate(nc.fecha)}</TD>
                              <TD align="right">
                                <IconButton icon={Pencil} size="sm" label={`Editar ${nc.codigo}`} onClick={() => setModal({ open: true, nc, estado: nc.estado })} />
                              </TD>
                            </TR>
                          )
                        })}
                      </TBody>
                    </Table>
                  )}
                </Card>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>

      <NCModal
        open={modal.open}
        nc={modal.nc}
        estadoInicial={modal.estado}
        codigo={siguienteCodigo(data)}
        responsables={responsables}
        onClose={() => setModal((m) => ({ ...m, open: false }))}
        onSave={guardar}
        onDelete={eliminar}
      />
    </>
  )
}
