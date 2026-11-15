import { STICKERS } from '../data/misc'
import { XP_PER_STICKER, useStore } from '../lib/store'
import { speakBoth } from '../lib/speech'

export function Stickers() {
  const { stickersUnlocked, xp, bilingual } = useStore()
  const toNext = XP_PER_STICKER - (xp % XP_PER_STICKER)
  return (
    <div className="practice">
      <header className="page-head">
        <h1>🏆 Mein Stickeralbum</h1>
        <p className="muted">
          Noch <b>{toNext} XP</b> bis zum nächsten Sticker. Truhen auf dem Pfad geben auch Sticker!
        </p>
        <div className="bar"><div className="bar-fill" style={{ width: `${((XP_PER_STICKER - toNext) / XP_PER_STICKER) * 100}%` }} /></div>
      </header>
      <div className="album">
        {STICKERS.map((s, i) => {
          const open = i < stickersUnlocked
          return (
            <button key={i} className={'sticker' + (open ? ' open' : '')} onClick={() => open && speakBoth(s.de, s.it, bilingual)} aria-label={open ? s.de : 'Noch gesperrt'}>
              <span className="sticker-emoji">{open ? s.emoji : '🔒'}</span>
              <span className="sticker-name">{open ? s.de : '???'}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
