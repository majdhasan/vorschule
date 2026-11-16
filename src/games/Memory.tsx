import { useEffect, useMemo, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import type { GameProps } from '../components/ChoiceGame'
import { Mascot } from '../components/Mascot'
import { LessonShell } from '../components/LessonShell'
import { speak } from '../lib/speech'
import { t } from '../lib/i18n'
import { wordOf } from './types'
import { sfx } from '../lib/sfx'
import { WORDS } from '../data/words'
import { pickN, shuffle } from '../lib/util'

type Card = { id: number; word: (typeof WORDS)[number]; flipped: boolean; matched: boolean }

export default function Memory({ level, onFinish, onClose }: GameProps) {
  const pairs = level === 1 ? 4 : level === 2 ? 6 : 8
  const cards0 = useMemo<Card[]>(() => {
    const ws = pickN(WORDS, pairs)
    return shuffle(ws.flatMap((w) => [w, w])).map((w, i) => ({ id: i, word: w, flipped: false, matched: false }))
  }, [pairs])
  const [cards, setCards] = useState(cards0)
  const [open, setOpen] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [lock, setLock] = useState(false)
  const [done, setDone] = useState(false)
  const timers = useRef<number[]>([])

  useEffect(() => {
    const tm = window.setTimeout(() => speak(t('Finde die Paare! Welche zwei Bilder sind gleich?', 'Trova le coppie! Quali due immagini sono uguali?')), 300)
    timers.current.push(tm)
    const list = timers.current
    return () => list.forEach(clearTimeout)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms))

  const flip = (i: number) => {
    if (lock || done || cards[i].flipped || cards[i].matched || open.length === 2) return
    sfx.tap()
    const next = cards.map((c, k) => (k === i ? { ...c, flipped: true } : c))
    setCards(next)
    const w = cards[i].word
    speak(wordOf(w))
    const o = [...open, i]
    setOpen(o)
    if (o.length < 2) return
    const totalMoves = moves + 1
    setMoves(totalMoves)
    const [a, b] = o
    if (next[a].word.de === next[b].word.de) {
      const matched = next.map((c, k) => (k === a || k === b ? { ...c, matched: true } : c))
      setCards(matched)
      setOpen([])
      sfx.correct()
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 }, disableForReducedMotion: true })
      if (matched.every((c) => c.matched)) {
        setDone(true)
        // generous: up to 2.5 moves per pair still counts as perfect
        const ratio = Math.min(1, (pairs * 2.5) / totalMoves)
        speak(t('Alle Paare gefunden! Super!', 'Hai trovato tutte le coppie! Bravo!'))
        later(() => onFinish({ correct: Math.round(ratio * 10), total: 10, hearts: 3, maxCombo: 0, missed: [], fixed: [] }), 1500)
      }
    } else {
      setLock(true)
      later(() => {
        setCards((cs) => cs.map((c, k) => (k === a || k === b ? { ...c, flipped: false } : c)))
        setOpen([])
        setLock(false)
      }, 1600)
    }
  }

  const matchedPairs = cards.filter((c) => c.matched).length / 2
  return (
    <LessonShell progress={matchedPairs / pairs} onClose={onClose}>
      <div className="q">
        <div className="q-head">
          <Mascot mood={done ? 'cheer' : 'normal'} size={56} />
          <button className="bubble" onClick={() => speak(t('Finde die Paare!', 'Trova le coppie!'))}>
            <div className="bubble-de">{t('Finde die Paare!', 'Trova le coppie!')}</div>
            <span className="bubble-speaker">🔊</span>
          </button>
        </div>
        <div className="memory" style={{ gridTemplateColumns: `repeat(4, 1fr)` }}>
          {cards.map((c, i) => (
            <button
              key={c.id}
              className={'card' + (c.flipped || c.matched ? ' open' : '') + (c.matched ? ' matched' : '')}
              onClick={() => flip(i)}
              aria-label={c.flipped || c.matched ? wordOf(c.word) : t('Karte', 'Carta')}
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
