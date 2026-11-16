import { useEffect, useState } from 'react'
import { ACHIEVEMENTS, MEDALS } from '../data/achievements'
import { todaysQuests, useStore, type LessonResult } from '../lib/store'
import { speak } from '../lib/speech'
import { todayKey } from '../lib/util'
import { t } from '../lib/i18n'
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
    const tm = setTimeout(() => {
      if (claimable) speak(t('Alle Tagesaufgaben geschafft! Hol dir deine Belohnung!', 'Missioni di oggi completate! Prendi il tuo premio!'))
      else if (result.newStickers.length) speak(t('Du hast einen neuen Sticker!', 'Hai un nuovo adesivo!'))
      else if (result.newMedals.length) speak(t('Du hast eine neue Medaille!', 'Hai una nuova medaglia!'))
      else {
        const open = quests.find((q) => !q.done)
        if (open) speak(open.q.left(open.q.target - open.v))
      }
    }, 600)
    return () => clearTimeout(tm)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (chest) return <ChestReveal title={t('Tagesaufgaben geschafft!', 'Missioni completate!')} open={() => s.claimQuests() ?? EMPTY} onDone={onNext} />

  return (
    <div className="end">
      <div className="end-top">
        <h1 className="end-title">🎯 {t('Tagesaufgaben', 'Missioni di oggi')}</h1>
      </div>
      <QuestList animate big />
      {(result.newStickers.length > 0 || result.setsCompleted.length > 0) && <RewardList reward={{ ...EMPTY, stickers: result.newStickers, setsCompleted: result.setsCompleted }} />}
      {result.newMedals.map((m) => {
        const a = ACHIEVEMENTS.find((x) => x.id === m.id)!
        return (
          <div key={m.id + m.tier} className="medal-new">
            <span className="medal-new-emoji">{MEDALS[m.tier]}</span>
            <span>
              {t('Neue Medaille:', 'Nuova medaglia:')} <b>{a.emoji} {t(a.de, a.it)}</b>
            </span>
          </div>
        )
      })}
      <footer className="lesson-foot">
        {claimable ? (
          <button className="btn yellow block pulse" onClick={guard(() => setChest(true))}>
            🎁 {t('Belohnung holen', 'Prendi il premio')}
          </button>
        ) : (
          <button className="btn green block" onClick={guard(onNext)}>
            {t('Weiter', 'Avanti')} ➜
          </button>
        )}
      </footer>
    </div>
  )
}
