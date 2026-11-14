import { useMemo } from 'react'
import { ChoiceGame, type GameProps, type Round } from '../components/ChoiceGame'
import { Clock } from '../components/Clock'
import { NUMBER_WORDS_DE } from '../data/misc'
import { randInt, shuffle, coin } from '../lib/util'

type T = { h: number; m: number }
const label = (t: T) => (t.m === 0 ? `${t.h} Uhr` : `halb ${t.h === 12 ? 1 : t.h + 1}`)
const sayDe = (t: T) => (t.m === 0 ? `${NUMBER_WORDS_DE[t.h]} Uhr` : `halb ${NUMBER_WORDS_DE[t.h === 12 ? 1 : t.h + 1]}`)
const sayIt = (t: T) => {
  const names = ['', "l'una", 'le due', 'le tre', 'le quattro', 'le cinque', 'le sei', 'le sette', 'le otto', 'le nove', 'le dieci', 'le undici', 'le dodici']
  return t.m === 0 ? names[t.h] : `${names[t.h]} e mezza`
}

export default function Uhr({ level, bilingual, onFinish }: GameProps) {
  const rounds = useMemo<Round[]>(() => {
    return Array.from({ length: 6 }, () => {
      const half = level >= 2 && coin()
      const t: T = { h: randInt(1, 12), m: half ? 30 : 0 }
      const nOpts = level === 1 ? 3 : 4
      const set = new Map<string, T>([[label(t), t]])
      while (set.size < nOpts) {
        const o: T = { h: randInt(1, 12), m: level >= 2 && coin() ? 30 : 0 }
        set.set(label(o), o)
      }
      const opts = shuffle([...set.values()])
      return {
        promptDe: 'Wie spät ist es?',
        promptIt: 'Che ore sono?',
        visual: <Clock hour={t.h} minute={t.m} />,
        options: opts.map((o) => ({ key: label(o), node: <span className="time-opt">{label(o)}</span>, sayDe: sayDe(o), sayIt: sayIt(o) })),
        answer: label(t),
        columns: 2,
      }
    })
  }, [level])
  return <ChoiceGame rounds={rounds} bilingual={bilingual} onFinish={onFinish} />
}
