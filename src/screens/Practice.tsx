import { useState } from 'react'
import { AREAS, GAMES, type Area, type Game } from '../games'
import { capReached, statsFor, useStore } from '../lib/store'
import { speak, speakBoth } from '../lib/speech'
import { Sheet } from '../components/Sheet'
import { Mascot } from '../components/Mascot'
import type { Launch } from './GameScreen'

type Props = { onLesson: (l: Launch) => void }

const LEVEL_WORD = ['', 'leicht', 'mittel', 'schwer']

export function Practice({ onLesson }: Props) {
  const s = useStore()
  const [sel, setSel] = useState<Game | null>(null)
  const [level, setLevel] = useState(1)
  const [listen, setListen] = useState(false)
  const capped = capReached(s)
  const mistakes = s.mistakes.filter((m) => GAMES.find((g) => g.id === m.g)?.build).length

  const open = (g: Game) => {
    setSel(g)
    setLevel(statsFor(s.games, g.id).level)
    setListen(false)
    speakBoth(g.title, g.titleIt, s.bilingual)
  }
  const chooseLevel = (l: number) => {
    setLevel(l)
    speak(`Stufe ${l}: ${LEVEL_WORD[l]}`, 'de')
  }

  return (
    <div className="practice">
      <header className="page-head">
        <h1>💪 Üben</h1>
        <p className="muted">Such dir eine Übung aus – jede Runde gibt XP.</p>
      </header>

      {capped && (
        <div className="cap-banner">
          <Mascot mood="sleep" size={48} />
          <b>Berli macht Pause – bis morgen!</b>
        </div>
      )}

      <button
        className={'mistakes-card' + (mistakes ? '' : ' empty')}
        disabled={!mistakes || capped}
        onClick={() => { speak('Fehler üben! Wir üben die Fragen, die noch schwer waren.', 'de'); onLesson({ kind: 'mistakes' }) }}
      >
        <span className="mistakes-emoji">🩹</span>
        <span className="mistakes-text">
          <b>Fehler üben</b>
          <span className="muted">{mistakes ? `${Math.min(8, mistakes)} Fragen, die noch schwer waren · +10 XP` : 'Super – gerade keine Fehler zum Üben!'}</span>
        </span>
        {mistakes > 0 && <span className="mistakes-count">{mistakes}</span>}
      </button>

      {(Object.keys(AREAS) as Area[]).map((area) => (
        <section key={area} className="area">
          <h2>
            {AREAS[area].emoji} {AREAS[area].de}
            {s.bilingual && <span className="h2-it"> · {AREAS[area].it}</span>}
          </h2>
          <div className="grid">
            {GAMES.filter((g) => g.area === area).map((g) => {
              const st = statsFor(s.games, g.id)
              return (
                <button key={g.id} className="game-card" style={{ ['--c' as string]: g.color } as React.CSSProperties} onClick={() => open(g)}>
                  <span className="game-emoji">{g.emoji}</span>
                  <span className="game-title">{g.title}</span>
                  <span className="game-meta">{'⭐'.repeat(st.level)}</span>
                </button>
              )
            })}
          </div>
        </section>
      ))}

      <Sheet open={!!sel} onClose={() => setSel(null)} color={sel?.color}>
        {sel && (
          <div className="node-sheet">
            <div className="node-sheet-title">
              {sel.emoji} {sel.title}
            </div>
            {s.bilingual && <div className="node-sheet-sub">{sel.titleIt}</div>}
            <div className="level-chips" role="radiogroup" aria-label="Stufe">
              {[1, 2, 3].map((l) => (
                <button key={l} role="radio" aria-checked={l === level} aria-label={`Stufe ${l}`} className={'chip' + (l === level ? ' on' : '')} onClick={() => chooseLevel(l)}>
                  {'⭐'.repeat(l)}
                </button>
              ))}
            </div>
            {sel.build && (
              <button className={'listen-toggle' + (listen ? ' on' : '')} onClick={() => { setListen(!listen); speak(listen ? 'Mit Text' : 'Nur hören! Ohne Text.', 'de') }} aria-pressed={listen}>
                🎧 Nur hören {listen ? '✓' : ''}
              </button>
            )}
            {capped ? (
              <button className="btn locked block" disabled>💤 Morgen geht's weiter</button>
            ) : (
              <button className="btn white block big" onClick={() => { setSel(null); onLesson({ kind: 'practice', gameId: sel.id, level, listen }) }}>
                ▶ Üben · +8 XP
              </button>
            )}
          </div>
        )}
      </Sheet>
    </div>
  )
}
