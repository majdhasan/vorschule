import { useMemo } from 'react'
import { ChoiceGame, type GameProps, type Round } from '../components/ChoiceGame'
import { BERLIN, SCHULWEG, type Quiz } from '../data/berlin'
import { pickN, shuffle } from '../lib/util'

function toRounds(qs: Quiz[]): Round[] {
  return pickN(qs, 6).map((q) => {
    const opts = shuffle(q.options.map((o, i) => ({ ...o, i })))
    return {
      promptDe: q.q,
      promptIt: q.qIt,
      factDe: q.fact,
      options: opts.map((o) => ({
        key: String(o.i),
        node: (
          <span className="row-opt">
            <span className="row-emoji">{o.emoji}</span>
            <span className="row-label">{o.label}</span>
          </span>
        ),
        sayDe: o.label,
        wide: true,
      })),
      answer: String(q.answer),
      columns: 1,
    }
  })
}

export function Berlin({ bilingual, onFinish, onClose }: GameProps) {
  const rounds = useMemo(() => toRounds(BERLIN), [])
  return <ChoiceGame rounds={rounds} bilingual={bilingual} onFinish={onFinish} onClose={onClose} />
}

export function Schulweg({ bilingual, onFinish, onClose }: GameProps) {
  const rounds = useMemo(() => toRounds(SCHULWEG), [])
  return <ChoiceGame rounds={rounds} bilingual={bilingual} onFinish={onFinish} onClose={onClose} />
}
