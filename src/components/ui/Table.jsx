import { cn } from '@/lib/cn'

/** Tabla del sistema: envoltorio con scroll horizontal en pantallas chicas. */
export function Table({ className, children, ...props }) {
  return (
    <div className="relative w-full overflow-x-auto">
      <table className={cn('w-full border-collapse text-left text-sm', className)} {...props}>
        {children}
      </table>
    </div>
  )
}

export function THead({ children }) {
  return <thead className="border-b border-line bg-surface-2/50">{children}</thead>
}

export function TBody({ children }) {
  return <tbody className="divide-y divide-line">{children}</tbody>
}

export function TR({ className, interactive = true, children, ...props }) {
  return (
    <tr className={cn(interactive && 'transition-colors duration-100 hover:bg-surface-2/60', className)} {...props}>
      {children}
    </tr>
  )
}

export function TH({ align = 'left', className, children, ...props }) {
  return (
    <th
      scope="col"
      className={cn(
        'h-10 whitespace-nowrap px-4 text-[11px] font-semibold uppercase tracking-[0.06em] text-fg-subtle first:pl-5 last:pr-5 sm:first:pl-6 sm:last:pr-6',
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
