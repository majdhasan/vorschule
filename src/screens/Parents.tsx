import { useState } from 'react'
import { GAMES } from '../games'
import { statsFor, useStore } from '../lib/store'
import { setSpeechEnabled } from '../lib/speech'

export function Parents({ onHome }: { onHome: () => void }) {
  const s = useStore()
  const [a] = useState(() => 3 + Math.floor(Math.random() * 6))
  const [b] = useState(() => 4 + Math.floor(Math.random() * 6))
  const [input, setInput] = useState('')
  const [name, setName] = useState(s.childName)
  const [confirmReset, setConfirmReset] = useState(false)

  if (!s.parentUnlocked) {
    return (
      <div className="screen">
        <div className="topbar" style={{ background: '#6c757d' }}>
          <button className="back" onClick={onHome} aria-label="Zurück">←</button>
          <div className="topbar-title">👨‍👩‍👦 Elternbereich</div>
          <div />
        </div>
        <div className="gate">
          <p>Nur für Erwachsene. Wie viel ist</p>
          <div className="gate-q">{a} × {b} = ?</div>
          <input
            className="gate-input"
            inputMode="numeric"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && Number(input) === a * b && s.setParentUnlocked(true)}
            autoFocus
          />
          <button className="btn" onClick={() => Number(input) === a * b && s.setParentUnlocked(true)}>Öffnen</button>
        </div>
      </div>
    )
  }

  const overall = GAMES.reduce((acc, g) => {
    const st = statsFor(s.games, g.id)
    return { c: acc.c + st.correct, t: acc.t + st.total, p: acc.p + st.plays }
  }, { c: 0, t: 0, p: 0 })

  return (
    <div className="screen">
      <div className="topbar" style={{ background: '#6c757d' }}>
        <button className="back" onClick={() => { s.setParentUnlocked(false); onHome() }} aria-label="Zurück">←</button>
        <div className="topbar-title">👨‍👩‍👦 Elternbereich</div>
        <div />
      </div>
      <div className="parents">
        <section className="pcard">
          <h3>Einstellungen</h3>
          <label className="prow">
            <span>Name des Kindes</span>
            <span className="prow-right">
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="z. B. Leo" />
              <button className="btn small" onClick={() => s.setName(name.trim())}>Speichern</button>
            </span>
          </label>
          <label className="prow">
            <span>Zweisprachig (Deutsch + Italienisch)</span>
            <input type="checkbox" checked={s.bilingual} onChange={(e) => s.setBilingual(e.target.checked)} />
          </label>
          <label className="prow">
            <span>Sprachausgabe</span>
            <input type="checkbox" checked={s.sound} onChange={(e) => { s.setSound(e.target.checked); setSpeechEnabled(e.target.checked) }} />
          </label>
        </section>

        <section className="pcard">
          <h3>Fortschritt</h3>
          <p className="muted">
            {overall.p} Spiele gespielt · {overall.t ? Math.round((overall.c / overall.t) * 100) : 0}% richtig · {s.totalStars} ⭐ · Serie: {s.streak} Tag(e)
          </p>
          <table className="ptable">
            <thead>
              <tr><th>Spiel</th><th>Stufe</th><th>Gespielt</th><th>Richtig</th><th>Zuletzt</th></tr>
            </thead>
            <tbody>
              {GAMES.map((g) => {
                const st = statsFor(s.games, g.id)
                const acc = st.total ? Math.round((st.correct / st.total) * 100) : null
                return (
                  <tr key={g.id}>
                    <td>{g.emoji} {g.title}<div className="skill">{g.skill}</div></td>
                    <td>{'⭐'.repeat(st.level)}</td>
                    <td>{st.plays}</td>
                    <td className={acc === null ? '' : acc >= 80 ? 'good' : acc >= 50 ? 'mid' : 'bad'}>{acc === null ? '–' : `${acc}%`}</td>
                    <td className="muted">{st.lastPlayed ?? '–'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </section>

        <section className="pcard">
          <h3>Was die Schule in Berlin erwartet</h3>
          <ul className="tips">
            <li><b>Sprache:</b> Reime erkennen, Silben klatschen, Anlaute hören, den eigenen Namen schreiben.</li>
            <li><b>Mathe:</b> Bis 10 (besser 20) zählen, Mengen vergleichen, Formen benennen, einfache Muster.</li>
            <li><b>Motorik:</b> Stift richtig halten, nachspuren, schneiden – hier hilft „Nachspuren“ und echtes Malen auf Papier.</li>
            <li><b>Selbstständigkeit:</b> Schulweg üben, Schulranzen packen, Hand heben, bis 112 wissen.</li>
            <li><b>Zweisprachigkeit:</b> Italienisch ist ein Schatz – beide Sprachen stärken sich gegenseitig. Jeden Tag 10 Minuten reichen.</li>
          </ul>
        </section>

        <section className="pcard danger">
          <h3>Zurücksetzen</h3>
          {!confirmReset ? (
            <button className="btn secondary" onClick={() => setConfirmReset(true)}>Alle Fortschritte löschen …</button>
          ) : (
            <div className="prow">
              <span>Wirklich alles löschen?</span>
              <span>
                <button className="btn small danger" onClick={() => { s.reset(); setConfirmReset(false) }}>Ja, löschen</button>{' '}
                <button className="btn small secondary" onClick={() => setConfirmReset(false)}>Abbrechen</button>
              </span>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
