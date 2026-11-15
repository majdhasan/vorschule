import { useMemo } from 'react'
import { ChoiceGame, type GameProps, type Round } from '../components/ChoiceGame'
import { Emojis } from '../components/Emojis'
import { NUMBER_WORDS_DE, NUMBER_WORDS_IT } from '../data/misc'
import { WORDS } from '../data/words'
import { pick, randInt, shuffle } from '../lib/util'

export default function Zaehlen({ level, bilingual, onFinish, onClose }: GameProps) {
  const rounds = useMemo<Round[]>(() => {
    const [min, max, nOpts] = level === 1 ? [1, 5, 3] : level === 2 ? [1, 10, 3] : [5, 20, 4]
    return Array.from({ length: 6 }, () => {
      const n = randInt(min, max)
      const w = pick(WORDS)
      const set = new Set([n])
      while (set.size < nOpts) set.add(Math.max(min, Math.min(max, n + randInt(-3, 3))))
      const opts = shuffle([...set])
      return {
        promptDe: 'Wie viele sind das? Zähle!',
        promptIt: 'Quanti sono? Conta!',
        visual: <Emojis emoji={w.emoji} n={n} size={n > 10 ? 36 : 48} />,
        options: opts.map((o) => ({ key: String(o), node: <span className="num-opt">{o}</span>, sayDe: NUMBER_WORDS_DE[o], sayIt: NUMBER_WORDS_IT[o] })),
        answer: String(n),
        columns: nOpts,
      }
    })
  }, [level])
  return <ChoiceGame rounds={rounds} bilingual={bilingual} onFinish={onFinish} onClose={onClose} />
}
