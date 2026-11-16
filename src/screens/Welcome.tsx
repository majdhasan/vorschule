import { useState } from 'react'
import { Mascot } from '../components/Mascot'
import { useStore } from '../lib/store'
import { speak, stopSpeech } from '../lib/speech'
import { t, type Lang } from '../lib/i18n'

const LANGS: { id: Lang; flag: string; label: string }[] = [
  { id: 'de', flag: '🇩🇪', label: 'Deutsch' },
  { id: 'it', flag: '🇮🇹', label: 'Italiano' },
]

/** First run: a grown-up picks the app language, then types the child's name. */
export function Welcome({ onDone }: { onDone: () => void }) {
  const { setName, lang, setLang } = useStore()
  const [name, setLocal] = useState('')
  const ok = name.trim().length > 0
  const pickLang = (l: Lang) => {
    stopSpeech()
    setLang(l)
  }
  const go = () => {
    if (!ok) return void speak(t('Wie heißt du? Mama oder Papa können deinen Namen eintippen.', 'Come ti chiami? Mamma o papà possono scrivere il tuo nome.'))
    speak(t(`Hallo ${name.trim()}! Ich bin Berli, der Berliner Bär. Lass uns spielen!`, `Ciao ${name.trim()}! Sono Berli, l'orso di Berlino. Giochiamo!`))
    setName(name.trim())
    onDone()
  }
  return (
    <div className="welcome">
      <div className="lang-pick" role="radiogroup" aria-label="Sprache · Lingua">
        {LANGS.map((l) => (
          <button key={l.id} role="radio" aria-checked={lang === l.id} className={'lang-btn' + (lang === l.id ? ' on' : '')} onClick={() => pickLang(l.id)}>
            <span className="lang-flag">{l.flag}</span>
            {l.label}
          </button>
        ))}
      </div>
      <Mascot mood="wave" size={140} />
      <h1>{t('Hallo! Ich bin Berli.', 'Ciao! Sono Berli.')}</h1>
      <p>{t('Ich bin der Berliner Bär und helfe dir, fit für die Schule zu werden.', "Sono l'orso di Berlino e ti aiuto a prepararti per la scuola.")}</p>
      <label className="welcome-label" htmlFor="name">{t('Wie heißt du?', 'Come ti chiami?')}</label>
      <input id="name" className="input big-input" value={name} onChange={(e) => setLocal(e.target.value)} placeholder={t('Dein Name', 'Il tuo nome')} onKeyDown={(e) => e.key === 'Enter' && go()} />
      <button className={'btn green big welcome-go' + (ok ? ' pulse' : '')} onClick={go} aria-disabled={!ok}>
        {t("Los geht's!", 'Si parte!')}
      </button>
    </div>
  )
}
