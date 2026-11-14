import { useState } from 'react'
import { Mascot } from '../components/Mascot'
import { useStore } from '../lib/store'
import { speakBoth } from '../lib/speech'

export function Welcome({ onDone }: { onDone: () => void }) {
  const { setName, bilingual } = useStore()
  const [name, setLocal] = useState('')
  const go = () => {
    setName(name.trim())
    speakBoth(`Hallo ${name.trim() || ''}! Ich bin Berli, der Berliner Bär. Lass uns spielen!`, `Ciao ${name.trim() || ''}! Sono Berli, l'orso di Berlino. Giochiamo!`, bilingual)
    onDone()
  }
  return (
    <div className="welcome">
      <Mascot mood="wave" size={120} />
      <h1>Hallo! Ich bin Berli.</h1>
      <p>Ich bin der Berliner Bär und helfe dir, fit für die Schule zu werden.</p>
      <p className="it">Ciao! Sono Berli, l'orso di Berlino.</p>
      <label className="welcome-label">Wie heißt du?</label>
      <input className="input big-input" value={name} onChange={(e) => setLocal(e.target.value)} placeholder="Dein Name" autoFocus onKeyDown={(e) => e.key === 'Enter' && go()} />
      <button className="btn big" onClick={go}>🚀 Los geht's!</button>
    </div>
  )
}
