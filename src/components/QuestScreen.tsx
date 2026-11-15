import { useEffect, useState } from 'react'
import { QUESTS, useStore } from '../lib/store'
import { STICKERS } from '../data/misc'
import { speak } from '../lib/speech'

type Props = { before: number; reward: boolean; newStickers: number; onNext: () => void }

export function QuestScreen({ reward, newStickers, onNext }: Props) {
  const { xpToday, lessonsToday, perfectToday, bilingual, stickersUnlocked } = useStore()
  const vals = { xpToday, lessonsToday, perfectToday }
  const [animate, setAnimate] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 100)
    if (reward) speak('Alle Tagesaufgaben geschafft! Du bekommst einen Sticker!', 'de')
    else if (newStickers > 0) speak('Du hast einen neuen Sticker!', 'de')
    return () => clearTimeout(t)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const sticker = STICKERS[(stickersUnlocked - 1 + STICKERS.length) % STICKERS.length]

  return (
    <div className="end">
      <div className="end-top">
        <h1 className="end-title">Tagesaufgaben</h1>
        {bilingual && <div className="end-sub">Missioni di oggi</div>}
      </div>
      <div className="quests big">
        {QUESTS.map((q) => {
          const v = Math.min(q.target, vals[q.key])
          const done = v >= q.target
          return (
            <div key={q.id} className={'quest' + (done ? ' done' : '')}>
              <span className="quest-emoji">{q.emoji}</span>
              <div className="quest-main">
                <div className="quest-title">{q.de}</div>
                <div className="quest-bar">
                  <div className="quest-fill" style={{ width: animate ? `${(v / q.target) * 100}%` : '0%' }} />
                  <span className="quest-num">
                    {v} / {q.target}
                  </span>
                </div>
              </div>
              <span className="quest-check">{done ? '✅' : '⬜'}</span>
            </div>
          )
        })}
      </div>
      {newStickers > 0 && (
        <div className="sticker-reveal">
          <div className="sticker-reveal-emoji">{sticker.emoji}</div>
          <div className="sticker-reveal-text">
            Neuer Sticker: <b>{sticker.de}</b>
            {bilingual && <i> · {sticker.it}</i>}
          </div>
        </div>
      )}
      <footer className="lesson-foot">
        <button className="btn green block" onClick={onNext}>
          Weiter
        </button>
      </footer>
    </div>
  )
}
