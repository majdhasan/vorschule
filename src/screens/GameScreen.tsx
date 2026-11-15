import { useState } from 'react'
import { EndScreen } from '../components/EndScreen'
import { QuestScreen } from '../components/QuestScreen'
import { gameById } from '../games'
import { useStore, type LessonResult } from '../lib/store'
import { stopSpeech } from '../lib/speech'

type Props = { nodeId?: string; gameId: string; level: number; onHome: () => void }

export function GameScreen({ nodeId, gameId, level, onHome }: Props) {
  const game = gameById(gameId)
  const { bilingual, childName, recordLesson } = useStore()
  const [step, setStep] = useState<'play' | 'end' | 'quests'>('play')
  const [result, setResult] = useState<(LessonResult & { perfect: boolean; seconds: number }) | null>(null)
  const [start] = useState(() => Date.now())

  const onFinish = (correct: number, total: number, hearts: number) => {
    const r = recordLesson({ nodeId, gameId, correct, total, hearts })
    setResult({ ...r, perfect: hearts >= 3 && correct === total, seconds: Math.round((Date.now() - start) / 1000) })
    setStep('end')
  }
  const close = () => {
    stopSpeech()
    onHome()
  }
  const C = game.component

  if (step === 'end' && result) {
    return (
      <EndScreen
        xp={result.xp}
        acc={result.acc}
        seconds={result.seconds}
        perfect={result.perfect}
        nodeDone={result.nodeDone}
        levelUp={result.levelUp}
        bilingual={bilingual}
        onNext={() => (result.questsAfter !== result.questsBefore || result.newStickers > 0 || result.questReward ? setStep('quests') : close())}
      />
    )
  }
  if (step === 'quests' && result) {
    return <QuestScreen before={result.questsBefore} reward={result.questReward} newStickers={result.newStickers} onNext={close} />
  }
  return <C level={level} bilingual={bilingual} childName={childName} onFinish={onFinish} onClose={close} />
}
