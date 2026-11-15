import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import confetti from 'canvas-confetti'
import { praise, retry, speak, speakBoth, stopSpeech } from '../lib/speech'
import { sfx } from '../lib/sfx'
import type { Src } from '../lib/store'
import { useTapGuard } from '../hooks/useTapGuard'
import { LessonShell } from './LessonShell'
import { Mascot, type Mood } from './Mascot'

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
  /** Speak the Italian prompt automatically (Italiano game). Otherwise Italian comes on the 2nd tap of the bubble. */
  autoIt?: boolean
  /** Never speak the Italian prompt (sound games: an Italian voice would mispronounce the German word). */
  noItalian?: boolean
  /** Read all options aloud after the prompt (text-only answers). */
  readOptions?: boolean
  /** Item key the builder can regenerate this question from (word, letter, …). */
  item?: string
  /** Origin of the question, for "Fehler üben". */
  src?: Src
}

export type LessonOutcome = {
  correct: number
  total: number
  hearts: number
  maxCombo: number
  missed: Src[]
  fixed: Src[]
}

export type GameProps = {
  level: number
  bilingual: boolean
  childName: string
  onFinish: (o: LessonOutcome) => void
  onClose: () => void
}

type Props = { rounds: Round[]; bilingual: boolean; onFinish: (o: LessonOutcome) => void; onClose: () => void; listenOnly?: boolean }

export const MAX_HEARTS = 3
/** How many wrong picks on one question before the answer is revealed. */
const MAX_TRIES = 2
const COMBO_STEPS = [3, 5, 8]

type Checked = null | 'correct' | 'wrong' | 'reveal'

export function ChoiceGame({ rounds, bilingual, onFinish, onClose, listenOnly }: Props) {
  // queue of round indices; a round whose answer had to be revealed comes back once at the end
  const [queue, setQueue] = useState<number[]>(() => rounds.map((_, i) => i))
  const [pos, setPos] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [checked, setChecked] = useState<Checked>(null)
  const [wrongKeys, setWrongKeys] = useState<string[]>([])
  const [hearts, setHearts] = useState(MAX_HEARTS)
  const [firstTryCorrect, setFirstTryCorrect] = useState(0)
  const [finished, setFinished] = useState<number[]>([])
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [toast, setToast] = useState<number | null>(null)
  const [speakingKey, setSpeakingKey] = useState<string | null>(null)
  const [nudge, setNudge] = useState(false)
  const missed = useRef<Src[]>([])
  const fixed = useRef<Src[]>([])
  const requeued = useRef(new Set<number>())
  const phase = useRef<'question' | 'options' | 'idle'>('idle')
  const pending = useRef<Option | null>(null)
  const bubbleTaps = useRef(0)
  const nudges = useRef(0)
  const roundIdx = queue[pos]
  const round = rounds[roundIdx]
  const isSecondPass = pos >= rounds.length
  const guard = useTapGuard(`${pos}-${checked}`)

  const sayOption = (o: Option) => (o.sayDe ? speakBoth(o.sayDe, o.sayIt, bilingual && !round.noItalian) : Promise.resolve(false))

  /** Question → (optionally) every option → any option tapped meanwhile. */
  const runPrompt = async () => {
    phase.current = 'question'
    pending.current = null
    const de = round.sayDe ?? round.promptDe
    const ok = round.autoIt ? await speakBoth(de, round.sayIt ?? round.promptIt, true) : await speak(de, 'de')
    if (!ok) return
    if (pending.current) {
      phase.current = 'idle'
      void sayOption(pending.current)
      return
    }
    if (round.readOptions) {
      phase.current = 'options'
      for (let i = 0; i < round.options.length; i++) {
        const o = round.options[i]
        if (!o.sayDe) continue
        setSpeakingKey(o.key)
        const last = i === round.options.length - 1
        const fine = await speak(round.options.length > 1 && last ? `oder ${o.sayDe}?` : o.sayDe, 'de', { interrupt: false })
        if (!fine) break
      }
      setSpeakingKey(null)
    }
    phase.current = 'idle'
  }

  useEffect(() => {
    setSelected(null)
    setChecked(null)
    setWrongKeys([])
    setNudge(false)
    bubbleTaps.current = 0
    const t = setTimeout(runPrompt, 350)
    return () => {
      clearTimeout(t)
      setSpeakingKey(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos])

  // A pre-reader may not know the green button: say it after a short idle.
  useEffect(() => {
    if (!selected || checked) return
    const t = setTimeout(() => {
      setNudge(true)
      if (nudges.current < 2) {
        nudges.current += 1
        speak('Drück auf den grünen Knopf!', 'de')
      }
    }, 3500)
    return () => clearTimeout(t)
  }, [selected, checked])

  const tapBubble = () => {
    bubbleTaps.current += 1
    const itText = round.sayIt ?? round.promptIt
    const italian = bilingual && !round.noItalian && !!itText && bubbleTaps.current % 2 === 0
    phase.current = 'idle'
    setSpeakingKey(null)
    if (italian) speak(itText!, 'it')
    else speak(round.sayDe ?? round.promptDe, 'de')
  }

  const pick = (o: Option) => {
    if (checked || wrongKeys.includes(o.key)) return
    sfx.tap()
    setSelected(o.key)
    setNudge(false)
    if (phase.current === 'question') pending.current = o
    else {
      phase.current = 'idle'
      setSpeakingKey(null)
      void sayOption(o)
    }
  }

  const finishRound = (idx: number) => setFinished((f) => (f.includes(idx) ? f : [...f, idx]))

  const check = async () => {
    if (!selected || checked) return
    stopSpeech()
    phase.current = 'idle'
    setSpeakingKey(null)
    if (selected === round.answer) {
      setChecked('correct')
      finishRound(roundIdx)
      sfx.correct()
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 }, scalar: 1, disableForReducedMotion: true })
      const firstTry = wrongKeys.length === 0 && !isSecondPass
      let c = 0
      if (firstTry) {
        setFirstTryCorrect((n) => n + 1)
        if (round.src) fixed.current.push(round.src)
        c = combo + 1
        setMaxCombo((m) => Math.max(m, c))
        if (COMBO_STEPS.includes(c)) {
          setToast(c)
          setTimeout(() => sfx.combo(), 250)
          setTimeout(() => setToast(null), 1800)
        }
      }
      setCombo(c)
      const ok = await praise(bilingual, COMBO_STEPS.includes(c) ? c : 0).say()
      if (ok && round.factDe) await speak(round.factDe, 'de', { interrupt: false })
      return
    }
    setCombo(0)
    sfx.wrong()
    const wrongNow = [...wrongKeys, selected]
    setWrongKeys(wrongNow)
    if (round.src && !missed.current.includes(round.src)) missed.current.push(round.src)
    // one heart per question, not per attempt
    if (wrongKeys.length === 0) setHearts((h) => Math.max(0, h - 1))
    const remaining = round.options.length - wrongNow.length
    const giveUp = wrongNow.length >= MAX_TRIES || remaining <= 1
    if (!giveUp) {
      setChecked('wrong')
      await retry().say()
      return
    }
    setChecked('reveal')
    if (!requeued.current.has(roundIdx)) {
      requeued.current.add(roundIdx)
      setQueue((q) => [...q, roundIdx])
    } else {
      finishRound(roundIdx) // second pass: it won't come back again
    }
    const correct = round.options.find((o) => o.key === round.answer)
    if (correct?.sayDe) await speakBoth(`Richtig wäre: ${correct.sayDe}`, correct.sayIt, bilingual && !round.noItalian)
    else await speak('Schau, das hier ist richtig.', 'de')
  }

  const tryAgain = () => {
    stopSpeech()
    setSelected(null)
    setChecked(null)
    void runPrompt()
  }

  const next = () => {
    stopSpeech()
    if (pos + 1 >= queue.length) {
      onFinish({ correct: firstTryCorrect, total: rounds.length, hearts, maxCombo, missed: missed.current, fixed: fixed.current })
    } else {
      setPos(pos + 1)
    }
  }

  const cols = round.columns ?? (round.options.length <= 3 ? round.options.length : 2)
  const correctOpt = useMemo(() => round.options.find((o) => o.key === round.answer), [round])
  const revealed = checked === 'correct' || checked === 'reveal'
  const mood: Mood = checked === 'correct' ? (combo >= 3 ? 'cheer' : 'happy') : checked === 'wrong' ? 'sad' : checked === 'reveal' ? 'think' : 'normal'

  const footer =
    checked === null ? (
      <button className={'btn green block' + (selected && nudge ? ' pulse' : '')} disabled={!selected} onClick={guard(check)}>
        ✓ Überprüfen
      </button>
    ) : checked === 'wrong' ? (
      <div className="feedback">
        <div className="feedback-row">
          <span className="feedback-icon">✗</span>
          <div className="feedback-text">
            <div className="feedback-title">Nicht ganz!</div>
            <div className="feedback-sub">{bilingual ? 'Versuch es nochmal! · Riprova!' : 'Versuch es nochmal!'}</div>
          </div>
        </div>
        <button className="btn block red" onClick={guard(tryAgain)}>
          🔁 Nochmal versuchen
        </button>
      </div>
    ) : (
      <div className="feedback">
        <div className="feedback-row">
          <span className="feedback-icon">{checked === 'correct' ? '✓' : '💡'}</span>
          <div className="feedback-text">
            <div className="feedback-title">{checked === 'correct' ? (bilingual ? 'Richtig! · Giusto!' : 'Richtig!') : 'So ist es richtig:'}</div>
            {checked === 'reveal' && correctOpt?.sayDe && (
              <div className="feedback-sub">
                <b>{correctOpt.sayDe}</b>
              </div>
            )}
            {checked === 'correct' && round.factDe && <div className="feedback-sub">{round.factDe}</div>}
          </div>
        </div>
        <button className={'btn block ' + (checked === 'correct' ? 'green' : 'red')} onClick={guard(next)}>
          Weiter ➜
        </button>
      </div>
    )

  return (
    <LessonShell
      progress={finished.length / rounds.length}
      hearts={hearts}
      onClose={onClose}
      footer={footer}
      footerTone={checked === 'reveal' ? 'wrong' : (checked ?? 'neutral')}
      className={listenOnly ? 'listen-only' : ''}
    >
      <div className="q" key={pos}>
        {toast && (
          <div className="combo-toast" aria-live="polite">
            🔥 {toast} in Folge!
          </div>
        )}
        <div className="q-head">
          <Mascot mood={mood} size={56} />
          <button className="bubble" onClick={tapBubble} aria-label="Nochmal anhören">
            {listenOnly ? (
              <div className="bubble-de">🎧 Hör gut zu!</div>
            ) : (
              <>
                <div className="bubble-de">{round.promptDe}</div>
                {bilingual && round.promptIt && <div className="bubble-it">{round.promptIt}</div>}
              </>
            )}
            <span className="bubble-speaker">🔊</span>
          </button>
        </div>
        {round.visual && <div className="visual">{round.visual}</div>}
        <div className="options" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {round.options.map((o) => {
            const isSel = selected === o.key
            const wasWrong = wrongKeys.includes(o.key)
            const cls =
              'opt' +
              (o.wide ? ' wide' : '') +
              (checked === null && isSel ? ' selected' : '') +
              (revealed && o.key === round.answer ? ' right' : '') +
              (wasWrong ? ' wrong' : '') +
              (speakingKey === o.key ? ' speaking' : '')
            return (
              <button key={o.key} className={cls} onClick={() => pick(o)} disabled={checked !== null || wasWrong} aria-label={o.sayDe}>
                {o.node}
                {o.wide && o.sayDe && (
                  <span
                    className="opt-say"
                    role="button"
                    aria-label={`${o.sayDe} anhören`}
                    onClick={(e) => {
                      e.stopPropagation()
                      phase.current = 'idle'
                      setSpeakingKey(null)
                      void sayOption(o)
                    }}
                  >
                    🔊
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </LessonShell>
  )
}
