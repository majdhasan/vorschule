import { useEffect, useState } from 'react'
import confetti from 'canvas-confetti'
import { speakBoth } from '../lib/speech'
import { sfx } from '../lib/sfx'
import type { LessonResult } from '../lib/store'
import { useTapGuard } from '../hooks/useTapGuard'
import { Mascot } from './Mascot'

type Props = { result: LessonResult; bilingual: boolean; levelUpText?: string; playerName?: string; onNext: () => void }

const STAR_WORD = ['Keine Sterne', 'Ein Stern', 'Zwei Sterne', 'Drei Sterne']

/** Duolingo-style sequence: title → XP counts up → bonus chips → stars → notes → pulsing Weiter. */
export function EndScreen({ result, bilingual, levelUpText, playerName, onNext }: Props) {
  const [step, setStep] = useState(0)
  const [shownXp, setShownXp] = useState(0)
  const guard = useTapGuard(step >= 4, 400)
  const { xp, stars, perfect } = result

  useEffect(() => {
    sfx.complete()
    confetti({ particleCount: perfect ? 200 : 110, spread: 110, origin: { y: 0.45 }, disableForReducedMotion: true })
    const ts = [setTimeout(() => setStep(1), 500)]
    return () => ts.forEach(clearTimeout)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // step 1: count XP up
  useEffect(() => {
    if (step !== 1) return
    let v = 0
    const id = setInterval(() => {
      v = Math.min(xp, v + Math.max(1, Math.ceil(xp / 14)))
      setShownXp(v)
      sfx.count()
      if (v >= xp) {
        clearInterval(id)
        setTimeout(() => setStep(2), 250)
      }
    }, 55)
    return () => clearInterval(id)
  }, [step, xp])

  // step 2: chips pop in, step 3: stars, step 4: notes + button
  useEffect(() => {
    if (step === 2) {
      const t = setTimeout(() => setStep(3), 250 + result.lines.length * 220)
      return () => clearTimeout(t)
    }
    if (step === 3) {
      for (let i = 0; i < stars; i++) setTimeout(() => sfx.tap(), 180 + i * 260)
      const de = `${STAR_WORD[stars]}! ${perfect ? 'Alles richtig!' : stars >= 1 ? 'Lektion geschafft!' : 'Das üben wir nochmal.'}`
      const it = perfect ? 'Perfetto!' : stars >= 1 ? 'Lezione completata!' : 'Riproviamo!'
      void speakBoth(de, it, bilingual)
      const t = setTimeout(() => setStep(4), 300 + stars * 260)
      return () => clearTimeout(t)
    }
  }, [step]) // eslint-disable-line react-hooks/exhaustive-deps

  const notes: string[] = []
  if (result.adult) notes.push(`⚡ ${xp} XP für ${playerName} in der Familien-Liga`)
  if (result.unitPassed) notes.push('🏆 Einheit bestanden!')
  else if (result.nodeDone) notes.push('🔓 Neue Lektion freigeschaltet!')
  if (result.legendary) notes.push('🏅 Legendär! Höchste Stufe geschafft!')
  else if (result.crownUp) notes.push(`👑 Krone ${result.crowns} geschafft!`)
  if (result.levelUp && levelUpText) notes.push(levelUpText)
  if (result.goalReached) notes.push('🎯 Tagesziel erreicht!')

  return (
    <div className="end">
      <div className="end-top">
        <Mascot mood={stars >= 1 ? 'cheer' : 'think'} size={104} />
        <h1 className="end-title">{perfect ? 'Perfekt!' : stars >= 1 ? 'Lektion geschafft!' : 'Gut gekämpft!'}</h1>
        {bilingual && <div className="end-sub">{perfect ? 'Perfetto!' : stars >= 1 ? 'Lezione completata!' : 'Ben fatto!'}</div>}
      </div>

      <div className={'xp-card' + (step >= 1 ? ' in' : '')}>
        <div className="xp-card-label">XP</div>
        <div className="xp-card-value">⚡ {shownXp}</div>
      </div>

      <div className="xp-lines">
        {step >= 2 &&
          result.lines.map((l, i) => (
            <span key={l.label} className="xp-chip" style={{ animationDelay: `${i * 0.22}s` }}>
              {l.label} <b>+{l.xp}</b>
            </span>
          ))}
        {step >= 2 && result.gems > 0 && (
          <span className="xp-chip gem" style={{ animationDelay: `${result.lines.length * 0.22}s` }}>
            💎 <b>+{result.gems}</b>
          </span>
        )}
      </div>

      <div className="big-stars" aria-label={STAR_WORD[stars]}>
        {[0, 1, 2].map((i) => (
          <span key={i} className={'big-star' + (step >= 3 && i < stars ? ' on' : '')} style={{ animationDelay: `${0.18 + i * 0.26}s` }}>
            ⭐
          </span>
        ))}
      </div>

      {step >= 4 && perfect && !result.adult && <div className="end-hearts">❤️❤️❤️ Alle Herzen behalten!</div>}
      {step >= 4 && notes.map((n) => <div key={n} className="end-note">{n}</div>)}

      <footer className="lesson-foot">
        <button className={'btn green block' + (step >= 4 ? ' pulse' : '')} onClick={guard(() => (step >= 4 ? onNext() : setStep(4)))}>
          Weiter ➜
        </button>
      </footer>
    </div>
  )
}
