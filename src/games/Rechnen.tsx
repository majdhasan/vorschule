import { useMemo } from 'react'
import { ChoiceGame, type GameProps, type Round } from '../components/ChoiceGame'
import { NUMBER_WORDS_DE, NUMBER_WORDS_IT } from '../data/misc'
import { randInt, shuffle, coin } from '../lib/util'

function Dots({ n, color }: { n: number; color: string }) {
  return (
    <span className="dots">
      {Array.from({ length: n }, (_, i) => (
        <span key={i} className="dotbig" style={{ background: color }} />
      ))}
    </span>
  )
}

export default function Rechnen({ level, bilingual, onFinish }: GameProps) {
  const rounds = useMemo<Round[]>(() => {
    return Array.from({ length: 6 }, () => {
      const max = level === 3 ? 20 : 10
      const minus = level >= 2 && coin()
      let a: number, b: number, res: number
      if (minus) {
        a = randInt(2, max)
        b = randInt(1, a - 1)
        res = a - b
      } else {
        a = randInt(1, max - 1)
        b = randInt(1, max - a)
        res = a + b
      }
      const set = new Set([res])
      while (set.size < 3) set.add(Math.max(0, Math.min(max, res + randInt(-3, 3))))
      const opts = shuffle([...set])
      const op = minus ? '−' : '+'
      const opDe = minus ? 'minus' : 'plus'
      const opIt = minus ? 'meno' : 'più'
      return {
        promptDe: `Wie viel ist ${a} ${opDe} ${b}?`,
        promptIt: `Quanto fa ${a} ${opIt} ${b}?`,
        visual: (
          <div className="math">
            <div className="math-eq">
              {a} <span className="math-op">{op}</span> {b} <span className="math-op">=</span> <span className="math-q">?</span>
            </div>
            {level < 3 && (
              <div className="math-dots">
                <Dots n={a} color="#1d6fd1" />
                <span className="math-op">{op}</span>
                <Dots n={b} color={minus ? '#aaa' : '#e63946'} />
              </div>
            )}
          </div>
        ),
        options: opts.map((o) => ({ key: String(o), node: <span className="num-opt">{o}</span>, sayDe: NUMBER_WORDS_DE[o], sayIt: NUMBER_WORDS_IT[o] })),
        answer: String(res),
        columns: 3,
      }
    })
  }, [level])
  return <ChoiceGame rounds={rounds} bilingual={bilingual} onFinish={onFinish} />
}
