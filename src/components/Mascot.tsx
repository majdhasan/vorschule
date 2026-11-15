import { OUTFITS } from '../data/misc'
import { useStore } from '../lib/store'

export type Mood = 'normal' | 'happy' | 'think' | 'wave' | 'sad' | 'cheer' | 'sleep'
const EXTRA: Partial<Record<Mood, string>> = { happy: '✨', think: '🤔', wave: '👋', sad: '💧', cheer: '🎉', sleep: '💤' }

export function Mascot({ mood = 'normal', size = 72, outfit }: { mood?: Mood; size?: number; outfit?: string }) {
  const own = useStore((s) => s.outfit)
  const o = OUTFITS.find((x) => x.id === (outfit ?? own))
  return (
    <div className={'mascot mascot-' + mood} style={{ fontSize: size }} aria-hidden>
      <span className="mascot-face">🐻</span>
      {o?.emoji && <span className={'mascot-outfit outfit-' + o.id}>{o.emoji}</span>}
      {EXTRA[mood] && <span className="mascot-extra">{EXTRA[mood]}</span>}
    </div>
  )
}
