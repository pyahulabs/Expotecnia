import { forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'
import { controlClasses } from './Input'

/**
 * Select nativo con estilo del sistema (accesible y cómodo en celular).
 * options: ['A', 'B'] o [{ value, label }]
 */
export const Select = forwardRef(function Select({ options = [], placeholder, icon: Icon, className, wrapperClassName, invalid, children, ...props }, ref) {
  return (
    <div className={cn('relative', wrapperClassName)}>
      {Icon && <Icon size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle" aria-hidden="true" />}
      <select
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(controlClasses, 'h-9 appearance-none truncate pl-3 pr-9', Icon && 'pl-9', className)}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => {
          const value = typeof option === 'object' ? option.value : option
          const label = typeof option === 'object' ? option.label : option
          return (
            <option key={value} value={value}>
              {label}
            </option>
          )
        })}
        {children}
      </select>
      <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-fg-subtle" aria-hidden="true" />
    </div>
  )
})
