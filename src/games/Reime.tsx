import type { Round } from '../components/ChoiceGame'
import { RHYME_GROUPS } from '../data/words'
import { pick, pickN, shuffle } from '../lib/util'
import type { Builder } from './types'

export const build: Builder = (level, { focus, count = 6 }) => {
  const focused = (focus ?? []).map((f) => RHYME_GROUPS.find((g) => g.some((w) => w.de === f))).filter((g) => !!g)
  const groups = [...focused, ...pickN(RHYME_GROUPS, count, (g) => focused.includes(g))].slice(0, count)
  return groups.map((g, gi): Round => {
    const fw = focus?.find((f) => g.some((w) => w.de === f))
    const target = fw ? g.find((w) => w.de === fw)! : shuffle(g)[0]
    const correct = pick(g.filter((w) => w.de !== target.de))
    const others = RHYME_GROUPS.filter((x) => x !== g).flat()
    const nOpts = level === 1 ? 3 : 4
    const opts = shuffle([correct, ...pickN(others, nOpts - 1, (w) => w.de === target.de || w.de === correct.de)])
    return {
      promptDe: `Was reimt sich auf „${target.de}“?`,
      promptIt: `Cosa fa rima con „${target.de}“?`,
      sayDe: `Was reimt sich auf ${target.de}?`,
      noItalian: true,
      readOptions: true,
      item: target.de,
      visual: (
        <div className="word-card" key={gi}>
          <span className="word-emoji">{target.emoji}</span>
          <span className="word-text">{target.de}</span>
        </div>
      ),
      options: opts.map((o) => ({
        key: o.de,
        node: (
          <span className="pic-opt">
            <span className="emoji-opt">{o.emoji}</span>
            {level < 3 && <span className="pic-label">{o.de}</span>}
          </span>
        ),
        sayDe: o.de,
      })),
      answer: correct.de,
      columns: nOpts === 3 ? 3 : 2,
    }
  })
}
