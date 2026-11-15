import { useMemo } from 'react'
import { ChoiceGame, type GameProps, type Round } from '../components/ChoiceGame'
import { ALPHABET } from '../data/words'
import { pickN, shuffle } from '../lib/util'

const EASY = 'AEIOMLSNTRBPKDFHUW'.split('')

export default function Buchstaben({ level, bilingual, childName, onFinish, onClose }: GameProps) {
  const rounds = useMemo<Round[]>(() => {
    const nameLetters = Array.from(new Set(childName.toUpperCase().replace(/[^A-Z]/g, '').split('')))
    const pool = level === 1 ? Array.from(new Set([...nameLetters, ...EASY])) : ALPHABET
    const targets = pickN(pool, 6)
    return targets.map((L) => {
      if (level === 1) {
        const distractors = pickN(pool, 2, (x) => x === L)
        const opts = shuffle([L, ...distractors])
        return {
          promptDe: `Das ist das große ${L}. Finde das kleine ${L.toLowerCase()}!`,
          promptIt: `Questa è la ${L} grande. Trova la ${L.toLowerCase()} piccola!`,
          sayDe: `Das ist das große ${L}. Finde das kleine ${L}.`,
          sayIt: `Trova la ${L} piccola.`,
          visual: <div className="big-letter">{L}</div>,
          options: opts.map((o) => ({ key: o, node: <span className="letter-opt">{o.toLowerCase()}</span>, sayDe: o })),
          answer: L,
          columns: 3,
        }
      }
      if (level === 2) {
        const distractors = pickN(ALPHABET, 5, (x) => x === L)
        const opts = shuffle([L, ...distractors])
        return {
          promptDe: `Finde das ${L}!`,
          promptIt: `Trova la ${L}!`,
          sayDe: `Finde das ${L}.`,
          sayIt: `Trova la ${L}.`,
          options: opts.map((o) => ({ key: o, node: <span className="letter-opt">{o}</span>, sayDe: o })),
          answer: L,
          columns: 3,
        }
      }
      const distractors = pickN(ALPHABET, 5, (x) => x === L)
      const opts = shuffle([L, ...distractors])
      return {
        promptDe: `Das ist das kleine ${L.toLowerCase()}. Wo ist das große ${L}?`,
        promptIt: `Questa è la ${L.toLowerCase()} piccola. Dov'è la ${L} grande?`,
        sayDe: `Das ist das kleine ${L}. Wo ist das große ${L}?`,
        sayIt: `Dov'è la ${L} grande?`,
        visual: <div className="big-letter">{L.toLowerCase()}</div>,
        options: opts.map((o) => ({ key: o, node: <span className="letter-opt">{o}</span>, sayDe: o })),
        answer: L,
        columns: 3,
      }
    })
  }, [level]) // eslint-disable-line react-hooks/exhaustive-deps
  return <ChoiceGame rounds={rounds} bilingual={bilingual} onFinish={onFinish} onClose={onClose} />
}
