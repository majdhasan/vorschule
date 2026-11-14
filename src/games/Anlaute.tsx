import { useMemo } from 'react'
import { ChoiceGame, type GameProps, type Round } from '../components/ChoiceGame'
import { ANLAUT_LETTERS, ANLAUT_WORDS } from '../data/words'
import { pickN, shuffle } from '../lib/util'

export default function Anlaute({ level, bilingual, onFinish }: GameProps) {
  const rounds = useMemo<Round[]>(() => {
    const words = pickN(ANLAUT_WORDS, 6)
    return words.map((w) => {
      const letter = w.anlaut as string
      if (level >= 3) {
        // Reverse: show letter, pick the picture that starts with it
        const distractors = pickN(ANLAUT_WORDS, 3, (x) => x.anlaut === letter)
        const opts = shuffle([w, ...distractors])
        return {
          promptDe: `Welches Bild beginnt mit ${letter}?`,
          promptIt: `Quale immagine comincia con ${letter}?`,
          visual: <div className="big-letter">{letter}<span className="small-letter">{letter.toLowerCase()}</span></div>,
          options: opts.map((o) => ({ key: o.de, node: <span className="emoji-opt">{o.emoji}</span>, sayDe: o.de, sayIt: o.it })),
          answer: w.de,
          columns: 2,
        }
      }
      const nOpts = level === 1 ? 3 : 4
      const distractors = pickN(ANLAUT_LETTERS, nOpts - 1, (l) => l === letter)
      const opts = shuffle([letter, ...distractors])
      return {
        promptDe: `Mit welchem Buchstaben beginnt „${w.de}“?`,
        promptIt: `Con quale lettera comincia „${w.de}“?`,
        sayDe: `Mit welchem Buchstaben beginnt ${w.de}? ${w.de}.`,
        sayIt: `Con quale lettera comincia ${w.de}?`,
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
          sayDe: l,
        })),
        answer: letter,
        columns: nOpts,
      }
    })
  }, [level]) // eslint-disable-line react-hooks/exhaustive-deps
  return <ChoiceGame rounds={rounds} bilingual={bilingual} onFinish={onFinish} />
}
