import { STROKES } from '../data/strokes'

export type Pt = [number, number]
export type Stroke = { d: string; pts: Pt[]; len: number; dot: boolean }

/** Glyph space (0..100 box plus margin) mapped onto the square canvas. */
const MIN = -8
const SPAN = 116
const STEP = 1.5
export const GUIDE_WIDTH = 13

const NS = 'http://www.w3.org/2000/svg'
let host: SVGSVGElement | null = null
const cache = new Map<string, Stroke[]>()

/** Sample each stroke into points (via a hidden SVG path) so we can draw arrows and animate it. */
export function strokesFor(ch: string): Stroke[] | null {
  const ds = STROKES[ch]
  if (!ds || typeof document === 'undefined') return null
  const hit = cache.get(ch)
  if (hit) return hit
  if (!host) {
    host = document.createElementNS(NS, 'svg')
    host.setAttribute('width', '0')
    host.setAttribute('height', '0')
    host.style.position = 'absolute'
    host.style.visibility = 'hidden'
    document.body.appendChild(host)
  }
  const out = ds.map((d) => {
    const p = document.createElementNS(NS, 'path')
    p.setAttribute('d', d)
    host!.appendChild(p)
    const len = p.getTotalLength()
    const pts: Pt[] = []
    for (let l = 0; l < len; l += STEP) {
      const q = p.getPointAtLength(l)
      pts.push([q.x, q.y])
    }
    const end = p.getPointAtLength(len)
    pts.push([end.x, end.y])
    host!.removeChild(p)
    return { d, pts, len, dot: len < 2 }
  })
  cache.set(ch, out)
  return out
}

function fit(ctx: CanvasRenderingContext2D, px: number) {
  const s = px / SPAN
  ctx.setTransform(s, 0, 0, s, -MIN * s, -MIN * s)
}
function reset(ctx: CanvasRenderingContext2D) {
  ctx.setTransform(1, 0, 0, 1, 0, 0)
}

const at = (st: Stroke, l: number): Pt => st.pts[Math.max(0, Math.min(st.pts.length - 1, Math.round(l / STEP)))]
function dirAt(st: Stroke, l: number): Pt {
  const a = at(st, Math.max(0, l - 2))
  const b = at(st, Math.min(st.len, l + 2))
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const n = Math.hypot(dx, dy) || 1
  return [dx / n, dy / n]
}

/** The grey letter the child traces (also the mask used for checking). */
export function drawGuide(ctx: CanvasRenderingContext2D, px: number, strokes: Stroke[]) {
  reset(ctx)
  ctx.clearRect(0, 0, px, px)
  fit(ctx, px)
  ctx.strokeStyle = '#d9d9d9'
  ctx.lineWidth = GUIDE_WIDTH
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  for (const st of strokes) ctx.stroke(new Path2D(st.d))
  reset(ctx)
}

/**
 * Where to put each stroke's number badge: close to the start, towards where the stroke heads,
 * but off the letter itself and away from other badges.
 */
function badgePositions(strokes: Stroke[]): (Pt | null)[] {
  const placed: Pt[] = []
  const all = strokes.flatMap((st) => st.pts.filter((_, k) => k % 3 === 0))
  return strokes.map((st) => {
    if (st.dot) return null
    const s0 = st.pts[0]
    const [dx, dy] = dirAt(st, 3)
    const aim: Pt = [s0[0] + dx * 8, s0[1] + dy * 8]
    let best: Pt = [s0[0] - dx * 13, s0[1] - dy * 13]
    let bestScore = Infinity
    for (const dist of [13, 16, 20]) {
      for (let a = 0; a < 16; a++) {
        const ang = (a / 16) * Math.PI * 2
        const c: Pt = [s0[0] + Math.cos(ang) * dist, s0[1] + Math.sin(ang) * dist]
        if (c[0] < MIN + 6.5 || c[0] > MIN + SPAN - 6.5 || c[1] < MIN + 6.5 || c[1] > MIN + SPAN - 6.5) continue
        let near = Infinity
        for (const q of all) near = Math.min(near, Math.hypot(c[0] - q[0], c[1] - q[1]))
        const clear = GUIDE_WIDTH / 2 + 6.2
        const overlap = near < clear ? (clear - near) * 12 : 0
        const crowd = placed.some((q) => Math.hypot(c[0] - q[0], c[1] - q[1]) < 13.5) ? 1000 : 0
        const score = Math.hypot(c[0] - aim[0], c[1] - aim[1]) + overlap + crowd + (dist - 13) * 0.6
        if (score < bestScore) {
          bestScore = score
          best = c
        }
      }
    }
    placed.push(best)
    return best
  })
}

/** Numbered start badges + orange direction arrows along every stroke. */
export function drawHints(ctx: CanvasRenderingContext2D, px: number, strokes: Stroke[]) {
  reset(ctx)
  ctx.clearRect(0, 0, px, px)
  fit(ctx, px)
  // arrows
  ctx.fillStyle = '#ff9600'
  for (const st of strokes) {
    if (st.dot) continue
    for (let l = 13; l < st.len - 7; l += 22) {
      const [x, y] = at(st, l)
      const [dx, dy] = dirAt(st, l)
      ctx.beginPath()
      ctx.moveTo(x + dx * 4, y + dy * 4)
      ctx.lineTo(x - dx * 2.5 - dy * 3.4, y - dy * 2.5 + dx * 3.4)
      ctx.lineTo(x - dx * 2.5 + dy * 3.4, y - dy * 2.5 - dx * 3.4)
      ctx.closePath()
      ctx.fill()
    }
  }
  // start dots + numbered badges
  const badges = badgePositions(strokes)
  let num = 0
  strokes.forEach((st, i) => {
    const [sx, sy] = st.pts[0]
    ctx.fillStyle = '#58cc02'
    ctx.beginPath()
    ctx.arc(sx, sy, 3.2, 0, Math.PI * 2)
    ctx.fill()
    const b = badges[i]
    if (!b) return // umlaut dots: obvious, no number
    num += 1
    const [bx, by] = b
    ctx.fillStyle = '#58cc02'
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 1.4
    ctx.beginPath()
    ctx.arc(bx, by, 6.2, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    ctx.fillStyle = '#ffffff'
    ctx.font = "900 9px Nunito, 'Arial Rounded MT Bold', sans-serif"
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(String(num), bx, by + 0.6)
  })
  reset(ctx)
}

/** Demo overlay: strokes drawn so far, t runs from 0 to strokes.length. */
export function drawDemo(ctx: CanvasRenderingContext2D, px: number, strokes: Stroke[], t: number) {
  fit(ctx, px)
  ctx.strokeStyle = 'rgba(28,176,246,0.85)'
  ctx.lineWidth = 6
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  let head = null as Pt | null
  strokes.forEach((st, i) => {
    const frac = Math.max(0, Math.min(1, t - i))
    if (frac <= 0) return
    const n = Math.max(1, Math.round((st.pts.length - 1) * frac))
    ctx.beginPath()
    ctx.moveTo(st.pts[0][0], st.pts[0][1])
    for (let k = 1; k <= n; k++) ctx.lineTo(st.pts[k][0], st.pts[k][1])
    if (st.dot) ctx.lineTo(st.pts[0][0] + 0.1, st.pts[0][1])
    ctx.stroke()
    if (frac < 1) head = st.pts[n]
  })
  if (head) {
    const [hx, hy] = head
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(hx, hy, 6, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#1cb0f6'
    ctx.beginPath()
    ctx.arc(hx, hy, 4.2, 0, Math.PI * 2)
    ctx.fill()
  }
  reset(ctx)
}

/**
 * Share of each stroke's centre line that the child's drawing covers (0..1).
 * `alpha` is the drawing canvas' RGBA data, `px` its width.
 */
export function strokeCoverage(strokes: Stroke[], alpha: Uint8ClampedArray, px: number): number[] {
  const s = px / SPAN
  const r = Math.max(2, Math.round(s * 2.5)) // a little slack around the centre line
  const painted = (x: number, y: number) => {
    const cx = Math.round((x - MIN) * s)
    const cy = Math.round((y - MIN) * s)
    for (let oy = -r; oy <= r; oy += r) for (let ox = -r; ox <= r; ox += r) {
      const X = cx + ox
      const Y = cy + oy
      if (X >= 0 && Y >= 0 && X < px && Y < px && alpha[(Y * px + X) * 4 + 3] > 0) return true
    }
    return false
  }
  return strokes.map((st) => {
    const pts = st.pts.filter((_, k) => k % 2 === 0)
    return pts.filter(([x, y]) => painted(x, y)).length / pts.length
  })
}
