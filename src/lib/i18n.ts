// One app language, chosen by the parent: everything (UI, speech, game content) follows it.
export type Lang = 'de' | 'it'

let current: Lang = 'de'

export const getLang = () => current

export function setLang(l: Lang) {
  current = l
  if (typeof document !== 'undefined') document.documentElement.lang = l
}

/** The string for the current language. */
export const t = (de: string, it: string) => (current === 'it' ? it : de)

/** Pick from a {de, it} record. */
export const tr = <T,>(o: { de: T; it: T }): T => o[current]

/** First letter upper-case (Italian weekday/season names are lower-case in the data). */
export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** Italian letter names, so a voice says "emme" for M. */
export const IT_LETTER: Record<string, string> = {
  A: 'a', B: 'bi', C: 'ci', D: 'di', E: 'e', F: 'effe', G: 'gi', H: 'acca', I: 'i', J: 'i lunga', K: 'cappa', L: 'elle', M: 'emme',
  N: 'enne', O: 'o', P: 'pi', Q: 'cu', R: 'erre', S: 'esse', T: 'ti', U: 'u', V: 'vu', W: 'doppia vu', X: 'ics', Y: 'ipsilon', Z: 'zeta',
}
