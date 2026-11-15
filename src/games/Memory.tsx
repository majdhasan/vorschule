import { useEffect, useMemo, useState } from 'react'
import confetti from 'canvas-confetti'
import type { GameProps } from '../components/ChoiceGame'
import { Mascot } from '../components/Mascot'
import { LessonShell } from '../components/LessonShell'
import { speak, speakBoth } from '../lib/speech'
import { WORDS } from '../data/words'
import { pickN, shuffle } from '../lib/util'

type Card = { id: number; word: (typeof WORDS)[number]; flipped: boolean; matched: boolean }

export default function Memory({ level, bilingual, onFinish, onClose }: GameProps) {
  const pairs = level === 1 ? 4 : level === 2 ? 6 : 8
  const cards0 = useMemo<Card[]>(() => {
    const ws = pickN(WORDS, pairs)
    return shuffle(ws.flatMap((w) => [w, w])).map((w, i) => ({ id: i, word: w, flipped: false, matched: false }))
  }, [pairs])
  const [cards, setCards] = useState(cards0)
  const [open, setOpen] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [lock, setLock] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => speakBoth('Finde die Paare! Welche zwei Bilder sind gleich?', 'Trova le coppie!', bilingual), 300)
    return () => clearTimeout(t)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const flip = (i: number) => {
    if (lock || cards[i].flipped || cards[i].matched || open.length === 2) return
    const next = cards.map((c, k) => (k === i ? { ...c, flipped: true } : c))
    setCards(next)
    const w = cards[i].word
    speakBoth(w.de, w.it, bilingual)
    const o = [...open, i]
    setOpen(o)
    if (o.length === 2) {
      setMoves((m) => m + 1)
      const [a, b] = o
      if (next[a].word.de === next[b].word.de) {
        const matched = next.map((c, k) => (k === a || k === b ? { ...c, matched: true } : c))
        setCards(matched)
        setOpen([])
        confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } })
        if (matched.every((c) => c.matched)) {
          const totalMoves = moves + 1
          const ratio = Math.min(1, (pairs * 1.6) / totalMoves)
          const hearts = totalMoves <= pairs * 1.6 ? 3 : totalMoves <= pairs * 2.2 ? 2 : 1
          speak('Alle Paare gefunden! Super!', 'de')
          setTimeout(() => onFinish(Math.round(ratio * 10), 10, hearts), 1500)
        }
      } else {
        setLock(true)
        setTimeout(() => {
          setCards((cs) => cs.map((c, k) => (k === a || k === b ? { ...c, flipped: false } : c)))
          setOpen([])
          setLock(false)
        }, 1100)
      }
    }
  }

  const cols = 4
  const matchedPairs = cards.filter((c) => c.matched).length / 2
  const heartsNow = moves <= pairs * 1.6 ? 3 : moves <= pairs * 2.2 ? 2 : 1
  return (
    <LessonShell progress={matchedPairs / pairs} hearts={heartsNow} onClose={onClose}>
      <div className="q">
      <div className="q-head">
        <Mascot size={56} />
        <div className="bubble static">
          <div className="bubble-de">Finde die Paare!</div>
          {bilingual && <div className="bubble-it">Trova le coppie!</div>}
          <div className="bubble-meta">Züge: {moves}</div>
        </div>
      </div>
      <div className="memory" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {cards.map((c, i) => (
          <button
            key={c.id}
            className={'card' + (c.flipped || c.matched ? ' open' : '') + (c.matched ? ' matched' : '')}
            onClick={() => flip(i)}
            aria-label={c.flipped ? c.word.de : 'Karte'}
          >
            <span className="card-front">❓</span>
            <span className="card-back">{c.word.emoji}</span>
          </button>
        ))}
      </div>
      </div>
    </LessonShell>
  )
}
