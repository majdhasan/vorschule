import type { Round } from '../components/ChoiceGame'
import { pickN } from '../lib/util'

export type BuildCtx = { bilingual: boolean; childName: string; focus?: string[]; count?: number }
export type Builder = (level: number, ctx: BuildCtx) => Round[]

/** n items from pool, focus items (by key) first. */
export function pickFocus<T>(pool: readonly T[], n: number, key: (x: T) => string, focus?: string[]): T[] {
  const f = focus?.length ? pool.filter((x) => focus.includes(key(x))) : []
  return [...f, ...pickN(pool, Math.max(0, n - f.length), (x) => f.includes(x))].slice(0, n)
}

/** How a German teacher "lautiert" a letter (sound, not letter name). */
export const LAUT: Record<string, string> = {
  A: 'a', B: 'bö', C: 'kö', D: 'dö', E: 'e', F: 'fff', G: 'gö', H: 'hö', I: 'i', J: 'jö', K: 'kö', L: 'lll', M: 'mmm',
  N: 'nnn', O: 'o', P: 'pö', Q: 'kwö', R: 'rrr', S: 'sss', T: 'tö', U: 'u', V: 'fff', W: 'wö', X: 'ks', Y: 'ü', Z: 'zö',
}
