import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { CalendarClock, ChartNoAxesGantt, Columns3, FilterX, Flag, ListChecks, Plus, Rocket, Route } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'
import { Avatar, Badge, Button, Card, EmptyState, Loading, PriorityBadge, SearchInput, Select, Skeleton, SkeletonKanban, StatCard, Tabs, toast } from '@/components/ui'
import { COLECCIONES } from '@/config/constants'
import { BRAND } from '@/config/brand'
import { logActivity, useCollection } from '@/firebase/hooks'
import { cn } from '@/lib/cn'
import { diffDays, formatDate, formatDateYear, formatPercent, normalize, sum, todayISO } from '@/lib/format'
import { fadeUp, stagger } from '@/lib/motion'
import { calcularRutaCritica } from './cpm'
import { ESTADOS_TAREA, estadoTarea } from './estados'
import { Gantt } from './Gantt'
import { FaseModal } from './FaseModal'
import { TareaModal } from './TareaModal'

/** Contenido de la tarjeta de tarea. */
function TareaCard({ tarea }) {
  const hecha = tarea.estado === 'hecho'
  const vencida = !hecha && tarea.fechaLimite && tarea.fechaLimite < todayISO()
  return (
    <>
      <div className="flex items-center justify-between gap-2">
        {tarea.etiqueta ? <Badge size="sm">{tarea.etiqueta}</Badge> : <span />}
        <PriorityBadge prioridad={tarea.prioridad} />
      </div>
      <p className={cn('mt-2 text-[13px] font-medium leading-5', hecha ? 'text-fg-muted line-through decoration-fg-subtle/60' : 'text-fg')}>{tarea.titulo}</p>
      {tarea.descripcion && <p className="mt-1 line-clamp-2 text-xs leading-[18px] text-fg-muted">{tarea.descripcion}</p>}
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-3">
        <span className="flex min-w-0 items-center gap-2">
          <Avatar name={tarea.responsable || 'Sin asignar'} size="xs" />
          <span className="truncate text-xs text-fg-muted">{tarea.responsable?.split(' ')[0] || 'Sin asignar'}</span>
        </span>
        {tarea.fechaLimite && (
          <span className={cn('flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px]', vencida ? 'bg-danger-soft font-semibold text-danger-text' : 'text-fg-subtle')}>
            <CalendarClock size={12} aria-hidden="true" />
            {vencida ? 'Venció el ' : ''}
            {formatDate(tarea.fechaLimite)}
          </span>
        )}
      </div>
    </>
  )
}

export default function ProyectosPage() {
  const tareas = useCollection(COLECCIONES.tareas, { orderBy: 'orden' })
  const fases = useCollection(COLECCIONES.fases, { orderBy: 'orden' })
  const { data: empleados } = useCollection(COLECCIONES.empleados, { orderBy: 'nombre' })

  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') === 'gantt' ? 'gantt' : 'kanban'
  const setTab = (id) => setParams(id === 'gantt' ? { tab: 'gantt' } : {}, { replace: true })

  const [busqueda, setBusqueda] = useState(params.get('q') || '')
  const [responsable, setResponsable] = useState('')
  const [modalTarea, setModalTarea] = useState({ open: false, tarea: null, estado: 'pendiente' })
  const [modalFase, setModalFase] = useState({ open: false, fase: null })

  const responsables = useMemo(
    () => [...new Set([...empleados.map((e) => e.nombre), ...tareas.data.map((t) => t.responsable), ...fases.data.map((f) => f.responsable)].filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es')),
    [empleados, tareas.data, fases.data],
  )

  const tareasFiltradas = useMemo(() => {
    const q = normalize(busqueda.trim())
    return tareas.data.filter((t) => (!responsable || t.responsable === responsable) && (!q || [t.titulo, t.descripcion, t.etiqueta, t.responsable].some((campo) => normalize(campo).includes(q))))
  }, [tareas.data, busqueda, responsable])

  const ruta = useMemo(() => calcularRutaCritica(fases.data), [fases.data])

  const resumen = useMemo(() => {
    const duraciones = fases.data.map((f) => Math.max(1, diffDays(f.inicio, f.fin) + 1))
    const total = sum(duraciones) || 1
    const avance = sum(fases.data.map((f, i) => (Number(f.avance) || 0) * duraciones[i])) / total
    return {
      avance,
      hechas: tareas.data.filter((t) => t.estado === 'hecho').length,
      restantes: ruta.fin ? diffDays(todayISO(), ruta.fin) : 0,
      duracion: ruta.inicio ? diffDays(ruta.inicio, ruta.fin) + 1 : 0,
    }
  }, [fases.data, tareas.data, ruta])

  const loading = tareas.loading || fases.loading
  const hayFiltros = Boolean(busqueda || responsable)

  // --- Tareas -----------------------------------------------------------------
  const guardarTarea = (valores, original) => {
    if (original) {
      tareas.update(original.id, valores)
      if (original.estado !== valores.estado) logActivity('Proyectos', `movió «${valores.titulo}» a ${estadoTarea(valores.estado).title}`, 'mover')
      toast.success('Tarea actualizada', valores.titulo)
    } else {
      const enColumna = tareas.data.filter((t) => t.estado === valores.estado)
      const primerOrden = enColumna.length ? Math.min(...enColumna.map((t) => t.orden || 0)) : 2000
      tareas.add({ ...valores, orden: primerOrden - 1000 })
      logActivity('Proyectos', `creó la tarea «${valores.titulo}»`, 'crear')
      toast.success('Tarea creada', valores.titulo)
    }
  }

  const eliminarTarea = (tarea) => {
    tareas.remove(tarea.id)
    logActivity('Proyectos', `eliminó la tarea «${tarea.titulo}»`, 'eliminar')
    toast.info('Tarea eliminada', tarea.titulo)
  }

  const moverTarea = (tarea, estado, orden, origen) => {
    tareas.update(tarea.id, { estado, orden })
    if (estado !== origen) {
      const destino = estadoTarea(estado)
      logActivity('Proyectos', `${estado === 'hecho' ? 'completó' : 'movió a ' + destino.title} la tarea «${tarea.titulo}»`, 'mover')
      toast.success(estado === 'hecho' ? '¡Tarea completada!' : `Movida a ${destino.title}`, tarea.titulo)
    }
  }

  // --- Fases ------------------------------------------------------------------
  const guardarFase = (valores, original) => {
    if (original) {
      fases.update(original.id, valores)
      logActivity('Proyectos', `actualizó la fase «${valores.nombre}» (${valores.avance}% de avance)`, 'editar')
      toast.success('Fase actualizada', valores.nombre)
    } else {
      fases.add({ ...valores, orden: (Math.max(0, ...fases.data.map((f) => f.orden || 0)) || 0) + 1000 })
      logActivity('Proyectos', `agregó la fase «${valores.nombre}» al cronograma`, 'crear')
      toast.success('Fase creada', valores.nombre)
    }
  }

  const eliminarFase = (fase) => {
    // También se quita de las dependencias de las demás fases
    fases.data.filter((f) => (f.dependencias || []).includes(fase.id)).forEach((f) => fases.update(f.id, { dependencias: f.dependencias.filter((d) => d !== fase.id) }))
    fases.remove(fase.id)
    logActivity('Proyectos', `eliminó la fase «${fase.nombre}»`, 'eliminar')
    toast.info('Fase eliminada', fase.nombre)
  }

  return (
    <>
      <PageHeader
        eyebrow="Unidad 7 · Gestión de proyectos"
        title="Gestor de proyectos"
        description={`Proyecto: implementación de ${BRAND.nombre} ${BRAND.sufijo} en ${BRAND.organizacion}`}
        actions={
          tab === 'kanban' ? (
            <Button icon={Plus} onClick={() => setModalTarea({ open: true, tarea: null, estado: 'pendiente' })}>
              Nueva tarea
            </Button>
          ) : (
            <Button icon={Plus} onClick={() => setModalFase({ open: true, fase: null })}>
              Nueva fase
            </Button>
          )
        }
      />

      <motion.div variants={stagger(0.06)} initial="hidden" animate="show" className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard loading={loading} icon={Rocket} label="Avance global" value={resumen.avance} format={(v) => formatPercent(v)} hint="Ponderado por duración de cada fase" />
        <StatCard loading={loading} icon={ListChecks} tone="success" label="Tareas completadas" value={resumen.hechas} hint={`de ${tareas.data.length} tareas del tablero`} />
        <StatCard loading={loading} icon={Route} tone="warning" label="Fases críticas" value={ruta.criticas.size} hint={`de ${fases.data.length} fases · sin holgura`} />
        <StatCard loading={loading} icon={Flag} tone="info" label="Días restantes" value={Math.max(0, resumen.restantes)} hint={ruta.fin ? `Fin estimado: ${formatDateYear(ruta.fin)}` : 'Sin cronograma'} />
      </motion.div>

      <Tabs
        className="mb-6 mt-6"
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'kanban', label: 'Kanban', icon: Columns3, count: tareas.loading ? null : tareas.data.length },
          { id: 'gantt', label: 'Gantt', icon: ChartNoAxesGantt, count: fases.loading ? null : fases.data.length },
        ]}
      />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={tab} role="tabpanel" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          {tab === 'kanban' ? (
            <div className="space-y-4 lg:space-y-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <SearchInput value={busqueda} onChange={setBusqueda} placeholder="Buscar tareas…" className="w-full sm:w-72" />
                <Select aria-label="Filtrar por responsable" value={responsable} onChange={(e) => setResponsable(e.target.value)} placeholder="Todos los responsables" options={responsables} wrapperClassName="sm:w-56" />
                {hayFiltros && (
                  <Button variant="ghost" size="sm" icon={FilterX} onClick={() => { setBusqueda(''); setResponsable('') }}>
                    Limpiar
                  </Button>
                )}
                <p className="text-xs text-fg-subtle sm:ml-auto" aria-live="polite">
                  {tareas.loading ? '' : `${tareasFiltradas.length} de ${tareas.data.length} tareas`}
                </p>
              </div>
              {tareas.loading ? (
                <Loading label="Cargando tareas…">
                  <SkeletonKanban columns={3} />
                </Loading>
              ) : tareas.data.length === 0 ? (
                <Card>
                  <EmptyState
                    icon={Columns3}
                    title="El tablero está vacío"
                demo
                    description="Creá la primera tarea y arrastrala entre columnas a medida que avanza."
                    action={
                      <Button icon={Plus} onClick={() => setModalTarea({ open: true, tarea: null, estado: 'pendiente' })}>
                        Nueva tarea
                      </Button>
                    }
                  />
                </Card>
              ) : (
                <KanbanBoard
                  columns={ESTADOS_TAREA}
                  items={tareasFiltradas}
                  onMove={moverTarea}
                  onAdd={(estado) => setModalTarea({ open: true, tarea: null, estado })}
                  onCardClick={(tarea) => setModalTarea({ open: true, tarea, estado: tarea.estado })}
                  renderCard={(tarea) => <TareaCard tarea={tarea} />}
                  emptyText={hayFiltros ? 'Sin resultados con estos filtros' : 'Soltá una tarea acá'}
                />
              )}
            </div>
          ) : (
            <Card variants={fadeUp} initial="hidden" animate="show" className="overflow-hidden">
              {fases.loading ? (
                <Loading label="Cargando cronograma…">
                  <div className="space-y-4 p-6">
                    {[70, 45, 60, 80, 55, 65].map((w, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-4 w-40 shrink-0" />
                        <Skeleton className="h-6 rounded-lg" style={{ width: `${w}%`, marginLeft: `${i * 5}%` }} />
                      </div>
                    ))}
                  </div>
                </Loading>
              ) : fases.data.length === 0 ? (
                <EmptyState
                  icon={ChartNoAxesGantt}
                  title="Todavía no hay cronograma"
                demo
                  description="Agregá las fases del proyecto con sus fechas y dependencias para ver el Gantt y la ruta crítica."
                  action={
                    <Button icon={Plus} onClick={() => setModalFase({ open: true, fase: null })}>
                      Nueva fase
                    </Button>
                  }
                />
              ) : (
                <Gantt fases={fases.data} ruta={ruta} onEdit={(fase) => setModalFase({ open: true, fase })} />
              )}
            </Card>
          )}
        </motion.div>
      </AnimatePresence>

      <TareaModal
        open={modalTarea.open}
        tarea={modalTarea.tarea}
        estadoInicial={modalTarea.estado}
        responsables={responsables}
        onClose={() => setModalTarea((m) => ({ ...m, open: false }))}
        onSave={guardarTarea}
        onDelete={eliminarTarea}
      />
      <FaseModal
        open={modalFase.open}
        fase={modalFase.fase}
        fases={fases.data}
        responsables={responsables}
        onClose={() => setModalFase((m) => ({ ...m, open: false }))}
        onSave={guardarFase}
        onDelete={eliminarFase}
      />
    </>
  )
}
