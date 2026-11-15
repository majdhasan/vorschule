import { useEffect, useMemo, useState } from 'react'
import { UNITS, type PathNode, type Unit } from '../data/path'
import { gameById } from '../games'
import { pathStatus, QUESTS, useStore } from '../lib/store'
import { speak, speakBoth } from '../lib/speech'
import { Mascot } from '../components/Mascot'
import { Sheet } from '../components/Sheet'
import { STICKERS } from '../data/misc'

type Props = { onLesson: (nodeId: string, gameId: string, level: number) => void }

const OFFSETS = [0, 46, 72, 46, 0, -46, -72, -46]

export function Path({ onLesson }: Props) {
  const s = useStore()
  useEffect(() => s.touchDay(), []) // eslint-disable-line react-hooks/exhaustive-deps
  const status = useMemo(() => pathStatus(s.nodes), [s.nodes])
  const [sel, setSel] = useState<{ node: PathNode; unit: Unit; index: number } | null>(null)
  const [chest, setChest] = useState<{ xp: number; sticker: string } | null>(null)

  const unitStarts = UNITS.reduce<number[]>((acc, _u, i) => [...acc, i === 0 ? 0 : acc[i - 1] + UNITS[i - 1].nodes.length], [])
  const questsDone = QUESTS.filter((q) => s[q.key] >= q.target).length

  const openNode = (node: PathNode, unit: Unit, index: number) => {
    const unlocked = status.isUnlocked(index)
    if (!unlocked) {
      speak('Schaffe zuerst die Lektionen davor!', 'de')
      setSel({ node, unit, index })
      return
    }
    if (node.kind === 'chest') {
      if (s.nodes[node.id]?.done) return
      const r = s.openChest(node.id)
      const st = STICKERS[(s.stickersUnlocked) % STICKERS.length]
      setChest({ xp: r.xp, sticker: `${st.emoji} ${st.de}` })
      speakBoth(`Eine Schatztruhe! Du bekommst ${r.xp} XP und den Sticker ${st.de}!`, 'Un forziere!', s.bilingual)
      return
    }
    const g = gameById(node.game)
    speakBoth(g.title, g.titleIt, s.bilingual)
    setSel({ node, unit, index })
  }

  return (
    <div className="path">
      <header className="topbar-stats">
        <span className="tstat" title="Serie">🔥 {s.streak}</span>
        <span className="tstat" title="XP">⚡ {s.xp}</span>
        <span className="tstat" title="Sticker">🏆 {s.stickersUnlocked}</span>
      </header>

      <section className="quests-card" onClick={() => speak('Deine Tagesaufgaben: ' + QUESTS.map((q) => q.de).join('. '), 'de')}>
        <div className="quests-head">
          <span>🎯 Tagesaufgaben</span>
          <span className="muted">{questsDone} / {QUESTS.length}</span>
        </div>
        {QUESTS.map((q) => {
          const v = Math.min(q.target, s[q.key])
          return (
            <div key={q.id} className={'quest' + (v >= q.target ? ' done' : '')}>
              <span className="quest-emoji">{q.emoji}</span>
              <div className="quest-main">
                <div className="quest-title">{q.de}</div>
                <div className="quest-bar">
                  <div className="quest-fill" style={{ width: `${(v / q.target) * 100}%` }} />
                  <span className="quest-num">{v} / {q.target}</span>
                </div>
              </div>
            </div>
          )
        })}
      </section>

      {UNITS.map((unit, ui) => {
        const unitStart = unitStarts[ui]
        const nodesEls = unit.nodes.map((node, ni) => {
          const index = unitStart + ni
          const unlocked = status.isUnlocked(index)
          const done = status.isDone(node.id)
          const current = index === status.currentIndex
          const offset = OFFSETS[ni % OFFSETS.length]
          const stars = s.nodes[node.id]?.stars ?? 0
          const label = node.kind === 'chest' ? 'Truhe' : gameById(node.game).title
          const icon = node.kind === 'chest' ? (done ? '📭' : '🎁') : done ? '⭐' : gameById(node.game).emoji
          return (
            <div key={node.id} className="node-row" style={{ transform: `translateX(${offset}px)` }}>
              {current && (
                <div className="start-bubble" style={{ color: unit.color }}>
                  {node.kind === 'chest' ? 'ÖFFNEN' : 'START'}
                </div>
              )}
              <button
                className={'node' + (node.kind === 'chest' ? ' chest' : '') + (unlocked ? '' : ' locked') + (done ? ' done' : '') + (current ? ' current' : '')}
                style={unlocked ? ({ ['--c' as string]: unit.color, ['--d' as string]: unit.dark } as React.CSSProperties) : undefined}
                onClick={() => openNode(node, unit, index)}
                aria-label={label}
              >
                {done && node.kind === 'lesson' && (
                  <span className="node-ring" style={{ background: `conic-gradient(#FFC800 ${(stars / 3) * 360}deg, #E5E5E5 0)` }} />
                )}
                <span className="node-icon">{icon}</span>
              </button>
              {current && <div className={'node-mascot' + (offset > 0 ? ' left' : ' right')}><Mascot mood="wave" size={64} /></div>}
              {node.kind === 'lesson' && <div className="node-label">{label}</div>}
            </div>
          )
        })
        const unitDone = unit.nodes.every((n) => status.isDone(n.id))
        const unitLocked = !status.isUnlocked(unitStart)
        return (
          <section key={unit.id} className="unit">
            <div className="unit-head" style={{ background: unitLocked ? '#AFAFAF' : unit.color, boxShadow: `0 4px 0 ${unitLocked ? '#8a8a8a' : unit.dark}` }}>
              <div>
                <div className="unit-kicker">Einheit {ui + 1}{unitDone ? ' · ✓' : ''}</div>
                <div className="unit-title">{unit.title}</div>
                {s.bilingual && <div className="unit-it">{unit.titleIt}</div>}
              </div>
              <span className="unit-emoji">{unit.emoji}</span>
            </div>
            <div className="nodes">{nodesEls}</div>
          </section>
        )
      })}

      <div className="path-end">
        <Mascot mood="happy" size={80} />
        <p>Mehr Lektionen kommen bald!</p>
      </div>

      <Sheet open={!!sel} onClose={() => setSel(null)} color={sel?.unit.color}>
        {sel && sel.node.kind === 'lesson' && (() => {
          const ln = sel.node
          const g = gameById(ln.game)
          const unlocked = status.isUnlocked(sel.index)
          const prog = s.nodes[sel.node.id]
          return (
            <div className={'node-sheet' + (unlocked ? '' : ' locked')}>
              <div className="node-sheet-title">
                {g.emoji} {g.title} <span className="lvl">Stufe {ln.level}</span>
              </div>
              <div className="node-sheet-sub">{s.bilingual ? `${g.titleIt} · ` : ''}{g.skill}</div>
              {prog?.done && <div className="node-sheet-stars">{'⭐'.repeat(prog.stars)}{'☆'.repeat(3 - prog.stars)} · Beste: {Math.round(prog.acc * 100)}%</div>}
              {unlocked ? (
                <button className="btn white block" onClick={() => { setSel(null); onLesson(ln.id, ln.game, ln.level) }}>
                  {prog?.done ? 'Nochmal üben · +5 XP' : 'Lektion starten · +10 XP'}
                </button>
              ) : (
                <button className="btn gray block" disabled>🔒 Noch gesperrt</button>
              )}
            </div>
          )
        })()}
        {sel && sel.node.kind === 'chest' && (
          <div className="node-sheet locked">
            <div className="node-sheet-title">🎁 Schatztruhe</div>
            <div className="node-sheet-sub">Schaffe alle Lektionen dieser Einheit, dann darfst du sie öffnen!</div>
            <button className="btn gray block" disabled>🔒 Noch gesperrt</button>
          </div>
        )}
      </Sheet>

      <Sheet open={!!chest} onClose={() => setChest(null)} color="#FFC800">
        {chest && (
          <div className="node-sheet">
            <div className="chest-open">🎉</div>
            <div className="node-sheet-title">Truhe geöffnet!</div>
            <div className="node-sheet-sub">+{chest.xp} XP · Neuer Sticker: {chest.sticker}</div>
            <button className="btn white block" onClick={() => setChest(null)}>Weiter</button>
          </div>
        )}
      </Sheet>
    </div>
  )
}
