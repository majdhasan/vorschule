import { useMemo } from 'react'
import { ChoiceGame, type GameProps, type Round } from '../components/ChoiceGame'
import { SYLLABLE_WORDS } from '../data/words'
import { pickN, range } from '../lib/util'

export default function Silben({ level, bilingual, onFinish, onClose }: GameProps) {
  const rounds = useMemo<Round[]>(() => {
    const maxSyl = level === 1 ? 3 : 4
    const pool = SYLLABLE_WORDS.filter((w) => w.syl <= maxSyl && (level > 1 || w.syl !== 4))
    // Try to balance: 2 words per syllable count where possible
    const words = pickN(pool, 6)
    return words.map((w) => ({
      promptDe: `Klatsche die Silben! Wie viele Silben hat „${w.de}“?`,
      promptIt: `Batti le mani! Quante sillabe ha „${w.de}“?`,
      sayDe: `Klatsche die Silben. Wie viele Silben hat ${w.de}?`,
      sayIt: `Quante sillabe ha ${w.de}?`,
      visual: (
        <div className="word-card">
          <span className="word-emoji">{w.emoji}</span>
          <span className="word-text">{w.de}</span>
          {bilingual && <span className="word-it">{w.it}</span>}
        </div>
      ),
      options: range(maxSyl).map((i) => ({
        key: String(i + 1),
        node: (
          <span className="syl-opt">
            <span className="syl-num">{i + 1}</span>
            <span className="syl-claps">{'👏'.repeat(i + 1)}</span>
          </span>
        ),
        sayDe: String(i + 1),
      })),
      answer: String(w.syl),
      columns: maxSyl === 3 ? 3 : 2,
    }))
  }, [level]) // eslint-disable-line react-hooks/exhaustive-deps
  return <ChoiceGame rounds={rounds} bilingual={bilingual} onFinish={onFinish} onClose={onClose} />
}
