import type { Round } from '../components/ChoiceGame'
import { WORDS } from '../data/words'
import { pick, pickN, shuffle } from '../lib/util'
import type { Builder } from './types'

const PATTERNS: Record<number, string[]> = {
  1: ['ABAB', 'ABAB', 'AABB'],
  2: ['ABC', 'AABB', 'ABB'],
  3: ['ABCD', 'ABB', 'AAB', 'ABCC'],
}

export const build: Builder = (level, { count = 6 }) =>
  Array.from({ length: count }, (): Round => {
    const pat = pick(PATTERNS[level])
    const distinct = Array.from(new Set(pat.split('')))
    const symbols = pickN(WORDS, distinct.length + 1).map((w) => w.emoji)
    const map: Record<string, string> = {}
    distinct.forEach((l, i) => (map[l] = symbols[i]))
    const shown = level === 1 ? 5 : level === 2 ? 6 : 7
    const seq = Array.from({ length: shown + 1 }, (_, i) => map[pat[i % pat.length]])
    const answer = seq[shown]
    const opts = shuffle([...new Set([answer, ...symbols])]).slice(0, level === 3 ? 4 : 3)
    if (!opts.includes(answer)) opts[0] = answer
    return {
      promptDe: 'Was kommt als Nächstes?',
      promptIt: 'Cosa viene dopo?',
      visual: (
        <div className="pattern" style={{ ['--n' as string]: shown + 1 } as React.CSSProperties}>
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
