import { useEffect, useState } from 'react'
import confetti from 'canvas-confetti'
import { STICKER_SETS, stickerById } from '../data/misc'
import { speak } from '../lib/speech'
import { t } from '../lib/i18n'
import { sfx } from '../lib/sfx'
import type { Reward } from '../lib/store'

/** Two-tap chest: tap to shake, tap again to pop it open and reveal the reward. */
export function ChestReveal({ open, title, emoji = '🎁', onDone }: { open: () => Reward; title: string; emoji?: string; onDone: () => void }) {
  const [taps, setTaps] = useState(0)
  const [reward, setReward] = useState<Reward | null>(null)
  useEffect(() => {
    speak(t('Tippe auf die Truhe!', 'Tocca il forziere!'))
  }, [])
  const tap = () => {
    if (reward) return
    if (taps === 0) {
      setTaps(1)
      sfx.tap()
      return
    }
    const r = open()
    setReward(r)
    sfx.chest()
    confetti({ particleCount: 160, spread: 100, origin: { y: 0.45 }, disableForReducedMotion: true })
    const st = r.stickers.map((id) => stickerById(id)).filter((x) => !!x).map((x) => t(x.de, x.it))
    speak(
      t(
        `Wow! ${r.gems ? `${r.gems} Edelsteine` : ''}${st.length ? ` und der Sticker ${st.join(' und ')}` : ''}!`,
        `Wow! ${r.gems ? `${r.gems} gemme` : ''}${st.length ? ` e l'adesivo ${st.join(' e ')}` : ''}!`,
      ),
    )
  }
  return (
    <div className="reveal-overlay">
      <h2 className="reveal-title">{title}</h2>
      {!reward ? (
        <button className={'reveal-chest' + (taps ? ' shake' : ' wobble')} onClick={tap} aria-label={t('Truhe öffnen', 'Apri il forziere')}>
          {emoji}
        </button>
      ) : (
        <RewardList reward={reward} />
      )}
      <p className="reveal-hint">{reward ? '' : taps ? t('Nochmal tippen!', 'Tocca ancora!') : t('Tippe auf die Truhe!', 'Tocca il forziere!')}</p>
      {reward && (
        <button className="btn green block reveal-btn" onClick={onDone}>
          {t('Weiter', 'Avanti')} ➜
        </button>
      )}
    </div>
  )
}

export function RewardList({ reward }: { reward: Reward }) {
  return (
    <div className="reward-list">
      {reward.stickers.map((id) => {
        const s = stickerById(id)!
        return (
          <div key={id} className="reward-sticker">
            <span className="reward-sticker-emoji">{s.emoji}</span>
            <span>
              {t('Neuer Sticker:', 'Nuovo adesivo:')} <b>{t(s.de, s.it)}</b>
              {s.rare && t(' ✨ selten!', ' ✨ raro!')}
            </span>
          </div>
        )
      })}
      <div className="reward-row">
        {reward.xp > 0 && <span className="xp-chip">⚡ +{reward.xp} XP</span>}
        {reward.gems > 0 && <span className="xp-chip gem">💎 +{reward.gems}</span>}
      </div>
      {reward.setsCompleted.map((id) => {
        const set = STICKER_SETS.find((x) => x.id === id)!
        return (
          <div key={id} className="end-note">
            {set.emoji} {t(`Set „${set.de}“ komplett!`, `Serie «${set.it}» completa!`)} +20 💎
          </div>
        )
      })}
    </div>
  )
}
