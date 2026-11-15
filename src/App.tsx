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

type Tab = 'path' | 'practice' | 'me' | 'shop' | 'parents'

const TABS: { id: Tab; emoji: string; label: string; say: string }[] = [
  { id: 'path', emoji: '🏠', label: 'Lernen', say: 'Lernen' },
  { id: 'practice', emoji: '💪', label: 'Üben', say: 'Üben' },
  { id: 'me', emoji: '🏆', label: 'Ich', say: 'Meine Sticker und Medaillen' },
  { id: 'shop', emoji: '🛍️', label: 'Laden', say: 'Laden' },
  { id: 'parents', emoji: '👨‍👩‍👦', label: 'Eltern', say: 'Für Mama und Papa' },
]

export default function App() {
  const { childName, sound, voiceDe, voiceIt, setParentUnlocked, rollDay } = useStore()
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
  const switchTab = (t: Tab) => {
    if (t !== tab) speak(TABS.find((x) => x.id === t)!.say, 'de')
    setTab(t)
    if (t !== 'path') window.scrollTo(0, 0)
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
          ✨ Neue Version – tippen zum Aktualisieren
        </button>
      )}
      <nav className="tabbar">
        <div className="tabbar-inner">
          {TABS.map((t) => (
            <button key={t.id} className={'tab' + (tab === t.id ? ' on' : '')} onClick={() => switchTab(t.id)} aria-label={t.label}>
              <span className="tab-emoji">{t.emoji}</span>
              <span className="tab-label">{t.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
