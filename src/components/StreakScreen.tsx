import { useEffect } from 'react'
import confetti from 'canvas-confetti'
import { speak } from '../lib/speech'
import { sfx } from '../lib/sfx'
import { addDays, todayKey, weekKey } from '../lib/util'
import { useTapGuard } from '../hooks/useTapGuard'

type Props = { streak: number; saved?: boolean; milestone?: number; lessonDays: string[]; freezes: number; doneToday: boolean; onNext: () => void; announce?: boolean }

const DAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

export function StreakScreen({ streak, saved, milestone, lessonDays, freezes, doneToday, onNext, announce = true }: Props) {
  const guard = useTapGuard('mount', 600)
  const monday = weekKey()
  const today = todayKey()
  useEffect(() => {
    if (!announce) return
    sfx.streak()
    if (milestone) confetti({ particleCount: 200, spread: 120, origin: { y: 0.4 }, colors: ['#ff9600', '#ffc800', '#ff4b4b'], disableForReducedMotion: true })
    const t = setTimeout(() => {
      const base = streak === 1 ? 'Super! Heute beginnt deine Serie!' : `Super! Du hast ${streak} Tage hintereinander gelernt!`
      speak(saved ? `Puh! Der Streak-Schutz hat deine Serie gerettet. ${base}` : base, 'de')
    }, 500)
    return () => clearTimeout(t)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="end streak-screen">
      <div className={'flame' + (doneToday ? '' : ' cold')}>🔥</div>
      <div className="streak-num">{streak}</div>
      <h1 className="streak-title">{streak === 1 ? 'Tag in Folge' : 'Tage in Folge'}</h1>
      {saved && <div className="end-note ice">🧊 Streak-Schutz hat deine Serie gerettet!</div>}
      {milestone ? <div className="end-note">🎉 Meilenstein: {milestone} Tage! +10 💎 und ein Sticker</div> : null}
      <div className="week-dots">
        {DAYS.map((d, i) => {
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
        🧊 Streak-Schutz: {freezes} · Lerne jeden Tag, damit das Feuer brennt!
      </p>
      <footer className="lesson-foot">
        <button className="btn orange block pulse" onClick={guard(onNext)}>
          Weiter ➜
        </button>
      </footer>
    </div>
  )
}
