import type { Round } from '../components/ChoiceGame'
import { Emojis, MiniDots } from '../components/Emojis'
import { NUMBER_WORDS_DE, NUMBER_WORDS_IT } from '../data/misc'
import { WORDS } from '../data/words'
import { pick, randInt, shuffle } from '../lib/util'
import { t, tr } from '../lib/i18n'
import type { Builder } from './types'


export const build: Builder = (level, { focus, count = 6 }) => {
  const [min, max, nOpts] = level === 1 ? [1, 5, 3] : level === 2 ? [1, 10, 3] : [5, 20, 4]
  return Array.from({ length: count }, (_, i): Round => {
    const n = Number(focus?.[i]) || randInt(min, max)
    const w = pick(WORDS)
    const set = new Set([n])
    while (set.size < nOpts) set.add(Math.max(min, Math.min(max, n + randInt(-3, 3))))
    return {
      prompt: t('Wie viele sind das? Zähle!', 'Quanti sono? Conta!'),
      item: String(n),
      visual: <Emojis emoji={w.emoji} n={n} size={n > 10 ? 34 : 44} />,
      options: shuffle([...set]).map((o) => ({
        key: String(o),
        node: (
          <span className="num-stack">
            <span className="num-opt">{o}</span>
            {level < 3 && <MiniDots n={o} />}
          </span>
        ),
        say: tr({ de: NUMBER_WORDS_DE, it: NUMBER_WORDS_IT })[o],
      })),
      answer: String(n),
      columns: nOpts === 4 ? 2 : 3,
    }
  })
}
