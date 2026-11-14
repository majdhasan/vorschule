import { useState } from 'react'
import { EndScreen } from '../components/EndScreen'
import { gameById } from '../games'
import { statsFor, useStore } from '../lib/store'
import { stopSpeech } from '../lib/speech'
import { starsFor } from '../lib/util'

type Props = { id: string; onHome: () => void }

export function GameScreen({ id, onHome }: Props) {
  const game = gameById(id)
  const { games, bilingual, childName, recordGame, stickersUnlocked } = useStore()
  const level = statsFor(games, id).level
  const [run, setRun] = useState(0)
  const [result, setResult] = useState<{ correct: number; total: number; stars: number; newSticker: boolean; levelUp: boolean } | null>(null)

  const onFinish = (correct: number, total: number) => {
    const stars = starsFor(correct, total)
    const r = recordGame(id, correct, total, stars)
    setResult({ correct, total, stars, ...r })
  }
  const again = () => {
    setResult(null)
    setRun((r) => r + 1)
  }
  const home = () => {
    stopSpeech()
    onHome()
  }
  const C = game.component

  return (
    <div className="screen">
      <div className="topbar" style={{ background: game.color }}>
        <button className="back" onClick={home} aria-label="Zurück">
          ←
        </button>
        <div className="topbar-title">
          {game.emoji} {game.title}
          {bilingual && <span className="topbar-it"> · {game.titleIt}</span>}
        </div>
        <div className="topbar-level" title="Stufe">
          {'⭐'.repeat(level)}
        </div>
      </div>
      {result ? (
        <EndScreen
          stars={result.stars}
          correct={result.correct}
          total={result.total}
          bilingual={bilingual}
          newSticker={result.newSticker}
          levelUp={result.levelUp}
          stickerIndex={stickersUnlocked}
          onAgain={again}
          onHome={home}
        />
      ) : (
        <C key={run} level={level} bilingual={bilingual} childName={childName} onFinish={onFinish} />
      )}
    </div>
  )
}
