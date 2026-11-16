import type { Round } from '../components/ChoiceGame'
import { BERLIN, SCHULWEG, type Quiz } from '../data/berlin'
import { getLang } from '../lib/i18n'
import { shuffle } from '../lib/util'
import { pickFocus, type Builder } from './types'

function toRounds(qs: Quiz[], focus: string[] | undefined, count: number): Round[] {
  const it = getLang() === 'it'
  // item = the German question: a stable id in both languages
  return pickFocus(qs, count, (q) => q.q, focus).map((q) => {
    const opts = shuffle(q.options.map((o, i) => ({ ...o, i })))
    return {
      prompt: it ? q.qIt : q.q,
      fact: it ? q.factIt : q.fact,
      readOptions: true,
      item: q.q,
      options: opts.map((o) => {
        const label = it ? o.it : o.label
        return {
          key: String(o.i),
          node: (
            <span className="row-opt">
              <span className="row-emoji">{o.emoji}</span>
              <span className="row-label">{label}</span>
            </span>
          ),
          say: label,
          wide: true,
        }
      }),
      answer: String(q.answer),
      columns: 1,
    }
  })
}

export const buildBerlin: Builder = (_level, { focus, count = 6 }) => toRounds(BERLIN, focus, count)
export const buildSchulweg: Builder = (_level, { focus, count = 6 }) => toRounds(SCHULWEG, focus, count)
