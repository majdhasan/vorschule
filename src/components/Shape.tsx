import type { ShapeId } from '../data/misc'

export function Shape({ shape, color, size = 90 }: { shape: ShapeId; color: string; size?: number }) {
  const s = size
  const common = { fill: color, stroke: 'rgba(0,0,0,0.15)', strokeWidth: 3 }
  let el
  switch (shape) {
    case 'kreis':
      el = <circle cx={50} cy={50} r={42} {...common} />
      break
    case 'quadrat':
      el = <rect x={10} y={10} width={80} height={80} rx={6} {...common} />
      break
    case 'rechteck':
      el = <rect x={4} y={24} width={92} height={52} rx={6} {...common} />
      break
    case 'dreieck':
      el = <polygon points="50,8 94,90 6,90" {...common} strokeLinejoin="round" />
      break
    case 'stern':
      el = (
        <polygon
          points="50,5 61,38 96,38 68,58 79,92 50,71 21,92 32,58 4,38 39,38"
          {...common}
          strokeLinejoin="round"
        />
      )
      break
    case 'herz':
      el = (
        <path
          d="M50 90 C 20 65, 5 45, 5 30 C 5 15, 18 6, 30 6 C 40 6, 47 12, 50 20 C 53 12, 60 6, 70 6 C 82 6, 95 15, 95 30 C 95 45, 80 65, 50 90 Z"
          {...common}
        />
      )
      break
  }
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" aria-hidden>
      {el}
    </svg>
  )
}
