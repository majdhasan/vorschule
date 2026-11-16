import type { Round } from '../components/ChoiceGame'
import { RHYME_GROUPS, RHYME_GROUPS_IT } from '../data/words'
import { getLang } from '../lib/i18n'
import { pick, pickN, shuffle } from '../lib/util'
import type { Builder } from './types'

export const build: Builder = (level, { focus, count = 6 }) => {
  const it = getLang() === 'it'
  const GROUPS = it ? RHYME_GROUPS_IT : RHYME_GROUPS
  const focused = (focus ?? []).map((f) => GROUPS.find((g) => g.some((w) => w.word === f))).filter((g) => !!g)
  const groups = [...focused, ...pickN(GROUPS, count, (g) => focused.includes(g))].slice(0, count)
  return groups.map((g, gi): Round => {
    const fw = focus?.find((f) => g.some((w) => w.word === f))
    const target = fw ? g.find((w) => w.word === fw)! : shuffle(g)[0]
    const correct = pick(g.filter((w) => w.word !== target.word))
    const others = GROUPS.filter((x) => x !== g).flat()
    const nOpts = level === 1 ? 3 : 4
    const opts = shuffle([correct, ...pickN(others, nOpts - 1, (w) => w.word === target.word || w.word === correct.word)])
    return {
      prompt: it ? `Cosa fa rima con «${target.word}»?` : `Was reimt sich auf „${target.word}“?`,
      say: it ? `Cosa fa rima con ${target.word}?` : `Was reimt sich auf ${target.word}?`,
      readOptions: true,
      item: target.word,
      visual: (
        <div className="word-card" key={gi}>
          <span className="word-emoji">{target.emoji}</span>
          <span className="word-text">{target.word}</span>
        </div>
      ),
      options: opts.map((o) => ({
        key: o.word,
        node: (
          <span className="pic-opt">
            <span className="emoji-opt">{o.emoji}</span>
            {level < 3 && <span className="pic-label">{o.word}</span>}
          </span>
        ),
        say: o.word,
      })),
      answer: correct.word,
      columns: nOpts === 3 ? 3 : 2,
    }
  })
}
