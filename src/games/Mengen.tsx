import { useMemo } from 'react'
import { ChoiceGame, type GameProps, type Round } from '../components/ChoiceGame'
import { Emojis } from '../components/Emojis'
import { WORDS } from '../data/words'
import { pickN, randInt, coin } from '../lib/util'

export default function Mengen({ level, bilingual, onFinish }: GameProps) {
  const rounds = useMemo<Round[]>(() => {
    return Array.from({ length: 6 }, () => {
      const max = level === 1 ? 6 : 10
      const minDiff = level === 3 ? 1 : 2
      let a = randInt(1, max), b = randInt(1, max)
      while (Math.abs(a - b) < minDiff) b = randInt(1, max)
      const [w1, w2] = pickN(WORDS, 2)
      const askMore = level === 1 ? true : coin()
      const answer = askMore ? (a > b ? 'a' : 'b') : a < b ? 'a' : 'b'
      return {
        promptDe: askMore ? 'Wo sind mehr?' : 'Wo sind weniger?',
        promptIt: askMore ? 'Dove ce ne sono di più?' : 'Dove ce ne sono di meno?',
        options: [
          { key: 'a', node: <Emojis emoji={w1.emoji} n={a} size={34} rowOf={level === 1 ? 3 : 5} />, sayDe: String(a) },
          { key: 'b', node: <Emojis emoji={w2.emoji} n={b} size={34} rowOf={level === 1 ? 3 : 5} />, sayDe: String(b) },
        ],
        answer,
        columns: 2,
      }
    })
  }, [level])
  return <ChoiceGame rounds={rounds} bilingual={bilingual} onFinish={onFinish} />
}
