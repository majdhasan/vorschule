import type { Round } from '../components/ChoiceGame'
import { ALPHABET } from '../data/words'
import { pickN, shuffle } from '../lib/util'
import { pickFocus, type Builder } from './types'

const EASY = 'AEIOMLSNTRBPKDFHUW'.split('')

export const build: Builder = (level, { childName, focus, count = 6 }) => {
  const nameLetters = Array.from(new Set(childName.toUpperCase().replace(/[^A-Z]/g, '').split('')))
  const pool = level === 1 ? Array.from(new Set([...nameLetters, ...EASY])) : ALPHABET
  const targets = pickFocus(pool, count, (x) => x, focus)
  return targets.map((L): Round => {
    if (level === 1) {
      const opts = shuffle([L, ...pickN(pool, 2, (x) => x === L)])
      return {
        promptDe: `Das ist das große ${L}. Finde das kleine ${L.toLowerCase()}!`,
        promptIt: `Questa è la ${L} grande. Trova la ${L.toLowerCase()} piccola!`,
        sayDe: `Das ist das große ${L}. Finde das kleine ${L}.`,
        noItalian: true,
        item: L,
        visual: <div className="big-letter">{L}</div>,
        options: opts.map((o) => ({ key: o, node: <span className="letter-opt">{o.toLowerCase()}</span>, sayDe: o })),
        answer: L,
        columns: 3,
      }
    }
    const opts = shuffle([L, ...pickN(ALPHABET, 3, (x) => x === L)])
    if (level === 2) {
      // audio only: the glyph is not shown, so it can't be solved by shape matching
      return {
        promptDe: 'Hör gut zu: Welchen Buchstaben suche ich?',
        promptIt: 'Ascolta bene: quale lettera cerco?',
        sayDe: `Finde das ${L}. ${L}.`,
        noItalian: true,
        item: L,
        visual: <div className="listen-card">👂 🔊</div>,
        options: opts.map((o) => ({ key: o, node: <span className="letter-opt">{o}</span>, sayDe: o })),
        answer: L,
        columns: 2,
      }
    }
    return {
      promptDe: `Das ist das kleine ${L.toLowerCase()}. Wo ist das große ${L}?`,
      promptIt: `Questa è la ${L.toLowerCase()} piccola. Dov'è la ${L} grande?`,
      sayDe: `Das ist das kleine ${L}. Wo ist das große ${L}?`,
      noItalian: true,
      item: L,
      visual: <div className="big-letter">{L.toLowerCase()}</div>,
      options: opts.map((o) => ({ key: o, node: <span className="letter-opt">{o}</span>, sayDe: o })),
      answer: L,
      columns: 2,
    }
  })
}
