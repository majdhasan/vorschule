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

export function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Whole calendar days from a to b (both YYYY-MM-DD). */
export function daysBetween(a: string, b: string) {
  if (!a || !b) return Infinity
  const pa = a.split('-').map(Number)
  const pb = b.split('-').map(Number)
  const ta = Date.UTC(pa[0], pa[1] - 1, pa[2])
  const tb = Date.UTC(pb[0], pb[1] - 1, pb[2])
  return Math.round((tb - ta) / 86400000)
}

export function addDays(key: string, n: number) {
  const [y, m, d] = key.split('-').map(Number)
  return dateKey(new Date(y, m - 1, d + n))
}

/** Monday of the current week as YYYY-MM-DD. */
export function weekKey(d = new Date()) {
  const day = (d.getDay() + 6) % 7 // Mon = 0
  return dateKey(new Date(d.getFullYear(), d.getMonth(), d.getDate() - day))
}

/** Small deterministic hash for seeding daily choices. */
export function hash(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Deterministic shuffle with a seed string. */
export function seededShuffle<T>(arr: readonly T[], seed: string): T[] {
  const a = [...arr]
  let h = hash(seed)
  for (let i = a.length - 1; i > 0; i--) {
    h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0
    const j = h % (i + 1)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function lum(hex: string) {
  const n = hex.replace('#', '')
  const c = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
}

export function contrast(a: string, b: string) {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}

/** Darken a colour until white text on it (and it as text on white) reaches the given contrast. */
export function readableDark(hex: string, min = 3.2) {
  let n = hex.replace('#', '')
  let rgb = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16))
  for (let k = 0; k < 40 && contrast('#' + n, '#ffffff') < min; k++) {
    rgb = rgb.map((v) => Math.max(0, Math.round(v * 0.93)))
    n = rgb.map((v) => v.toString(16).padStart(2, '0')).join('')
  }
  return '#' + n
}
