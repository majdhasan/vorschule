import type { Round } from '../components/ChoiceGame'
import { Clock } from '../components/Clock'
import { NUMBER_WORDS_DE } from '../data/misc'
import { getLang } from '../lib/i18n'
import { randInt, shuffle } from '../lib/util'
import type { Builder } from './types'

const IT = ['', "È l'una", 'Sono le due', 'Sono le tre', 'Sono le quattro', 'Sono le cinque', 'Sono le sei', 'Sono le sette', 'Sono le otto', 'Sono le nove', 'Sono le dieci', 'Sono le undici', 'Sono le dodici']

/** Vorschule: full hours only. Higher levels just mean more choices. */
export const build: Builder = (level, { focus, count = 6 }) => {
  const it = getLang() === 'it'
  return Array.from({ length: count }, (_, i): Round => {
    const h = Number(focus?.[i]) || randInt(1, 12)
    const nOpts = level === 1 ? 3 : 4
    const set = new Set([h])
    while (set.size < nOpts) set.add(randInt(1, 12))
    return {
      prompt: it ? 'Che ore sono?' : 'Wie spät ist es?',
      item: String(h),
      readOptions: true,
      visual: <Clock hour={h} minute={0} size={200} />,
      options: shuffle([...set]).map((o) => ({
        key: String(o),
        node: (
          <span className="time-opt">
            {it ? `ore ${o}` : `${o} Uhr`}
            <small>{o}:00</small>
          </span>
        ),
        say: it ? IT[o] : `${NUMBER_WORDS_DE[o]} Uhr`,
      })),
      answer: String(h),
      columns: nOpts === 3 ? 3 : 2,
    }
  })
}
