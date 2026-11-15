import type { Round } from '../components/ChoiceGame'
import { ANLAUT_LETTERS, ANLAUT_WORDS } from '../data/words'
import { pickN, shuffle } from '../lib/util'
import { LAUT, pickFocus, type Builder } from './types'

export const build: Builder = (level, { bilingual, focus, count = 6 }) => {
  const words = pickFocus(ANLAUT_WORDS, count, (w) => w.de, focus)
  return words.map((w): Round => {
    const letter = w.anlaut as string
    if (level >= 3) {
      // Reverse: show letter, pick the picture that starts with it
      const distractors = pickN(ANLAUT_WORDS, 3, (x) => x.anlaut === letter)
      const opts = shuffle([w, ...distractors])
      return {
        promptDe: `Welches Bild beginnt mit ${letter}?`,
        promptIt: `Quale immagine comincia con ${letter}?`,
        sayDe: `Welches Bild beginnt mit ${LAUT[letter]}?`,
        noItalian: true,
        readOptions: true,
        item: w.de,
        visual: <div className="big-letter">{letter}<span className="small-letter">{letter.toLowerCase()}</span></div>,
        options: opts.map((o) => ({ key: o.de, node: <span className="emoji-opt">{o.emoji}</span>, sayDe: o.de })),
        answer: w.de,
        columns: 2,
      }
    }
    const nOpts = level === 1 ? 3 : 4
    const distractors = pickN(ANLAUT_LETTERS, nOpts - 1, (l) => l === letter)
    const opts = shuffle([letter, ...distractors])
    return {
      promptDe: `Mit welchem Laut beginnt „${w.de}“?`,
      promptIt: `Con quale suono comincia „${w.de}“?`,
      sayDe: `Mit welchem Laut beginnt ${w.de}? ${w.de}.`,
      noItalian: true,
      item: w.de,
      visual: (
        <div className="word-card">
          <span className="word-emoji">{w.emoji}</span>
          <span className="word-text">{w.de}</span>
          {bilingual && <span className="word-it">{w.it}</span>}
        </div>
      ),
      options: opts.map((l) => ({
        key: l,
        node: (
          <span className="letter-opt">
            {l}
            {level >= 2 && <span className="letter-small">{l.toLowerCase()}</span>}
          </span>
        ),
        sayDe: LAUT[l] ?? l,
      })),
      answer: letter,
      columns: nOpts,
    }
  })
}
