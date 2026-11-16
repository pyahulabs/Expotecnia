// Tokens de movimiento: una sola curva y pocas duraciones para toda la app.
export const ease = [0.22, 1, 0.36, 1]

export const duration = { micro: 0.15, base: 0.25, slow: 0.45 }

/** Contenedor que hace entrar a sus hijos de forma escalonada. */
export const stagger = (step = 0.06, delay = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren: step, delayChildren: delay } },
})

/** Hijo estándar para usar dentro de un contenedor `stagger`. */
export const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: duration.slow, ease } },
}

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: duration.base, ease } },
}

export const pageTransition = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.32, ease } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.16, ease: 'easeIn' } },
}
