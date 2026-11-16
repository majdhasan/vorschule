import type { Round } from '../components/ChoiceGame'
import type { Word } from '../data/words'
import { getLang, IT_LETTER } from '../lib/i18n'
import { pickN } from '../lib/util'

export type BuildCtx = { childName: string; focus?: string[]; count?: number }
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

/** What the voice says for a letter: the German sound, or the Italian letter name. */
export const sound = (letter: string) => (getLang() === 'it' ? (IT_LETTER[letter] ?? letter) : (LAUT[letter] ?? letter))

/** The word in the app language. */
export const wordOf = (w: Pick<Word, 'de' | 'it'>) => (getLang() === 'it' ? w.it : w.de)
