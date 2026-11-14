import { useEffect, useState } from 'react'
import { GAMES } from '../games'
import { statsFor, useStore } from '../lib/store'
import { setPreferredVoice, setSpeechEnabled, speak, voicesFor, type VoiceInfo } from '../lib/speech'

export function Parents({ onHome }: { onHome: () => void }) {
  const s = useStore()
  const [a] = useState(() => 3 + Math.floor(Math.random() * 6))
  const [b] = useState(() => 4 + Math.floor(Math.random() * 6))
  const [input, setInput] = useState('')
  const [name, setName] = useState(s.childName)
  const [confirmReset, setConfirmReset] = useState(false)
  const [voices, setVoices] = useState<{ de: VoiceInfo[]; it: VoiceInfo[] }>({ de: [], it: [] })
  useEffect(() => {
    const load = () => setVoices({ de: voicesFor('de'), it: voicesFor('it') })
    load()
    speechSynthesis?.addEventListener?.('voiceschanged', load)
    return () => speechSynthesis?.removeEventListener?.('voiceschanged', load)
  }, [])

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
          <h3>Stimmen</h3>
          <p className="muted">
            Die Sprachqualität hängt von den Stimmen auf diesem Gerät ab. ★★★ = sehr gut, ★ = einfache Standardstimme.
            Ohne Auswahl nimmt Berli automatisch die beste.
          </p>
          {(['de', 'it'] as const).map((lang) => {
            const list = voices[lang]
            const current = lang === 'de' ? s.voiceDe : s.voiceIt
            const sample = lang === 'de' ? 'Hallo! Ich bin Berli, der Berliner Bär. Mit welchem Buchstaben beginnt Elefant?' : "Ciao! Sono Berli, l'orso di Berlino. Quante sillabe ha banana?"
            return (
              <div className="prow" key={lang}>
                <span>{lang === 'de' ? '🇩🇪 Deutsch' : '🇮🇹 Italienisch'}</span>
                <span className="prow-right">
                  <select
                    className="input"
                    value={current}
                    onChange={(e) => { s.setVoice(lang, e.target.value); setPreferredVoice(lang, e.target.value) }}
                  >
                    <option value="">Automatisch{list[0] ? ` (${list[0].name})` : ''}</option>
                    {list.map((v) => (
                      <option key={v.name} value={v.name}>{v.label}</option>
                    ))}
                  </select>
                  <button className="btn small" onClick={() => speak(sample, lang)}>▶ Test</button>
                </span>
              </div>
            )
          })}
          {voices.de.length === 0 && <p className="muted">Keine deutsche Stimme gefunden – siehe Hinweis unten.</p>}
          <details className="hint">
            <summary>Bessere Stimmen installieren</summary>
            <ul className="tips">
              <li><b>iPad / iPhone:</b> Einstellungen → Bedienungshilfen → Gesprochene Inhalte → Stimmen → Deutsch → „Anna (Premium)“ oder „Petra (Premium)“ laden; Italienisch → „Alice (Premium)“ oder „Federica (Premium)“. Danach Safari neu starten.</li>
              <li><b>Mac:</b> Systemeinstellungen → Bedienungshilfen → Gesprochene Inhalte → Systemstimme → „Stimmen verwalten“ → dieselben Premium-Stimmen laden.</li>
              <li><b>Chrome am Mac/PC:</b> online stehen „Google Deutsch“ und „Google italiano“ bereit – deutlich besser als die Standardstimmen, werden automatisch bevorzugt.</li>
              <li><b>Android:</b> Einstellungen → System → Sprachen → Text-zu-Sprache → Google-Sprachausgabe → Stimmen für Deutsch und Italienisch installieren.</li>
            </ul>
          </details>
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
