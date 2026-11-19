import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeftRight, Crown, Info, Lock, Pencil, SearchX, ShieldCheck, Trash2, UserCheck, UserCog, UserPlus, Users } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Avatar, Badge, Button, Card, Chip, ConfirmDialog, EmptyState, IconButton, Loading, SearchInput, SkeletonTable, StatCard, Table, TBody, TD, TH, THead, Pagination, usePaginacion, toast } from '@/components/ui'
import { COLECCIONES, LISTA_ROLES, ROLES } from '@/config/constants'
import { esAdministrador, useSession } from '@/context/SessionContext'
import { logActivity, useCollection } from '@/firebase/hooks'
import { normalize, timeAgo } from '@/lib/format'
import { fadeUp, stagger } from '@/lib/motion'
import { useCambiarUsuario } from '@/lib/useCambiarUsuario'
import { antiguedad } from '@/modules/talentoHumano/desempeno'
import { esUltimoAdmin, esUsuarioActual } from './reglas'
import { UsuarioModal } from './UsuarioModal'

export default function UsuariosPage() {
  const { data, loading, add, update, remove } = useCollection(COLECCIONES.usuarios, { orderBy: 'nombre' })
  const { user, updateSession } = useSession()
  const { cambiar: cambiarUsuario, claveModal } = useCambiarUsuario()
  const admin = esAdministrador(user)

  const [busqueda, setBusqueda] = useState('')
  const [rol, setRol] = useState('Todos')
  const [modal, setModal] = useState({ open: false, usuario: null })
  const [aEliminar, setAEliminar] = useState(null)

  const filtrados = useMemo(() => {
    const q = normalize(busqueda.trim())
    return data.filter((u) => (rol === 'Todos' || u.rol === rol) && (!q || [u.nombre, u.email, u.cargo].some((c) => normalize(c).includes(q))))
  }, [data, busqueda, rol])

  const conteo = (r) => data.filter((u) => u.rol === r).length
  const paginacion = usePaginacion(filtrados, 8)

  const guardar = (valores, original) => {
    if (original) {
      update(original.id, valores)
      if (esUsuarioActual(user, original)) updateSession({ ...valores, id: original.id })
      logActivity('Usuarios', `actualizó la cuenta de ${valores.nombre}`, 'editar')
      toast.success('Usuario actualizado', `${valores.nombre} · ${valores.rol}`)
    } else {
      add(valores)
      logActivity('Usuarios', `creó el usuario ${valores.nombre} (${valores.rol})`, 'crear')
      toast.success('Usuario creado', `${valores.nombre} ya puede ingresar como ${valores.rol}.`)
    }
  }

  const eliminar = (original) => {
    remove(original.id)
    logActivity('Usuarios', `eliminó el usuario ${original.nombre}`, 'eliminar')
    toast.info('Usuario eliminado', original.nombre)
  }

  return (
    <>
      <PageHeader
        eyebrow="Administración"
        title="Usuarios"
        description="Quién puede ingresar al sistema y con qué rol. Cambiá de usuario cuando quieras, sin cerrar sesión."
        actions={
          admin && (
            <Button icon={UserPlus} onClick={() => setModal({ open: true, usuario: null })}>
              Nuevo usuario
            </Button>
          )
        }
      />

      <motion.div variants={stagger(0.06)} initial="hidden" animate="show" className="space-y-4 lg:space-y-6">
        {!admin && (
          <motion.div variants={fadeUp} className="flex items-start gap-3 rounded-2xl border border-info/30 bg-info-soft px-4 py-3.5 sm:px-5" role="note">
            <Info size={18} className="mt-0.5 shrink-0 text-info-text" aria-hidden="true" />
            <p className="text-[13px] leading-5 text-fg-muted">
              Estás como <span className="font-semibold text-fg">{user?.rol}</span>: podés ver la lista y cambiar de usuario, pero solo un <span className="font-semibold text-fg">Administrador</span> puede crear, editar o eliminar cuentas.
            </p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard loading={loading} icon={Users} label="Usuarios" value={data.length} hint={`${data.filter((u) => u.estado !== 'Inactivo').length} activos`} />
          <StatCard loading={loading} icon={Crown} tone="warning" label="Administradores" value={conteo('Administrador')} hint="Gestionan cuentas y empresas" />
          <StatCard loading={loading} icon={UserCheck} tone="info" label="Editores y lectores" value={conteo('Editor') + conteo('Lector')} hint="Trabajan o consultan en los módulos" />
        </div>

        <Card variants={fadeUp} className="overflow-hidden">
          <div className="flex flex-col gap-3 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
            <SearchInput value={busqueda} onChange={setBusqueda} placeholder="Buscar por nombre, correo o cargo…" className="w-full lg:w-80" />
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por rol">
              {['Todos', ...LISTA_ROLES].map((r) => (
                <Chip key={r} active={rol === r} onClick={() => setRol(r)}>
                  {r}
                  <span className="text-[11px] tabular-nums opacity-70">{r === 'Todos' ? data.length : conteo(r)}</span>
                </Chip>
              ))}
            </div>
          </div>

          <div className="border-t border-line">
            {loading ? (
              <Loading label="Cargando usuarios…">
                <SkeletonTable rows={5} />
              </Loading>
            ) : data.length === 0 ? (
              <EmptyState
                icon={UserCog}
                title="Todavía no hay usuarios"
                demo
                description="Creá el primer usuario o cargá los datos de demo."
                action={
                  admin && (
                    <Button icon={UserPlus} onClick={() => setModal({ open: true, usuario: null })}>
                      Nuevo usuario
                    </Button>
                  )
                }
              />
            ) : filtrados.length === 0 ? (
              <EmptyState icon={SearchX} title="Sin resultados" description="Ningún usuario coincide con la búsqueda o el filtro." action={<Button variant="secondary" onClick={() => { setBusqueda(''); setRol('Todos') }}>Limpiar filtros</Button>} />
            ) : (
              <Table aria-label="Usuarios del sistema">
                <THead>
                  <tr>
                    <TH>Usuario</TH>
                    <TH className="hidden md:table-cell">Cargo</TH>
                    <TH className="hidden xl:table-cell">Contacto</TH>
                    <TH>Rol</TH>
                    <TH className="hidden sm:table-cell">Estado</TH>
                    <TH className="hidden lg:table-cell">Último acceso</TH>
                    <TH align="right">
                      <span className="sr-only">Acciones</span>
                    </TH>
                  </tr>
                </THead>
                <TBody>
                  <AnimatePresence initial={false}>
                    {paginacion.visibles.map((u) => {
                      const actual = esUsuarioActual(user, u)
                      const inactivo = u.estado === 'Inactivo'
                      return (
                        <motion.tr key={u.id} layout="position" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="transition-colors hover:bg-surface-2/60">
                          <TD>
                            <div className="flex items-center gap-3">
                              <Avatar name={u.nombre} className={inactivo ? 'opacity-50' : undefined} />
                              <div className="min-w-0">
                                <p className="flex items-center gap-2 truncate font-medium text-fg">
                                  {u.nombre}
                                  {actual && <Badge tone="primary" size="sm">Vos</Badge>}
                                </p>
                                <p className="flex items-center gap-1.5 truncate text-xs text-fg-subtle">
                                  {u.email}
                                  {u.claveHash && <Lock size={11} className="shrink-0" aria-label="Cuenta con contraseña" />}
                                </p>
                              </div>
                            </div>
                          </TD>
                          <TD className="hidden md:table-cell">
                            <p className="text-fg-muted">{u.cargo || '—'}</p>
                            {u.departamento && <p className="text-xs text-fg-subtle">{u.departamento}</p>}
                          </TD>
                          <TD className="hidden xl:table-cell">
                            <p className="whitespace-nowrap text-[13px] text-fg-muted">{u.telefono || '—'}</p>
                            {u.fechaIngreso && <p className="text-xs text-fg-subtle">{antiguedad(u.fechaIngreso)} en la empresa</p>}
                          </TD>
                          <TD>
                            <Badge tone={ROLES[u.rol]?.tone || 'neutral'} icon={u.rol === 'Administrador' ? ShieldCheck : undefined}>
                              {u.rol}
                            </Badge>
                          </TD>
                          <TD className="hidden sm:table-cell">
                            <Badge tone={inactivo ? 'neutral' : 'success'} dot>
                              {u.estado || 'Activo'}
                            </Badge>
                          </TD>
                          <TD className="hidden whitespace-nowrap text-[13px] text-fg-muted lg:table-cell">{u.ultimoAcceso ? timeAgo(u.ultimoAcceso) : 'Nunca'}</TD>
                          <TD align="right">
                            <div className="flex justify-end">
                              {!actual && !inactivo && <IconButton icon={ArrowLeftRight} size="sm" label={`Cambiar a ${u.nombre}`} onClick={() => cambiarUsuario(u)} />}
                              {admin && (
                                <>
                                  <IconButton icon={Pencil} size="sm" label={`Editar a ${u.nombre}`} onClick={() => setModal({ open: true, usuario: u })} />
                                  <IconButton
                                    icon={Trash2}
                                    size="sm"
                                    label={`Eliminar a ${u.nombre}`}
                                    disabled={actual || esUltimoAdmin(data, u)}
                                    onClick={() => setAEliminar(u)}
                                    className="hover:bg-danger-soft hover:text-danger-text"
                                  />
                                </>
                              )}
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
          {!loading && filtrados.length > 0 && <Pagination {...paginacion} nombre="usuarios" />}
        </Card>

        <motion.section variants={fadeUp} aria-label="Roles disponibles" className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {LISTA_ROLES.map((r) => (
            <Card key={r} className="p-5">
              <Badge tone={ROLES[r].tone} icon={r === 'Administrador' ? ShieldCheck : undefined}>
                {r}
              </Badge>
              <p className="mt-3 text-[13px] leading-5 text-fg-muted">{ROLES[r].descripcion}</p>
            </Card>
          ))}
        </motion.section>
      </motion.div>

      {claveModal}
      <UsuarioModal
        open={modal.open}
        usuario={modal.usuario}
        usuarios={data}
        esActual={modal.usuario ? esUsuarioActual(user, modal.usuario) : false}
        onClose={() => setModal((m) => ({ ...m, open: false }))}
        onSave={guardar}
        onDelete={(u) => setAEliminar(u)}
      />
      <ConfirmDialog
        open={!!aEliminar}
        onClose={() => setAEliminar(null)}
        onConfirm={() => eliminar(aEliminar)}
        title={`¿Eliminar a ${aEliminar?.nombre}?`}
        description="La persona deja de poder ingresar con esta cuenta. Sus registros en los módulos se conservan."
      />
    </>
  )
}
