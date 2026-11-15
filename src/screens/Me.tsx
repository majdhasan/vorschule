import { useState } from 'react'
import { ACHIEVEMENTS, MEDALS, tierOf } from '../data/achievements'
import { STICKER_SETS, STICKERS, SET_BONUS_GEMS } from '../data/misc'
import { achStats, XP_PER_STICKER, useStore } from '../lib/store'
import { speak, speakBoth } from '../lib/speech'
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
            <span>🔥 Rekord {s.bestStreak}</span>
            <span>👑 {st.crowns}</span>
            <span>📚 {s.lessonsTotal}</span>
          </div>
        </div>
      </section>

      <div className="seg">
        <button className={tab === 'album' ? 'on' : ''} onClick={() => { setTab('album'); speak('Stickeralbum', 'de') }}>🏆 Sticker</button>
        <button className={tab === 'medals' ? 'on' : ''} onClick={() => { setTab('medals'); speak('Medaillen', 'de') }}>🥇 Medaillen</button>
      </div>

      {tab === 'album' ? (
        <>
          <p className="muted small-print">
            Noch <b>{toNext} XP</b> bis zum nächsten Sticker. Truhen und Aufgaben geben auch Sticker – oder kauf welche im Laden!
          </p>
          <div className="bar"><div className="bar-fill" style={{ width: `${((XP_PER_STICKER - toNext) / XP_PER_STICKER) * 100}%` }} /></div>
          {STICKER_SETS.map((set) => {
            const items = STICKERS.filter((x) => x.set === set.id)
            const have = items.filter((x) => s.stickers.includes(x.id)).length
            return (
              <section key={set.id} className="sticker-set">
                <h2>
                  {set.emoji} {set.de} <span className="set-count">{have}/{items.length}</span>
                  {have === items.length && <span className="set-done">✓ komplett</span>}
                </h2>
                <div className="album">
                  {items.map((x) => {
                    const open = s.stickers.includes(x.id)
                    return (
                      <button
                        key={x.id}
                        className={'sticker' + (open ? ' open' : '') + (x.rare ? ' rare' : '')}
                        onClick={() => (open ? speakBoth(x.de, x.it, s.bilingual) : speak(x.rare ? 'Ein seltener Sticker! Noch geheim.' : 'Noch geheim!', 'de'))}
                        aria-label={open ? x.de : 'Noch gesperrt'}
                      >
                        <span className="sticker-emoji">{open ? x.emoji : '?'}</span>
                        <span className="sticker-name">{open ? x.de : x.rare ? '✨' : ''}</span>
                      </button>
                    )
                  })}
                </div>
                {have < items.length && <p className="muted small-print">Ganzes Set sammeln: +{SET_BONUS_GEMS} 💎</p>}
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
              <button key={a.id} className={'medal' + (tier ? ' got' : '')} onClick={() => speak(`${a.de}. ${tier < 3 ? `Noch ${next - v} ${a.unit} bis zur nächsten Medaille.` : 'Goldmedaille!'}`, 'de')}>
                <span className="medal-emoji">{a.emoji}</span>
                <span className="medal-main">
                  <b>{a.de}</b>
                  <span className="mini-bar"><span style={{ width: `${Math.min(1, v / next) * 100}%` }} /></span>
                  <span className="muted">{Math.min(v, next)} / {next} {a.unit}</span>
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
