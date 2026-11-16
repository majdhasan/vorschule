import { useState, type ComponentType } from 'react'
import { ChoiceGame, type GameProps, type LessonOutcome, type Round } from '../components/ChoiceGame'
import { EndScreen } from '../components/EndScreen'
import { StreakScreen } from '../components/StreakScreen'
import { RewardsScreen } from '../components/RewardsScreen'
import { gameById, GAMES } from '../games'
import type { BuildCtx } from '../games/types'
import { findNode, lessonsOf, unitById } from '../data/path'
import { streakInfo, todaysQuests, useStore, type LessonResult, type Src } from '../lib/store'
import { stopSpeech } from '../lib/speech'
import { shuffle, todayKey } from '../lib/util'
import { t } from '../lib/i18n'

export type Launch =
  | { kind: 'node'; nodeId: string; gameId: string; level: number }
  | { kind: 'practice'; gameId: string; level: number; listen?: boolean }
  | { kind: 'mistakes' }

type Built = { gameId: string; level: number; rounds?: Round[]; Component?: ComponentType<GameProps> }

const stamp = (rounds: Round[], g: string, l: number): Round[] => rounds.map((r) => ({ ...r, src: { g, l, item: r.item } }))

function build(launch: Launch, ctx: BuildCtx, mistakes: Src[]): Built {
  if (launch.kind === 'mistakes') {
    const picked = mistakes.filter((m) => gameById(m.g)?.build).slice(0, 8)
    const groups = new Map<string, Src[]>()
    for (const m of picked) groups.set(`${m.g}|${m.l}`, [...(groups.get(`${m.g}|${m.l}`) ?? []), m])
    let rounds: Round[] = []
    for (const list of groups.values()) {
      const { g, l } = list[0]
      const items = list.map((m) => m.item).filter((x): x is string => !!x)
      rounds.push(...stamp(gameById(g).build!(l, { ...ctx, focus: items, count: list.length }), g, l))
    }
    // short lists are topped up with fresh questions from the same games
    for (const list of groups.values()) {
      if (rounds.length >= 5) break
      const { g, l } = list[0]
      rounds.push(...stamp(gameById(g).build!(l, { ...ctx, count: 2 }), g, l))
    }
    rounds = shuffle(rounds).slice(0, 8)
    return { gameId: 'mistakes', level: 1, rounds }
  }
  if (launch.kind === 'node' && launch.gameId === 'review') {
    const entry = findNode(launch.nodeId)!
    const unit = unitById(entry.node.kind === 'review' ? entry.node.unit : entry.unit.id)
    const games = [...new Set(lessonsOf(unit).map((l) => l.game))].map(gameById).filter((g) => g.build)
    const rounds = shuffle(games.flatMap((g) => stamp(g.build!(launch.level, { ...ctx, count: 2 }), g.id, launch.level))).slice(0, 10)
    return { gameId: 'review', level: launch.level, rounds }
  }
  const g = gameById(launch.gameId)
  if (g.build) return { gameId: g.id, level: launch.level, rounds: stamp(g.build(launch.level, ctx), g.id, launch.level) }
  return { gameId: g.id, level: launch.level, Component: g.component }
}

export function GameScreen({ launch, onHome }: { launch: Launch; onHome: () => void }) {
  const s = useStore()
  const [built] = useState(() => build(launch, { childName: s.childName }, s.mistakes))
  const [step, setStep] = useState<'play' | 'end' | 'streak' | 'rewards'>('play')
  const [result, setResult] = useState<LessonResult | null>(null)

  const close = () => {
    stopSpeech()
    onHome()
  }

  const onFinish = (o: LessonOutcome) => {
    const r = s.recordLesson({
      kind: launch.kind,
      nodeId: launch.kind === 'node' ? launch.nodeId : undefined,
      gameId: built.gameId,
      level: built.level,
      ...o,
    })
    setResult(r)
    setStep('end')
  }

  const afterEnd = (r: LessonResult) => {
    if (r.adult) return close()
    if (r.streakExtended) return setStep('streak')
    afterStreak(r)
  }
  const afterStreak = (r: LessonResult) => {
    const st = useStore.getState()
    const claimable = todaysQuests(st).every((q) => q.done) && st.questClaimDay !== todayKey()
    if (r.questsAfter > r.questsBefore || r.newStickers.length || r.newMedals.length || r.setsCompleted.length || claimable) setStep('rewards')
    else close()
  }

  if (step === 'end' && result) {
    const g = GAMES.find((x) => x.id === built.gameId)
    const levelUpText = g && result.levelUp ? `⬆️ ${g.emoji} ${t(g.title, g.titleIt)}: ${t('neue Stufe', 'nuovo livello')} ${'⭐'.repeat(s.games[g.id]?.level ?? 1)}` : undefined
    const member = s.members.find((m) => m.id === s.activeMember)
    return <EndScreen result={result} levelUpText={levelUpText} playerName={member?.name} onNext={() => afterEnd(result)} />
  }
  if (step === 'streak' && result) {
    return (
      <StreakScreen
        streak={result.streak}
        saved={result.streakSaved}
        milestone={result.milestone}
        lessonDays={s.lessonDays}
        freezes={s.freezes}
        doneToday={streakInfo(s).doneToday}
        onNext={() => afterStreak(result)}
      />
    )
  }
  if (step === 'rewards' && result) return <RewardsScreen result={result} onNext={close} />

  if (built.rounds) {
    return <ChoiceGame rounds={built.rounds} onFinish={onFinish} onClose={close} listenOnly={launch.kind === 'practice' && launch.listen} />
  }
  const C = built.Component!
  return <C level={built.level} childName={s.childName} onFinish={onFinish} onClose={close} />
}
