import { useEffect, useMemo, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import type { GameProps } from '../components/ChoiceGame'
import { Mascot } from '../components/Mascot'
import { LessonShell } from '../components/LessonShell'
import { praise, speak, speakBoth } from '../lib/speech'
import { pickN, shuffle } from '../lib/util'

const L1 = 'AOMILET'.split('')
const L2 = 'BCDFGHKNPRSUWZ12345'.split('')
const L3 = 'abdeghmnrstuw67890'.split('')

function sayFor(ch: string) {
  if (/\d/.test(ch)) return { de: `Fahre die Zahl ${ch} nach.`, it: `Ripassa il numero ${ch}.` }
  if (ch === ch.toLowerCase()) return { de: `Fahre das kleine ${ch.toUpperCase()} nach.`, it: `Ripassa la ${ch} piccola.` }
  return { de: `Fahre das große ${ch} nach.`, it: `Ripassa la ${ch} grande.` }
}

export default function Nachspuren({ level, bilingual, childName, onFinish, onClose }: GameProps) {
  const targets = useMemo(() => {
    const name = Array.from(new Set(childName.toUpperCase().replace(/[^A-ZÄÖÜ]/g, '').split('')))
    if (level === 1) return shuffle([...name.slice(0, 3), ...pickN(L1, 5 - Math.min(3, name.length))])
    if (level === 2) return pickN(L2, 5)
    return pickN(L3, 5)
  }, [level]) // eslint-disable-line react-hooks/exhaustive-deps

  const [idx, setIdx] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [hearts, setHearts] = useState(3)
  const [good, setGood] = useState(0)
  const [msg, setMsg] = useState<string | null>(null)
  const [solved, setSolved] = useState(false)
  const guideRef = useRef<HTMLCanvasElement>(null)
  const drawRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const ch = targets[idx]
  const size = Math.min(window.innerWidth - 32, 340)

  const drawGuide = () => {
    const c = guideRef.current!
    const ctx = c.getContext('2d')!
    ctx.clearRect(0, 0, size, size)
    ctx.fillStyle = '#d9d9d9'
    ctx.font = `700 ${size * 0.78}px Fredoka, Arial Rounded MT Bold, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(ch, size / 2, size / 2 + size * 0.04)
    // start dot
    ctx.fillStyle = '#2a9d4b'
  }

  useEffect(() => {
    drawGuide()
    const d = drawRef.current!.getContext('2d')!
    d.clearRect(0, 0, size, size)
    setMsg(null)
    setSolved(false)
    setAttempts(0)
    const s = sayFor(ch)
    const t = setTimeout(() => speakBoth(s.de, s.it, bilingual), 300)
    // Fonts may load late → redraw
    document.fonts?.ready.then(drawGuide)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx])

  const pos = (e: React.PointerEvent) => {
    const r = drawRef.current!.getBoundingClientRect()
    return { x: ((e.clientX - r.left) / r.width) * size, y: ((e.clientY - r.top) / r.height) * size }
  }
  const onDown = (e: React.PointerEvent) => {
    if (solved) return
    drawing.current = true
    const ctx = drawRef.current!.getContext('2d')!
    const p = pos(e)
    ctx.lineWidth = size * 0.11
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#1d6fd1'
    ctx.beginPath()
    ctx.moveTo(p.x, p.y)
    ctx.lineTo(p.x + 0.1, p.y + 0.1)
    ctx.stroke()
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
  }
  const onMove = (e: React.PointerEvent) => {
    if (!drawing.current) return
    const ctx = drawRef.current!.getContext('2d')!
    const p = pos(e)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
  }
  const onUp = () => {
    drawing.current = false
  }

  const clear = () => {
    drawRef.current!.getContext('2d')!.clearRect(0, 0, size, size)
  }

  const evaluate = async () => {
    if (solved) return
    const g = guideRef.current!.getContext('2d')!.getImageData(0, 0, size, size).data
    const d = drawRef.current!.getContext('2d')!.getImageData(0, 0, size, size).data
    let mask = 0, hit = 0, drawn = 0, outside = 0
    for (let i = 3; i < g.length; i += 4) {
      const m = g[i] > 0
      const dr = d[i] > 0
      if (m) mask++
      if (dr) drawn++
      if (m && dr) hit++
      if (dr && !m) outside++
    }
    const coverage = mask ? hit / mask : 0
    const outsideRatio = drawn ? outside / drawn : 1
    const ok = coverage >= 0.55 && outsideRatio < 0.75
    if (ok) {
      setSolved(true)
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } })
      const p = praise(bilingual)
      setMsg(p.de)
      await p.say()
      const firstTry = attempts === 0
      const newGood = good + (firstTry ? 1 : 0)
      setGood(newGood)
      if (idx + 1 >= targets.length) onFinish(newGood, targets.length, hearts)
      else setIdx(idx + 1)
    } else {
      setAttempts((a) => a + 1)
      if (attempts === 0) setHearts((h) => Math.max(0, h - 1))
      const m = drawn === 0 ? 'Male mit dem Finger über den grauen Buchstaben!' : coverage < 0.55 ? 'Fahre den ganzen Buchstaben nach!' : 'Bleib auf dem grauen Buchstaben!'
      setMsg(m)
      speak(m, 'de')
    }
  }
  const skip = () => {
    if (idx + 1 >= targets.length) onFinish(good, targets.length, hearts)
    else setIdx(idx + 1)
  }

  const footer = (
    <div className="trace-actions">
      <button className="btn white" onClick={clear}>🧽 Löschen</button>
      {attempts >= 2 && <button className="btn white" onClick={skip}>⏭️ Weiter</button>}
      <button className="btn green" onClick={evaluate}>Fertig</button>
    </div>
  )

  return (
    <LessonShell progress={idx / targets.length} hearts={hearts} onClose={onClose} footer={footer}>
      <div className="q">
      <div className="q-head">
        <Mascot mood={solved ? 'happy' : 'normal'} size={56} />
        <button className="bubble" onClick={() => { const s = sayFor(ch); speakBoth(s.de, s.it, bilingual) }}>
          <div className="bubble-de">{msg ?? sayFor(ch).de}</div>
          {bilingual && !msg && <div className="bubble-it">{sayFor(ch).it}</div>}
          <span className="bubble-speaker">🔊</span>
        </button>
      </div>
      <div className="trace-wrap" style={{ width: size, height: size }}>
        <canvas ref={guideRef} width={size} height={size} className="trace-guide" />
        <canvas
          ref={drawRef}
          width={size}
          height={size}
          className="trace-draw"
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onPointerLeave={onUp}
        />
      </div>
      </div>
    </LessonShell>
  )
}
