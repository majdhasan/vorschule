import { STICKERS } from '../data/misc'
import { STICKER_EVERY, useStore } from '../lib/store'
import { speakBoth } from '../lib/speech'

export function Stickers({ onHome }: { onHome: () => void }) {
  const { stickersUnlocked, totalStars, bilingual } = useStore()
  const toNext = STICKER_EVERY - (totalStars % STICKER_EVERY)
  return (
    <div className="screen">
      <div className="topbar" style={{ background: '#ffb703' }}>
        <button className="back" onClick={onHome} aria-label="Zurück">←</button>
        <div className="topbar-title">🏆 Mein Stickeralbum</div>
        <div className="topbar-level">⭐ {totalStars}</div>
      </div>
      <div className="stickers-info">
        Noch <b>{toNext}</b> {toNext === 1 ? 'Stern' : 'Sterne'} bis zum nächsten Sticker!
        <div className="bar"><div className="bar-fill" style={{ width: `${((STICKER_EVERY - toNext) / STICKER_EVERY) * 100}%` }} /></div>
      </div>
      <div className="album">
        {STICKERS.map((s, i) => {
          const open = i < stickersUnlocked
          return (
            <button
              key={i}
              className={'sticker' + (open ? ' open' : '')}
              onClick={() => open && speakBoth(s.de, s.it, bilingual)}
              aria-label={open ? s.de : 'Noch gesperrt'}
            >
              <span className="sticker-emoji">{open ? s.emoji : '🔒'}</span>
              <span className="sticker-name">{open ? s.de : '???'}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
