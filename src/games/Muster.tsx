import { useMemo } from 'react'
import { ChoiceGame, type GameProps, type Round } from '../components/ChoiceGame'
import { WORDS } from '../data/words'
import { pick, pickN, shuffle } from '../lib/util'

const PATTERNS: Record<number, string[]> = {
  1: ['ABAB', 'ABAB', 'AABB'],
  2: ['ABC', 'AABB', 'ABB'],
  3: ['ABCD', 'ABB', 'AAB', 'ABCC'],
}

export default function Muster({ level, bilingual, onFinish, onClose }: GameProps) {
  const rounds = useMemo<Round[]>(() => {
    return Array.from({ length: 6 }, () => {
      const pat = pick(PATTERNS[level])
      const distinct = Array.from(new Set(pat.split('')))
      const symbols = pickN(WORDS, distinct.length + 1).map((w) => w.emoji)
      const map: Record<string, string> = {}
      distinct.forEach((l, i) => (map[l] = symbols[i]))
      const shown = level === 1 ? 5 : level === 2 ? 6 : 7
      const seq = Array.from({ length: shown + 1 }, (_, i) => map[pat[i % pat.length]])
      const answer = seq[shown]
      const optSet = new Set([answer, ...symbols])
      const opts = shuffle([...optSet]).slice(0, level === 3 ? 4 : 3)
      if (!opts.includes(answer)) opts[0] = answer
      return {
        promptDe: 'Was kommt als Nächstes?',
        promptIt: 'Cosa viene dopo?',
        visual: (
          <div className="pattern">
            {seq.slice(0, shown).map((s, i) => (
              <span key={i} className="pattern-item">{s}</span>
            ))}
            <span className="pattern-item q">❓</span>
          </div>
        ),
        options: shuffle(opts).map((o) => ({ key: o, node: <span className="emoji-opt">{o}</span> })),
        answer,
        columns: opts.length,
      }
    })
  }, [level])
  return <ChoiceGame rounds={rounds} bilingual={bilingual} onFinish={onFinish} onClose={onClose} />
}
