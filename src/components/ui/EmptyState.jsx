import { motion } from 'framer-motion'
import { Inbox } from 'lucide-react'
import { cn } from '@/lib/cn'
import { ease } from '@/lib/motion'

/** Ilustración genérica: tarjetas apiladas + burbuja con ícono. Usa los tokens, sirve en claro y oscuro. */
function Illustration({ icon: Icon }) {
  return (
    <div className="relative mx-auto h-[120px] w-[168px]" aria-hidden="true">
      <svg viewBox="0 0 168 120" className="absolute inset-0 size-full" fill="none">
        <ellipse cx="84" cy="108" rx="58" ry="7" fill="var(--surface-3)" opacity="0.7" />
        <rect x="34" y="20" width="100" height="70" rx="12" fill="var(--surface-2)" stroke="var(--border)" transform="rotate(-6 84 55)" />
        <rect x="34" y="24" width="100" height="70" rx="12" fill="var(--surface)" stroke="var(--border-strong)" />
        <rect x="46" y="38" width="34" height="6" rx="3" fill="var(--surface-3)" />
        <rect x="46" y="52" width="76" height="5" rx="2.5" fill="var(--surface-2)" />
        <rect x="46" y="63" width="62" height="5" rx="2.5" fill="var(--surface-2)" />
        <rect x="46" y="74" width="44" height="5" rx="2.5" fill="var(--surface-2)" />
        <path d="M22 34v8M18 38h8" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        <path d="M150 62v6M147 65h6" stroke="var(--warning)" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
        <circle cx="30" cy="78" r="3" fill="var(--success)" opacity="0.5" />
      </svg>
      <motion.div
        className="absolute right-3 top-0 grid size-12 place-items-center rounded-2xl bg-primary text-white shadow-raised"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Icon size={22} />
      </motion.div>
    </div>
  )
}

/** Estado vacío: ilustración + mensaje + acción principal. */
export function EmptyState({ icon = Inbox, title, description, action, compact = false, className }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease }}
      className={cn('flex flex-col items-center justify-center text-center', compact ? 'px-4 py-8' : 'px-6 py-14', className)}
    >
      <Illustration icon={icon} />
      <h3 className="mt-5 text-base font-semibold text-fg">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-[13px] leading-5 text-fg-muted">{description}</p>}
      {action && <div className="mt-5 flex flex-wrap items-center justify-center gap-2">{action}</div>}
    </motion.div>
  )
}
