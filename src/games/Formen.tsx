import { useMemo } from 'react'
import { ChoiceGame, type GameProps, type Round } from '../components/ChoiceGame'
import { Shape } from '../components/Shape'
import { COLORS, SHAPES } from '../data/misc'
import { pick, pickN, shuffle } from '../lib/util'

const ACC: Record<string, string> = { kreis: 'den', quadrat: 'das', dreieck: 'das', rechteck: 'das', stern: 'den', herz: 'das' }
const IT_F = new Set(['stern'])
const INVARIANT = new Set(['rosa', 'lila', 'orange'])

function deAdj(color: string, article: string) {
  if (INVARIANT.has(color)) return color
  return color + (article === 'den' ? 'en' : 'e')
}
/** Strong ending without article: "rotes Dreieck", "roter Stern" */
function deAdjStrong(color: string, shapeId: string) {
  if (INVARIANT.has(color)) return color
  return color + (ACC[shapeId] === 'den' ? 'er' : 'es')
}
function itAdj(colorIt: string, fem: boolean) {
  if (fem && colorIt.endsWith('o')) return colorIt.slice(0, -1) + 'a'
  return colorIt
}

export default function Formen({ level, bilingual, onFinish, onClose }: GameProps) {
  const rounds = useMemo<Round[]>(() => {
    return Array.from({ length: 6 }, (_, ri) => {
      const mode = level === 1 ? 'shape' : level === 2 ? 'both' : ri % 2 === 0 ? 'both' : 'color'
      if (mode === 'shape') {
        const shapes = pickN(SHAPES, 3)
        const target = shapes[0]
        const colors = pickN(COLORS, 3)
        const opts = shuffle(shapes.map((s, i) => ({ s, c: colors[i] })))
        return {
          promptDe: `Tippe auf ${ACC[target.id]} ${target.de}!`,
          promptIt: `Tocca ${IT_F.has(target.id) ? 'la' : 'il'} ${target.it}!`,
          options: opts.map((o) => ({ key: o.s.id, node: <Shape shape={o.s.id} color={o.c.hex} />, sayDe: o.s.de, sayIt: o.s.it })),
          answer: target.id,
          columns: 3,
        }
      }
      if (mode === 'color') {
        const shape = pick(SHAPES)
        const colors = pickN(COLORS, 4)
        const target = colors[0]
        return {
          promptDe: `Welche Farbe hat ${ACC[shape.id] === 'den' ? 'der' : 'das'} ${shape.de}?`,
          promptIt: `Di che colore è ${IT_F.has(shape.id) ? 'la' : 'il'} ${shape.it}?`,
          visual: <Shape shape={shape.id} color={target.hex} size={140} />,
          options: shuffle(colors).map((c) => ({ key: c.id, node: <span className="swatch" style={{ background: c.hex }} />, sayDe: c.de, sayIt: c.it })),
          answer: target.id,
          columns: 4,
        }
      }
      // both: shape + color
      const [s1, s2] = pickN(SHAPES, 2)
      const [c1, c2] = pickN(COLORS, 2)
      const items = shuffle([
        { s: s1, c: c1, key: 'target' },
        { s: s1, c: c2, key: 'd1' },
        { s: s2, c: c1, key: 'd2' },
        { s: s2, c: c2, key: 'd3' },
      ])
      const art = ACC[s1.id]
      return {
        promptDe: `Tippe auf ${art} ${deAdj(c1.de, art)} ${s1.de}!`,
        promptIt: `Tocca ${IT_F.has(s1.id) ? 'la' : 'il'} ${s1.it} ${itAdj(c1.it, IT_F.has(s1.id))}!`,
        options: items.map((o) => ({ key: o.key, node: <Shape shape={o.s.id} color={o.c.hex} />, sayDe: `${deAdjStrong(o.c.de, o.s.id)} ${o.s.de}`, sayIt: `${o.s.it} ${itAdj(o.c.it, IT_F.has(o.s.id))}` })),
        answer: 'target',
        columns: 2,
      }
    })
  }, [level])
  return <ChoiceGame rounds={rounds} bilingual={bilingual} onFinish={onFinish} onClose={onClose} />
}
