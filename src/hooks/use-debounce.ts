import { useEffect, useState } from 'react'

/** Debounce any rapidly-changing value (used for the search box). */
export function useDebounce<T>(value: T, delay = 500): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])

  return debounced
}
