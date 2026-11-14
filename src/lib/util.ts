export function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function pickN<T>(arr: readonly T[], n: number, exclude: (x: T) => boolean = () => false): T[] {
  return shuffle(arr.filter((x) => !exclude(x))).slice(0, n)
}

export function randInt(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min + 1))
}

export function range(n: number) {
  return Array.from({ length: n }, (_, i) => i)
}

export function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function starsFor(correct: number, total: number) {
  const r = total === 0 ? 0 : correct / total
  if (r >= 0.9) return 3
  if (r >= 0.6) return 2
  if (r > 0) return 1
  return 0
}

export const coin = () => Math.random() < 0.5
