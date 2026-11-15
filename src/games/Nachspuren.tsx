import { useEffect, useMemo, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import type { GameProps } from '../components/ChoiceGame'
import { Mascot } from '../components/Mascot'
import { LessonShell } from '../components/LessonShell'
import { praise, speak, speakBoth } from '../lib/speech'
import { sfx } from '../lib/sfx'
import { pickN, shuffle } from '../lib/util'
import { drawDemo, drawGuide as drawStrokeGuide, drawHints, strokeCoverage, strokesFor } from './tracing'

const L1 = 'AOMILET'.split('')
const L2 = 'BCDFGHKNPRSUWZ12345'.split('')
const L3 = 'abdeghmnrstuw67890'.split('')

const NUM = ['', 'eins', 'zwei', 'drei', 'vier', 'fünf']

function sayFor(ch: string) {
  const n = strokesFor(ch)?.filter((x) => !x.dot).length ?? 1
  const order = n > 1 ? ` Fang bei der Eins an.` : ''
  if (/\d/.test(ch)) return { de: `Fahre die Zahl ${ch} nach.${order}`, it: `Ripassa il numero ${ch}.` }
  if (ch === ch.toLowerCase()) return { de: `Fahre das kleine ${ch.toUpperCase()} nach.${order}`, it: `Ripassa la ${ch} piccola.` }
  return { de: `Fahre das große ${ch} nach.${order}`, it: `Ripassa la ${ch} grande.` }
}

/** Spoken while the demo draws: "Erst eins, dann zwei, dann drei." */
function orderPhrase(n: number) {
  if (n <= 1) return 'Schau mal, so geht das.'
  return 'Schau mal: ' + Array.from({ length: n }, (_, i) => `${i === 0 ? 'erst' : 'dann'} ${NUM[i + 1] ?? i + 1}`).join(', ') + '.'
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
  const demoFrame = useRef(0)
  const ch = targets[idx]
  const strokes = strokesFor(ch)

  useEffect(() => {
    alive.current = true // StrictMode mounts twice; re-arm after the first cleanup
    return () => {
      alive.current = false
      clearTimeout(autoTimer.current)
      cancelAnimationFrame(demoFrame.current)
    }
  }, [])

  const drawGuide = () => {
    const c = guideRef.current
    const h = hintRef.current
    if (!c || !h) return
    const ctx = c.getContext('2d')!
    const hc = h.getContext('2d')!
    if (strokes) {
      drawStrokeGuide(ctx, size, strokes)
      drawHints(hc, size, strokes)
      return
    }
    // fallback for a glyph without stroke data: plain font, no hints
    ctx.clearRect(0, 0, size, size)
    hc.clearRect(0, 0, size, size)
    ctx.fillStyle = '#d9d9d9'
    ctx.font = `800 ${size * 0.78}px Nunito, 'Arial Rounded MT Bold', sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(ch, size / 2, size / 2 + size * 0.04)
  }

  /** Animate the strokes in order (blue pen), then go back to the numbered hints. */
  const demo = (withVoice: boolean) => {
    const h = hintRef.current
    if (!strokes || !h) return
    cancelAnimationFrame(demoFrame.current)
    const n = strokes.length
    const real = strokes.filter((x) => !x.dot).length
    if (withVoice) speak(orderPhrase(real), 'de')
    const perStroke = 900
    const t0 = performance.now()
    const hc = h.getContext('2d')!
    const frame = (now: number) => {
      if (!alive.current) return
      const t = Math.min(n, (now - t0) / perStroke)
      drawHints(hc, size, strokes)
      drawDemo(hc, size, strokes, t)
      if (t < n) demoFrame.current = requestAnimationFrame(frame)
      else demoFrame.current = window.setTimeout(() => alive.current && drawHints(hc, size, strokes), 700) as unknown as number
    }
    demoFrame.current = requestAnimationFrame(frame)
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
    // show how it's written once per letter, quietly, while Berli talks
    const d = setTimeout(() => demo(false), 700)
    document.fonts?.ready.then(() => alive.current && drawGuide())
    return () => {
      clearTimeout(t)
      clearTimeout(d)
      cancelAnimationFrame(demoFrame.current)
      clearTimeout(demoFrame.current)
    }
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
    // every numbered stroke must be traced (a stem alone is not a K)
    const perStroke = strokes ? strokeCoverage(strokes, d, size) : []
    const missing = perStroke.findIndex((c, i) => c < (strokes![i].dot ? 0.5 : 0.55))
    const ok = (strokes ? missing === -1 : coverage >= 0.35) && outsideRatio < 0.55
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
      const m = 'Male mit dem Finger über den grauen Buchstaben! Fang bei der grünen Eins an.'
      setMsg(m)
      speak(m, 'de')
      return
    }
    setFailed((a) => a + 1)
    const numbered = strokes ? strokes.slice(0, missing + 1).filter((x) => !x.dot).length : 0
    const m =
      outsideRatio >= 0.55
        ? 'Bleib auf dem grauen Buchstaben!'
        : strokes && missing >= 0
          ? strokes[missing].dot
            ? 'Vergiss die Pünktchen nicht!'
            : `Fast! Vergiss die ${NUM[numbered] ?? numbered} nicht!`
          : 'Fahre den ganzen Buchstaben nach!'
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
      {strokes && <button className="btn white icon" onClick={() => demo(true)} aria-label="Zeig mir wie">👀</button>}
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
