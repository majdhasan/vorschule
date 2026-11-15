import { useState } from 'react'
import { Mascot } from '../components/Mascot'
import { useStore } from '../lib/store'
import { speak, speakBoth } from '../lib/speech'

export function Welcome({ onDone }: { onDone: () => void }) {
  const { setName, bilingual } = useStore()
  const [name, setLocal] = useState('')
  const ok = name.trim().length > 0
  const go = () => {
    if (!ok) return void speak('Wie heißt du? Mama oder Papa können deinen Namen eintippen.', 'de')
    speakBoth(`Hallo ${name.trim()}! Ich bin Berli, der Berliner Bär. Lass uns spielen!`, `Ciao ${name.trim()}! Sono Berli, l'orso di Berlino. Giochiamo!`, bilingual)
    setName(name.trim())
    onDone()
  }
  return (
    <div className="welcome">
      <Mascot mood="wave" size={140} />
      <h1>Hallo! Ich bin Berli.</h1>
      <p>Ich bin der Berliner Bär und helfe dir, fit für die Schule zu werden.</p>
      <p className="it">Ciao! Sono Berli, l'orso di Berlino.</p>
      <label className="welcome-label" htmlFor="name">Wie heißt du?</label>
      <input id="name" className="input big-input" value={name} onChange={(e) => setLocal(e.target.value)} placeholder="Dein Name" onKeyDown={(e) => e.key === 'Enter' && go()} />
      <button className={'btn green big welcome-go' + (ok ? ' pulse' : '')} onClick={go} aria-disabled={!ok}>
        Los geht's!
      </button>
    </div>
  )
}
