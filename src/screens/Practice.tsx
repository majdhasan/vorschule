import { useState } from 'react'
import { AREAS, GAMES, type Area, type Game } from '../games'
import { statsFor, useStore } from '../lib/store'
import { speakBoth } from '../lib/speech'
import { Sheet } from '../components/Sheet'

type Props = { onLesson: (gameId: string, level: number) => void }

export function Practice({ onLesson }: Props) {
  const { games, bilingual } = useStore()
  const [sel, setSel] = useState<Game | null>(null)
  const [level, setLevel] = useState(1)
  const open = (g: Game) => {
    setSel(g)
    setLevel(statsFor(games, g.id).level)
    speakBoth(g.title, g.titleIt, bilingual)
  }
  return (
    <div className="practice">
      <header className="page-head">
        <h1>💪 Üben</h1>
        <p className="muted">Such dir eine Übung aus – jede Runde gibt XP.</p>
      </header>
      {(Object.keys(AREAS) as Area[]).map((area) => (
        <section key={area} className="area">
          <h2>
            {AREAS[area].emoji} {AREAS[area].de}
            {bilingual && <span className="h2-it"> · {AREAS[area].it}</span>}
          </h2>
          <div className="grid">
            {GAMES.filter((g) => g.area === area).map((g) => {
              const st = statsFor(games, g.id)
              const acc = st.total ? Math.round((st.correct / st.total) * 100) : null
              return (
                <button key={g.id} className="game-card" style={{ ['--c' as string]: g.color } as React.CSSProperties} onClick={() => open(g)}>
                  <span className="game-emoji">{g.emoji}</span>
                  <span className="game-title">{g.title}</span>
                  <span className="game-meta">{'⭐'.repeat(st.level)}{acc !== null && ` · ${acc}%`}</span>
                </button>
              )
            })}
          </div>
        </section>
      ))}
      <Sheet open={!!sel} onClose={() => setSel(null)} color={sel?.color}>
        {sel && (
          <div className="node-sheet">
            <div className="node-sheet-title">{sel.emoji} {sel.title}</div>
            <div className="node-sheet-sub">{bilingual ? `${sel.titleIt} · ` : ''}{sel.skill}</div>
            <div className="level-chips">
              {[1, 2, 3].map((l) => (
                <button key={l} className={'chip' + (l === level ? ' on' : '')} onClick={() => setLevel(l)}>
                  Stufe {l}
                </button>
              ))}
            </div>
            <button className="btn white block" onClick={() => { setSel(null); onLesson(sel.id, level) }}>
              Üben · +8 XP
            </button>
          </div>
        )}
      </Sheet>
    </div>
  )
}
