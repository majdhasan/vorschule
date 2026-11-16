import { useEffect } from 'react'
import confetti from 'canvas-confetti'
import { speak } from '../lib/speech'
import { sfx } from '../lib/sfx'
import { addDays, todayKey, weekKey } from '../lib/util'
import { useTapGuard } from '../hooks/useTapGuard'
import { t, tr } from '../lib/i18n'

type Props = { streak: number; saved?: boolean; milestone?: number; lessonDays: string[]; freezes: number; doneToday: boolean; onNext: () => void; announce?: boolean }

const DAYS = { de: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'], it: ['Lu', 'Ma', 'Me', 'Gi', 'Ve', 'Sa', 'Do'] }

export function StreakScreen({ streak, saved, milestone, lessonDays, freezes, doneToday, onNext, announce = true }: Props) {
  const guard = useTapGuard('mount', 600)
  const monday = weekKey()
  const today = todayKey()
  useEffect(() => {
    if (!announce) return
    sfx.streak()
    if (milestone) confetti({ particleCount: 200, spread: 120, origin: { y: 0.4 }, colors: ['#ff9600', '#ffc800', '#ff4b4b'], disableForReducedMotion: true })
    const tm = setTimeout(() => {
      const base = streak === 1 ? t('Super! Heute beginnt deine Serie!', 'Bravo! Oggi inizia la tua serie!') : t(`Super! Du hast ${streak} Tage hintereinander gelernt!`, `Bravo! Hai imparato per ${streak} giorni di fila!`)
      speak(saved ? t(`Puh! Der Streak-Schutz hat deine Serie gerettet. ${base}`, `Uff! La protezione ha salvato la tua serie. ${base}`) : base)
    }, 500)
    return () => clearTimeout(tm)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="end streak-screen">
      <div className={'flame' + (doneToday ? '' : ' cold')}>🔥</div>
      <div className="streak-num">{streak}</div>
      <h1 className="streak-title">{streak === 1 ? t('Tag in Folge', 'giorno di fila') : t('Tage in Folge', 'giorni di fila')}</h1>
      {saved && <div className="end-note ice">🧊 {t('Streak-Schutz hat deine Serie gerettet!', 'La protezione ha salvato la tua serie!')}</div>}
      {milestone ? <div className="end-note">🎉 {t(`Meilenstein: ${milestone} Tage! +10 💎 und ein Sticker`, `Traguardo: ${milestone} giorni! +10 💎 e un adesivo`)}</div> : null}
      <div className="week-dots">
        {tr(DAYS).map((d, i) => {
          const key = addDays(monday, i)
          const on = lessonDays.includes(key)
          return (
            <div key={d} className={'wd' + (on ? ' on' : '') + (key === today ? ' today' : '')}>
              <span className="wd-dot">{on ? '🔥' : ''}</span>
              <span className="wd-label">{d}</span>
            </div>
          )
        })}
      </div>
      <p className="muted streak-hint">
        🧊 {t(`Streak-Schutz: ${freezes} · Lerne jeden Tag, damit das Feuer brennt!`, `Protezione serie: ${freezes} · Impara ogni giorno per tenere acceso il fuoco!`)}
      </p>
      <footer className="lesson-foot">
        <button className="btn orange block pulse" onClick={guard(onNext)}>
          {t('Weiter', 'Avanti')} ➜
        </button>
      </footer>
    </div>
  )
}
