import { useEffect, useState } from 'react'
import { todaysQuests, useStore } from '../lib/store'

/** Today's three quests with progress bars. */
export function QuestList({ animate = false, big = false }: { animate?: boolean; big?: boolean }) {
  const s = useStore()
  const quests = todaysQuests(s)
  const [go, setGo] = useState(!animate)
  useEffect(() => {
    if (!animate) return
    const t = setTimeout(() => setGo(true), 150)
    return () => clearTimeout(t)
  }, [animate])
  return (
    <div className={'quests' + (big ? ' big' : '')}>
      {quests.map(({ q, v, done }) => (
        <div key={q.id} className={'quest' + (done ? ' done' : '')}>
          <span className="quest-emoji">{q.emoji}</span>
          <div className="quest-main">
            <div className="quest-title">{q.de}</div>
            <div className="quest-bar">
              <div className="quest-fill" style={{ width: go ? `${(v / q.target) * 100}%` : '0%' }} />
              <span className="quest-num">
                {v} / {q.target}
              </span>
            </div>
          </div>
          <span className={'quest-check' + (done ? ' on' : '')} aria-label={done ? 'geschafft' : 'offen'} />
        </div>
      ))}
    </div>
  )
}
