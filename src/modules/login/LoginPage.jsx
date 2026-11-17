import { useMemo, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Eye, Mail, Radio, ShieldCheck, SlidersHorizontal, TrendingUp, User, UserPlus } from 'lucide-react'
import { BRAND } from '@/config/brand'
import { useSession } from '@/context/SessionContext'
import { ease, fadeUp, stagger } from '@/lib/motion'
import { Avatar, Badge, Button, Field, Input, Loading, Skeleton, ThemeToggle } from '@/components/ui'
import { COLECCIONES, ROLES } from '@/config/constants'
import { addItem, logActivity, useCollection } from '@/firebase/hooks'
import { emailEnUso } from '@/modules/usuarios/reglas'
import { useCambiarUsuario } from '@/lib/useCambiarUsuario'
import { Logo, LogoMark } from '@/components/layout/Logo'

const FEATURES = [
  { icon: Radio, title: 'Tiempo real', text: 'Cada cambio se sincroniza al instante con Firestore.' },
  { icon: SlidersHorizontal, title: 'Simulador de escenarios', text: 'Proyectá presupuesto y costos moviendo un control.' },
  { icon: ShieldCheck, title: '7 módulos integrados', text: 'Planeación, talento, calidad, finanzas y proyectos.' },
]

/** Tarjetas flotantes decorativas del panel de marca. */
function FloatingPreview() {
  const bars = [38, 56, 44, 70, 62, 84, 76]
  return (
    <div className="relative mx-auto mt-12 h-56 w-full max-w-md" aria-hidden="true">
      <motion.div
        className="absolute left-0 top-4 w-64 rounded-2xl border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: [0, -8, 0] }}
        transition={{ opacity: { duration: 0.6, delay: 0.5 }, y: { duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.5 } }}
      >
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-white/70">Presupuesto ejecutado</p>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/20 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-200">
            <TrendingUp size={10} /> 4,2%
          </span>
        </div>
        <p className="mt-1 text-2xl font-semibold tracking-tight text-white">90,6%</p>
        <div className="mt-3 flex h-14 items-end gap-1.5">
          {bars.map((h, i) => (
            <motion.span
              key={i}
              className="flex-1 rounded-t-[3px] bg-white/70"
              style={{ opacity: 0.35 + i * 0.09 }}
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ duration: 0.7, delay: 0.8 + i * 0.07, ease }}
            />
          ))}
        </div>
      </motion.div>

      <motion.div
        className="absolute right-0 top-0 w-52 rounded-2xl border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{ opacity: { duration: 0.6, delay: 0.7 }, y: { duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.7 } }}
      >
        <p className="text-xs font-medium text-white/70">No conformidades</p>
        <div className="mt-3 space-y-2">
          {[
            ['Abierto', 'bg-rose-300', '45%'],
            ['En análisis', 'bg-amber-300', '70%'],
            ['Resuelto', 'bg-emerald-300', '90%'],
          ].map(([label, color, width]) => (
            <div key={label}>
              <div className="mb-1 flex justify-between text-[10px] text-white/70">
                <span>{label}</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/15">
                <div className={`h-full rounded-full ${color}`} style={{ width }} />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-0 right-10 flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 shadow-2xl backdrop-blur-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: [0, -6, 0] }}
        transition={{ opacity: { duration: 0.6, delay: 0.9 }, y: { duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.9 } }}
      >
        <span className="relative grid size-2.5 place-items-center">
          <span className="absolute size-2.5 animate-pulse-ring rounded-full bg-emerald-300" />
          <span className="relative size-2 rounded-full bg-emerald-300" />
        </span>
        <p className="text-xs font-medium text-white/85">Sincronizado en tiempo real</p>
      </motion.div>
    </div>
  )
}

/** Pantalla de bienvenida con acceso SIMULADO: se elige un usuario existente o se crea uno nuevo. */
export default function LoginPage() {
  const { user, login } = useSession()
  const navigate = useNavigate()
  const location = useLocation()
  const { data: usuarios, loading } = useCollection(COLECCIONES.usuarios, { orderBy: 'nombre' })
  const cambiarUsuario = useCambiarUsuario({ silencioso: true })
  const [entrando, setEntrando] = useState(false)
  const [creando, setCreando] = useState(false)
  const [form, setForm] = useState({ nombre: '', email: '' })
  const [errors, setErrors] = useState({})

  const activos = useMemo(() => usuarios.filter((u) => u.estado !== 'Inactivo'), [usuarios])
  const sinUsuarios = !loading && usuarios.length === 0
  const mostrandoForm = creando || sinUsuarios

  if (user && !entrando) return <Navigate to="/" replace />

  const entrar = (accion) => {
    setEntrando(true)
    // Pequeña espera para que se perciba la transición de ingreso
    window.setTimeout(() => {
      accion()
      navigate(location.state?.from || '/', { replace: true })
    }, 550)
  }

  const crearUsuario = (event) => {
    event.preventDefault()
    const next = {}
    if (!form.nombre.trim()) next.nombre = 'Ingresá tu nombre.'
    if (!form.email.trim()) next.email = 'Ingresá tu correo.'
    else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = 'El correo no tiene un formato válido.'
    else if (emailEnUso(usuarios, form.email)) next.email = 'Ya existe un usuario con ese correo: elegilo en la lista.'
    setErrors(next)
    if (Object.keys(next).length) return
    // La primera persona en entrar queda como Administrador; las demás, como Editor
    const rol = usuarios.length === 0 ? 'Administrador' : 'Editor'
    const datos = { nombre: form.nombre.trim(), email: form.email.trim(), cargo: '', rol, estado: 'Activo', ultimoAcceso: Date.now() }
    entrar(() => {
      const id = addItem(COLECCIONES.usuarios, datos)
      login({ ...datos, id })
      logActivity('Usuarios', `se registró como nuevo usuario (${rol})`, 'crear')
    })
  }

  return (
    <div className="grid min-h-dvh grid-cols-1 bg-canvas lg:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)]">
      {/* Panel de marca */}
      <section className="relative hidden overflow-hidden bg-[#1a1447] lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        <div className="absolute inset-0" aria-hidden="true">
          <div className="absolute -left-32 -top-32 size-[520px] rounded-full bg-[#6c5ff8] opacity-60 blur-[120px]" />
          <div className="absolute -bottom-40 right-[-120px] size-[560px] rounded-full bg-[#a855f7] opacity-40 blur-[130px]" />
          <div className="absolute left-1/3 top-1/2 size-[320px] rounded-full bg-[#38bdf8] opacity-20 blur-[110px]" />
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
              backgroundSize: '44px 44px',
              maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
            }}
          />
        </div>

        <div className="relative flex items-center gap-3">
          <LogoMark size={40} />
          <span className="text-xl font-semibold tracking-tight text-white">
            {BRAND.nombre} <span className="font-normal text-white/60">{BRAND.sufijo}</span>
          </span>
        </div>

        <motion.div className="relative" variants={stagger(0.09, 0.1)} initial="hidden" animate="show">
          <motion.p variants={fadeUp} className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur">
            {BRAND.evento} · {BRAND.carrera}
          </motion.p>
          <motion.h1 variants={fadeUp} className="max-w-lg text-4xl font-semibold leading-[1.12] tracking-[-0.03em] text-white xl:text-5xl">
            Toda tu organización, en un solo lugar.
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-4 max-w-md text-base leading-7 text-white/70">
            Un ERP simple y moderno para planificar, medir y mejorar: de la estrategia a la ejecución, con datos en vivo.
          </motion.p>
          <FloatingPreview />
        </motion.div>

        <motion.ul className="relative grid grid-cols-1 gap-4 xl:grid-cols-3" variants={stagger(0.08, 0.5)} initial="hidden" animate="show">
          {FEATURES.map((feature) => (
            <motion.li key={feature.title} variants={fadeUp} className="flex gap-3 xl:flex-col xl:gap-2">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white/10 text-white">
                <feature.icon size={16} aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">{feature.title}</p>
                <p className="mt-0.5 text-[13px] leading-5 text-white/60">{feature.text}</p>
              </div>
            </motion.li>
          ))}
        </motion.ul>
      </section>

      {/* Ingreso */}
      <section className="relative flex flex-col px-5 py-6 sm:px-10">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(60%_100%_at_50%_0%,var(--primary-soft),transparent)] lg:hidden" aria-hidden="true" />
        <div className="relative flex items-center justify-between">
          <Logo className="lg:invisible" />
          <ThemeToggle />
        </div>

        <motion.div className="relative mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center py-10" variants={stagger(0.07)} initial="hidden" animate="show">
          <motion.div variants={fadeUp}>
            <h2 className="text-[28px] font-semibold leading-9 tracking-[-0.025em] text-fg">Te damos la bienvenida</h2>
            <p className="mt-2 text-sm leading-6 text-fg-muted">
              {mostrandoForm ? 'Registrá tu usuario para empezar a usar el sistema.' : <>Elegí con qué usuario querés ingresar al panel de <span className="font-medium text-fg">{BRAND.organizacion}</span></>}
            </p>
          </motion.div>

          {mostrandoForm ? (
            <motion.form variants={fadeUp} onSubmit={crearUsuario} className="mt-8 space-y-4" noValidate>
              {sinUsuarios && (
                <p className="rounded-xl bg-info-soft px-3.5 py-3 text-[13px] leading-5 text-info-text">Todavía no hay usuarios: el primero que se registre queda como <span className="font-semibold">Administrador</span>.</p>
              )}
              <Field label="Nombre" htmlFor="login-nombre" error={errors.nombre}>
                <Input id="login-nombre" icon={User} autoComplete="name" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Tu nombre y apellido" className="h-11" invalid={!!errors.nombre} maxLength={80} />
              </Field>
              <Field label="Correo electrónico" htmlFor="login-email" error={errors.email} hint="Acceso simulado para la feria: no se pide contraseña.">
                <Input id="login-email" icon={Mail} type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="nombre@empresa.com.py" className="h-11" invalid={!!errors.email} />
              </Field>
              <Button type="submit" size="lg" loading={entrando} iconRight={ArrowRight} className="mt-2 w-full">
                {entrando ? 'Ingresando…' : 'Crear usuario e ingresar'}
              </Button>
              {!sinUsuarios && (
                <Button variant="ghost" size="lg" icon={ArrowLeft} className="w-full" disabled={entrando} onClick={() => { setCreando(false); setErrors({}) }}>
                  Volver a la lista de usuarios
                </Button>
              )}
            </motion.form>
          ) : (
            <motion.div variants={fadeUp} className="mt-8">
              {loading ? (
                <Loading label="Cargando usuarios…">
                  <div className="space-y-2.5">
                    {[0, 1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-[62px] w-full rounded-xl" />
                    ))}
                  </div>
                </Loading>
              ) : (
                <ul className="max-h-[430px] space-y-2 overflow-y-auto pr-1" aria-label="Usuarios disponibles">
                  {activos.map((u) => (
                    <li key={u.id}>
                      <button
                        type="button"
                        disabled={entrando}
                        onClick={() => entrar(() => cambiarUsuario(u))}
                        className="group flex w-full items-center gap-3 rounded-xl border border-line bg-surface px-3.5 py-3 text-left shadow-card transition-[border-color,box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-raised disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Avatar name={u.nombre} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-fg">{u.nombre}</span>
                          <span className="block truncate text-xs text-fg-subtle">{u.cargo || u.email}</span>
                        </span>
                        <Badge tone={ROLES[u.rol]?.tone || 'neutral'} size="sm">
                          {u.rol}
                        </Badge>
                        <ArrowRight size={16} className="shrink-0 text-fg-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-primary-text" aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <Button variant="secondary" size="lg" icon={UserPlus} disabled={entrando || loading} onClick={() => setCreando(true)}>
                  Nuevo usuario
                </Button>
                <Button variant="secondary" size="lg" icon={Eye} disabled={entrando} onClick={() => entrar(() => login({ nombre: 'Invitado', email: 'invitado@arandu.com.py', rol: 'Lector' }))}>
                  Entrar como invitado
                </Button>
              </div>
              <p className="mt-4 text-center text-xs text-fg-subtle">Acceso simulado para la feria: no se pide contraseña.</p>
            </motion.div>
          )}
        </motion.div>

        <p className="relative text-center text-xs text-fg-subtle">
          {BRAND.nombre} {BRAND.sufijo} · Proyecto de {BRAND.carrera} · {BRAND.evento}
        </p>
      </section>
    </div>
  )
}
