import { useEffect, useState } from 'react'
import { Path } from './screens/Path'
import { Practice } from './screens/Practice'
import { GameScreen, type Launch } from './screens/GameScreen'
import { Me } from './screens/Me'
import { Shop } from './screens/Shop'
import { Parents } from './screens/Parents'
import { Welcome } from './screens/Welcome'
import { useStore } from './lib/store'
import { setPreferredVoice, setSpeechEnabled, speak } from './lib/speech'
import { setSfxEnabled, unlockSfx } from './lib/sfx'
import { onUpdateReady } from './pwa'
import { setLang, t } from './lib/i18n'

type Tab = 'path' | 'practice' | 'me' | 'shop' | 'parents'

// label/say are [German, Italian]
const TABS: { id: Tab; emoji: string; label: [string, string]; say: [string, string] }[] = [
  { id: 'path', emoji: '🏠', label: ['Lernen', 'Impara'], say: ['Lernen', 'Impara'] },
  { id: 'practice', emoji: '💪', label: ['Üben', 'Esercizi'], say: ['Üben', 'Esercizi'] },
  { id: 'me', emoji: '🏆', label: ['Ich', 'Io'], say: ['Meine Sticker und Medaillen', 'I miei adesivi e le mie medaglie'] },
  { id: 'shop', emoji: '🛍️', label: ['Laden', 'Negozio'], say: ['Laden', 'Negozio'] },
  { id: 'parents', emoji: '👨‍👩‍👦', label: ['Eltern', 'Genitori'], say: ['Für Mama und Papa', 'Per mamma e papà'] },
]

export default function App() {
  const { childName, sound, voiceDe, voiceIt, setParentUnlocked, rollDay, lang } = useStore()
  // set before any child renders, so every t() below follows a switch at once
  setLang(lang)
  const [lesson, setLesson] = useState<{ launch: Launch; key: number } | null>(null)
  const [tab, setTab] = useState<Tab>('path')
  const [update, setUpdate] = useState<null | (() => void)>(null)

  // parent area is locked whenever the app starts – not when settings change
  useEffect(() => {
    setParentUnlocked(false)
    rollDay()
    onUpdateReady((apply) => setUpdate(() => apply))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setSpeechEnabled(sound)
    setSfxEnabled(sound)
  }, [sound])

  useEffect(() => {
    setPreferredVoice('de', voiceDe)
    setPreferredVoice('it', voiceIt)
  }, [voiceDe, voiceIt])

  // Warm up speech + audio on first interaction (iOS requires a user gesture)
  useEffect(() => {
    const warm = () => {
      try {
        speechSynthesis.speak(new SpeechSynthesisUtterance(''))
      } catch {
        /* ignore */
      }
      unlockSfx()
      window.removeEventListener('pointerdown', warm)
    }
    window.addEventListener('pointerdown', warm)
    return () => window.removeEventListener('pointerdown', warm)
  }, [])

  if (!childName) return <Welcome onDone={() => setTab('path')} />
  if (lesson) return <GameScreen key={lesson.key} launch={lesson.launch} onHome={() => setLesson(null)} />

  const start = (launch: Launch) => setLesson({ launch, key: Date.now() })
  const switchTab = (next: Tab) => {
    if (next !== tab) speak(t(...TABS.find((x) => x.id === next)!.say))
    setTab(next)
    if (next !== 'path') window.scrollTo(0, 0)
  }

  return (
    <div className="app">
      <div className="tab-content">
        {tab === 'path' && <Path onLesson={start} />}
        {tab === 'practice' && <Practice onLesson={start} />}
        {tab === 'me' && <Me />}
        {tab === 'shop' && <Shop />}
        {tab === 'parents' && <Parents />}
      </div>
      {update && (
        <button className="update-toast" onClick={update}>
          ✨ {t('Neue Version – tippen zum Aktualisieren', 'Nuova versione – tocca per aggiornare')}
        </button>
      )}
      <nav className="tabbar">
        <div className="tabbar-inner">
          {TABS.map((x) => (
            <button key={x.id} className={'tab' + (tab === x.id ? ' on' : '')} onClick={() => switchTab(x.id)} aria-label={t(...x.label)}>
              <span className="tab-emoji">{x.emoji}</span>
              <span className="tab-label">{t(...x.label)}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
