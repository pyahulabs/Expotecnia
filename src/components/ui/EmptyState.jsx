import { motion } from 'framer-motion'
import { DatabaseZap, Inbox } from 'lucide-react'
import { cn } from '@/lib/cn'
import { ease } from '@/lib/motion'
import { esAdministrador, useSession } from '@/context/SessionContext'
import { useDemoActions } from '@/lib/useDemoActions'
import { Button } from './Button'

/** Ilustración: tarjetas apiladas, un gráfico tenue y el ícono del módulo flotando. Usa los tokens (claro y oscuro). */
function Illustration({ icon: Icon }) {
  return (
    <div className="relative mx-auto h-[132px] w-[188px]" aria-hidden="true">
      <div className="absolute inset-x-6 bottom-1 h-6 rounded-full bg-primary/15 blur-xl" />
      <svg viewBox="0 0 188 132" className="absolute inset-0 size-full" fill="none">
        <rect x="38" y="22" width="112" height="76" rx="14" fill="var(--surface-2)" stroke="var(--border)" transform="rotate(-7 94 60)" />
        <rect x="38" y="28" width="112" height="76" rx="14" fill="var(--surface)" stroke="var(--border-strong)" />
        <rect x="52" y="42" width="38" height="6" rx="3" fill="var(--surface-3)" />
        <rect x="52" y="54" width="22" height="4" rx="2" fill="var(--surface-2)" />
        <path d="M52 92 L66 80 L78 85 L92 70 L106 76 L120 62 L136 66" stroke="var(--primary)" strokeOpacity="0.45" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M52 92 L66 80 L78 85 L92 70 L106 76 L120 62 L136 66 L136 96 L52 96 Z" fill="var(--primary)" fillOpacity="0.07" />
        <path d="M22 38v8M18 42h8" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" opacity="0.55" />
        <path d="M168 72v6M165 75h6" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
        <circle cx="30" cy="92" r="3" fill="var(--success)" opacity="0.5" />
      </svg>
      <motion.div
        className="absolute right-4 top-1 grid size-12 place-items-center rounded-2xl bg-brand-animated text-white shadow-[0_10px_24px_-8px_var(--primary)] ring-4 ring-surface"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Icon size={22} />
      </motion.div>
    </div>
  )
}

/** Botón «Cargar datos de demo»: solo lo ve un Administrador. */
export function CargarDemoBoton({ variant = 'primary', size = 'md' }) {
  const { user } = useSession()
  const { seed, seeding } = useDemoActions()
  if (!esAdministrador(user)) return null
  return (
    <Button variant={variant} size={size} icon={DatabaseZap} loading={seeding} onClick={seed}>
      Cargar datos de demo
    </Button>
  )
}

/**
 * Estado vacío: ilustración + mensaje + acciones.
 * `demo` agrega el botón «Cargar datos de demo» (visible solo para el Administrador).
 */
export function EmptyState({ icon = Inbox, title, description, action, demo = false, compact = false, className }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease }}
      className={cn('flex flex-col items-center justify-center text-center', compact ? 'px-4 py-8' : 'px-6 py-14', className)}
    >
      <Illustration icon={icon} />
      <h3 className="mt-5 text-base font-semibold tracking-[-0.01em] text-fg">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-[13px] leading-5 text-fg-muted">{description}</p>}
      {(action || demo) && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {demo && <CargarDemoBoton variant={action ? 'secondary' : 'primary'} />}
          {action}
        </div>
      )}
    </motion.div>
  )
}
