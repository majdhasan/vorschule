import { useState } from 'react'
import confetti from 'canvas-confetti'
import { FREEZE_PRICE, MAX_FREEZES, OUTFITS, STICKER_PACK_PRICE, STICKERS, THEMES, stickerById } from '../data/misc'
import { useStore } from '../lib/store'
import { speak } from '../lib/speech'
import { sfx } from '../lib/sfx'
import { Mascot } from '../components/Mascot'

/** Gems shop: sticker packs, streak protection, Berli outfits, path themes. */
export function Shop() {
  const s = useStore()
  const [last, setLast] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const allStickers = s.stickers.length >= STICKERS.length

  const buy = (kind: 'pack' | 'freeze' | 'outfit' | 'theme', id: string | undefined, price: number, name: string) => {
    if (s.gems < price) return void speak(`Dafür brauchst du ${price} Edelsteine. Du hast ${s.gems}.`, 'de')
    const r = s.buy(kind, id)
    if (!r.ok) return void speak('Das geht gerade nicht.', 'de')
    sfx.chest()
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 }, disableForReducedMotion: true })
    if (r.sticker) {
      const st = stickerById(r.sticker)!
      setLast(r.sticker)
      speak(`Juhu! Der Sticker ${st.de}!`, 'de')
    } else speak(`Gekauft: ${name}!`, 'de')
  }

  return (
    <div className="practice">
      <header className="page-head">
        <h1>🛍️ Laden</h1>
        <div className="gem-balance">💎 {s.gems}</div>
        <p className="muted">Edelsteine bekommst du für Lektionen, Truhen, Aufgaben und Medaillen.</p>
      </header>

      <section className="shop-sec">
        <h2>Sticker</h2>
        <div className="shop-item">
          <span className="shop-emoji">🎴</span>
          <span className="shop-main">
            <b>Sticker-Überraschung</b>
            <span className="muted">Ein neuer Sticker für dein Album</span>
          </span>
          <button className="btn blue small" disabled={allStickers} onClick={() => buy('pack', undefined, STICKER_PACK_PRICE, 'Sticker')}>
            💎 {STICKER_PACK_PRICE}
          </button>
        </div>
        {last && (
          <div className="end-note">
            {stickerById(last)!.emoji} Neu: {stickerById(last)!.de}
          </div>
        )}
      </section>

      <section className="shop-sec">
        <h2>Streak-Schutz</h2>
        <div className="shop-item">
          <span className="shop-emoji">🧊</span>
          <span className="shop-main">
            <b>Streak-Schutz ({s.freezes}/{MAX_FREEZES})</b>
            <span className="muted">Rettet deine Serie, wenn du einen Tag nicht lernst. Jeden Montag gibt es einen gratis.</span>
          </span>
          <button className="btn blue small" disabled={s.freezes >= MAX_FREEZES} onClick={() => buy('freeze', undefined, FREEZE_PRICE, 'Streak-Schutz')}>
            💎 {FREEZE_PRICE}
          </button>
        </div>
      </section>

      <section className="shop-sec">
        <h2>Berli anziehen</h2>
        <div className="outfit-preview">
          <Mascot size={96} outfit={preview ?? s.outfit} mood="happy" />
        </div>
        <div className="shop-grid">
          {OUTFITS.map((o) => {
            const owned = s.outfitsOwned.includes(o.id)
            const on = s.outfit === o.id
            return (
              <button
                key={o.id || 'none'}
                className={'shop-tile' + (on ? ' on' : '')}
                onPointerEnter={() => setPreview(o.id)}
                onPointerLeave={() => setPreview(null)}
                onClick={() => (owned ? (s.setOutfit(o.id), speak(o.de, 'de')) : buy('outfit', o.id, o.price, o.de))}
              >
                <span className="shop-tile-emoji">{o.emoji || '🐻'}</span>
                <span className="shop-tile-name">{o.de}</span>
                <span className="shop-tile-price">{owned ? (on ? '✓ an' : 'anziehen') : `💎 ${o.price}`}</span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="shop-sec">
        <h2>Pfad-Themen</h2>
        <div className="shop-grid">
          {THEMES.map((t) => {
            const owned = s.themesOwned.includes(t.id)
            const on = s.theme === t.id
            return (
              <button key={t.id || 'std'} className={'shop-tile' + (on ? ' on' : '')} onClick={() => (owned ? (s.setTheme(t.id), speak(t.de, 'de')) : buy('theme', t.id, t.price, t.de))}>
                <span className="shop-tile-emoji">{t.emoji}</span>
                <span className="shop-tile-name">{t.de}</span>
                <span className="shop-tile-price">{owned ? (on ? '✓ an' : 'wählen') : `💎 ${t.price}`}</span>
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}
