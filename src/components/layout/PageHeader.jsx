import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'
import { ease } from '@/lib/motion'

/** Encabezado de cada página: unidad temática (chip) + título + descripción + acciones. */
export function PageHeader({ eyebrow, title, description, actions, className }) {
  return (
    <div className={cn('mb-6 flex flex-col gap-4 lg:mb-8 lg:flex-row lg:items-end lg:justify-between', className)}>
      <motion.div className="min-w-0" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease }}>
        {eyebrow && (
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-line bg-surface/80 py-0.5 pl-2 pr-2.5 text-[11px] font-medium tracking-wide text-fg-muted shadow-card">
            <span className="relative grid size-1.5 place-items-center" aria-hidden="true">
              <span className="absolute size-1.5 animate-pulse-ring rounded-full bg-primary" />
              <span className="relative size-1.5 rounded-full bg-gradient-to-br from-primary to-accent" />
            </span>
            {eyebrow}
          </p>
        )}
        <h1 className="text-[26px] font-semibold leading-8 tracking-[-0.03em] text-fg sm:text-[30px] sm:leading-9">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm leading-6 text-fg-muted">{description}</p>}
      </motion.div>
      {actions && (
        <motion.div className="flex flex-wrap items-center gap-2" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.06, ease }}>
          {actions}
        </motion.div>
      )}
    </div>
  )
}
