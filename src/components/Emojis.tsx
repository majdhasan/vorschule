/** Renders n copies of an emoji in rows of 5 (helps subitizing / counting in fives) */
export function Emojis({ emoji, n, size = 44, rowOf = 5 }: { emoji: string; n: number; size?: number; rowOf?: number }) {
  const rows: number[][] = []
  for (let i = 0; i < n; i += rowOf) rows.push(Array.from({ length: Math.min(rowOf, n - i) }, (_, k) => i + k))
  return (
    <div className="emoji-rows">
      {rows.map((r, ri) => (
        <div key={ri} className="emoji-row">
          {r.map((i) => (
            <span key={i} style={{ fontSize: size }} className="emoji-item">
              {emoji}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}

/** Counting dots in rows of 5; the last `crossed` ones are shown as taken away. */
export function Dots({ n, color, crossed = 0 }: { n: number; color: string; crossed?: number }) {
  return (
    <span className="dots">
      {Array.from({ length: n }, (_, i) => (
        <span key={i} className={'dotbig' + (i >= n - crossed ? ' crossed' : '')} style={{ background: color }} />
      ))}
    </span>
  )
}

/** Tiny dot pattern under a numeral. */
export function MiniDots({ n }: { n: number }) {
  return (
    <span className="mini-dots" aria-hidden>
      {Array.from({ length: n }, (_, i) => (
        <i key={i} />
      ))}
    </span>
  )
}
