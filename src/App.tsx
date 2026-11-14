import { useEffect, useState } from 'react'
import { Home } from './screens/Home'
import { GameScreen } from './screens/GameScreen'
import { Stickers } from './screens/Stickers'
import { Parents } from './screens/Parents'
import { Welcome } from './screens/Welcome'
import { useStore } from './lib/store'
import { setPreferredVoice, setSpeechEnabled } from './lib/speech'

type Screen = { name: 'home' } | { name: 'game'; id: string } | { name: 'stickers' } | { name: 'parents' } | { name: 'welcome' }

export default function App() {
  const { childName, sound, voiceDe, voiceIt, setParentUnlocked } = useStore()
  const [screen, setScreen] = useState<Screen>(() => (childName ? { name: 'home' } : { name: 'welcome' }))

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
        const u = new SpeechSynthesisUtterance('')
        speechSynthesis.speak(u)
      } catch { /* ignore */ }
      window.removeEventListener('pointerdown', warm)
    }
    window.addEventListener('pointerdown', warm)
    return () => window.removeEventListener('pointerdown', warm)
  }, [])

  const home = () => setScreen({ name: 'home' })
  switch (screen.name) {
    case 'welcome':
      return <Welcome onDone={home} />
    case 'game':
      return <GameScreen key={screen.id} id={screen.id} onHome={home} />
    case 'stickers':
      return <Stickers onHome={home} />
    case 'parents':
      return <Parents onHome={home} />
    default:
      return <Home onPlay={(id) => setScreen({ name: 'game', id })} onStickers={() => setScreen({ name: 'stickers' })} onParents={() => setScreen({ name: 'parents' })} />
  }
}
