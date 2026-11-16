import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Une clases condicionales y resuelve conflictos de Tailwind. */
export const cn = (...inputs) => twMerge(clsx(inputs))
