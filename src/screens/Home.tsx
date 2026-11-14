import { useEffect, useMemo } from 'react'
import { AREAS, GAMES, type Area, type Game } from '../games'
import { statsFor, useStore } from '../lib/store'
import { speak, speakBoth } from '../lib/speech'
import { Mascot } from '../components/Mascot'

type Props = { onPlay: (id: string) => void; onStickers: () => void; onParents: () => void }

/** Pick 3 games for today: least played / weakest first, rotating by day. */
function dailyPlan(games: ReturnType<typeof useStore.getState>['games'], doneToday: string[]): Game[] {
  const scored = GAMES.map((g) => {
    const s = statsFor(games, g.id)
    const acc = s.total ? s.correct / s.total : 0.5
    const score = s.plays * 2 + acc * 3 + (doneToday.includes(g.id) ? 100 : 0) + Math.random()
    return { g, score }
  })
  scored.sort((a, b) => a.score - b.score)
  // ensure variety: one per area where possible
  const out: Game[] = []
  const areas = new Set<Area>()
  for (const { g } of scored) {
    if (out.length >= 3) break
    if (!areas.has(g.area)) {
      out.push(g)
      areas.add(g.area)
    }
  }
  for (const { g } of scored) {
    if (out.length >= 3) break
    if (!out.includes(g)) out.push(g)
  }
  return out
}

export function Home({ onPlay, onStickers, onParents }: Props) {
  const { childName, bilingual, totalStars, streak, games, doneToday, stickersUnlocked, touchDay } = useStore()
  useEffect(() => touchDay(), [touchDay])
  const plan = useMemo(() => dailyPlan(games, doneToday), []) // eslint-disable-line react-hooks/exhaustive-deps

  const greet = () => {
    const h = new Date().getHours()
    const de = h < 11 ? 'Guten Morgen' : h < 18 ? 'Hallo' : 'Guten Abend'
    const it = h < 11 ? 'Buongiorno' : h < 18 ? 'Ciao' : 'Buonasera'
    speakBoth(`${de}${childName ? ', ' + childName : ''}! Was möchtest du heute spielen?`, `${it}${childName ? ', ' + childName : ''}!`, bilingual)
  }

  return (
    <div className="home">
      <header className="home-head">
        <button className="mascot-btn" onClick={greet} aria-label="Berli begrüßt dich">
          <Mascot mood="wave" size={64} />
        </button>
        <div className="home-title">
          <h1>{childName ? `Hallo ${childName}!` : 'Hallo!'}</h1>
          <div className="home-sub">Berli – fit für die Schule</div>
        </div>
        <div className="home-stats">
          <button className="stat" onClick={onStickers} aria-label="Sticker">
            <span>⭐</span> {totalStars}
          </button>
          <div className="stat">
            <span>🔥</span> {streak}
          </div>
        </div>
      </header>

      <section>
        <h2 onClick={() => speak('Heute für dich: drei Aufgaben!', 'de')}>
          🎯 Heute für dich {doneToday.length >= 3 && <span className="done-badge">✅ geschafft!</span>}
        </h2>
        <div className="plan">
          {plan.map((g, i) => {
            const done = doneToday.includes(g.id)
            return (
              <button key={g.id} className={'plan-card' + (done ? ' done' : '')} style={{ background: g.color }} onClick={() => onPlay(g.id)}>
                <span className="plan-num">{done ? '✅' : i + 1}</span>
                <span className="plan-emoji">{g.emoji}</span>
                <span className="plan-title">{g.title}</span>
                {bilingual && <span className="plan-it">{g.titleIt}</span>}
              </button>
            )
          })}
        </div>
      </section>

      {(Object.keys(AREAS) as Area[]).map((area) => (
        <section key={area}>
          <h2>
            {AREAS[area].emoji} {AREAS[area].de}
            {bilingual && <span className="h2-it"> · {AREAS[area].it}</span>}
          </h2>
          <div className="grid">
            {GAMES.filter((g) => g.area === area).map((g) => {
              const s = statsFor(games, g.id)
              return (
                <button key={g.id} className="game-card" style={{ ['--c' as string]: g.color }} onClick={() => onPlay(g.id)}>
                  <span className="game-emoji">{g.emoji}</span>
                  <span className="game-title">{g.title}</span>
                  <span className="game-meta">
                    {'⭐'.repeat(Math.min(3, s.level))}
                    {s.stars > 0 && <span className="game-stars"> {s.stars}</span>}
                  </span>
                </button>
              )
            })}
          </div>
        </section>
      ))}

      <nav className="bottom-nav">
        <button className="nav-btn" onClick={onStickers}>
          🏆 Sticker <span className="pill">{stickersUnlocked}</span>
        </button>
        <button className="nav-btn ghost" onClick={onParents}>
          👨‍👩‍👦 Eltern
        </button>
      </nav>
    </div>
  )
}
