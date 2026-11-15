import { useMemo } from 'react'
import { ChoiceGame, type GameProps, type Round } from '../components/ChoiceGame'
import { RHYME_GROUPS } from '../data/words'
import { pick, pickN, shuffle } from '../lib/util'

export default function Reime({ level, bilingual, onFinish, onClose }: GameProps) {
  const rounds = useMemo<Round[]>(() => {
    const groups = pickN(RHYME_GROUPS, 6)
    return groups.map((g, gi) => {
      const [target, ...rest] = shuffle(g)
      const correct = pick(rest)
      const others = RHYME_GROUPS.filter((_, i) => RHYME_GROUPS[i] !== g).flat()
      const nOpts = level === 1 ? 3 : 4
      const distractors = pickN(others, nOpts - 1, (w) => w.de === target.de || w.de === correct.de)
      const opts = shuffle([correct, ...distractors])
      return {
        promptDe: `Was reimt sich auf „${target.de}“?`,
        promptIt: `Cosa fa rima con „${target.de}“?`,
        sayDe: `Was reimt sich auf ${target.de}?`,
        sayIt: `Cosa fa rima con ${target.de}?`,
        visual: (
          <div className="word-card" key={gi}>
            <span className="word-emoji">{target.emoji}</span>
            <span className="word-text">{target.de}</span>
          </div>
        ),
        options: opts.map((o) => ({
          key: o.de,
          node: (
            <span className="pic-opt">
              <span className="emoji-opt">{o.emoji}</span>
              {level < 3 && <span className="pic-label">{o.de}</span>}
            </span>
          ),
          sayDe: o.de,
        })),
        answer: correct.de,
        columns: 2,
      }
    })
  }, [level]) // eslint-disable-line react-hooks/exhaustive-deps
  return <ChoiceGame rounds={rounds} bilingual={bilingual} onFinish={onFinish} onClose={onClose} />
}
