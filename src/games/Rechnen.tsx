import type { Round } from '../components/ChoiceGame'
import { Dots } from '../components/Emojis'
import { NUMBER_WORDS_DE, NUMBER_WORDS_IT } from '../data/misc'
import { randInt, shuffle, coin } from '../lib/util'
import { t, tr } from '../lib/i18n'
import type { Builder } from './types'


/** Vorschule: always within 10, always with dots. Minus shows the dots being taken away. */
export const build: Builder = (level, { focus, count = 6 }) => {
  const MAX = 10
  const fromFocus = (focus ?? [])
    .map((f) => /^(\d+)([+-])(\d+)$/.exec(f))
    .filter((m): m is RegExpExecArray => !!m)
    .map((m) => ({ a: Number(m[1]), minus: m[2] === '-', b: Number(m[3]) }))
  return Array.from({ length: count }, (_, i): Round => {
    let { a, b, minus } = fromFocus[i] ?? { a: 0, b: 0, minus: level >= 2 && coin() }
    if (!a) {
      if (minus) {
        a = randInt(2, MAX)
        b = randInt(1, a - 1)
      } else {
        a = randInt(1, level === 1 ? 5 : MAX - 1)
        b = randInt(1, (level === 1 ? 6 : MAX) - a)
      }
    }
    const res = minus ? a - b : a + b
    const nOpts = level === 3 ? 4 : 3
    const set = new Set([res])
    while (set.size < nOpts) set.add(Math.max(0, Math.min(MAX, res + randInt(-3, 3))))
    const op = minus ? '−' : '+'
    return {
      prompt: t(`Wie viel ist ${a} ${minus ? 'minus' : 'plus'} ${b}?`, `Quanto fa ${a} ${minus ? 'meno' : 'più'} ${b}?`),
      item: `${a}${minus ? '-' : '+'}${b}`,
      visual: (
        <div className="math">
          <div className="math-eq">
            {a} <span className="math-op">{op}</span> {b} <span className="math-op">=</span> <span className="math-q">?</span>
          </div>
          <div className="math-dots">
            {minus ? (
              <Dots n={a} color="#1d6fd1" crossed={b} />
            ) : (
              <>
                <Dots n={a} color="#1d6fd1" />
                <span className="math-op">+</span>
                <Dots n={b} color="#e63946" />
              </>
            )}
          </div>
        </div>
      ),
      options: shuffle([...set]).map((o) => ({ key: String(o), node: <span className="num-opt">{o}</span>, say: tr({ de: NUMBER_WORDS_DE, it: NUMBER_WORDS_IT })[o] })),
      answer: String(res),
      columns: nOpts === 4 ? 2 : 3,
    }
  })
}
