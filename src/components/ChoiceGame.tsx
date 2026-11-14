import { useEffect, useRef, useState, type ReactNode } from 'react'
import confetti from 'canvas-confetti'
import { praise, retry, speak, speakBoth, stopSpeech } from '../lib/speech'
import { Mascot } from './Mascot'

export type Option = { key: string; node: ReactNode; sayDe?: string; sayIt?: string; wide?: boolean }
export type Round = {
  promptDe: string
  promptIt?: string
  visual?: ReactNode
  options: Option[]
  answer: string
  factDe?: string
  columns?: number
  /** Speak this instead of promptDe (e.g. only the word) */
  sayDe?: string
  sayIt?: string
}

export type GameProps = {
  level: number
  bilingual: boolean
  childName: string
  onFinish: (correct: number, total: number) => void
}

type Props = { rounds: Round[]; bilingual: boolean; onFinish: (correct: number, total: number) => void }

export function ChoiceGame({ rounds, bilingual, onFinish }: Props) {
  const [idx, setIdx] = useState(0)
  const [wrong, setWrong] = useState<Set<string>>(new Set())
  const [solved, setSolved] = useState(false)
  const [firstTryCount, setFirstTryCount] = useState(0)
  const [bubble, setBubble] = useState<{ de: string; it?: string } | null>(null)
  const round = rounds[idx]
  const busy = useRef(false)

  useEffect(() => {
    busy.current = false
    setWrong(new Set())
    setSolved(false)
    setBubble(null)
    const t = setTimeout(() => speakBoth(round.sayDe ?? round.promptDe, round.sayIt ?? round.promptIt, bilingual), 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx])

  const replay = () => speakBoth(round.sayDe ?? round.promptDe, round.sayIt ?? round.promptIt, bilingual)

  const onPick = async (o: Option) => {
    if (busy.current || solved) return
    if (o.key === round.answer) {
      busy.current = true
      setSolved(true)
      const isFirst = wrong.size === 0
      if (isFirst) setFirstTryCount((c) => c + 1)
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 }, scalar: 1.1 })
      const p = praise(bilingual)
      setBubble({ de: p.de, it: bilingual ? p.it : undefined })
      stopSpeech()
      if (o.sayDe) await speakBoth(o.sayDe, o.sayIt, bilingual)
      await p.say()
      if (round.factDe) {
        setBubble({ de: round.factDe })
        await speak(round.factDe, 'de')
      }
      const nextIdx = idx + 1
      if (nextIdx >= rounds.length) {
        onFinish(firstTryCount + (isFirst ? 1 : 0), rounds.length)
      } else {
        setIdx(nextIdx)
      }
    } else {
      setWrong((w) => new Set(w).add(o.key))
      const r = retry()
      setBubble({ de: r.de })
      stopSpeech()
      if (o.sayDe) await speakBoth(o.sayDe, o.sayIt, bilingual)
      r.say()
    }
  }

  const cols = round.columns ?? (round.options.length <= 3 ? round.options.length : 2)

  return (
    <div className="game">
      <div className="progress">
        {rounds.map((_, i) => (
          <span key={i} className={'dot' + (i < idx ? ' done' : i === idx ? ' now' : '')} />
        ))}
      </div>
      <div className="prompt-row">
        <Mascot mood={solved ? 'happy' : wrong.size ? 'think' : 'normal'} />
        <button className="bubble" onClick={replay} aria-label="Nochmal anhören">
          <div className="bubble-de">{bubble?.de ?? round.promptDe}</div>
          {bilingual && (bubble ? bubble.it : round.promptIt) && <div className="bubble-it">{bubble ? bubble.it : round.promptIt}</div>}
          <span className="bubble-speaker">🔊</span>
        </button>
      </div>
      {round.visual && <div className="visual">{round.visual}</div>}
      <div className="options" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {round.options.map((o) => {
          const isWrong = wrong.has(o.key)
          const isRight = solved && o.key === round.answer
          return (
            <button
              key={o.key}
              className={'opt' + (isWrong ? ' wrong' : '') + (isRight ? ' right' : '') + (o.wide ? ' wide' : '')}
              onClick={() => onPick(o)}
              disabled={isWrong || solved}
            >
              {o.node}
            </button>
          )
        })}
      </div>
    </div>
  )
}
