import { useEffect, useState } from 'react'
import { Path } from './screens/Path'
import { Practice } from './screens/Practice'
import { GameScreen } from './screens/GameScreen'
import { Stickers } from './screens/Stickers'
import { Parents } from './screens/Parents'
import { Welcome } from './screens/Welcome'
import { useStore } from './lib/store'
import { setPreferredVoice, setSpeechEnabled } from './lib/speech'

type Tab = 'path' | 'practice' | 'stickers' | 'parents'
type Screen = { name: 'tabs' } | { name: 'lesson'; nodeId?: string; gameId: string; level: number } | { name: 'welcome' }

const TABS: { id: Tab; emoji: string; label: string }[] = [
  { id: 'path', emoji: '🏠', label: 'Lernen' },
  { id: 'practice', emoji: '💪', label: 'Üben' },
  { id: 'stickers', emoji: '🏆', label: 'Sticker' },
  { id: 'parents', emoji: '👨‍👩‍👦', label: 'Eltern' },
]

export default function App() {
  const { childName, sound, voiceDe, voiceIt, setParentUnlocked } = useStore()
  const [screen, setScreen] = useState<Screen>(() => (childName ? { name: 'tabs' } : { name: 'welcome' }))
  const [tab, setTab] = useState<Tab>('path')
  const [lessonKey, setLessonKey] = useState(0)

  useEffect(() => {
    setSpeechEnabled(sound)
    setParentUnlocked(false)
  }, [sound, setParentUnlocked])

  useEffect(() => {
    setPreferredVoice('de', voiceDe)
    setPreferredVoice('it', voiceIt)
  }, [voiceDe, voiceIt])

  // Warm up speech synthesis on first interaction (iOS requires a user gesture)
  useEffect(() => {
    const warm = () => {
      try {
        speechSynthesis.speak(new SpeechSynthesisUtterance(''))
      } catch { /* ignore */ }
      window.removeEventListener('pointerdown', warm)
    }
    window.addEventListener('pointerdown', warm)
    return () => window.removeEventListener('pointerdown', warm)
  }, [])

  const startLesson = (gameId: string, level: number, nodeId?: string) => {
    setLessonKey((k) => k + 1)
    setScreen({ name: 'lesson', gameId, level, nodeId })
  }
  const home = () => {
    setScreen({ name: 'tabs' })
    window.scrollTo(0, 0)
  }

  if (screen.name === 'welcome') return <Welcome onDone={home} />
  if (screen.name === 'lesson') return <GameScreen key={lessonKey} nodeId={screen.nodeId} gameId={screen.gameId} level={screen.level} onHome={home} />

  return (
    <div className="app">
      <div className="tab-content">
        {tab === 'path' && <Path onLesson={(nodeId, gameId, level) => startLesson(gameId, level, nodeId)} />}
        {tab === 'practice' && <Practice onLesson={(gameId, level) => startLesson(gameId, level)} />}
        {tab === 'stickers' && <Stickers />}
        {tab === 'parents' && <Parents />}
      </div>
      <nav className="tabbar">
        {TABS.map((t) => (
          <button key={t.id} className={'tab' + (tab === t.id ? ' on' : '')} onClick={() => { setTab(t.id); window.scrollTo(0, 0) }} aria-label={t.label}>
            <span className="tab-emoji">{t.emoji}</span>
            <span className="tab-label">{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
