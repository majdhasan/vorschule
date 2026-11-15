import { useEffect, useState } from 'react'
import { GAMES } from '../games'
import { AVATARS } from '../data/misc'
import { statsFor, useStore } from '../lib/store'
import { setPreferredVoice, speak, voicesFor, type VoiceInfo } from '../lib/speech'
import { addDays, todayKey } from '../lib/util'

const WD = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']

export function Parents() {
  const s = useStore()
  const [a] = useState(() => 3 + Math.floor(Math.random() * 6))
  const [b] = useState(() => 4 + Math.floor(Math.random() * 6))
  const [input, setInput] = useState('')
  const [name, setName] = useState(s.childName)
  const [confirmReset, setConfirmReset] = useState(false)
  const [voices, setVoices] = useState<{ de: VoiceInfo[]; it: VoiceInfo[] }>({ de: [], it: [] })
  useEffect(() => {
    if (typeof speechSynthesis === 'undefined') return
    const load = () => setVoices({ de: voicesFor('de'), it: voicesFor('it') })
    load()
    speechSynthesis.addEventListener?.('voiceschanged', load)
    return () => speechSynthesis.removeEventListener?.('voiceschanged', load)
  }, [])
  const [memberName, setMemberName] = useState('')
  const [memberAvatar, setMemberAvatar] = useState('👩')

  if (!s.parentUnlocked) {
    return (
      <div className="practice">
        <header className="page-head"><h1>👨‍👩‍👦 Elternbereich</h1></header>
        <div className="gate">
          <p>Nur für Erwachsene. Wie viel ist</p>
          <div className="gate-q">{a} × {b} = ?</div>
          <input
            className="gate-input"
            inputMode="numeric"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && Number(input) === a * b && s.setParentUnlocked(true)}
            aria-label="Ergebnis"
          />
          <button className="btn green" onClick={() => Number(input) === a * b && s.setParentUnlocked(true)}>Öffnen</button>
        </div>
      </div>
    )
  }

  const overall = GAMES.reduce((acc, g) => {
    const st = statsFor(s.games, g.id)
    return { c: acc.c + st.correct, t: acc.t + st.total, p: acc.p + st.plays }
  }, { c: 0, t: 0, p: 0 })

  return (
    <div className="practice">
      <header className="page-head">
        <h1>👨‍👩‍👦 Elternbereich</h1>
        <button className="btn gray small" onClick={() => s.setParentUnlocked(false)}>🔒 Sperren</button>
      </header>
      <div className="parents">
        <section className="pcard">
          <h3>Einstellungen</h3>
          <label className="prow">
            <span>Name des Kindes</span>
            <span className="prow-right">
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="z. B. Leo" />
              <button className="btn blue small" onClick={() => s.setName(name.trim())}>Speichern</button>
            </span>
          </label>
          <label className="prow">
            <span>Zweisprachig (Deutsch + Italienisch)</span>
            <input type="checkbox" checked={s.bilingual} onChange={(e) => s.setBilingual(e.target.checked)} />
          </label>
          <label className="prow">
            <span>Sprachausgabe</span>
            <input type="checkbox" checked={s.sound} onChange={(e) => s.setSound(e.target.checked)} />
          </label>
          <div className="prow">
            <span>Tagesziel</span>
            <span className="seg small">
              {[10, 20, 30, 50].map((g) => (
                <button key={g} className={s.dailyGoal === g ? 'on' : ''} onClick={() => s.setDailyGoal(g)}>{g} XP</button>
              ))}
            </span>
          </div>
          <div className="prow">
            <span>Lektionen pro Tag</span>
            <span className="seg small">
              {[0, 3, 5, 8].map((n) => (
                <button key={n} className={s.dailyCap === n ? 'on' : ''} onClick={() => s.setDailyCap(n)}>{n ? n : 'frei'}</button>
              ))}
            </span>
          </div>
          <p className="muted small-print">Ist das Limit erreicht, macht Berli Pause bis morgen. Der Pfad bleibt sichtbar.</p>
          <div className="prow wrap">
            <span>Avatar des Kindes</span>
            <span className="avatar-pick">
              {AVATARS.map((a) => (
                <button key={a} className={s.childAvatar === a ? 'on' : ''} onClick={() => s.setChildAvatar(a)} aria-label={a}>{a}</button>
              ))}
            </span>
          </div>
        </section>

        <section className="pcard">
          <h3>🏅 Familien-Liga</h3>
          <p className="muted">Bis zu drei Erwachsene oder Geschwister sammeln wöchentliche XP mit. Wer spielt, sammelt nur Liga-XP – der Pfad des Kindes bleibt unverändert.</p>
          {s.members.map((m) => (
            <div className="prow" key={m.id}>
              <span>{m.avatar} {m.name} · {m.weekXp} XP</span>
              <span className="prow-right">
                <button className={'btn small ' + (s.activeMember === m.id ? 'green' : 'blue')} onClick={() => s.setActiveMember(s.activeMember === m.id ? '' : m.id)}>
                  {s.activeMember === m.id ? '✓ spielt' : 'Jetzt spielen'}
                </button>
                <button className="btn small gray" onClick={() => s.removeMember(m.id)} aria-label={`${m.name} entfernen`}>✕</button>
              </span>
            </div>
          ))}
          {s.members.length < 3 && (
            <div className="prow wrap">
              <span className="avatar-pick">
                {AVATARS.slice(3).map((a) => (
                  <button key={a} className={memberAvatar === a ? 'on' : ''} onClick={() => setMemberAvatar(a)} aria-label={a}>{a}</button>
                ))}
              </span>
              <span className="prow-right">
                <input className="input" value={memberName} onChange={(e) => setMemberName(e.target.value)} placeholder="z. B. Mama" />
                <button className="btn blue small" disabled={!memberName.trim()} onClick={() => { s.addMember(memberName.trim(), memberAvatar); setMemberName('') }}>+</button>
              </span>
            </div>
          )}
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
                    value={list.some((v) => v.name === current) ? current : ''}
                    onChange={(e) => { s.setVoice(lang, e.target.value); setPreferredVoice(lang, e.target.value) }}
                  >
                    <option value="">Automatisch{list[0] ? ` (${list[0].name})` : ''}</option>
                    {list.map((v) => (
                      <option key={v.name} value={v.name}>{v.label}</option>
                    ))}
                  </select>
                  <button className="btn blue small" onClick={() => speak(sample, lang)}>▶ Test</button>
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
          <h3>📊 Diese Woche</h3>
          <div className="week-chart" role="img" aria-label="XP der letzten 7 Tage">
            {Array.from({ length: 7 }, (_, i) => {
              const key = addDays(todayKey(), i - 6)
              const v = s.xpByDay[key] ?? 0
              const max = Math.max(s.dailyGoal, ...Object.values(s.xpByDay))
              const [y, mo, d] = key.split('-').map(Number)
              return (
                <div key={key} className="wc-col">
                  <span className="wc-val">{v || ''}</span>
                  <span className={'wc-bar' + (v >= s.dailyGoal ? ' goal' : '')} style={{ height: `${(v / max) * 100}%` }} />
                  <span className="wc-day">{WD[new Date(y, mo - 1, d).getDay()]}</span>
                </div>
              )
            })}
          </div>
          {(() => {
            const weak = GAMES.map((g) => ({ g, st: statsFor(s.games, g.id) })).filter(({ st }) => st.total >= 4 && st.correct / st.total < 0.6)
            return weak.length ? (
              <p className="small-print">
                <b>Woran üben:</b> {weak.map(({ g, st }) => `${g.emoji} ${g.title} (${Math.round((st.correct / st.total) * 100)} %)`).join(' · ')}
              </p>
            ) : (
              <p className="muted small-print">Keine Schwachstellen – alle Spiele über 60 % richtig.</p>
            )
          })()}
          <p className="muted small-print">{s.mistakes.length} Fragen im Fehler-Training · 🧊 Streak-Schutz: {s.freezes}</p>
        </section>

        <section className="pcard">
          <h3>Fortschritt</h3>
          <p className="muted">
            {overall.p} Lektionen · {overall.t ? Math.round((overall.c / overall.t) * 100) : 0}% richtig · {s.xp} XP · {Object.values(s.nodes).filter((n) => n.done).length} Pfad-Stationen geschafft · Serie: {s.streak} Tag(e) · Rekord: {s.bestStreak}
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
                    <td className="muted nowrap">{st.lastPlayed ? st.lastPlayed.slice(8, 10) + '.' + st.lastPlayed.slice(5, 7) + '.' : '–'}</td>
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
            <button className="btn gray" onClick={() => setConfirmReset(true)}>Fortschritt löschen</button>
          ) : (
            <div className="prow">
              <span>Wirklich alles löschen?</span>
              <span className="prow-right">
                <button className="btn small red" onClick={() => { s.reset(); setConfirmReset(false) }}>Ja, löschen</button>
                <button className="btn small gray" onClick={() => setConfirmReset(false)}>Abbrechen</button>
              </span>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
