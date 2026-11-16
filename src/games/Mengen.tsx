import type { Round } from '../components/ChoiceGame'
import { Emojis } from '../components/Emojis'
import { WORDS } from '../data/words'
import { pickN, randInt, coin } from '../lib/util'
import { t } from '../lib/i18n'
import type { Builder } from './types'

export const build: Builder = (level, { count = 6 }) =>
  Array.from({ length: count }, (): Round => {
    const max = level === 1 ? 6 : 10
    const minDiff = level === 3 ? 1 : 2
    const a = randInt(1, max)
    let b = randInt(1, max)
    while (Math.abs(a - b) < minDiff) b = randInt(1, max)
    const [w1, w2] = pickN(WORDS, 2)
    const askMore = level === 1 ? true : coin()
    const answer = askMore ? (a > b ? 'a' : 'b') : a < b ? 'a' : 'b'
    const rowOf = level === 1 ? 3 : 5
    return {
      prompt: askMore ? t('Wo sind mehr?', 'Dove ce ne sono di più?') : t('Wo sind weniger?', 'Dove ce ne sono di meno?'),
      options: [
        { key: 'a', node: <Emojis emoji={w1.emoji} n={a} size={26} rowOf={rowOf} />, say: String(a) },
        { key: 'b', node: <Emojis emoji={w2.emoji} n={b} size={26} rowOf={rowOf} />, say: String(b) },
      ],
      answer,
      columns: 2,
    }
  })
