import { useMemo } from 'react'
import { ChoiceGame, type GameProps, type Round } from '../components/ChoiceGame'
import { WORDS } from '../data/words'
import { pickN, shuffle } from '../lib/util'

/** Hear the Italian word, find the picture. Always bilingual. */
export default function Italienisch({ level, onFinish, onClose }: GameProps) {
  const rounds = useMemo<Round[]>(() => {
    const words = pickN(WORDS, 6)
    const nOpts = level === 1 ? 3 : level === 2 ? 4 : 6
    return words.map((w) => {
      const distractors = pickN(WORDS, nOpts - 1, (x) => x.de === w.de)
      const opts = shuffle([w, ...distractors])
      return {
        promptDe: `Auf Italienisch: „${w.it}“ – wo ist das?`,
        promptIt: `Dov'è: „${w.it}“?`,
        sayDe: 'Auf Italienisch:',
        sayIt: `${w.it}. Dov'è?`,
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
        columns: nOpts === 6 ? 3 : 2,
      }
    })
  }, [level]) // eslint-disable-line react-hooks/exhaustive-deps
  return <ChoiceGame rounds={rounds} bilingual={true} onFinish={onFinish} onClose={onClose} />
}
