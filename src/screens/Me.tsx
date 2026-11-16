import { useState } from 'react'
import { ACHIEVEMENTS, MEDALS, tierOf } from '../data/achievements'
import { STICKER_SETS, STICKERS, SET_BONUS_GEMS } from '../data/misc'
import { achStats, XP_PER_STICKER, useStore } from '../lib/store'
import { speak } from '../lib/speech'
import { t } from '../lib/i18n'
import { Mascot } from '../components/Mascot'

/** "Ich": profile, medals and the sticker album grouped into sets. */
export function Me() {
  const s = useStore()
  const st = achStats(s)
  const [tab, setTab] = useState<'album' | 'medals'>('album')
  const toNext = XP_PER_STICKER - (s.xp % XP_PER_STICKER)
  return (
    <div className="practice">
      <section className="profile">
        <div className="profile-avatar">
          <Mascot size={74} />
          <span className="profile-kid">{s.childAvatar}</span>
        </div>
        <div className="profile-main">
          <h1>{s.childName}</h1>
          <div className="profile-stats">
            <span>⚡ {s.xp} XP</span>
            <span>🔥 {t('Rekord', 'Record')} {s.bestStreak}</span>
            <span>👑 {st.crowns}</span>
            <span>📚 {s.lessonsTotal}</span>
          </div>
        </div>
      </section>

      <div className="seg">
        <button className={tab === 'album' ? 'on' : ''} onClick={() => { setTab('album'); speak(t('Stickeralbum', 'Album degli adesivi')) }}>🏆 {t('Sticker', 'Adesivi')}</button>
        <button className={tab === 'medals' ? 'on' : ''} onClick={() => { setTab('medals'); speak(t('Medaillen', 'Medaglie')) }}>🥇 {t('Medaillen', 'Medaglie')}</button>
      </div>

      {tab === 'album' ? (
        <>
          <p className="muted small-print">
            {t('Noch', 'Ancora')} <b>{toNext} XP</b> {t('bis zum nächsten Sticker. Truhen und Aufgaben geben auch Sticker – oder kauf welche im Laden!', 'al prossimo adesivo. Anche forzieri e missioni danno adesivi – oppure comprali nel negozio!')}
          </p>
          <div className="bar"><div className="bar-fill" style={{ width: `${((XP_PER_STICKER - toNext) / XP_PER_STICKER) * 100}%` }} /></div>
          {STICKER_SETS.map((set) => {
            const items = STICKERS.filter((x) => x.set === set.id)
            const have = items.filter((x) => s.stickers.includes(x.id)).length
            return (
              <section key={set.id} className="sticker-set">
                <h2>
                  {set.emoji} {t(set.de, set.it)} <span className="set-count">{have}/{items.length}</span>
                  {have === items.length && <span className="set-done">✓ {t('komplett', 'completa')}</span>}
                </h2>
                <div className="album">
                  {items.map((x) => {
                    const open = s.stickers.includes(x.id)
                    return (
                      <button
                        key={x.id}
                        className={'sticker' + (open ? ' open' : '') + (x.rare ? ' rare' : '')}
                        onClick={() => speak(open ? t(x.de, x.it) : x.rare ? t('Ein seltener Sticker! Noch geheim.', 'Un adesivo raro! Ancora segreto.') : t('Noch geheim!', 'Ancora segreto!'))}
                        aria-label={open ? t(x.de, x.it) : t('Noch gesperrt', 'Ancora bloccato')}
                      >
                        <span className="sticker-emoji">{open ? x.emoji : '?'}</span>
                        <span className="sticker-name">{open ? t(x.de, x.it) : x.rare ? '✨' : ''}</span>
                      </button>
                    )
                  })}
                </div>
                {have < items.length && <p className="muted small-print">{t('Ganzes Set sammeln:', 'Completa la serie:')} +{SET_BONUS_GEMS} 💎</p>}
              </section>
            )
          })}
        </>
      ) : (
        <div className="medals">
          {ACHIEVEMENTS.map((a) => {
            const tier = tierOf(a, st)
            const v = a.value(st)
            const next = a.tiers[tier] ?? a.tiers[2]
            return (
              <button key={a.id} className={'medal' + (tier ? ' got' : '')} onClick={() => speak(`${t(a.de, a.it)}. ${tier < 3 ? t(`Noch ${next - v} ${a.unit} bis zur nächsten Medaille.`, `Ancora ${next - v} ${a.unitIt} alla prossima medaglia.`) : t('Goldmedaille!', 'Medaglia d’oro!')}`)}>
                <span className="medal-emoji">{a.emoji}</span>
                <span className="medal-main">
                  <b>{t(a.de, a.it)}</b>
                  <span className="mini-bar"><span style={{ width: `${Math.min(1, v / next) * 100}%` }} /></span>
                  <span className="muted">{Math.min(v, next)} / {next} {t(a.unit, a.unitIt)}</span>
                </span>
                <span className="medal-tiers">{[1, 2, 3].map((t) => <span key={t} className={t <= tier ? 'on' : ''}>{MEDALS[t]}</span>)}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
