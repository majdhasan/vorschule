import { useEffect, useState, type ReactNode } from 'react'
import { useStore } from '../lib/store'
import { hasVoice, speak, stopSpeech } from '../lib/speech'
import { Mascot } from './Mascot'
import { Sheet } from './Sheet'

type Props = {
  progress: number // 0..1
  hearts?: number // omit to hide hearts
  maxHearts?: number
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  footerTone?: 'neutral' | 'correct' | 'wrong'
  className?: string
}

export function LessonShell({ progress, hearts, maxHearts = 3, onClose, children, footer, footerTone = 'neutral', className }: Props) {
  const sound = useStore((s) => s.sound)
  const [ask, setAsk] = useState(false)
  const [noVoice, setNoVoice] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setNoVoice(typeof speechSynthesis === 'undefined' || !hasVoice('de')), 1500)
    return () => clearTimeout(t)
  }, [])
  // leaving the lesson must silence anything still queued
  useEffect(() => () => stopSpeech(), [])

  const requestClose = () => {
    if (progress <= 0) return onClose()
    setAsk(true)
    speak('Willst du wirklich aufhören?', 'de')
  }

  return (
    <div className={'lesson ' + (className ?? '')}>
      <header className="lesson-head">
        <button className="icon-btn close-btn" onClick={requestClose} aria-label="Lektion beenden">
          ✕
        </button>
        <div className="pbar" role="progressbar" aria-valuenow={Math.round(progress * 100)}>
          <div className="pbar-fill" style={{ width: `${Math.max(0, Math.min(1, progress)) * 100}%` }}>
            <div className="pbar-shine" />
          </div>
        </div>
        {hearts !== undefined && (
          <div className="hearts" aria-label={`${hearts} Herzen`}>
            {Array.from({ length: maxHearts }, (_, i) => (
              <span key={i} className={'heart' + (i < hearts ? '' : ' lost')}>
                {i < hearts ? '❤️' : '🖤'}
              </span>
            ))}
          </div>
        )}
      </header>
      {(!sound || noVoice) && (
        <div className="mute-banner" role="status">
          🔇 {!sound ? 'Ton ist aus – im Elternbereich einschalten' : 'Keine deutsche Stimme auf diesem Gerät gefunden'}
        </div>
      )}
      <main className="lesson-body">{children}</main>
      {footer && <footer className={'lesson-foot tone-' + footerTone}>{footer}</footer>}
      <Sheet open={ask} onClose={() => setAsk(false)} light>
        <div className="quit">
          <Mascot mood="sad" size={88} />
          <h2>Wirklich aufhören?</h2>
          <p className="muted">Dann ist diese Lektion weg.</p>
          <button className="btn green block" onClick={() => { stopSpeech(); setAsk(false) }}>
            ✅ Weiterlernen
          </button>
          <button className="btn outline-red block" onClick={() => { stopSpeech(); onClose() }}>
            ❌ Aufhören
          </button>
        </div>
      </Sheet>
    </div>
  )
}
