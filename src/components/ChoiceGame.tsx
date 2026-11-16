import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import confetti from 'canvas-confetti'
import { praise, retry, speak, stopSpeech } from '../lib/speech'
import { t } from '../lib/i18n'
import { sfx } from '../lib/sfx'
import type { Src } from '../lib/store'
import { useTapGuard } from '../hooks/useTapGuard'
import { LessonShell } from './LessonShell'
import { Mascot, type Mood } from './Mascot'

// All texts are already in the app language: builders run with it set.
export type Option = { key: string; node: ReactNode; say?: string; wide?: boolean }
export type Round = {
  prompt: string
  visual?: ReactNode
  options: Option[]
  answer: string
  fact?: string
  columns?: number
  /** spoken instead of `prompt` when it differs (letter sounds, pauses) */
  say?: string
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
  childName: string
  onFinish: (o: LessonOutcome) => void
  onClose: () => void
}

type Props = { rounds: Round[]; onFinish: (o: LessonOutcome) => void; onClose: () => void; listenOnly?: boolean }

export const MAX_HEARTS = 3
/** How many wrong picks on one question before the answer is revealed. */
const MAX_TRIES = 2
const COMBO_STEPS = [3, 5, 8]

type Checked = null | 'correct' | 'wrong' | 'reveal'

export function ChoiceGame({ rounds, onFinish, onClose, listenOnly }: Props) {
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
  const nudges = useRef(0)
  const roundIdx = queue[pos]
  const round = rounds[roundIdx]
  const isSecondPass = pos >= rounds.length
  const guard = useTapGuard(`${pos}-${checked}`)

  const sayOption = (o: Option) => (o.say ? speak(o.say) : Promise.resolve(false))

  /** Question → (optionally) every option → any option tapped meanwhile. */
  const runPrompt = async () => {
    phase.current = 'question'
    pending.current = null
    const ok = await speak(round.say ?? round.prompt)
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
        if (!o.say) continue
        setSpeakingKey(o.key)
        const last = i === round.options.length - 1
        const fine = await speak(round.options.length > 1 && last ? t(`oder ${o.say}?`, `oppure ${o.say}?`) : o.say, undefined, { interrupt: false })
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
    const tm = setTimeout(runPrompt, 350)
    return () => {
      clearTimeout(tm)
      setSpeakingKey(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos])

  // A pre-reader may not know the green button: say it after a short idle.
  useEffect(() => {
    if (!selected || checked) return
    const tm = setTimeout(() => {
      setNudge(true)
      if (nudges.current < 2) {
        nudges.current += 1
        speak(t('Drück auf den grünen Knopf!', 'Premi il pulsante verde!'))
      }
    }, 3500)
    return () => clearTimeout(tm)
  }, [selected, checked])

  const tapBubble = () => {
    phase.current = 'idle'
    setSpeakingKey(null)
    speak(round.say ?? round.prompt)
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
      const ok = await praise(COMBO_STEPS.includes(c) ? c : 0).say()
      if (ok && round.fact) await speak(round.fact, undefined, { interrupt: false })
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
    if (correct?.say) await speak(t(`Richtig wäre: ${correct.say}`, `La risposta giusta è: ${correct.say}`))
    else await speak(t('Schau, das hier ist richtig.', 'Guarda, questa è quella giusta.'))
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
        ✓ {t('Überprüfen', 'Controlla')}
      </button>
    ) : checked === 'wrong' ? (
      <div className="feedback">
        <div className="feedback-row">
          <span className="feedback-icon">✗</span>
          <div className="feedback-text">
            <div className="feedback-title">{t('Nicht ganz!', 'Non proprio!')}</div>
            <div className="feedback-sub">{t('Versuch es nochmal!', 'Prova ancora!')}</div>
          </div>
        </div>
        <button className="btn block red" onClick={guard(tryAgain)}>
          🔁 {t('Nochmal versuchen', 'Riprova')}
        </button>
      </div>
    ) : (
      <div className="feedback">
        <div className="feedback-row">
          <span className="feedback-icon">{checked === 'correct' ? '✓' : '💡'}</span>
          <div className="feedback-text">
            <div className="feedback-title">{checked === 'correct' ? t('Richtig!', 'Giusto!') : t('So ist es richtig:', 'Ecco quella giusta:')}</div>
            {checked === 'reveal' && correctOpt?.say && (
              <div className="feedback-sub">
                <b>{correctOpt.say}</b>
              </div>
            )}
            {checked === 'correct' && round.fact && <div className="feedback-sub">{round.fact}</div>}
          </div>
        </div>
        <button className={'btn block ' + (checked === 'correct' ? 'green' : 'red')} onClick={guard(next)}>
          {t('Weiter', 'Avanti')} ➜
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
            🔥 {toast} {t('in Folge!', 'di fila!')}
          </div>
        )}
        <div className="q-head">
          <Mascot mood={mood} size={56} />
          <button className="bubble" onClick={tapBubble} aria-label={t('Nochmal anhören', 'Ascolta di nuovo')}>
            {listenOnly ? (
              <div className="bubble-de">🎧 {t('Hör gut zu!', 'Ascolta bene!')}</div>
            ) : (
              <div className="bubble-de">{round.prompt}</div>
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
              <button key={o.key} className={cls} onClick={() => pick(o)} disabled={checked !== null || wasWrong} aria-label={o.say}>
                {o.node}
                {o.wide && o.say && (
                  <span
                    className="opt-say"
                    role="button"
                    aria-label={t(`${o.say} anhören`, `Ascolta: ${o.say}`)}
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
