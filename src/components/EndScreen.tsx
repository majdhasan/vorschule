import { useEffect } from 'react'
import confetti from 'canvas-confetti'
import { speakBoth } from '../lib/speech'
import { Mascot } from './Mascot'

type Props = {
  xp: number
  acc: number
  seconds: number
  perfect: boolean
  nodeDone: boolean
  levelUp: boolean
  bilingual: boolean
  onNext: () => void
}

export function EndScreen({ xp, acc, seconds, perfect, nodeDone, levelUp, bilingual, onNext }: Props) {
  useEffect(() => {
    confetti({ particleCount: perfect ? 220 : 120, spread: 110, origin: { y: 0.5 } })
    const de = perfect ? 'Perfekt! Alles richtig!' : acc >= 0.6 ? 'Lektion geschafft! Super!' : 'Geschafft! Das üben wir nochmal.'
    const it = perfect ? 'Perfetto!' : acc >= 0.6 ? 'Lezione completata! Bravo!' : 'Fatto! Riproviamo.'
    speakBoth(`${de}${levelUp ? ' Du bist jetzt eine Stufe höher!' : ''}`, it, bilingual)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const mm = Math.floor(seconds / 60)
  const ss = String(seconds % 60).padStart(2, '0')
  return (
    <div className="end">
      <div className="end-top">
        <Mascot mood="happy" size={110} />
        <h1 className="end-title">{perfect ? 'Perfekt!' : 'Lektion geschafft!'}</h1>
        {bilingual && <div className="end-sub">{perfect ? 'Perfetto!' : 'Lezione completata!'}</div>}
        {nodeDone && <div className="end-note">⭐ Neue Lektion freigeschaltet!</div>}
        {levelUp && <div className="end-note">⬆️ Neue Stufe!</div>}
      </div>
      <div className="stat-cards">
        <div className="stat-card yellow" style={{ animationDelay: '0.1s' }}>
          <div className="stat-label">Gesamt-XP</div>
          <div className="stat-value">⚡ {xp}</div>
        </div>
        <div className="stat-card green" style={{ animationDelay: '0.3s' }}>
          <div className="stat-label">{perfect ? 'Fehlerfrei' : 'Genauigkeit'}</div>
          <div className="stat-value">🎯 {Math.round(acc * 100)}%</div>
        </div>
        <div className="stat-card blue" style={{ animationDelay: '0.5s' }}>
          <div className="stat-label">Zeit</div>
          <div className="stat-value">⏱ {mm}:{ss}</div>
        </div>
      </div>
      <footer className="lesson-foot">
        <button className="btn green block" onClick={onNext}>
          Weiter
        </button>
      </footer>
    </div>
  )
}
