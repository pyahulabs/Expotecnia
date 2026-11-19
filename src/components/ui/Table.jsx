import { cn } from '@/lib/cn'

/** Tabla del sistema: encabezado fijo y scroll propio (horizontal en pantallas chicas). */
export function Table({ className, maxHeight = 'max-h-[68vh]', children, ...props }) {
  return (
    <div className={cn('relative w-full overflow-auto', maxHeight)}>
      <table className={cn('w-full border-collapse text-left text-sm', className)} {...props}>
        {children}
      </table>
    </div>
  )
}

export function THead({ children }) {
  return <thead>{children}</thead>
}

export function TBody({ children }) {
  return <tbody className="divide-y divide-line">{children}</tbody>
}

export function TR({ className, interactive = true, children, ...props }) {
  return (
    <tr className={cn(interactive && 'transition-colors duration-100 hover:bg-primary-soft/40', className)} {...props}>
      {children}
    </tr>
  )
}

export function TH({ align = 'left', className, children, ...props }) {
  return (
    <th
      scope="col"
      className={cn(
        'sticky top-0 z-10 h-10 whitespace-nowrap bg-surface-2 px-4 text-[11px] font-semibold uppercase tracking-[0.06em] text-fg-subtle shadow-[inset_0_-1px_0_var(--border)] first:pl-5 last:pr-5 sm:first:pl-6 sm:last:pr-6',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
        className,
      )}
      {...props}
    >
      {children}
    </th>
  )
}

export function TD({ align = 'left', className, children, ...props }) {
  return (
    <td
      className={cn(
        'px-4 py-3 align-middle text-fg first:pl-5 last:pr-5 sm:first:pl-6 sm:last:pr-6',
        align === 'right' && 'text-right tabular-nums',
        align === 'center' && 'text-center',
        className,
      )}
      {...props}
    >
      {children}
    </td>
  )
}
