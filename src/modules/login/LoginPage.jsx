import { useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from 'framer-motion'
import { ArrowRight, ChevronDown, Eye, EyeOff, LoaderCircle, Lock, Mail, TriangleAlert, Users } from 'lucide-react'
import { BRAND } from '@/config/brand'
import { COLECCIONES, ROLES } from '@/config/constants'
import { useSession } from '@/context/SessionContext'
import { updateItem, useCollection } from '@/firebase/hooks'
import { autenticar, cuentasDemostracion } from '@/lib/acceso'
import { cn } from '@/lib/cn'
import { ease } from '@/lib/motion'
import { Avatar, Badge, ThemeToggle, toast } from '@/components/ui'
import { LogoMark } from '@/components/layout/Logo'
import { LoginBackground } from './LoginBackground'
import { LoginShowcase } from './LoginShowcase'

// Pantalla de acceso. Control de acceso de DEMOSTRACIÓN en el cliente: ver la advertencia
// en src/config/usuarios.js (no reemplaza a Firebase Authentication).

const EMAIL_VALIDO = /^\S+@\S+\.\S+$/

const entrada = {
  hidden: { opacity: 0, y: 14 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.55, delay: 0.12 + i * 0.07, ease } }),
}

function Campo({ id, label, icon: Icon, error, children, accion }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-[13px] font-medium text-fg">
          {label}
        </label>
        {accion}
      </div>
      <div
        className={cn(
          'group relative flex items-center rounded-xl border bg-surface/80 shadow-[0_1px_2px_rgb(16_16_23/0.04)] transition-[border-color,box-shadow] duration-150',
          error ? 'border-danger/70 ring-[3px] ring-danger/15' : 'border-line hover:border-line-strong focus-within:border-primary focus-within:ring-[3px] focus-within:ring-primary/20',
        )}
      >
        <Icon size={16} className={cn('pointer-events-none ml-3.5 shrink-0 transition-colors', error ? 'text-danger-text' : 'text-fg-subtle group-focus-within:text-primary-text')} aria-hidden="true" />
        {children}
      </div>
      <AnimatePresence initial={false}>
        {error && (
          <motion.p
            id={`${id}-error`}
            role="alert"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="text-xs text-danger-text"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function LoginPage() {
  const { user, login } = useSession()
  const navigate = useNavigate()
  const location = useLocation()
  const reducir = useReducedMotion()
  const sacudir = useAnimationControls()
  const { data: usuarios } = useCollection(COLECCIONES.usuarios)

  const [email, setEmail] = useState('')
  const [clave, setClave] = useState('')
  const [verClave, setVerClave] = useState(false)
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [estado, setEstado] = useState('idle') // idle | ingresando | saliendo
  const [verCuentas, setVerCuentas] = useState(false)
  const claveRef = useRef(null)
  const emailRef = useRef(null)

  const cuentas = useMemo(() => cuentasDemostracion(usuarios), [usuarios])

  useEffect(() => {
    const t = setTimeout(() => emailRef.current?.focus({ preventScroll: true }), 500)
    return () => clearTimeout(t)
  }, [])

  if (user && estado === 'idle') return <Navigate to={location.state?.from || '/'} replace />

  const fallar = (mensaje) => {
    setErrorGeneral(mensaje)
    setEstado('idle')
    if (!reducir) sacudir.start({ x: [0, -11, 10, -8, 7, -4, 3, 0], transition: { duration: 0.5, ease: 'easeOut' } })
  }

  const enviar = (event) => {
    event.preventDefault()
    if (estado !== 'idle') return
    const siguientes = {}
    if (!email.trim()) siguientes.email = 'Ingresá tu correo electrónico.'
    else if (!EMAIL_VALIDO.test(email.trim())) siguientes.email = 'El correo no tiene un formato válido.'
    if (!clave) siguientes.clave = 'Ingresá tu contraseña.'
    setErrores(siguientes)
    setErrorGeneral('')
    if (Object.keys(siguientes).length) {
      fallar('')
      return
    }

    setEstado('ingresando')
    // Pequeña espera para que el estado «Ingresando…» se perciba
    window.setTimeout(() => {
      const resultado = autenticar(email, clave, usuarios)
      if (!resultado.ok) {
        fallar(resultado.motivo === 'inactivo' ? 'Esta cuenta está desactivada. Pedile a un administrador que la active.' : 'Correo o contraseña incorrectos. Revisá los datos e intentá de nuevo.')
        return
      }
      const { usuario } = resultado
      setEstado('saliendo')
      // Se espera la animación de salida y luego se entra al dashboard
      window.setTimeout(() => {
        login(usuario)
        if (usuarios.some((u) => u.id === usuario.id)) updateItem(COLECCIONES.usuarios, usuario.id, { ultimoAcceso: Date.now() })
        navigate(location.state?.from || '/', { replace: true })
        toast.success(`¡Hola, ${usuario.nombre.split(' ')[0]}!`, `Ingresaste como ${usuario.rol}.`)
      }, reducir ? 0 : 480)
    }, 750)
  }

  const elegirCuenta = (cuenta) => {
    setEmail(cuenta.email)
    setErrores({})
    setErrorGeneral('')
    setVerCuentas(false)
    window.setTimeout(() => claveRef.current?.focus(), 50)
  }

  const ocupado = estado !== 'idle'

  return (
    <motion.div
      className="relative flex min-h-dvh flex-col overflow-hidden bg-canvas"
      animate={estado === 'saliendo' ? { opacity: 0, scale: 1.015 } : { opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, ease }}
    >
      <LoginBackground />

      <header className="relative z-10 flex items-center justify-between px-5 py-5 sm:px-8">
        <span className="flex items-center gap-2.5">
          <LogoMark size={30} />
          <span className="text-[15px] font-semibold tracking-[-0.02em] text-fg">
            {BRAND.nombre} <span className="font-normal text-fg-subtle">{BRAND.sufijo}</span>
          </span>
        </span>
        <ThemeToggle />
      </header>

      <main className="relative z-10 mx-auto grid w-full max-w-[1240px] flex-1 grid-cols-1 items-center gap-12 px-5 pb-8 sm:px-8 lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)] lg:gap-16">
        {/* Tarjeta de acceso */}
        <motion.section animate={sacudir} className="mx-auto w-full max-w-[440px]" aria-labelledby="login-titulo">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease }}
            className="glass-strong relative overflow-hidden rounded-3xl border border-line p-6 shadow-pop sm:p-8"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" aria-hidden="true" />

            <motion.div variants={entrada} initial="hidden" animate="show" custom={0} className="flex items-center gap-3">
              <span className="rounded-2xl shadow-[0_10px_28px_-8px_var(--primary)]">
                <LogoMark size={44} />
              </span>
              <div>
                <h1 id="login-titulo" className="text-[22px] font-semibold leading-7 tracking-[-0.025em] text-fg">
                  {BRAND.nombre} {BRAND.sufijo}
                </h1>
                <p className="text-[13px] text-fg-muted">Gestión empresarial en tiempo real</p>
              </div>
            </motion.div>

            <motion.p variants={entrada} initial="hidden" animate="show" custom={1} className="mt-6 text-sm leading-6 text-fg-muted">
              Ingresá con tu cuenta para continuar.
            </motion.p>

            <form onSubmit={enviar} noValidate className="mt-5 space-y-4">
              <motion.div variants={entrada} initial="hidden" animate="show" custom={2}>
                <Campo id="login-email" label="Correo electrónico" icon={Mail} error={errores.email}>
                  <input
                    ref={emailRef}
                    id="login-email"
                    type="email"
                    inputMode="email"
                    autoComplete="username"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrores((x) => ({ ...x, email: undefined })); setErrorGeneral('') }}
                    placeholder="nombre.apellido@gmail.com"
                    aria-invalid={errores.email ? true : undefined}
                    aria-describedby={errores.email ? 'login-email-error' : undefined}
                    disabled={ocupado}
                    className="h-11 w-full min-w-0 bg-transparent px-3 text-sm text-fg outline-none placeholder:text-fg-subtle disabled:opacity-70"
                  />
                </Campo>
              </motion.div>

              <motion.div variants={entrada} initial="hidden" animate="show" custom={3}>
                <Campo id="login-clave" label="Contraseña" icon={Lock} error={errores.clave}>
                  <input
                    ref={claveRef}
                    id="login-clave"
                    type={verClave ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={clave}
                    onChange={(e) => { setClave(e.target.value); setErrores((x) => ({ ...x, clave: undefined })); setErrorGeneral('') }}
                    placeholder="Tu contraseña"
                    aria-invalid={errores.clave ? true : undefined}
                    aria-describedby={errores.clave ? 'login-clave-error' : undefined}
                    disabled={ocupado}
                    className="h-11 w-full min-w-0 bg-transparent px-3 text-sm text-fg outline-none placeholder:text-fg-subtle disabled:opacity-70"
                  />
                  <button
                    type="button"
                    onClick={() => setVerClave((v) => !v)}
                    aria-label={verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    aria-pressed={verClave}
                    className="mr-1.5 grid size-8 shrink-0 place-items-center rounded-lg text-fg-subtle transition-colors hover:bg-surface-2 hover:text-fg"
                  >
                    {verClave ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                  </button>
                </Campo>
              </motion.div>

              <AnimatePresence initial={false}>
                {errorGeneral && (
                  <motion.div
                    role="alert"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-start gap-2.5 rounded-xl border border-danger/25 bg-danger-soft px-3.5 py-3 text-[13px] leading-5 text-danger-text"
                  >
                    <TriangleAlert size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                    {errorGeneral}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div variants={entrada} initial="hidden" animate="show" custom={4}>
                <motion.button
                  type="submit"
                  disabled={ocupado}
                  whileHover={ocupado ? undefined : { y: -1 }}
                  whileTap={ocupado ? undefined : { scale: 0.985 }}
                  className="shine-loop relative flex h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-brand-button text-[15px] font-semibold text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_10px_28px_-10px_var(--primary)] transition-shadow hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_14px_34px_-10px_var(--primary)] disabled:cursor-wait"
                >
                  {ocupado ? (
                    <>
                      <LoaderCircle size={17} className="animate-spin" aria-hidden="true" />
                      Ingresando…
                    </>
                  ) : (
                    <>
                      Ingresar
                      <ArrowRight size={17} aria-hidden="true" />
                    </>
                  )}
                </motion.button>
              </motion.div>
            </form>

            {/* Cuentas de la demostración */}
            <motion.div variants={entrada} initial="hidden" animate="show" custom={5} className="mt-5 border-t border-line pt-4">
              <button
                type="button"
                onClick={() => setVerCuentas((v) => !v)}
                aria-expanded={verCuentas}
                aria-controls="cuentas-demo"
                className="mx-auto flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-fg-subtle transition-colors hover:text-fg"
              >
                <Users size={14} aria-hidden="true" />
                Cuentas de la demostración
                <ChevronDown size={14} className={cn('transition-transform duration-200', verCuentas && 'rotate-180')} aria-hidden="true" />
              </button>
              <AnimatePresence initial={false}>
                {verCuentas && (
                  <motion.ul
                    id="cuentas-demo"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="mt-3 max-h-56 space-y-1 overflow-y-auto pr-1"
                    aria-label="Cuentas de la demostración"
                  >
                    {cuentas.map((c) => (
                      <li key={c.email}>
                        <button
                          type="button"
                          onClick={() => elegirCuenta(c)}
                          className={cn('flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-surface-2', email === c.email && 'bg-primary-soft')}
                        >
                          <Avatar name={c.nombre} size="sm" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[13px] font-medium text-fg">{c.nombre}</span>
                            <span className="block truncate text-[11px] text-fg-subtle">{c.email}</span>
                          </span>
                          <Badge tone={ROLES[c.rol]?.tone || 'neutral'} size="sm">
                            {c.rol}
                          </Badge>
                        </button>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </motion.section>

        {/* Panel con tarjetas flotantes */}
        <section className="hidden lg:block" aria-label="Vista previa del sistema">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2, ease }} className="mb-6 max-w-lg">
            <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-3 py-1 text-xs font-medium text-fg-muted backdrop-blur">
              <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
              {BRAND.evento} · {BRAND.carrera}
            </p>
            <h2 className="mt-4 text-[40px] font-semibold leading-[1.08] tracking-[-0.035em] text-fg xl:text-[46px]">
              Toda tu organización, <span className="text-brand">en un solo lugar.</span>
            </h2>
            <p className="mt-3 max-w-md text-[15px] leading-7 text-fg-muted">Planeación, personas, calidad, finanzas y proyectos con datos sincronizados al instante.</p>
          </motion.div>
          <LoginShowcase />
        </section>
      </main>

      <footer className="relative z-10 px-5 pb-6 text-center text-xs text-fg-subtle sm:px-8">Expotecnia 2026 · Facultad Politécnica · UNVES</footer>
    </motion.div>
  )
}
