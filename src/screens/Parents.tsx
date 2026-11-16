import { useEffect, useState } from 'react'
import { GAMES } from '../games'
import { AVATARS } from '../data/misc'
import { statsFor, useStore } from '../lib/store'
import { setPreferredVoice, speak, stopSpeech, voicesFor, type VoiceInfo } from '../lib/speech'
import { t, tr, type Lang } from '../lib/i18n'
import { addDays, todayKey } from '../lib/util'

const WD = { de: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'], it: ['Do', 'Lu', 'Ma', 'Me', 'Gi', 'Ve', 'Sa'] }
const LANGS: { id: Lang; label: string }[] = [
  { id: 'de', label: '🇩🇪 Deutsch' },
  { id: 'it', label: '🇮🇹 Italiano' },
]

export function Parents() {
  const s = useStore()
  const [a] = useState(() => 3 + Math.floor(Math.random() * 6))
  const [b] = useState(() => 4 + Math.floor(Math.random() * 6))
  const [input, setInput] = useState('')
  const [name, setName] = useState(s.childName)
  const [confirmReset, setConfirmReset] = useState(false)
  const [voices, setVoices] = useState<VoiceInfo[]>([])
  useEffect(() => {
    if (typeof speechSynthesis === 'undefined') return
    const load = () => setVoices(voicesFor(s.lang))
    load()
    speechSynthesis.addEventListener?.('voiceschanged', load)
    return () => speechSynthesis.removeEventListener?.('voiceschanged', load)
  }, [s.lang])
  const [memberName, setMemberName] = useState('')
  const [memberAvatar, setMemberAvatar] = useState('👩')

  if (!s.parentUnlocked) {
    return (
      <div className="practice">
        <header className="page-head"><h1>👨‍👩‍👦 {t('Elternbereich', 'Area genitori')}</h1></header>
        <div className="gate">
          <p>{t('Nur für Erwachsene. Wie viel ist', 'Solo per adulti. Quanto fa')}</p>
          <div className="gate-q">{a} × {b} = ?</div>
          <input
            className="gate-input"
            inputMode="numeric"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && Number(input) === a * b && s.setParentUnlocked(true)}
            aria-label={t('Ergebnis', 'Risultato')}
          />
          <button className="btn green" onClick={() => Number(input) === a * b && s.setParentUnlocked(true)}>{t('Öffnen', 'Apri')}</button>
        </div>
      </div>
    )
  }

  const overall = GAMES.reduce((acc, g) => {
    const st = statsFor(s.games, g.id)
    return { c: acc.c + st.correct, t: acc.t + st.total, p: acc.p + st.plays }
  }, { c: 0, t: 0, p: 0 })

  const chooseLang = (l: Lang) => {
    if (l === s.lang) return
    stopSpeech()
    s.setLang(l)
  }

  const voice = s.lang === 'de' ? s.voiceDe : s.voiceIt
  const sample = t('Hallo! Ich bin Berli, der Berliner Bär. Mit welchem Laut beginnt Elefant?', "Ciao! Sono Berli, l'orso di Berlino. Quante sillabe ha banana?")

  return (
    <div className="practice">
      <header className="page-head">
        <h1>👨‍👩‍👦 {t('Elternbereich', 'Area genitori')}</h1>
        <button className="btn gray small" onClick={() => s.setParentUnlocked(false)}>🔒 {t('Sperren', 'Blocca')}</button>
      </header>
      <div className="parents">
        <section className="pcard">
          <h3>{t('Einstellungen', 'Impostazioni')}</h3>
          <div className="prow wrap">
            <span>{t('Sprache der App', "Lingua dell'app")}</span>
            <span className="seg small lang-seg" role="radiogroup" aria-label={t('Sprache', 'Lingua')}>
              {LANGS.map((l) => (
                <button key={l.id} role="radio" aria-checked={s.lang === l.id} className={s.lang === l.id ? 'on' : ''} onClick={() => chooseLang(l.id)}>
                  {l.label}
                </button>
              ))}
            </span>
          </div>
          <p className="muted small-print">
            {t(
              'Berli spricht, schreibt und fragt nur in dieser Sprache – auch Buchstaben, Reime und Silben. Der Fortschritt bleibt beim Wechseln erhalten.',
              'Berli parla, scrive e fa domande solo in questa lingua – anche lettere, rime e sillabe. Cambiando lingua i progressi restano.',
            )}
          </p>
          <label className="prow">
            <span>{t('Name des Kindes', 'Nome del bambino')}</span>
            <span className="prow-right">
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('z. B. Leo', 'per es. Leo')} />
              <button className="btn blue small" onClick={() => s.setName(name.trim())}>{t('Speichern', 'Salva')}</button>
            </span>
          </label>
          <label className="prow">
            <span>{t('Sprachausgabe', 'Voce')}</span>
            <input type="checkbox" checked={s.sound} onChange={(e) => s.setSound(e.target.checked)} />
          </label>
          <div className="prow">
            <span>{t('Tagesziel', 'Obiettivo del giorno')}</span>
            <span className="seg small">
              {[10, 20, 30, 50].map((g) => (
                <button key={g} className={s.dailyGoal === g ? 'on' : ''} onClick={() => s.setDailyGoal(g)}>{g} XP</button>
              ))}
            </span>
          </div>
          <div className="prow">
            <span>{t('Lektionen pro Tag', 'Lezioni al giorno')}</span>
            <span className="seg small">
              {[0, 3, 5, 8].map((n) => (
                <button key={n} className={s.dailyCap === n ? 'on' : ''} onClick={() => s.setDailyCap(n)}>{n ? n : t('frei', 'libero')}</button>
              ))}
            </span>
          </div>
          <p className="muted small-print">{t('Ist das Limit erreicht, macht Berli Pause bis morgen. Der Pfad bleibt sichtbar.', 'Raggiunto il limite, Berli fa una pausa fino a domani. Il percorso resta visibile.')}</p>
          <div className="prow wrap">
            <span>{t('Avatar des Kindes', 'Avatar del bambino')}</span>
            <span className="avatar-pick">
              {AVATARS.map((av) => (
                <button key={av} className={s.childAvatar === av ? 'on' : ''} onClick={() => s.setChildAvatar(av)} aria-label={av}>{av}</button>
              ))}
            </span>
          </div>
        </section>

        <section className="pcard">
          <h3>🏅 {t('Familien-Liga', 'Lega di famiglia')}</h3>
          <p className="muted">
            {t(
              'Bis zu drei Erwachsene oder Geschwister sammeln wöchentliche XP mit. Wer spielt, sammelt nur Liga-XP – der Pfad des Kindes bleibt unverändert.',
              'Fino a tre adulti o fratelli raccolgono XP settimanali. Chi gioca raccoglie solo XP della lega – il percorso del bambino non cambia.',
            )}
          </p>
          {s.members.map((m) => (
            <div className="prow" key={m.id}>
              <span>{m.avatar} {m.name} · {m.weekXp} XP</span>
              <span className="prow-right">
                <button className={'btn small ' + (s.activeMember === m.id ? 'green' : 'blue')} onClick={() => s.setActiveMember(s.activeMember === m.id ? '' : m.id)}>
                  {s.activeMember === m.id ? t('✓ spielt', '✓ gioca') : t('Jetzt spielen', 'Gioca ora')}
                </button>
                <button className="btn small gray" onClick={() => s.removeMember(m.id)} aria-label={t(`${m.name} entfernen`, `Rimuovi ${m.name}`)}>✕</button>
              </span>
            </div>
          ))}
          {s.members.length < 3 && (
            <div className="prow wrap">
              <span className="avatar-pick">
                {AVATARS.slice(3).map((av) => (
                  <button key={av} className={memberAvatar === av ? 'on' : ''} onClick={() => setMemberAvatar(av)} aria-label={av}>{av}</button>
                ))}
              </span>
              <span className="prow-right">
                <input className="input" value={memberName} onChange={(e) => setMemberName(e.target.value)} placeholder={t('z. B. Mama', 'per es. Mamma')} />
                <button className="btn blue small" disabled={!memberName.trim()} onClick={() => { s.addMember(memberName.trim(), memberAvatar); setMemberName('') }}>+</button>
              </span>
            </div>
          )}
        </section>

        <section className="pcard">
          <h3>{t('Stimme', 'Voce')}</h3>
          <p className="muted">
            {t(
              'Die Sprachqualität hängt von den Stimmen auf diesem Gerät ab. ★★★ = sehr gut, ★ = einfache Standardstimme. Ohne Auswahl nimmt Berli automatisch die beste.',
              'La qualità dipende dalle voci di questo dispositivo. ★★★ = ottima, ★ = voce standard semplice. Senza scelta Berli usa automaticamente la migliore.',
            )}
          </p>
          <div className="prow">
            <span>{s.lang === 'de' ? '🇩🇪 Deutsch' : '🇮🇹 Italiano'}</span>
            <span className="prow-right">
              <select
                className="input"
                value={voices.some((v) => v.name === voice) ? voice : ''}
                onChange={(e) => { s.setVoice(s.lang, e.target.value); setPreferredVoice(s.lang, e.target.value) }}
              >
                <option value="">{t('Automatisch', 'Automatica')}{voices[0] ? ` (${voices[0].name})` : ''}</option>
                {voices.map((v) => (
                  <option key={v.name} value={v.name}>{v.label}</option>
                ))}
              </select>
              <button className="btn blue small" onClick={() => speak(sample)}>▶ Test</button>
            </span>
          </div>
          {voices.length === 0 && <p className="muted">{t('Keine deutsche Stimme gefunden – siehe Hinweis unten.', 'Nessuna voce italiana trovata – vedi i consigli qui sotto.')}</p>}
          <details className="hint">
            <summary>{t('Bessere Stimmen installieren', 'Installare voci migliori')}</summary>
            {s.lang === 'de' ? (
              <ul className="tips">
                <li><b>iPad / iPhone:</b> Einstellungen → Bedienungshilfen → Gesprochene Inhalte → Stimmen → Deutsch → „Anna (Premium)“ oder „Petra (Premium)“ laden. Danach Safari neu starten.</li>
                <li><b>Mac:</b> Systemeinstellungen → Bedienungshilfen → Gesprochene Inhalte → Systemstimme → „Stimmen verwalten“ → dieselben Premium-Stimmen laden.</li>
                <li><b>Chrome am Mac/PC:</b> online steht „Google Deutsch“ bereit – deutlich besser als die Standardstimmen, wird automatisch bevorzugt.</li>
                <li><b>Android:</b> Einstellungen → System → Sprachen → Text-zu-Sprache → Google-Sprachausgabe → deutsche Stimmen installieren.</li>
              </ul>
            ) : (
              <ul className="tips">
                <li><b>iPad / iPhone:</b> Impostazioni → Accessibilità → Contenuto letto ad alta voce → Voci → Italiano → scarica „Alice (Premium)“ o „Federica (Premium)“. Poi riavvia Safari.</li>
                <li><b>Mac:</b> Impostazioni di Sistema → Accessibilità → Contenuto letto ad alta voce → Voce di sistema → „Gestisci voci“ → scarica le stesse voci Premium.</li>
                <li><b>Chrome su Mac/PC:</b> online c’è „Google italiano“ – molto meglio delle voci standard, viene scelta automaticamente.</li>
                <li><b>Android:</b> Impostazioni → Sistema → Lingue → Sintesi vocale → Servizi di sintesi vocale Google → installa le voci italiane.</li>
              </ul>
            )}
          </details>
        </section>

        <section className="pcard">
          <h3>📊 {t('Diese Woche', 'Questa settimana')}</h3>
          <div className="week-chart" role="img" aria-label={t('XP der letzten 7 Tage', 'XP degli ultimi 7 giorni')}>
            {Array.from({ length: 7 }, (_, i) => {
              const key = addDays(todayKey(), i - 6)
              const v = s.xpByDay[key] ?? 0
              const max = Math.max(s.dailyGoal, ...Object.values(s.xpByDay))
              const [y, mo, d] = key.split('-').map(Number)
              return (
                <div key={key} className="wc-col">
                  <span className="wc-val">{v || ''}</span>
                  <span className={'wc-bar' + (v >= s.dailyGoal ? ' goal' : '')} style={{ height: `${(v / max) * 100}%` }} />
                  <span className="wc-day">{tr(WD)[new Date(y, mo - 1, d).getDay()]}</span>
                </div>
              )
            })}
          </div>
          {(() => {
            const weak = GAMES.map((g) => ({ g, st: statsFor(s.games, g.id) })).filter(({ st }) => st.total >= 4 && st.correct / st.total < 0.6)
            return weak.length ? (
              <p className="small-print">
                <b>{t('Woran üben:', 'Da esercitare:')}</b> {weak.map(({ g, st }) => `${g.emoji} ${t(g.title, g.titleIt)} (${Math.round((st.correct / st.total) * 100)} %)`).join(' · ')}
              </p>
            ) : (
              <p className="muted small-print">{t('Keine Schwachstellen – alle Spiele über 60 % richtig.', 'Nessun punto debole – tutti i giochi sopra il 60 % di risposte giuste.')}</p>
            )
          })()}
          <p className="muted small-print">
            {t(`${s.mistakes.length} Fragen im Fehler-Training · 🧊 Streak-Schutz: ${s.freezes}`, `${s.mistakes.length} domande da ripassare · 🧊 Protezione serie: ${s.freezes}`)}
          </p>
        </section>

        <section className="pcard">
          <h3>{t('Fortschritt', 'Progressi')}</h3>
          <p className="muted">
            {t(
              `${overall.p} Lektionen · ${overall.t ? Math.round((overall.c / overall.t) * 100) : 0}% richtig · ${s.xp} XP · ${Object.values(s.nodes).filter((n) => n.done).length} Pfad-Stationen geschafft · Serie: ${s.streak} Tag(e) · Rekord: ${s.bestStreak}`,
              `${overall.p} lezioni · ${overall.t ? Math.round((overall.c / overall.t) * 100) : 0}% giuste · ${s.xp} XP · ${Object.values(s.nodes).filter((n) => n.done).length} tappe completate · Serie: ${s.streak} giorni · Record: ${s.bestStreak}`,
            )}
          </p>
          <table className="ptable">
            <thead>
              <tr>
                <th>{t('Spiel', 'Gioco')}</th>
                <th>{t('Stufe', 'Livello')}</th>
                <th>{t('Gespielt', 'Partite')}</th>
                <th>{t('Richtig', 'Giuste')}</th>
                <th>{t('Zuletzt', 'Ultima')}</th>
              </tr>
            </thead>
            <tbody>
              {GAMES.map((g) => {
                const st = statsFor(s.games, g.id)
                const acc = st.total ? Math.round((st.correct / st.total) * 100) : null
                return (
                  <tr key={g.id}>
                    <td>{g.emoji} {t(g.title, g.titleIt)}<div className="skill">{t(g.skill, g.skillIt)}</div></td>
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
          <h3>{t('Was die Schule in Berlin erwartet', 'Cosa si aspetta la scuola a Berlino')}</h3>
          {s.lang === 'de' ? (
            <ul className="tips">
              <li><b>Sprache:</b> Reime erkennen, Silben klatschen, Anlaute hören, den eigenen Namen schreiben.</li>
              <li><b>Mathe:</b> Bis 10 (besser 20) zählen, Mengen vergleichen, Formen benennen, einfache Muster.</li>
              <li><b>Motorik:</b> Stift richtig halten, nachspuren, schneiden – hier hilft „Nachspuren“ und echtes Malen auf Papier.</li>
              <li><b>Selbstständigkeit:</b> Schulweg üben, Schulranzen packen, Hand heben, bis 112 wissen.</li>
              <li><b>Mehrsprachig?</b> Die Sprache der App lässt sich oben jederzeit umstellen. Jeden Tag 10 Minuten reichen.</li>
            </ul>
          ) : (
            <ul className="tips">
              <li><b>Lingua:</b> riconoscere le rime, battere le sillabe, sentire la prima lettera, scrivere il proprio nome.</li>
              <li><b>Matematica:</b> contare fino a 10 (meglio 20), confrontare quantità, nominare le forme, sequenze semplici.</li>
              <li><b>Motricità:</b> tenere bene la matita, ripassare, ritagliare – aiutano „Ripassare“ e disegnare su carta.</li>
              <li><b>Autonomia:</b> provare la strada per la scuola, preparare lo zaino, alzare la mano, conoscere il 112.</li>
              <li><b>Bilingue?</b> La scuola a Berlino è in tedesco: la lingua dell'app si cambia qui sopra in ogni momento. Bastano 10 minuti al giorno.</li>
            </ul>
          )}
        </section>

        <section className="pcard danger">
          <h3>{t('Zurücksetzen', 'Azzera')}</h3>
          {!confirmReset ? (
            <button className="btn gray" onClick={() => setConfirmReset(true)}>{t('Fortschritt löschen', 'Cancella i progressi')}</button>
          ) : (
            <div className="prow">
              <span>{t('Wirklich alles löschen?', 'Cancellare davvero tutto?')}</span>
              <span className="prow-right">
                <button className="btn small red" onClick={() => { s.reset(); setConfirmReset(false) }}>{t('Ja, löschen', 'Sì, cancella')}</button>
                <button className="btn small gray" onClick={() => setConfirmReset(false)}>{t('Abbrechen', 'Annulla')}</button>
              </span>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
