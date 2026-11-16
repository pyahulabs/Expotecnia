import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Pencil, SearchX, Star, Trash2, UserPlus, Users } from 'lucide-react'
import { Avatar, Badge, Button, Card, Chip, ConfirmDialog, EmptyState, IconButton, Loading, SearchInput, SkeletonTable, StarRating, Table, TBody, TD, TH, THead } from '@/components/ui'
import { DEPARTAMENTOS, ESTADOS_EMPLEADO } from '@/config/constants'
import { formatDateYear, formatDecimal, normalize } from '@/lib/format'
import { antiguedad } from './desempeno'

/** Tabla de empleados con búsqueda, filtro por departamento y acciones por fila. */
export function EmpleadosTab({ empleados, loading, ultimas, busquedaInicial = '', onNuevo, onEditar, onEvaluar, onEliminar }) {
  const [busqueda, setBusqueda] = useState(busquedaInicial)
  const [departamento, setDepartamento] = useState('Todos')
  const [aEliminar, setAEliminar] = useState(null)

  const conteo = useMemo(() => {
    const mapa = { Todos: empleados.length }
    empleados.forEach((e) => (mapa[e.departamento] = (mapa[e.departamento] || 0) + 1))
    return mapa
  }, [empleados])

  const filtrados = useMemo(() => {
    const q = normalize(busqueda.trim())
    return empleados.filter(
      (e) =>
        (departamento === 'Todos' || e.departamento === departamento) &&
        (!q || [e.nombre, e.cargo, e.email, e.departamento].some((campo) => normalize(campo).includes(q))),
    )
  }, [empleados, busqueda, departamento])

  const limpiar = () => {
    setBusqueda('')
    setDepartamento('Todos')
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-3 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
        <SearchInput value={busqueda} onChange={setBusqueda} placeholder="Buscar por nombre, cargo o correo…" className="w-full shrink-0 lg:w-80" />
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:-mx-5 sm:px-5 lg:mx-0 lg:flex-wrap lg:justify-end lg:px-0" role="group" aria-label="Filtrar por departamento">
          {['Todos', ...DEPARTAMENTOS].map((d) => (
            <Chip key={d} active={departamento === d} onClick={() => setDepartamento(d)} className="shrink-0">
              {d}
              <span className="text-[11px] tabular-nums opacity-70">{conteo[d] || 0}</span>
            </Chip>
          ))}
        </div>
      </div>

      <div className="border-t border-line">
        {loading ? (
          <Loading label="Cargando empleados…">
            <SkeletonTable rows={7} />
          </Loading>
        ) : empleados.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Todavía no hay empleados"
            description="Creá el primer legajo o cargá los datos de demostración desde el dashboard."
            action={
              <Button icon={UserPlus} onClick={onNuevo}>
                Nuevo empleado
              </Button>
            }
          />
        ) : filtrados.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="Sin resultados"
            description="Ningún empleado coincide con la búsqueda o el filtro elegido."
            action={
              <Button variant="secondary" onClick={limpiar}>
                Limpiar filtros
              </Button>
            }
          />
        ) : (
          <Table aria-label="Empleados">
            <THead>
              <tr>
                <TH>Empleado</TH>
                <TH className="hidden md:table-cell">Cargo</TH>
                <TH className="hidden sm:table-cell">Departamento</TH>
                <TH className="hidden min-[1400px]:table-cell">Ingreso</TH>
                <TH>Estado</TH>
                <TH className="hidden lg:table-cell">Desempeño</TH>
                <TH align="right">
                  <span className="sr-only">Acciones</span>
                </TH>
              </tr>
            </THead>
            <TBody>
              <AnimatePresence initial={false}>
                {filtrados.map((empleado) => {
                  const evaluacion = ultimas.get(empleado.id)
                  return (
                    <motion.tr
                      key={empleado.id}
                      layout="position"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="transition-colors duration-100 hover:bg-surface-2/60"
                    >
                      <TD>
                        <div className="flex items-center gap-3">
                          <Avatar name={empleado.nombre} />
                          <div className="min-w-0 max-w-[14rem]">
                            <p className="truncate font-medium text-fg">{empleado.nombre}</p>
                            <p className="truncate text-xs text-fg-subtle md:hidden">{empleado.cargo}</p>
                            <p className="hidden truncate text-xs text-fg-subtle md:block">{empleado.email || 'Sin correo'}</p>
                          </div>
                        </div>
                      </TD>
                      <TD className="hidden text-fg-muted md:table-cell">{empleado.cargo}</TD>
                      <TD className="hidden sm:table-cell">
                        <Badge>{empleado.departamento}</Badge>
                      </TD>
                      <TD className="hidden min-[1400px]:table-cell">
                        <p className="whitespace-nowrap text-fg-muted">{formatDateYear(empleado.fechaIngreso)}</p>
                        <p className="text-xs text-fg-subtle">{antiguedad(empleado.fechaIngreso)}</p>
                      </TD>
                      <TD>
                        <Badge tone={ESTADOS_EMPLEADO[empleado.estado] || 'neutral'} dot>
                          {empleado.estado}
                        </Badge>
                      </TD>
                      <TD className="hidden lg:table-cell">
                        {evaluacion ? (
                          <div className="flex items-center gap-2">
                            <StarRating value={evaluacion.promedio} size={14} label={`Desempeño de ${empleado.nombre}`} />
                            <span className="text-[13px] font-semibold tabular-nums text-fg">{formatDecimal(evaluacion.promedio)}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-fg-subtle">Sin evaluar</span>
                        )}
                      </TD>
                      <TD align="right">
                        <div className="flex justify-end">
                          <IconButton icon={Star} size="sm" label={`Evaluar a ${empleado.nombre}`} onClick={() => onEvaluar(empleado)} />
                          <IconButton icon={Pencil} size="sm" label={`Editar a ${empleado.nombre}`} onClick={() => onEditar(empleado)} />
                          <IconButton icon={Trash2} size="sm" label={`Eliminar a ${empleado.nombre}`} onClick={() => setAEliminar(empleado)} className="hover:bg-danger-soft hover:text-danger-text" />
                        </div>
                      </TD>
                    </motion.tr>
                  )
                })}
              </AnimatePresence>
            </TBody>
          </Table>
        )}
      </div>

      {!loading && filtrados.length > 0 && (
        <p className="border-t border-line px-5 py-3 text-xs text-fg-subtle sm:px-6">
          Mostrando <span className="font-semibold text-fg-muted">{filtrados.length}</span> de {empleados.length} empleados
        </p>
      )}

      <ConfirmDialog
        open={!!aEliminar}
        onClose={() => setAEliminar(null)}
        onConfirm={() => onEliminar(aEliminar)}
        title={`¿Eliminar a ${aEliminar?.nombre}?`}
        description="Se borra el legajo del empleado. Sus evaluaciones anteriores se conservan."
      />
    </Card>
  )
}
