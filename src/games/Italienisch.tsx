import type { Round } from '../components/ChoiceGame'
import { WORDS } from '../data/words'
import { pickN, shuffle } from '../lib/util'
import { pickFocus, type Builder } from './types'

/** Hear the Italian word, find the picture. Italian is spoken automatically here. */
export const build: Builder = (level, { focus, count = 6 }) => {
  const words = pickFocus(WORDS, count, (w) => w.de, focus)
  const nOpts = level === 1 ? 3 : 4
  return words.map((w): Round => {
    const opts = shuffle([w, ...pickN(WORDS, nOpts - 1, (x) => x.de === w.de)])
    return {
      promptDe: `Auf Italienisch: „${w.it}“ – wo ist das?`,
      promptIt: `Dov'è: „${w.it}“?`,
      sayDe: 'Auf Italienisch:',
      sayIt: `${w.it}. Dov'è?`,
      autoIt: true,
      item: w.de,
      options: opts.map((o) => ({
        key: o.de,
        node: (
          <span className="pic-opt">
            <span className="emoji-opt">{o.emoji}</span>
            {level === 1 && <span className="pic-label">{o.de}</span>}
          </span>
        ),
        sayDe: o.de,
        sayIt: o.it,
      })),
      answer: w.de,
      columns: nOpts === 3 ? 3 : 2,
    }
  })
}
