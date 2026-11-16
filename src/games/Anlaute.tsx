import type { Round } from '../components/ChoiceGame'
import { ANLAUT_LETTERS, ANLAUT_LETTERS_IT, ANLAUT_WORDS, ANLAUT_WORDS_IT, itAnlaut, type Word } from '../data/words'
import { getLang } from '../lib/i18n'
import { pickN, shuffle } from '../lib/util'
import { pickFocus, sound, wordOf, type Builder } from './types'

export const build: Builder = (level, { focus, count = 6 }) => {
  const it = getLang() === 'it'
  const pool = it ? ANLAUT_WORDS_IT : ANLAUT_WORDS
  const letters = it ? ANLAUT_LETTERS_IT : ANLAUT_LETTERS
  const first = (w: Word) => (it ? itAnlaut(w) : w.anlaut) as string
  // items stay the German word: a stable id whatever the language
  const words = pickFocus(pool, count, (w) => w.de, focus)
  return words.map((w): Round => {
    const letter = first(w)
    const name = wordOf(w)
    if (level >= 3) {
      // Reverse: show letter, pick the picture that starts with it
      const distractors = pickN(pool, 3, (x) => first(x) === letter)
      const opts = shuffle([w, ...distractors])
      return {
        prompt: it ? `Quale immagine comincia con la ${letter}?` : `Welches Bild beginnt mit ${letter}?`,
        say: it ? `Quale immagine comincia con la lettera ${sound(letter)}?` : `Welches Bild beginnt mit ${sound(letter)}?`,
        readOptions: true,
        item: w.de,
        visual: <div className="big-letter">{letter}<span className="small-letter">{letter.toLowerCase()}</span></div>,
        options: opts.map((o) => ({ key: o.de, node: <span className="emoji-opt">{o.emoji}</span>, say: wordOf(o) })),
        answer: w.de,
        columns: 2,
      }
    }
    const nOpts = level === 1 ? 3 : 4
    const opts = shuffle([letter, ...pickN(letters, nOpts - 1, (l) => l === letter)])
    return {
      prompt: it ? `Con quale lettera comincia «${name}»?` : `Mit welchem Laut beginnt „${name}“?`,
      say: it ? `Con quale lettera comincia ${name}? ${name}.` : `Mit welchem Laut beginnt ${name}? ${name}.`,
      item: w.de,
      visual: (
        <div className="word-card">
          <span className="word-emoji">{w.emoji}</span>
          <span className="word-text">{name}</span>
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
        say: sound(l),
      })),
      answer: letter,
      columns: nOpts,
    }
  })
}
