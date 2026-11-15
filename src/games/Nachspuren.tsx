import { useEffect, useMemo, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import type { GameProps } from '../components/ChoiceGame'
import { Mascot } from '../components/Mascot'
import { LessonShell } from '../components/LessonShell'
import { praise, speak, speakBoth } from '../lib/speech'
import { sfx } from '../lib/sfx'
import { pickN, shuffle } from '../lib/util'

const L1 = 'AOMILET'.split('')
const L2 = 'BCDFGHKNPRSUWZ12345'.split('')
const L3 = 'abdeghmnrstuw67890'.split('')

// Where writing starts (fraction of the glyph box) and the first direction.
const DOWN: [number, number] = [0, 1]
const LEFT: [number, number] = [-1, 0.35]
const RIGHT: [number, number] = [1, 0]
const START: Record<string, { at: [number, number]; dir: [number, number] }> = {
  A: { at: [0.5, 0], dir: [-0.45, 1] }, Ä: { at: [0.5, 0.25], dir: [-0.45, 1] }, C: { at: [0.9, 0.15], dir: LEFT }, G: { at: [0.9, 0.15], dir: LEFT },
  I: { at: [0.5, 0], dir: DOWN }, J: { at: [1, 0], dir: DOWN }, O: { at: [0.5, 0], dir: LEFT }, Ö: { at: [0.5, 0.25], dir: LEFT }, Q: { at: [0.5, 0], dir: LEFT },
  S: { at: [0.85, 0.12], dir: LEFT }, T: { at: [0, 0], dir: RIGHT }, Z: { at: [0, 0], dir: RIGHT }, '0': { at: [0.5, 0], dir: LEFT },
  '1': { at: [0.35, 0.18], dir: [1, -1] }, '2': { at: [0.1, 0.25], dir: [0.6, -1] }, '3': { at: [0.1, 0.15], dir: [1, -0.4] }, '4': { at: [0.6, 0], dir: [-0.5, 1] },
  '5': { at: [0.2, 0], dir: DOWN }, '6': { at: [0.8, 0.05], dir: LEFT }, '7': { at: [0, 0], dir: RIGHT }, '8': { at: [0.85, 0.15], dir: LEFT }, '9': { at: [0.85, 0.25], dir: LEFT },
  a: { at: [0.9, 0.3], dir: LEFT }, d: { at: [0.65, 0.45], dir: LEFT }, e: { at: [0.1, 0.55], dir: RIGHT }, g: { at: [0.85, 0.1], dir: LEFT },
  s: { at: [0.85, 0.15], dir: LEFT }, t: { at: [0.4, 0], dir: DOWN },
}

function sayFor(ch: string) {
  if (/\d/.test(ch)) return { de: `Fahre die Zahl ${ch} nach.`, it: `Ripassa il numero ${ch}.` }
  if (ch === ch.toLowerCase()) return { de: `Fahre das kleine ${ch.toUpperCase()} nach.`, it: `Ripassa la ${ch} piccola.` }
  return { de: `Fahre das große ${ch} nach.`, it: `Ripassa la ${ch} grande.` }
}

export default function Nachspuren({ level, bilingual, childName, onFinish, onClose }: GameProps) {
  const targets = useMemo(() => {
    const name = Array.from(new Set(childName.toUpperCase().replace(/[^A-ZÄÖÜ]/g, '').split(''))).slice(0, 3)
    if (level === 1) return shuffle([...name, ...pickN(L1, 5 - name.length, (x) => name.includes(x))])
    if (level === 2) return pickN(L2, 5)
    return pickN(L3, 5)
  }, [level]) // eslint-disable-line react-hooks/exhaustive-deps

  const [idx, setIdx] = useState(0)
  const [failed, setFailed] = useState(0)
  const [good, setGood] = useState(0)
  const [msg, setMsg] = useState<string | null>(null)
  const [solved, setSolved] = useState(false)
  // fixed once: rotating the device must not wipe the canvas
  const [size] = useState(() => Math.round(Math.min(window.innerWidth - 32, window.innerHeight * 0.5, 460)))
  const guideRef = useRef<HTMLCanvasElement>(null)
  const hintRef = useRef<HTMLCanvasElement>(null)
  const drawRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const alive = useRef(true)
  const idxRef = useRef(0)
  const autoTimer = useRef<number | undefined>(undefined)
  const ch = targets[idx]

  useEffect(() => () => {
    alive.current = false
    clearTimeout(autoTimer.current)
  }, [])

  const drawGuide = () => {
    const c = guideRef.current
    const h = hintRef.current
    if (!c || !h) return
    const ctx = c.getContext('2d')!
    ctx.clearRect(0, 0, size, size)
    ctx.fillStyle = '#d9d9d9'
    ctx.font = `800 ${size * 0.78}px Nunito, 'Arial Rounded MT Bold', sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(ch, size / 2, size / 2 + size * 0.04)
    // start dot + arrow on a separate layer (must not count as part of the letter)
    const data = ctx.getImageData(0, 0, size, size).data
    let x0 = size, y0 = size, x1 = 0, y1 = 0
    for (let y = 0; y < size; y += 2) for (let x = 0; x < size; x += 2) if (data[(y * size + x) * 4 + 3] > 0) {
      if (x < x0) x0 = x
      if (x > x1) x1 = x
      if (y < y0) y0 = y
      if (y > y1) y1 = y
    }
    const st = START[ch] ?? { at: [0, 0], dir: DOWN }
    const tx = x0 + (x1 - x0) * st.at[0]
    const ty = y0 + (y1 - y0) * st.at[1]
    let best = { x: tx, y: ty, d: Infinity }
    for (let y = y0; y <= y1; y += 2) for (let x = x0; x <= x1; x += 2) if (data[(y * size + x) * 4 + 3] > 0) {
      const d = (x - tx) ** 2 + (y - ty) ** 2
      if (d < best.d) best = { x, y, d }
    }
    const hc = h.getContext('2d')!
    hc.clearRect(0, 0, size, size)
    const r = size * 0.045
    const [dx, dy] = st.dir
    const len = Math.hypot(dx, dy)
    const ux = dx / len, uy = dy / len
    const ax = best.x + ux * size * 0.13, ay = best.y + uy * size * 0.13
    hc.strokeStyle = '#ff9600'
    hc.fillStyle = '#ff9600'
    hc.lineWidth = size * 0.018
    hc.lineCap = 'round'
    hc.beginPath()
    hc.moveTo(best.x + ux * r * 1.4, best.y + uy * r * 1.4)
    hc.lineTo(ax, ay)
    hc.stroke()
    hc.beginPath()
    hc.moveTo(ax + ux * size * 0.035, ay + uy * size * 0.035)
    hc.lineTo(ax - uy * size * 0.03, ay + ux * size * 0.03)
    hc.lineTo(ax + uy * size * 0.03, ay - ux * size * 0.03)
    hc.fill()
    hc.fillStyle = '#58cc02'
    hc.beginPath()
    hc.arc(best.x, best.y, r, 0, Math.PI * 2)
    hc.fill()
  }

  useEffect(() => {
    idxRef.current = idx
    drawGuide()
    drawRef.current!.getContext('2d')!.clearRect(0, 0, size, size)
    setMsg(null)
    setSolved(false)
    setFailed(0)
    const s = sayFor(ch)
    const t = setTimeout(() => speakBoth(s.de, s.it, bilingual), 300)
    document.fonts?.ready.then(() => alive.current && drawGuide())
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx])

  const pos = (e: React.PointerEvent) => {
    const r = drawRef.current!.getBoundingClientRect()
    return { x: ((e.clientX - r.left) / r.width) * size, y: ((e.clientY - r.top) / r.height) * size }
  }
  const onDown = (e: React.PointerEvent) => {
    if (solved) return
    clearTimeout(autoTimer.current)
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
    if (!drawing.current) return
    drawing.current = false
    clearTimeout(autoTimer.current)
    autoTimer.current = window.setTimeout(() => evaluate(true), 900)
  }

  const clear = () => {
    clearTimeout(autoTimer.current)
    drawRef.current!.getContext('2d')!.clearRect(0, 0, size, size)
  }

  const next = (newGood: number) => {
    if (!alive.current) return
    if (idxRef.current + 1 >= targets.length) onFinish({ correct: newGood, total: targets.length, hearts: 3, maxCombo: 0, missed: [], fixed: [] })
    else setIdx(idxRef.current + 1)
  }

  /** silent = auto-check after lifting the finger: only reacts when it passes. */
  const evaluate = async (silent = false) => {
    if (solved || !alive.current) return
    clearTimeout(autoTimer.current)
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
    const ok = coverage >= 0.35 && outsideRatio < 0.55
    if (ok) {
      const myIdx = idx
      setSolved(true)
      sfx.correct()
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 }, disableForReducedMotion: true })
      const p = praise(bilingual)
      setMsg(p.de)
      const newGood = good + (failed === 0 ? 1 : 0)
      setGood(newGood)
      await p.say()
      if (alive.current && idxRef.current === myIdx) next(newGood)
      return
    }
    if (silent) return
    if (drawn === 0) {
      const m = 'Male mit dem Finger über den grauen Buchstaben! Fang beim grünen Punkt an.'
      setMsg(m)
      speak(m, 'de')
      return
    }
    setFailed((a) => a + 1)
    const m = coverage < 0.35 ? 'Fahre den ganzen Buchstaben nach!' : 'Bleib auf dem grauen Buchstaben!'
    setMsg(m)
    speak(m, 'de')
  }

  const skip = () => {
    clearTimeout(autoTimer.current)
    next(good)
  }

  const footer = (
    <div className="trace-actions">
      <button className="btn white icon" onClick={clear} aria-label="Löschen">🧽</button>
      <button className="btn white icon" onClick={skip} aria-label="Überspringen">⏭️</button>
      <button className="btn green grow" onClick={() => evaluate(false)}>✓ Fertig</button>
    </div>
  )

  return (
    <LessonShell progress={(idx + (solved ? 1 : 0)) / targets.length} onClose={onClose} footer={footer}>
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
          <canvas ref={hintRef} width={size} height={size} className="trace-hint" />
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
