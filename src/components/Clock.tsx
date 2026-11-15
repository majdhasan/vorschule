export function Clock({ hour, minute = 0, size = 220 }: { hour: number; minute?: number; size?: number }) {
  const hAngle = ((hour % 12) + minute / 60) * 30
  const mAngle = minute * 6
  const r = 100
  return (
    <svg width={size} height={size} viewBox="-110 -110 220 220" aria-hidden>
      <circle r={r} fill="#fff" stroke="#333" strokeWidth={6} />
      {Array.from({ length: 12 }, (_, i) => {
        const a = ((i + 1) * 30 * Math.PI) / 180
        const x = Math.sin(a) * 78
        const y = -Math.cos(a) * 78
        return (
          <text key={i} x={x} y={y + 8} textAnchor="middle" fontSize={22} fontWeight={700} fill="#333" fontFamily="Nunito, sans-serif">
            {i + 1}
          </text>
        )
      })}
      {Array.from({ length: 60 }, (_, i) => {
        const a = (i * 6 * Math.PI) / 180
        const len = i % 5 === 0 ? 10 : 5
        return <line key={i} x1={Math.sin(a) * (r - 4)} y1={-Math.cos(a) * (r - 4)} x2={Math.sin(a) * (r - 4 - len)} y2={-Math.cos(a) * (r - 4 - len)} stroke="#555" strokeWidth={i % 5 === 0 ? 3 : 1.5} />
      })}
      <line x1={0} y1={0} x2={0} y2={-50} stroke="#1d6fd1" strokeWidth={10} strokeLinecap="round" transform={`rotate(${hAngle})`} />
      <line x1={0} y1={0} x2={0} y2={-70} stroke="#e63946" strokeWidth={6} strokeLinecap="round" transform={`rotate(${mAngle})`} />
      <circle r={7} fill="#333" />
    </svg>
  )
}
