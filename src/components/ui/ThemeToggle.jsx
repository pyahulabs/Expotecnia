import { AnimatePresence, motion } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import { IconButton } from './Button'

/** Alterna entre modo claro y oscuro (se guarda en localStorage). */
export function ThemeToggle({ className }) {
  const { theme, toggleTheme } = useTheme()
  const dark = theme === 'dark'
  return (
    <IconButton label={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'} onClick={toggleTheme} aria-pressed={dark} className={className}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ rotate: -90, scale: 0.4, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          exit={{ rotate: 90, scale: 0.4, opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="grid place-items-center"
        >
          {dark ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
        </motion.span>
      </AnimatePresence>
    </IconButton>
  )
}
