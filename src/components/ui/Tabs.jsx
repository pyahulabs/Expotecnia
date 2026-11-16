import { useId } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'

/**
 * Pestañas con indicador animado.
 * tabs: [{ id, label, icon?, count? }] — variant: 'underline' (secciones) | 'pill' (cambio de vista)
 */
export function Tabs({ tabs, value, onChange, variant = 'underline', label = 'Secciones', className }) {
  const layoutId = useId()

  const onKeyDown = (event) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
    event.preventDefault()
    const index = tabs.findIndex((t) => t.id === value)
    const next = tabs[(index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length]
    onChange(next.id)
    event.currentTarget.querySelector(`[data-tab="${next.id}"]`)?.focus()
  }

  if (variant === 'pill') {
    return (
      <div role="tablist" aria-label={label} onKeyDown={onKeyDown} className={cn('inline-flex rounded-xl bg-surface-2 p-1', className)}>
        {tabs.map((tab) => {
          const active = tab.id === value
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              data-tab={tab.id}
              aria-selected={active}
              tabIndex={active ? 0 : -1}
              onClick={() => onChange(tab.id)}
              className={cn(
                'relative inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium transition-colors duration-150',
                active ? 'text-fg' : 'text-fg-muted hover:text-fg',
              )}
            >
              {active && (
                <motion.span
                  layoutId={layoutId}
                  className="absolute inset-0 rounded-lg border border-line bg-surface shadow-card"
                  transition={{ type: 'spring', stiffness: 480, damping: 36 }}
                />
              )}
              <span className="relative inline-flex items-center gap-1.5">
                {tab.icon && <tab.icon size={15} aria-hidden="true" />}
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div role="tablist" aria-label={label} onKeyDown={onKeyDown} className={cn('no-scrollbar flex gap-1 overflow-x-auto border-b border-line', className)}>
      {tabs.map((tab) => {
        const active = tab.id === value
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            data-tab={tab.id}
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative -mb-px inline-flex h-11 shrink-0 items-center gap-2 px-3 text-sm font-medium transition-colors duration-150',
              active ? 'text-fg' : 'text-fg-muted hover:text-fg',
            )}
          >
            {tab.icon && <tab.icon size={16} aria-hidden="true" className={active ? 'text-primary-text' : undefined} />}
            {tab.label}
            {tab.count != null && (
              <span className={cn('rounded-full px-1.5 text-[11px] font-semibold leading-[18px] tabular-nums', active ? 'bg-primary-soft text-primary-text' : 'bg-surface-2 text-fg-subtle')}>
                {tab.count}
              </span>
            )}
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary"
                transition={{ type: 'spring', stiffness: 480, damping: 36 }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
