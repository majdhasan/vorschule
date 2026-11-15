import { registerSW } from 'virtual:pwa-register'

// A new version waits until the user taps the toast, so a lesson is never reloaded mid-way.
let listener: ((apply: () => void) => void) | null = null
let pending: (() => void) | null = null

const updateSW = registerSW({
  onNeedRefresh() {
    pending = () => void updateSW(true)
    listener?.(pending)
  },
})

export function onUpdateReady(fn: (apply: () => void) => void) {
  listener = fn
  if (pending) fn(pending)
}
