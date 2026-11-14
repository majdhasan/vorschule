import { useEffect } from 'react'
import confetti from 'canvas-confetti'
import { speakBoth } from '../lib/speech'
import { STICKERS } from '../data/misc'
import { Mascot } from './Mascot'

type Props = {
  stars: number
  correct: number
  total: number
  bilingual: boolean
  newSticker: boolean
  levelUp: boolean
  stickerIndex: number
  onAgain: () => void
  onHome: () => void
}

export function EndScreen({ stars, correct, total, bilingual, newSticker, levelUp, stickerIndex, onAgain, onHome }: Props) {
  const sticker = STICKERS[(stickerIndex - 1 + STICKERS.length) % STICKERS.length]
  useEffect(() => {
    if (stars >= 2) confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } })
    const de =
      stars === 3 ? 'Fantastisch! Alles richtig!' : stars === 2 ? 'Sehr gut gemacht!' : stars === 1 ? 'Gut gemacht! Weiter so!' : 'Das üben wir noch einmal!'
    const it = stars === 3 ? 'Fantastico! Tutto giusto!' : stars === 2 ? 'Molto bene!' : stars === 1 ? 'Bravo! Continua così!' : 'Riproviamo!'
    const extra = newSticker ? ` Du hast einen neuen Sticker: ${sticker.de}!` : levelUp ? ' Du bist jetzt eine Stufe höher!' : ''
    speakBoth(de + extra, it, bilingual)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="end">
      <Mascot mood={stars >= 2 ? 'happy' : 'normal'} size={96} />
      <div className="end-stars">
        {[1, 2, 3].map((i) => (
          <span key={i} className={'big-star' + (i <= stars ? ' on' : '')} style={{ animationDelay: `${i * 0.2}s` }}>
            ⭐
          </span>
        ))}
      </div>
      <div className="end-score">
        {correct} / {total}
      </div>
      {levelUp && <div className="badge level">⬆️ Neue Stufe!</div>}
      {newSticker && (
        <div className="badge sticker">
          <span className="sticker-big">{sticker.emoji}</span>
          <span>
            Neuer Sticker: <b>{sticker.de}</b>
            {bilingual && <i> · {sticker.it}</i>}
          </span>
        </div>
      )}
      <div className="end-actions">
        <button className="btn big" onClick={onAgain}>
          🔁 Nochmal
        </button>
        <button className="btn big secondary" onClick={onHome}>
          🏠 Zurück
        </button>
      </div>
    </div>
  )
}
