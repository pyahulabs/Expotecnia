import { cn } from '@/lib/cn'

/** Encabezado de cada página: unidad temática + título + descripción + acciones. */
export function PageHeader({ eyebrow, title, description, actions, className }) {
  return (
    <div className={cn('mb-6 flex flex-col gap-4 lg:mb-8 lg:flex-row lg:items-end lg:justify-between', className)}>
      <div className="min-w-0">
        {eyebrow && <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.09em] text-primary-text">{eyebrow}</p>}
        <h1 className="text-2xl font-semibold leading-8 tracking-[-0.025em] text-fg sm:text-[28px] sm:leading-9">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm leading-6 text-fg-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}
