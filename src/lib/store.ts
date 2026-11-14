import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { todayKey } from './util'

export type GameStats = {
  level: number // 1..3
  plays: number
  correct: number
  total: number
  stars: number
  lastPlayed?: string
  history: number[] // last accuracies (0..1)
}

export type State = {
  childName: string
  bilingual: boolean
  sound: boolean
  parentUnlocked: boolean
  totalStars: number
  games: Record<string, GameStats>
  stickersUnlocked: number
  lastDay: string
  streak: number
  doneToday: string[]
  setName: (n: string) => void
  setBilingual: (b: boolean) => void
  setSound: (b: boolean) => void
  setParentUnlocked: (b: boolean) => void
  recordGame: (id: string, correct: number, total: number, stars: number) => { newSticker: boolean; levelUp: boolean }
  touchDay: () => void
  reset: () => void
}

export const STICKER_EVERY = 8 // stars per sticker

const emptyStats = (): GameStats => ({ level: 1, plays: 0, correct: 0, total: 0, stars: 0, history: [] })

const initial = {
  childName: '',
  bilingual: true,
  sound: true,
  parentUnlocked: false,
  totalStars: 0,
  games: {},
  stickersUnlocked: 0,
  lastDay: '',
  streak: 0,
  doneToday: [] as string[],
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      ...initial,
      setName: (childName) => set({ childName }),
      setBilingual: (bilingual) => set({ bilingual }),
      setSound: (sound) => set({ sound }),
      setParentUnlocked: (parentUnlocked) => set({ parentUnlocked }),
      touchDay: () => {
        const today = todayKey()
        const { lastDay, streak } = get()
        if (lastDay === today) return
        const y = new Date()
        y.setDate(y.getDate() - 1)
        const yesterday = `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, '0')}-${String(y.getDate()).padStart(2, '0')}`
        set({ lastDay: today, streak: lastDay === yesterday ? streak + 1 : 1, doneToday: [] })
      },
      recordGame: (id, correct, total, stars) => {
        get().touchDay()
        const s = get()
        const g = { ...(s.games[id] ?? emptyStats()) }
        const acc = total ? correct / total : 0
        g.plays += 1
        g.correct += correct
        g.total += total
        g.stars += stars
        g.lastPlayed = todayKey()
        g.history = [...g.history, acc].slice(-5)
        let levelUp = false
        // Level up after two strong rounds in a row at the current level
        const last2 = g.history.slice(-2)
        if (g.level < 3 && last2.length === 2 && last2.every((a) => a >= 0.85)) {
          g.level += 1
          g.history = []
          levelUp = true
        }
        // Level down if struggling twice in a row
        if (g.level > 1 && last2.length === 2 && last2.every((a) => a < 0.4)) {
          g.level -= 1
          g.history = []
        }
        const totalStars = s.totalStars + stars
        const stickers = Math.floor(totalStars / STICKER_EVERY)
        const newSticker = stickers > s.stickersUnlocked
        set({
          games: { ...s.games, [id]: g },
          totalStars,
          stickersUnlocked: stickers,
          doneToday: s.doneToday.includes(id) ? s.doneToday : [...s.doneToday, id],
        })
        return { newSticker, levelUp }
      },
      reset: () => set({ ...initial }),
    }),
    { name: 'berli-vorschule-v1' },
  ),
)

export function statsFor(games: Record<string, GameStats>, id: string): GameStats {
  return games[id] ?? emptyStats()
}
