import type { Round } from '../components/ChoiceGame'
import { NUMBER_WORDS_DE, NUMBER_WORDS_IT } from '../data/misc'
import { SYLLABLE_WORDS, SYLLABLE_WORDS_IT } from '../data/words'
import { getLang } from '../lib/i18n'
import { range } from '../lib/util'
import { pickFocus, wordOf, type Builder } from './types'

export const build: Builder = (level, { focus, count = 6 }) => {
  const it = getLang() === 'it'
  const maxSyl = level === 1 ? 3 : 4
  const syl = (w: (typeof SYLLABLE_WORDS)[number]) => (it ? w.itSyl : w.syl)
  const pool = (it ? SYLLABLE_WORDS_IT : SYLLABLE_WORDS).filter((w) => syl(w) <= maxSyl)
  const NUM = it ? NUMBER_WORDS_IT : NUMBER_WORDS_DE
  return pickFocus(pool, count, (w) => w.de, focus).map((w): Round => {
    const name = wordOf(w)
    return {
      prompt: it ? `Batti le mani! Quante sillabe ha «${name}»?` : `Klatsche mit! Wie viele Silben hat „${name}“?`,
      say: it ? `Batti le sillabe. Quante sillabe ha ${name}?` : `Klatsche die Silben. Wie viele Silben hat ${name}?`,
      item: w.de,
      visual: (
        <div className="word-card">
          <span className="word-emoji">{w.emoji}</span>
          <span className="word-text">{name}</span>
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
        say: NUM[i + 1],
      })),
      answer: String(syl(w)),
      columns: 2,
    }
  })
}
