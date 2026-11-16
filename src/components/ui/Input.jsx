import { forwardRef, useId } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { formatNumber, parseGs } from '@/lib/format'

export const controlClasses =
  'w-full rounded-[10px] border border-line bg-surface text-sm text-fg shadow-[0_1px_2px_rgb(27_25_23/0.04)] transition-[border-color,box-shadow] duration-150 placeholder:text-fg-subtle hover:border-line-strong focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-danger aria-[invalid=true]:ring-danger/15'

/** Envoltorio de campo: etiqueta + control + ayuda/error. */
export function Field({ label, hint, error, required, htmlFor, className, children }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label htmlFor={htmlFor} className="block text-[13px] font-medium text-fg">
          {label}
          {required && <span className="ml-0.5 text-danger-text" aria-hidden="true">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs text-danger-text" role="alert">{error}</p>
      ) : (
        hint && <p className="text-xs text-fg-subtle">{hint}</p>
      )}
    </div>
  )
}

export const Input = forwardRef(function Input({ icon: Icon, suffix, className, invalid, ...props }, ref) {
  return (
    <div className="relative">
      {Icon && <Icon size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle" aria-hidden="true" />}
      <input ref={ref} aria-invalid={invalid || undefined} className={cn(controlClasses, 'h-9 px-3', Icon && 'pl-9', suffix && 'pr-10', className)} {...props} />
      {suffix && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-fg-subtle">{suffix}</span>}
    </div>
  )
})

export const Textarea = forwardRef(function Textarea({ className, invalid, rows = 3, ...props }, ref) {
  return <textarea ref={ref} rows={rows} aria-invalid={invalid || undefined} className={cn(controlClasses, 'resize-y px-3 py-2 leading-5', className)} {...props} />
})

/** Campo de búsqueda con ícono y botón para limpiar. */
export function SearchInput({ value, onChange, placeholder = 'Buscar…', className, ...props }) {
  const id = useId()
  return (
    <div className={cn('relative', className)}>
      <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle" aria-hidden="true" />
      <input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={cn(controlClasses, 'h-9 pl-9 pr-8')}
        {...props}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Limpiar búsqueda"
          className="absolute right-1.5 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-md text-fg-subtle hover:bg-surface-2 hover:text-fg"
        >
          <X size={14} aria-hidden="true" />
        </button>
      )}
    </div>
  )
}

/** Monto en Guaraníes: muestra separador de miles mientras se escribe. `value` y `onChange` trabajan con números. */
export const MoneyInput = forwardRef(function MoneyInput({ value, onChange, className, invalid, ...props }, ref) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-medium text-fg-subtle">Gs.</span>
      <input
        ref={ref}
        inputMode="numeric"
        aria-invalid={invalid || undefined}
        value={value ? formatNumber(value) : ''}
        onChange={(e) => onChange(parseGs(e.target.value))}
        placeholder="0"
        className={cn(controlClasses, 'h-9 pl-10 pr-3 text-right tabular-nums', className)}
        {...props}
      />
    </div>
  )
})
