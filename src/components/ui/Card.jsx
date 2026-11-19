import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'

/**
 * Tarjeta base. Es un `motion.div`, así que acepta `variants` para entrar
 * escalonada dentro de un contenedor con `stagger()`.
 */
export const Card = forwardRef(function Card({ interactive = false, className, children, ...props }, ref) {
  return (
    <motion.div
      ref={ref}
      whileHover={interactive ? { y: -3 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className={cn(
        'rounded-2xl border border-line bg-surface shadow-card',
        interactive && 'transition-[box-shadow,border-color] duration-200 hover:border-line-strong hover:shadow-raised',
        className,
      )}
      {...props}
    >
      {children}
    </motion.div>
  )
})

export function CardHeader({ title, description, action, icon: Icon, className }) {
  return (
    <div className={cn('flex items-start justify-between gap-4 px-5 pt-5 sm:px-6 sm:pt-6', className)}>
      <div className="flex min-w-0 items-start gap-3">
        {Icon && (
          <div className="grid size-9 shrink-0 place-items-center rounded-xl border border-primary/15 bg-primary-soft text-primary-text">
            <Icon size={17} aria-hidden="true" />
          </div>
        )}
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold leading-6 tracking-[-0.015em] text-fg">{title}</h2>
          {description && <p className="mt-0.5 text-[13px] leading-5 text-fg-muted">{description}</p>}
        </div>
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  )
}

export function CardBody({ className, children }) {
  return <div className={cn('p-5 sm:p-6', className)}>{children}</div>
}
