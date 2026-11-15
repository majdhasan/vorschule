import type { Round } from '../components/ChoiceGame'
import { SYLLABLE_WORDS } from '../data/words'
import { range } from '../lib/util'
import { pickFocus, type Builder } from './types'

const NUM = ['eins', 'zwei', 'drei', 'vier']

export const build: Builder = (level, { bilingual, focus, count = 6 }) => {
  const maxSyl = level === 1 ? 3 : 4
  const pool = SYLLABLE_WORDS.filter((w) => w.syl <= maxSyl)
  return pickFocus(pool, count, (w) => w.de, focus).map((w): Round => ({
    promptDe: `Klatsche mit! Wie viele Silben hat „${w.de}“?`,
    promptIt: `Batti le mani! Quante sillabe ha „${w.de}“?`,
    sayDe: `Klatsche die Silben. Wie viele Silben hat ${w.de}?`,
    noItalian: true,
    item: w.de,
    visual: (
      <div className="word-card">
        <span className="word-emoji">{w.emoji}</span>
        <span className="word-text">{w.de}</span>
        {bilingual && <span className="word-it">{w.it}</span>}
      </div>
    ),
    options: range(maxSyl).map((i) => ({
      key: String(i + 1),
      node: (
        <span className="syl-opt">
          <span className="syl-claps">{'👏'.repeat(i + 1)}</span>
          <span className="syl-num">{i + 1}</span>
        </span>
      ),
      sayDe: NUM[i],
    })),
    answer: String(w.syl),
    columns: 2,
  }))
}
