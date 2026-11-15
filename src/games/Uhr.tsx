import type { Round } from '../components/ChoiceGame'
import { Clock } from '../components/Clock'
import { NUMBER_WORDS_DE } from '../data/misc'
import { randInt, shuffle } from '../lib/util'
import type { Builder } from './types'

const IT = ['', "l'una", 'le due', 'le tre', 'le quattro', 'le cinque', 'le sei', 'le sette', 'le otto', 'le nove', 'le dieci', 'le undici', 'le dodici']

/** Vorschule: full hours only. Higher levels just mean more choices. */
export const build: Builder = (level, { focus, count = 6 }) =>
  Array.from({ length: count }, (_, i): Round => {
    const h = Number(focus?.[i]) || randInt(1, 12)
    const nOpts = level === 1 ? 3 : 4
    const set = new Set([h])
    while (set.size < nOpts) set.add(randInt(1, 12))
    return {
      promptDe: 'Wie spät ist es?',
      promptIt: 'Che ore sono?',
      item: String(h),
      readOptions: true,
      visual: <Clock hour={h} minute={0} size={200} />,
      options: shuffle([...set]).map((o) => ({
        key: String(o),
        node: (
          <span className="time-opt">
            {o} Uhr<small>{o}:00</small>
          </span>
        ),
        sayDe: `${NUMBER_WORDS_DE[o]} Uhr`,
        sayIt: `${IT[o]}`,
      })),
      answer: String(h),
      columns: nOpts === 3 ? 3 : 2,
    }
  })
