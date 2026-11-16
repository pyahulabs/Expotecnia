import { useCallback, useState } from 'react'

/** useState que se guarda en localStorage. */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored == null ? initialValue : JSON.parse(stored)
    } catch {
      return initialValue
    }
  })

  const set = useCallback(
    (next) => {
      setValue((current) => {
        const resolved = typeof next === 'function' ? next(current) : next
        try {
          localStorage.setItem(key, JSON.stringify(resolved))
        } catch {
          /* noop */
        }
        return resolved
      })
    },
    [key],
  )

  return [value, set]
}
