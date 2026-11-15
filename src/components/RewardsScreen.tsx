import { useEffect, useState } from 'react'
import { ACHIEVEMENTS, MEDALS } from '../data/achievements'
import { todaysQuests, useStore, type LessonResult } from '../lib/store'
import { speak } from '../lib/speech'
import { todayKey } from '../lib/util'
import { useTapGuard } from '../hooks/useTapGuard'
import { QuestList } from './Quests'
import { ChestReveal, RewardList } from './RewardReveal'

const EMPTY = { xp: 0, gems: 0, stickers: [], setsCompleted: [] }

/** After a lesson: quest progress, claimable quest chest, new stickers and medals. */
export function RewardsScreen({ result, onNext }: { result: LessonResult; onNext: () => void }) {
  const s = useStore()
  const quests = todaysQuests(s)
  const claimable = quests.every((q) => q.done) && s.questClaimDay !== todayKey()
  const [chest, setChest] = useState(false)
  const guard = useTapGuard(chest, 500)

  useEffect(() => {
    const t = setTimeout(() => {
      if (claimable) speak('Alle Tagesaufgaben geschafft! Hol dir deine Belohnung!', 'de')
      else if (result.newStickers.length) speak('Du hast einen neuen Sticker!', 'de')
      else if (result.newMedals.length) speak('Du hast eine neue Medaille!', 'de')
      else {
        const open = quests.find((q) => !q.done)
        if (open) speak(open.q.left(open.q.target - open.v), 'de')
      }
    }, 600)
    return () => clearTimeout(t)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (chest) return <ChestReveal title="Tagesaufgaben geschafft!" open={() => s.claimQuests() ?? EMPTY} onDone={onNext} />

  return (
    <div className="end">
      <div className="end-top">
        <h1 className="end-title">🎯 Tagesaufgaben</h1>
        {s.bilingual && <div className="end-sub">Missioni di oggi</div>}
      </div>
      <QuestList animate big />
      {(result.newStickers.length > 0 || result.setsCompleted.length > 0) && <RewardList reward={{ ...EMPTY, stickers: result.newStickers, setsCompleted: result.setsCompleted }} />}
      {result.newMedals.map((m) => {
        const a = ACHIEVEMENTS.find((x) => x.id === m.id)!
        return (
          <div key={m.id + m.tier} className="medal-new">
            <span className="medal-new-emoji">{MEDALS[m.tier]}</span>
            <span>
              Neue Medaille: <b>{a.emoji} {a.de}</b>
            </span>
          </div>
        )
      })}
      <footer className="lesson-foot">
        {claimable ? (
          <button className="btn yellow block pulse" onClick={guard(() => setChest(true))}>
            🎁 Belohnung holen
          </button>
        ) : (
          <button className="btn green block" onClick={guard(onNext)}>
            Weiter ➜
          </button>
        )}
      </footer>
    </div>
  )
}
