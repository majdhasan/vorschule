import { useCallback, useEffect, useRef } from 'react'

/**
 * Ignore taps for a short moment after `dep` changes (or after mount).
 * Buttons that swap in the same spot (Überprüfen → Weiter → next screen)
 * would otherwise swallow a fast double tap and skip a screen.
 */
export function useTapGuard(dep: unknown, ms = 450) {
  const since = useRef(0)
  useEffect(() => {
    since.current = performance.now()
  }, [dep])
  return useCallback(
    <A extends unknown[]>(fn: (...a: A) => void) =>
      (...a: A) => {
        if (performance.now() - since.current < ms) return
        fn(...a)
      },
    [ms],
  )
}
