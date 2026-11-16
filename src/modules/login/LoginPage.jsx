import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Lock, Mail, Radio, ShieldCheck, SlidersHorizontal, TrendingUp, User } from 'lucide-react'
import { BRAND } from '@/config/brand'
import { useSession } from '@/context/SessionContext'
import { ease, fadeUp, stagger } from '@/lib/motion'
import { Button, Field, Input, ThemeToggle } from '@/components/ui'
import { Logo, LogoMark } from '@/components/layout/Logo'

const DEMO_USER = { nombre: 'María José Benítez', email: 'maria.benitez@yvoty.com.py' }

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

/** Pantalla de bienvenida con acceso SIMULADO (no valida credenciales). */
export default function LoginPage() {
  const { user, login } = useSession()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState(DEMO_USER)
  const [loading, setLoading] = useState(false)

  if (user && !loading) return <Navigate to="/" replace />

  const enter = (data) => {
    setLoading(true)
    // Pequeña espera para que se perciba la transición de ingreso
    window.setTimeout(() => {
      login(data)
      navigate(location.state?.from || '/', { replace: true })
    }, 650)
  }

  const onSubmit = (event) => {
    event.preventDefault()
    enter(form)
  }

  return (
    <div className="grid grid-cols-1 min-h-dvh bg-canvas lg:grid-cols-[1.08fr_1fr]">
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

      {/* Formulario */}
      <section className="relative flex flex-col px-5 py-6 sm:px-10">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(60%_100%_at_50%_0%,var(--primary-soft),transparent)] lg:hidden" aria-hidden="true" />
        <div className="relative flex items-center justify-between">
          <Logo className="lg:invisible" />
          <ThemeToggle />
        </div>

        <motion.div
          className="relative mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-10"
          variants={stagger(0.07)}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={fadeUp}>
            <h2 className="text-[28px] font-semibold leading-9 tracking-[-0.025em] text-fg">Te damos la bienvenida</h2>
            <p className="mt-2 text-sm leading-6 text-fg-muted">
              Ingresá para ver el panel de <span className="font-medium text-fg">{BRAND.organizacion}</span>
            </p>
          </motion.div>

          <motion.form variants={fadeUp} onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>
            <Field label="Nombre" htmlFor="login-nombre">
              <Input id="login-nombre" icon={User} autoComplete="name" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Tu nombre" className="h-11" />
            </Field>
            <Field label="Correo electrónico" htmlFor="login-email">
              <Input id="login-email" icon={Mail} type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="nombre@empresa.com.py" className="h-11" />
            </Field>
            <Field label="Contraseña" htmlFor="login-pass" hint="Acceso simulado para la feria: no se valida la contraseña.">
              <Input id="login-pass" icon={Lock} type="password" defaultValue="expotecnia" autoComplete="off" className="h-11" />
            </Field>
            <Button type="submit" size="lg" loading={loading} iconRight={ArrowRight} className="mt-2 w-full">
              {loading ? 'Ingresando…' : 'Ingresar al sistema'}
            </Button>
          </motion.form>

          <motion.div variants={fadeUp} className="mt-4">
            <div className="flex items-center gap-3 py-2 text-xs text-fg-subtle">
              <span className="h-px flex-1 bg-line" />o<span className="h-px flex-1 bg-line" />
            </div>
            <Button variant="secondary" size="lg" className="mt-2 w-full" disabled={loading} onClick={() => enter({ nombre: 'Invitado', email: 'invitado@arandu.com.py', rol: 'Visitante' })}>
              Entrar como invitado
            </Button>
          </motion.div>
        </motion.div>

        <p className="relative text-center text-xs text-fg-subtle">
          {BRAND.nombre} {BRAND.sufijo} · Proyecto de {BRAND.carrera} · {BRAND.evento}
        </p>
      </section>
    </div>
  )
}
