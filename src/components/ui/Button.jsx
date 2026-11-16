import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { LoaderCircle } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Tooltip } from './Tooltip'

const VARIANTS = {
  primary:
    'bg-primary text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.18),0_1px_2px_rgb(27_25_23/0.24)] hover:bg-primary-hover',
  secondary: 'bg-surface text-fg border border-line shadow-card hover:bg-surface-2 hover:border-line-strong',
  soft: 'bg-primary-soft text-primary-text hover:bg-primary/20',
  ghost: 'text-fg-muted hover:bg-surface-2 hover:text-fg',
  danger: 'bg-danger text-white shadow-[0_1px_2px_rgb(27_25_23/0.24)] hover:brightness-95',
}

const SIZES = {
  sm: 'h-8 px-2.5 text-[13px] gap-1.5 rounded-lg',
  md: 'h-9 px-3.5 text-sm gap-2 rounded-[10px]',
  lg: 'h-11 px-5 text-[15px] gap-2.5 rounded-xl',
}

const ICON_SIZES = { sm: 15, md: 16, lg: 18 }

/**
 * Botón base del sistema.
 * variant: primary | secondary | soft | ghost | danger — size: sm | md | lg
 */
export const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', icon: Icon, iconRight: IconRight, loading = false, disabled, className, children, type = 'button', ...props },
  ref,
) {
  const isDisabled = disabled || loading
  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={isDisabled}
      whileTap={isDisabled ? undefined : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={cn(
        'inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap font-medium transition-colors duration-150',
        'disabled:cursor-not-allowed disabled:opacity-55',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {loading ? (
        <LoaderCircle size={ICON_SIZES[size]} className="animate-spin" aria-hidden="true" />
      ) : (
        Icon && <Icon size={ICON_SIZES[size]} aria-hidden="true" />
      )}
      {children}
      {IconRight && !loading && <IconRight size={ICON_SIZES[size]} aria-hidden="true" />}
    </motion.button>
  )
})

const ICON_BUTTON_SIZES = { sm: 'size-8 rounded-lg', md: 'size-9 rounded-[10px]', lg: 'size-10 rounded-xl' }

/** Botón cuadrado solo con ícono. `label` es obligatorio: se usa como aria-label y tooltip. */
export const IconButton = forwardRef(function IconButton(
  { icon: Icon, label, variant = 'ghost', size = 'md', tooltip = true, tooltipSide = 'bottom', className, children, ...props },
  ref,
) {
  const button = (
    <motion.button
      ref={ref}
      type="button"
      aria-label={label}
      whileTap={{ scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={cn(
        'inline-flex shrink-0 items-center justify-center transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50',
        VARIANTS[variant],
        ICON_BUTTON_SIZES[size],
        className,
      )}
      {...props}
    >
      {Icon ? <Icon size={size === 'sm' ? 15 : 17} aria-hidden="true" /> : children}
    </motion.button>
  )
  if (!tooltip) return button
  return (
    <Tooltip content={label} side={tooltipSide}>
      {button}
    </Tooltip>
  )
})
