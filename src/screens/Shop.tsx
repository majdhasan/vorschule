import { useState } from 'react'
import confetti from 'canvas-confetti'
import { FREEZE_PRICE, MAX_FREEZES, OUTFITS, STICKER_PACK_PRICE, STICKERS, THEMES, stickerById } from '../data/misc'
import { useStore } from '../lib/store'
import { speak } from '../lib/speech'
import { t } from '../lib/i18n'
import { sfx } from '../lib/sfx'
import { Mascot } from '../components/Mascot'

/** Gems shop: sticker packs, streak protection, Berli outfits, path themes. */
export function Shop() {
  const s = useStore()
  const [last, setLast] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const allStickers = s.stickers.length >= STICKERS.length

  const buy = (kind: 'pack' | 'freeze' | 'outfit' | 'theme', id: string | undefined, price: number, name: string) => {
    if (s.gems < price) return void speak(t(`Dafür brauchst du ${price} Edelsteine. Du hast ${s.gems}.`, `Ti servono ${price} gemme. Ne hai ${s.gems}.`))
    const r = s.buy(kind, id)
    if (!r.ok) return void speak(t('Das geht gerade nicht.', 'Adesso non si può.'))
    sfx.chest()
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 }, disableForReducedMotion: true })
    if (r.sticker) {
      const st = stickerById(r.sticker)!
      setLast(r.sticker)
      speak(t(`Juhu! Der Sticker ${st.de}!`, `Evviva! L'adesivo ${st.it}!`))
    } else speak(t(`Gekauft: ${name}!`, `Comprato: ${name}!`))
  }

  return (
    <div className="practice">
      <header className="page-head">
        <h1>🛍️ {t('Laden', 'Negozio')}</h1>
        <div className="gem-balance">💎 {s.gems}</div>
        <p className="muted">{t('Edelsteine bekommst du für Lektionen, Truhen, Aufgaben und Medaillen.', 'Le gemme si guadagnano con lezioni, forzieri, missioni e medaglie.')}</p>
      </header>

      <section className="shop-sec">
        <h2>{t('Sticker', 'Adesivi')}</h2>
        <div className="shop-item">
          <span className="shop-emoji">🎴</span>
          <span className="shop-main">
            <b>{t('Sticker-Überraschung', 'Adesivo a sorpresa')}</b>
            <span className="muted">{t('Ein neuer Sticker für dein Album', 'Un nuovo adesivo per il tuo album')}</span>
          </span>
          <button className="btn blue small" disabled={allStickers} onClick={() => buy('pack', undefined, STICKER_PACK_PRICE, t('Sticker', 'Adesivo'))}>
            💎 {STICKER_PACK_PRICE}
          </button>
        </div>
        {last && (
          <div className="end-note">
            {stickerById(last)!.emoji} {t('Neu:', 'Nuovo:')} {t(stickerById(last)!.de, stickerById(last)!.it)}
          </div>
        )}
      </section>

      <section className="shop-sec">
        <h2>{t('Streak-Schutz', 'Protezione serie')}</h2>
        <div className="shop-item">
          <span className="shop-emoji">🧊</span>
          <span className="shop-main">
            <b>{t('Streak-Schutz', 'Protezione serie')} ({s.freezes}/{MAX_FREEZES})</b>
            <span className="muted">{t('Rettet deine Serie, wenn du einen Tag nicht lernst. Jeden Montag gibt es einen gratis.', 'Salva la tua serie se salti un giorno. Ogni lunedì ne ricevi una gratis.')}</span>
          </span>
          <button className="btn blue small" disabled={s.freezes >= MAX_FREEZES} onClick={() => buy('freeze', undefined, FREEZE_PRICE, t('Streak-Schutz', 'Protezione serie'))}>
            💎 {FREEZE_PRICE}
          </button>
        </div>
      </section>

      <section className="shop-sec">
        <h2>{t('Berli anziehen', 'Vesti Berli')}</h2>
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
                onClick={() => (owned ? (s.setOutfit(o.id), speak(t(o.de, o.it))) : buy('outfit', o.id, o.price, t(o.de, o.it)))}
              >
                <span className="shop-tile-emoji">{o.emoji || '🐻'}</span>
                <span className="shop-tile-name">{t(o.de, o.it)}</span>
                <span className="shop-tile-price">{owned ? (on ? t('✓ an', '✓ indossato') : t('anziehen', 'indossa')) : `💎 ${o.price}`}</span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="shop-sec">
        <h2>{t('Pfad-Themen', 'Temi del percorso')}</h2>
        <div className="shop-grid">
          {THEMES.map((th) => {
            const owned = s.themesOwned.includes(th.id)
            const on = s.theme === th.id
            const name = t(th.de, th.it)
            return (
              <button key={th.id || 'std'} className={'shop-tile' + (on ? ' on' : '')} onClick={() => (owned ? (s.setTheme(th.id), speak(name)) : buy('theme', th.id, th.price, name))}>
                <span className="shop-tile-emoji">{th.emoji}</span>
                <span className="shop-tile-name">{name}</span>
                <span className="shop-tile-price">{owned ? (on ? t('✓ an', '✓ attivo') : t('wählen', 'scegli')) : `💎 ${th.price}`}</span>
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}
