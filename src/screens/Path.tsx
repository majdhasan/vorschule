import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { UNITS, type PathNode, type Unit } from '../data/path'
import { THEMES } from '../data/misc'
import { gameById } from '../games'
import { capReached, nodePlayLevel, pathStatus, streakInfo, todaysQuests, useStore } from '../lib/store'
import { speak } from '../lib/speech'
import { t } from '../lib/i18n'
import { readableDark, todayKey } from '../lib/util'
import { Mascot } from '../components/Mascot'
import { Sheet } from '../components/Sheet'
import { QuestList } from '../components/Quests'
import { ChestReveal } from '../components/RewardReveal'
import { StreakScreen } from '../components/StreakScreen'
import type { Launch } from './GameScreen'

type Props = { onLesson: (l: Launch) => void }

const OFFSETS = [0, 46, 72, 46, 0, -46, -72, -46]
const EMPTY = { xp: 0, gems: 0, stickers: [], setsCompleted: [] }

// Scroll position when a lesson was started; on return we restore it and glide to the new current node.
let savedScroll: number | null = null

type Sel = { node: PathNode; unit: Unit; index: number }

export function Path({ onLesson }: Props) {
  const s = useStore()
  useEffect(() => s.rollDay(), []) // eslint-disable-line react-hooks/exhaustive-deps
  const status = useMemo(() => pathStatus(s.nodes), [s.nodes])
  const [sel, setSel] = useState<Sel | null>(null)
  const [chest, setChest] = useState<string | null>(null)
  const [sheet, setSheet] = useState<null | 'quests' | 'league' | 'streak' | 'claim'>(null)
  const [jump, setJump] = useState<null | 'up' | 'down'>(null)
  const currentRef = useRef<HTMLDivElement>(null)
  const capped = capReached(s)
  const sk = streakInfo(s)
  const quests = todaysQuests(s)
  const questsDone = quests.filter((q) => q.done).length
  const claimable = questsDone === quests.length && s.questClaimDay !== todayKey() && !s.activeMember
  const theme = THEMES.find((t) => t.id === s.theme) ?? THEMES[0]
  const member = s.members.find((m) => m.id === s.activeMember)

  const unitStarts = UNITS.reduce<number[]>((acc, _u, i) => [...acc, i === 0 ? 0 : acc[i - 1] + UNITS[i - 1].nodes.length], [])

  // --- auto-scroll to where the child left off ---
  const scrollToCurrent = (smooth: boolean) => currentRef.current?.scrollIntoView({ block: 'center', behavior: smooth ? 'smooth' : 'auto' })
  useLayoutEffect(() => {
    if (savedScroll !== null) {
      window.scrollTo(0, savedScroll)
      savedScroll = null
      const tm = setTimeout(() => scrollToCurrent(true), 350)
      return () => clearTimeout(tm)
    }
    scrollToCurrent(false)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const el = currentRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => setJump(e.isIntersecting ? null : e.boundingClientRect.top < 0 ? 'up' : 'down'), { rootMargin: '-60px 0px -90px 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [status.currentIndex])

  const start = (l: Launch) => {
    savedScroll = window.scrollY
    onLesson(l)
  }

  const openNode = (node: PathNode, unit: Unit, index: number) => {
    if (!status.isUnlocked(index)) {
      speak(t('Schaffe zuerst die Lektionen davor!', 'Prima completa le lezioni precedenti!'))
      setSel({ node, unit, index })
      return
    }
    if (node.kind === 'chest') {
      if (status.isDone(node.id)) return void speak(t('Diese Truhe hast du schon geöffnet.', 'Hai già aperto questo forziere.'))
      if (s.activeMember) return void speak(t('Die Truhe darf nur das Kind öffnen.', 'Solo il bambino può aprire il forziere.'))
      setChest(node.id)
      return
    }
    if (node.kind === 'review') speak(t('Die Prüfung! Alle Spiele dieser Einheit gemischt.', 'La verifica! Tutti i giochi di questa unità mescolati.'))
    else {
      const g = gameById(node.game)
      speak(t(g.title, g.titleIt))
    }
    setSel({ node, unit, index })
  }

  const continueUnit = () => {
    scrollToCurrent(true)
    const entry = UNITS.flatMap((u, ui) => u.nodes.map((n, ni) => ({ n, u, i: unitStarts[ui] + ni }))).find((x) => x.i === status.currentIndex)
    if (entry) setTimeout(() => openNode(entry.n, entry.u, entry.i), 400)
  }

  // league board
  const board = [{ id: '', name: s.childName, avatar: s.childAvatar, xp: s.childWeekXp }, ...s.members.map((m) => ({ id: m.id, name: m.name, avatar: m.avatar, xp: m.weekXp }))].sort((a, b) => b.xp - a.xp)
  const myRank = board.findIndex((b) => b.id === '') + 1
  const goalPct = Math.min(1, s.daily.xp / s.dailyGoal)

  return (
    <div className={'path theme-' + (theme.id || 'standard')}>
      <header className="topbar-stats">
        <div className="topbar-inner">
          <button className={'tstat' + (sk.doneToday ? '' : ' cold')} onClick={() => setSheet('streak')} aria-label={t(`Serie ${sk.streak} Tage`, `Serie di ${sk.streak} giorni`)}>
            🔥 {sk.streak}
          </button>
          <button className="tstat" onClick={() => speak(t(`Du hast ${s.gems} Edelsteine. Im Laden kannst du damit Sachen kaufen.`, `Hai ${s.gems} gemme. Nel negozio puoi comprarci delle cose.`))} aria-label={t(`${s.gems} Edelsteine`, `${s.gems} gemme`)}>
            💎 {s.gems}
          </button>
          <button className="tstat goal" onClick={() => speak(goalPct >= 1 ? t('Tagesziel geschafft!', 'Obiettivo del giorno raggiunto!') : t(`Noch ${s.dailyGoal - s.daily.xp} XP bis zum Tagesziel.`, `Ancora ${s.dailyGoal - s.daily.xp} XP all’obiettivo del giorno.`))} aria-label={t('Tagesziel', 'Obiettivo del giorno')}>
            <span className="goal-ring" style={{ ['--p' as string]: `${goalPct * 360}deg` } as React.CSSProperties}>
              <span>⚡</span>
            </span>
            {s.xp}
          </button>
        </div>
      </header>

      {member && (
        <div className="adult-banner">
          <span>
            {member.avatar} {member.name} {t('spielt gerade', 'sta giocando')}
          </span>
          <button className="btn small white" onClick={() => s.setActiveMember('')}>
            {t('Zurück zu', 'Torna a')} {s.childName}
          </button>
        </div>
      )}

      {capped && (
        <div className="cap-banner">
          <Mascot mood="sleep" size={56} />
          <div>
            <b>{t('Berli macht Pause – bis morgen!', 'Berli fa una pausa – a domani!')}</b>
            <div className="muted">{t(`Heute hast du schon ${s.daily.lessons} Lektionen geschafft. Toll!`, `Oggi hai già fatto ${s.daily.lessons} lezioni. Bravo!`)}</div>
          </div>
        </div>
      )}

      <div className="chips-row">
        <button className={'chip-card' + (claimable ? ' glow' : '')} onClick={() => { setSheet('quests'); speak(claimable ? t('Hol dir deine Belohnung!', 'Prendi il tuo premio!') : t('Deine Tagesaufgaben', 'Le tue missioni di oggi')) }}>
          <span className="chip-emoji">{claimable ? '🎁' : '🎯'}</span>
          <span className="chip-main">
            <span className="chip-title">{t('Aufgaben', 'Missioni')}</span>
            <span className="mini-bar"><span style={{ width: `${(questsDone / quests.length) * 100}%` }} /></span>
          </span>
          <span className="chip-num">{questsDone}/{quests.length}</span>
        </button>
        <button className="chip-card" onClick={() => { setSheet('league'); speak(s.members.length ? t(`Familien-Liga: Du bist auf Platz ${myRank}.`, `Lega di famiglia: sei al posto numero ${myRank}.`) : t('Familien-Liga', 'Lega di famiglia')) }}>
          <span className="chip-emoji">🏅</span>
          <span className="chip-main">
            <span className="chip-title">{t('Liga', 'Lega')}</span>
            <span className="chip-sub">{s.members.length ? t(`Platz ${myRank}`, `${myRank}° posto`) : t('Familie', 'Famiglia')}</span>
          </span>
        </button>
      </div>

      {UNITS.map((unit, ui) => {
        const unitStart = unitStarts[ui]
        const nodesEls = unit.nodes.flatMap((node, ni) => {
          const index = unitStart + ni
          const unlocked = status.isUnlocked(index)
          const done = status.isDone(node.id)
          const current = index === status.currentIndex
          const offset = OFFSETS[ni % OFFSETS.length]
          const prog = s.nodes[node.id]
          const crowns = prog?.crowns ?? 0
          const legendary = crowns >= 3
          const g = node.kind === 'lesson' ? gameById(node.game) : null
          const label = node.kind === 'chest' ? t('Truhe', 'Forziere') : node.kind === 'review' ? t('Prüfung', 'Verifica') : t(g!.title, g!.titleIt)
          const icon = node.kind === 'chest' ? '🎁' : node.kind === 'review' ? '🏆' : gameById(node.game).emoji
          const deco = theme.deco.length && Math.abs(offset) >= 46 ? theme.deco[(index * 3) % theme.deco.length] : null
          const els = [
            <div
              key={node.id}
              ref={current ? currentRef : undefined}
              className={'node-row' + (current ? ' is-current' : '')}
              style={{ transform: `translateX(${offset}px)` }}
            >
              {current && (
                <div className="start-bubble" style={{ color: readableDark(unit.color, 4.5) }}>
                  {capped ? '💤' : node.kind === 'chest' ? t('ÖFFNEN', 'APRI') : t('START', 'VIA')}
                </div>
              )}
              <button
                className={
                  'node' + (node.kind !== 'lesson' ? ' ' + node.kind : '') + (unlocked ? '' : ' locked') + (done ? ' done' : '') + (current ? ' current' : '') + (legendary ? ' legendary' : '')
                }
                style={unlocked ? ({ ['--c' as string]: unit.color, ['--d' as string]: unit.dark } as React.CSSProperties) : undefined}
                onClick={() => openNode(node, unit, index)}
                aria-label={`${label}${done ? t(', geschafft', ', fatto') : unlocked ? '' : t(', gesperrt', ', bloccato')}`}
              >
                {done && node.kind !== 'chest' && <span className="node-ring" style={{ background: `conic-gradient(#FFC800 ${((prog?.stars ?? 0) / 3) * 360}deg, #E5E5E5 0)` }} />}
                <span className="node-icon">{icon}</span>
                {done && node.kind !== 'chest' && <span className={'node-badge' + (legendary ? ' gold' : '')}>{legendary ? '🏅' : `👑${crowns}`}</span>}
                {done && node.kind === 'chest' && <span className="node-badge">✓</span>}
              </button>
              {current && (
                <div className={'node-mascot' + (offset > 0 ? ' left' : ' right')}>
                  <Mascot mood={capped ? 'sleep' : 'wave'} size={64} />
                </div>
              )}
              {deco && <span className={'deco ' + (offset > 0 ? 'left' : 'right')}>{deco}</span>}
              <div className={'node-label' + (unlocked ? ' on' : '')}>{label}</div>
            </div>,
          ]
          if (ni < unit.nodes.length - 1) {
            const nextOffset = OFFSETS[(ni + 1) % OFFSETS.length]
            els.push(
              <div key={node.id + '-trail'} className={'trail' + (done ? ' done' : '')} style={{ ['--c' as string]: unit.color } as React.CSSProperties} aria-hidden>
                {[0.25, 0.5, 0.75].map((t) => (
                  <i key={t} style={{ transform: `translateX(${offset + (nextOffset - offset) * t}px)` }} />
                ))}
              </div>,
            )
          }
          return els
        })
        const unitDoneCount = unit.nodes.filter((n) => status.isDone(n.id)).length
        const unitLocked = !status.isUnlocked(unitStart)
        const isCurrentUnit = status.currentIndex >= unitStart && status.currentIndex < unitStart + unit.nodes.length
        return (
          <section key={unit.id} className="unit">
            <div className="unit-head" style={{ background: unitLocked ? '#AFAFAF' : unit.color, boxShadow: `0 4px 0 ${unitLocked ? '#8a8a8a' : unit.dark}` }}>
              <div className="unit-text">
                <div className="unit-kicker">
                  {t('Einheit', 'Unità')} {ui + 1} · {unitDoneCount}/{unit.nodes.length}
                  {unitDoneCount === unit.nodes.length ? ' ✓' : ''}
                </div>
                <div className="unit-title">{t(unit.title, unit.titleIt)}</div>
              </div>
              {isCurrentUnit && !capped ? (
                <button className="unit-go" onClick={continueUnit} style={{ color: readableDark(unit.color, 4.5) }}>
                  {t('Weiter', 'Avanti')} ➜
                </button>
              ) : (
                <span className="unit-emoji">{unit.emoji}</span>
              )}
            </div>
            <div className="nodes">{nodesEls}</div>
          </section>
        )
      })}

      <div className="path-end">
        <Mascot mood="happy" size={80} />
        <p>{t('Mehr Lektionen kommen bald!', 'Presto arriveranno altre lezioni!')}</p>
      </div>

      {jump && (
        <button className={'jump-btn ' + jump} onClick={() => scrollToCurrent(true)} aria-label={t('Zur aktuellen Lektion', 'Vai alla lezione attuale')}>
          {jump === 'up' ? '⬆' : '⬇'}
        </button>
      )}

      <NodeSheet sel={sel} status={status} capped={capped} onClose={() => setSel(null)} onStart={(l) => { setSel(null); start(l) }} />

      <Sheet open={sheet === 'quests'} onClose={() => setSheet(null)} light>
        <h2 className="sheet-h">🎯 {t('Tagesaufgaben', 'Missioni di oggi')}</h2>
        <QuestList />
        {claimable ? (
          <button className="btn yellow block pulse" onClick={() => setSheet('claim')}>
            🎁 {t('Belohnung holen', 'Prendi il premio')}
          </button>
        ) : (
          <p className="muted small-print">{t('Alle drei geschafft? Dann gibt es eine Truhe mit 💎 und einem Sticker!', 'Completate tutte e tre? Allora c’è un forziere con 💎 e un adesivo!')}</p>
        )}
      </Sheet>

      <Sheet open={sheet === 'league'} onClose={() => setSheet(null)} light>
        <h2 className="sheet-h">🏅 {t('Familien-Liga', 'Lega di famiglia')}</h2>
        <p className="muted small-print">{t('Wer sammelt diese Woche die meisten XP? Jeden Montag geht es von vorne los.', 'Chi raccoglie più XP questa settimana? Ogni lunedì si ricomincia.')}</p>
        <ol className="league">
          {board.map((b, i) => (
            <li key={b.id || 'child'} className={b.id === '' ? 'me' : ''}>
              <span className="league-rank">{['🥇', '🥈', '🥉'][i] ?? i + 1}</span>
              <span className="league-avatar">{b.avatar}</span>
              <span className="league-name">{b.name || t('Ich', 'Io')}</span>
              <span className="league-xp">{b.xp} XP</span>
            </li>
          ))}
        </ol>
        {s.lastWeek && <p className="muted small-print">{t('Letzte Woche:', 'Settimana scorsa:')} 🥇 {s.lastWeek.avatar} {s.lastWeek.name} {t('mit', 'con')} {s.lastWeek.xp} XP</p>}
        {!s.members.length && <p className="muted small-print">{t('Mama, Papa & Co. können im Elternbereich mitspielen.', 'Mamma, papà & co. possono giocare dall’area genitori.')}</p>}
      </Sheet>

      {sheet === 'streak' && (
        <div className="overlay-screen">
          <StreakScreen streak={sk.streak} lessonDays={s.lessonDays} freezes={s.freezes} doneToday={sk.doneToday} announce={false} onNext={() => setSheet(null)} />
        </div>
      )}
      {sheet === 'claim' && (
        <div className="overlay-screen">
          <ChestReveal title={t('Tagesaufgaben geschafft!', 'Missioni completate!')} open={() => s.claimQuests() ?? EMPTY} onDone={() => setSheet(null)} />
        </div>
      )}
      {chest && (
        <div className="overlay-screen">
          <ChestReveal title={t('Eine Schatztruhe!', 'Un forziere del tesoro!')} open={() => s.openChest(chest)} onDone={() => setChest(null)} />
        </div>
      )}
    </div>
  )
}

function NodeSheet({ sel, status, capped, onClose, onStart }: { sel: Sel | null; status: ReturnType<typeof pathStatus>; capped: boolean; onClose: () => void; onStart: (l: Launch) => void }) {
  const s = useStore()
  if (!sel) return null
  const unlocked = status.isUnlocked(sel.index)
  const node = sel.node
  const color = unlocked ? sel.unit.color : '#8a8a8a'
  if (node.kind === 'chest') {
    return (
      <Sheet open onClose={onClose} color={color}>
        <div className="node-sheet">
          <div className="node-sheet-title">🎁 {t('Schatztruhe', 'Forziere del tesoro')}</div>
          <div className="node-sheet-sub">{t('Schaffe alle Lektionen und die Prüfung dieser Einheit, dann darfst du sie öffnen!', 'Completa tutte le lezioni e la verifica di questa unità, poi potrai aprirlo!')}</div>
          <button className="btn locked block" disabled>🔒 {t('Noch gesperrt', 'Ancora bloccato')}</button>
        </div>
      </Sheet>
    )
  }
  const prog = s.nodes[node.id]
  const level = nodePlayLevel(node, prog)
  const crowns = prog?.crowns ?? 0
  const g = node.kind === 'lesson' ? gameById(node.game) : null
  const title = g ? `${g.emoji} ${t(g.title, g.titleIt)}` : `🏆 ${t('Prüfung', 'Verifica')}`
  const action = !prog?.done
    ? `${node.kind === 'review' ? t('Prüfung starten', 'Inizia la verifica') : t('Start', 'Inizia')} · +${node.kind === 'review' ? 15 : 10} XP`
    : crowns < 3
      ? t(`Krone ${crowns + 1} holen · +10 XP`, `Conquista la corona ${crowns + 1} · +10 XP`)
      : t('Nochmal üben · +5 XP', 'Ripassa · +5 XP')
  return (
    <Sheet open onClose={onClose} color={color}>
      <div className="node-sheet">
        <div className="node-sheet-title">
          {title} <span className="lvl">{'⭐'.repeat(level)}</span>
        </div>
        {node.kind === 'review' && <div className="node-sheet-sub">{t('Alle Spiele dieser Einheit gemischt. Schaffst du sie, geht die Truhe auf!', 'Tutti i giochi di questa unità mescolati. Se la superi, il forziere si apre!')}</div>}
        {prog?.done && (
          <div className="crowns-row" aria-label={t(`${crowns} von 3 Kronen`, `${crowns} corone su 3`)}>
            {[1, 2, 3].map((i) => (
              <span key={i} className={'crown' + (i <= crowns ? ' on' : '')}>
                👑
              </span>
            ))}
            {crowns >= 3 && <span className="legend-tag">🏅 {t('Legendär', 'Leggendario')}</span>}
          </div>
        )}
        {!unlocked ? (
          <button className="btn locked block" disabled>🔒 {t('Noch gesperrt', 'Ancora bloccato')}</button>
        ) : capped ? (
          <button className="btn locked block" disabled>💤 {t("Morgen geht's weiter", 'Si continua domani')}</button>
        ) : (
          <button
            className="btn white block big"
            onClick={() => onStart(node.kind === 'review' ? { kind: 'node', nodeId: node.id, gameId: 'review', level } : { kind: 'node', nodeId: node.id, gameId: node.game, level })}
          >
            ▶ {action}
          </button>
        )}
      </div>
    </Sheet>
  )
}
