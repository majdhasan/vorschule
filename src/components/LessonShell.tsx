import { useEffect, useState, type ReactNode } from 'react'
import { useStore } from '../lib/store'
import { hasVoice, speak, stopSpeech } from '../lib/speech'
import { getLang, t } from '../lib/i18n'
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
    const tm = setTimeout(() => setNoVoice(typeof speechSynthesis === 'undefined' || !hasVoice(getLang())), 1500)
    return () => clearTimeout(tm)
  }, [])
  // leaving the lesson must silence anything still queued
  useEffect(() => () => stopSpeech(), [])

  const requestClose = () => {
    if (progress <= 0) return onClose()
    setAsk(true)
    speak(t('Willst du wirklich aufhören?', 'Vuoi davvero smettere?'))
  }

  return (
    <div className={'lesson ' + (className ?? '')}>
      <header className="lesson-head">
        <button className="icon-btn close-btn" onClick={requestClose} aria-label={t('Lektion beenden', 'Esci dalla lezione')}>
          ✕
        </button>
        <div className="pbar" role="progressbar" aria-valuenow={Math.round(progress * 100)}>
          <div className="pbar-fill" style={{ width: `${Math.max(0, Math.min(1, progress)) * 100}%` }}>
            <div className="pbar-shine" />
          </div>
        </div>
        {hearts !== undefined && (
          <div className="hearts" aria-label={t(`${hearts} Herzen`, `${hearts} cuori`)}>
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
          🔇 {!sound ? t('Ton ist aus – im Elternbereich einschalten', 'Audio spento – attivalo nell’area genitori') : t('Keine deutsche Stimme auf diesem Gerät gefunden', 'Nessuna voce italiana su questo dispositivo')}
        </div>
      )}
      <main className="lesson-body">{children}</main>
      {footer && <footer className={'lesson-foot tone-' + footerTone}>{footer}</footer>}
      <Sheet open={ask} onClose={() => setAsk(false)} light>
        <div className="quit">
          <Mascot mood="sad" size={88} />
          <h2>{t('Wirklich aufhören?', 'Vuoi smettere?')}</h2>
          <p className="muted">{t('Dann ist diese Lektion weg.', 'Questa lezione andrà persa.')}</p>
          <button className="btn green block" onClick={() => { stopSpeech(); setAsk(false) }}>
            ✅ {t('Weiterlernen', 'Continua')}
          </button>
          <button className="btn outline-red block" onClick={() => { stopSpeech(); onClose() }}>
            ❌ {t('Aufhören', 'Smetti')}
          </button>
        </div>
      </Sheet>
    </div>
  )
}
