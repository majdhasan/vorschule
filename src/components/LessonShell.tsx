import type { ReactNode } from 'react'

type Props = {
  progress: number // 0..1
  hearts: number
  maxHearts?: number
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  footerTone?: 'neutral' | 'correct' | 'wrong'
}

export function LessonShell({ progress, hearts, maxHearts = 3, onClose, children, footer, footerTone = 'neutral' }: Props) {
  return (
    <div className="lesson">
      <header className="lesson-head">
        <button className="icon-btn" onClick={onClose} aria-label="Schließen">
          ✕
        </button>
        <div className="pbar" role="progressbar" aria-valuenow={Math.round(progress * 100)}>
          <div className="pbar-fill" style={{ width: `${Math.max(0, Math.min(1, progress)) * 100}%` }}>
            <div className="pbar-shine" />
          </div>
        </div>
        <div className="hearts" aria-label={`${hearts} Herzen`}>
          {Array.from({ length: maxHearts }, (_, i) => (
            <span key={i} className={'heart' + (i < hearts ? '' : ' lost')}>
              {i < hearts ? '❤️' : '🖤'}
            </span>
          ))}
        </div>
      </header>
      <main className="lesson-body">{children}</main>
      {footer && <footer className={'lesson-foot tone-' + footerTone}>{footer}</footer>}
    </div>
  )
}
