import type { Round } from '../components/ChoiceGame'
import { BERLIN, SCHULWEG, type Quiz } from '../data/berlin'
import { shuffle } from '../lib/util'
import { pickFocus, type Builder } from './types'

function toRounds(qs: Quiz[], focus: string[] | undefined, count: number): Round[] {
  return pickFocus(qs, count, (q) => q.q, focus).map((q) => {
    const opts = shuffle(q.options.map((o, i) => ({ ...o, i })))
    return {
      promptDe: q.q,
      promptIt: q.qIt,
      factDe: q.fact,
      readOptions: true,
      item: q.q,
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

export const buildBerlin: Builder = (_level, { focus, count = 6 }) => toRounds(BERLIN, focus, count)
export const buildSchulweg: Builder = (_level, { focus, count = 6 }) => toRounds(SCHULWEG, focus, count)
