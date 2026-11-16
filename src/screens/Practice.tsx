import { useState } from 'react'
import { AREAS, GAMES, type Area, type Game } from '../games'
import { capReached, statsFor, useStore } from '../lib/store'
import { speak } from '../lib/speech'
import { t, tr } from '../lib/i18n'
import { Sheet } from '../components/Sheet'
import { Mascot } from '../components/Mascot'
import type { Launch } from './GameScreen'

type Props = { onLesson: (l: Launch) => void }

const LEVEL_WORD = { de: ['', 'leicht', 'mittel', 'schwer'], it: ['', 'facile', 'medio', 'difficile'] }

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
    speak(t(g.title, g.titleIt))
  }
  const chooseLevel = (l: number) => {
    setLevel(l)
    speak(`${t('Stufe', 'Livello')} ${l}: ${tr(LEVEL_WORD)[l]}`)
  }

  return (
    <div className="practice">
      <header className="page-head">
        <h1>💪 {t('Üben', 'Esercizi')}</h1>
        <p className="muted">{t('Such dir eine Übung aus – jede Runde gibt XP.', 'Scegli un esercizio – ogni partita dà XP.')}</p>
      </header>

      {capped && (
        <div className="cap-banner">
          <Mascot mood="sleep" size={48} />
          <b>{t('Berli macht Pause – bis morgen!', 'Berli fa una pausa – a domani!')}</b>
        </div>
      )}

      <button
        className={'mistakes-card' + (mistakes ? '' : ' empty')}
        disabled={!mistakes || capped}
        onClick={() => { speak(t('Fehler üben! Wir üben die Fragen, die noch schwer waren.', 'Ripassa gli errori! Rifacciamo le domande che erano difficili.')); onLesson({ kind: 'mistakes' }) }}
      >
        <span className="mistakes-emoji">🩹</span>
        <span className="mistakes-text">
          <b>{t('Fehler üben', 'Ripassa gli errori')}</b>
          <span className="muted">
            {mistakes
              ? t(`${Math.min(8, mistakes)} Fragen, die noch schwer waren · +10 XP`, `${Math.min(8, mistakes)} domande ancora difficili · +10 XP`)
              : t('Super – gerade keine Fehler zum Üben!', 'Bravo – nessun errore da ripassare!')}
          </span>
        </span>
        {mistakes > 0 && <span className="mistakes-count">{mistakes}</span>}
      </button>

      {(Object.keys(AREAS) as Area[]).map((area) => (
        <section key={area} className="area">
          <h2>
            {AREAS[area].emoji} {tr(AREAS[area])}
          </h2>
          <div className="grid">
            {GAMES.filter((g) => g.area === area).map((g) => {
              const st = statsFor(s.games, g.id)
              return (
                <button key={g.id} className="game-card" style={{ ['--c' as string]: g.color } as React.CSSProperties} onClick={() => open(g)}>
                  <span className="game-emoji">{g.emoji}</span>
                  <span className="game-title">{t(g.title, g.titleIt)}</span>
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
              {sel.emoji} {t(sel.title, sel.titleIt)}
            </div>
            <div className="level-chips" role="radiogroup" aria-label={t('Stufe', 'Livello')}>
              {[1, 2, 3].map((l) => (
                <button key={l} role="radio" aria-checked={l === level} aria-label={`${t('Stufe', 'Livello')} ${l}`} className={'chip' + (l === level ? ' on' : '')} onClick={() => chooseLevel(l)}>
                  {'⭐'.repeat(l)}
                </button>
              ))}
            </div>
            {sel.build && (
              <button className={'listen-toggle' + (listen ? ' on' : '')} onClick={() => { setListen(!listen); speak(listen ? t('Mit Text', 'Con il testo') : t('Nur hören! Ohne Text.', 'Solo ascolto! Senza testo.')) }} aria-pressed={listen}>
                🎧 {t('Nur hören', 'Solo ascolto')} {listen ? '✓' : ''}
              </button>
            )}
            {capped ? (
              <button className="btn locked block" disabled>💤 {t("Morgen geht's weiter", 'Si continua domani')}</button>
            ) : (
              <button className="btn white block big" onClick={() => { setSel(null); onLesson({ kind: 'practice', gameId: sel.id, level, listen }) }}>
                ▶ {t('Üben', 'Allenati')} · +8 XP
              </button>
            )}
          </div>
        )}
      </Sheet>
    </div>
  )
}
