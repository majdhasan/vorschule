import type { Round } from '../components/ChoiceGame'
import { ALPHABET, ALPHABET_IT } from '../data/words'
import { getLang, IT_LETTER } from '../lib/i18n'
import { pickN, shuffle } from '../lib/util'
import { pickFocus, type Builder } from './types'

const EASY = 'AEIOMLSNTRBPKDFHUW'.split('')
const EASY_IT = 'AEIOUMLSNTRPCDFB'.split('')

export const build: Builder = (level, { childName, focus, count = 6 }) => {
  const it = getLang() === 'it'
  const ABC = it ? ALPHABET_IT : ALPHABET
  // German voices read a lone letter as its name; Italian ones need it spelled out
  const nm = (l: string) => (it ? IT_LETTER[l] : l)
  const nameLetters = Array.from(new Set(childName.toUpperCase().replace(/[^A-Z]/g, '').split(''))).filter((l) => ABC.includes(l))
  const pool = level === 1 ? Array.from(new Set([...nameLetters, ...(it ? EASY_IT : EASY)])) : ABC
  const targets = pickFocus(pool, count, (x) => x, focus)
  return targets.map((L): Round => {
    const l = L.toLowerCase()
    if (level === 1) {
      const opts = shuffle([L, ...pickN(pool, 2, (x) => x === L)])
      return {
        prompt: it ? `Questa è la ${L} maiuscola. Trova la ${l} minuscola!` : `Das ist das große ${L}. Finde das kleine ${l}!`,
        say: it ? `Questa è la ${nm(L)} maiuscola. Trova la ${nm(L)} minuscola.` : `Das ist das große ${L}. Finde das kleine ${L}.`,
        item: L,
        visual: <div className="big-letter">{L}</div>,
        options: opts.map((o) => ({ key: o, node: <span className="letter-opt">{o.toLowerCase()}</span>, say: nm(o) })),
        answer: L,
        columns: 3,
      }
    }
    const opts = shuffle([L, ...pickN(ABC, 3, (x) => x === L)])
    if (level === 2) {
      // audio only: the glyph is not shown, so it can't be solved by shape matching
      return {
        prompt: it ? 'Ascolta bene: quale lettera cerco?' : 'Hör gut zu: Welchen Buchstaben suche ich?',
        say: it ? `Trova la ${nm(L)}. ${nm(L)}.` : `Finde das ${L}. ${L}.`,
        item: L,
        visual: <div className="listen-card">👂 🔊</div>,
        options: opts.map((o) => ({ key: o, node: <span className="letter-opt">{o}</span>, say: nm(o) })),
        answer: L,
        columns: 2,
      }
    }
    return {
      prompt: it ? `Questa è la ${l} minuscola. Dov'è la ${L} maiuscola?` : `Das ist das kleine ${l}. Wo ist das große ${L}?`,
      say: it ? `Questa è la ${nm(L)} minuscola. Dov'è la ${nm(L)} maiuscola?` : `Das ist das kleine ${L}. Wo ist das große ${L}?`,
      item: L,
      visual: <div className="big-letter">{l}</div>,
      options: opts.map((o) => ({ key: o, node: <span className="letter-opt">{o}</span>, say: nm(o) })),
      answer: L,
      columns: 2,
    }
  })
}
