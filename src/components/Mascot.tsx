export function Mascot({ mood = 'normal', size = 72 }: { mood?: 'normal' | 'happy' | 'think' | 'wave'; size?: number }) {
  return (
    <div className={'mascot mascot-' + mood} style={{ fontSize: size }} aria-hidden>
      <span className="mascot-face">🐻</span>
      {mood === 'happy' && <span className="mascot-extra">✨</span>}
      {mood === 'think' && <span className="mascot-extra">🤔</span>}
      {mood === 'wave' && <span className="mascot-extra">👋</span>}
    </div>
  )
}
