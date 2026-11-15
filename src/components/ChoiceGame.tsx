import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import confetti from 'canvas-confetti'
import { praise, retry, speak, speakBoth, stopSpeech } from '../lib/speech'
import { LessonShell } from './LessonShell'
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
  sayDe?: string
  sayIt?: string
}

export type GameProps = {
  level: number
  bilingual: boolean
  childName: string
  onFinish: (correct: number, total: number, hearts: number) => void
  onClose: () => void
}

type Props = { rounds: Round[]; bilingual: boolean; onFinish: GameProps['onFinish']; onClose: () => void }

export const MAX_HEARTS = 3

export function ChoiceGame({ rounds, bilingual, onFinish, onClose }: Props) {
  // queue of round indices; a missed round is appended once so it comes back
  const [queue, setQueue] = useState<number[]>(() => rounds.map((_, i) => i))
  const [pos, setPos] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [checked, setChecked] = useState<null | 'correct' | 'wrong'>(null)
  const [hearts, setHearts] = useState(MAX_HEARTS)
  const [firstTryCorrect, setFirstTryCorrect] = useState(0)
  const [solvedCount, setSolvedCount] = useState(0)
  const missed = useRef(new Set<number>())
  const roundIdx = queue[pos]
  const round = rounds[roundIdx]
  const isRetry = missed.current.has(roundIdx) && pos >= rounds.length

  const sayPrompt = () => speakBoth(round.sayDe ?? round.promptDe, round.sayIt ?? round.promptIt, bilingual)

  useEffect(() => {
    setSelected(null)
    setChecked(null)
    const t = setTimeout(sayPrompt, 350)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos])

  const pick = (o: Option) => {
    if (checked) return
    setSelected(o.key)
    if (o.sayDe) speakBoth(o.sayDe, o.sayIt, bilingual)
  }

  const check = async () => {
    if (!selected || checked) return
    stopSpeech()
    if (selected === round.answer) {
      setChecked('correct')
      setSolvedCount((c) => c + 1)
      if (!isRetry) setFirstTryCorrect((c) => c + 1)
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 }, scalar: 1 })
      const p = praise(bilingual)
      await p.say()
      if (round.factDe) await speak(round.factDe, 'de')
    } else {
      setChecked('wrong')
      setHearts((h) => Math.max(0, h - 1))
      if (!missed.current.has(roundIdx)) {
        missed.current.add(roundIdx)
        setQueue((q) => [...q, roundIdx])
      }
      const r = retry()
      await r.say()
      const correct = round.options.find((o) => o.key === round.answer)
      if (correct?.sayDe) await speakBoth(`Richtig wäre: ${correct.sayDe}`, correct.sayIt, bilingual)
    }
  }

  const next = () => {
    stopSpeech()
    if (pos + 1 >= queue.length) {
      onFinish(firstTryCorrect, rounds.length, hearts)
    } else {
      setPos(pos + 1)
    }
  }

  const cols = round.columns ?? (round.options.length <= 3 ? round.options.length : 2)
  const correctOpt = useMemo(() => round.options.find((o) => o.key === round.answer), [round])

  const footer =
    checked === null ? (
      <button className="btn green block" disabled={!selected} onClick={check}>
        Überprüfen
      </button>
    ) : (
      <div className="feedback">
        <div className="feedback-row">
          <span className="feedback-icon">{checked === 'correct' ? '✓' : '✗'}</span>
          <div className="feedback-text">
            <div className="feedback-title">{checked === 'correct' ? (bilingual ? 'Richtig! · Giusto!' : 'Richtig!') : 'Nicht ganz!'}</div>
            {checked === 'wrong' && correctOpt && (
              <div className="feedback-sub">
                Richtig wäre: <b>{correctOpt.sayDe ?? ''}</b>
              </div>
            )}
            {checked === 'correct' && round.factDe && <div className="feedback-sub">{round.factDe}</div>}
          </div>
        </div>
        <button className={'btn block ' + (checked === 'correct' ? 'green' : 'red')} onClick={next}>
          Weiter
        </button>
      </div>
    )

  return (
    <LessonShell progress={solvedCount / rounds.length} hearts={hearts} onClose={onClose} footer={footer} footerTone={checked ?? 'neutral'}>
      <div className="q">
        <div className="q-head">
          <Mascot mood={checked === 'correct' ? 'happy' : checked === 'wrong' ? 'think' : 'normal'} size={56} />
          <button className="bubble" onClick={sayPrompt} aria-label="Nochmal anhören">
            <div className="bubble-de">{round.promptDe}</div>
            {bilingual && round.promptIt && <div className="bubble-it">{round.promptIt}</div>}
            <span className="bubble-speaker">🔊</span>
          </button>
        </div>
        {round.visual && <div className="visual">{round.visual}</div>}
        <div className="options" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {round.options.map((o) => {
            const isSel = selected === o.key
            const cls =
              'opt' +
              (o.wide ? ' wide' : '') +
              (checked === null && isSel ? ' selected' : '') +
              (checked && o.key === round.answer ? ' right' : '') +
              (checked === 'wrong' && isSel ? ' wrong' : '')
            return (
              <button key={o.key} className={cls} onClick={() => pick(o)} disabled={checked !== null}>
                {o.node}
              </button>
            )
          })}
        </div>
      </div>
    </LessonShell>
  )
}
