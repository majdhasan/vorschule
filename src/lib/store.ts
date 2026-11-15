import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ALL_NODES } from '../data/path'
import { todayKey } from './util'

export type GameStats = {
  level: number // 1..3 – practice difficulty, adapts
  plays: number
  correct: number
  total: number
  lastPlayed?: string
  history: number[]
}

export type NodeProgress = { stars: number; acc: number; done: boolean; plays: number }

export const XP_PER_STICKER = 80
export const CHEST_XP = 20

export const QUESTS = [
  { id: 'xp', de: 'Sammle 30 XP', it: 'Guadagna 30 XP', emoji: '⚡', target: 30, key: 'xpToday' as const },
  { id: 'lessons', de: 'Schaffe 3 Lektionen', it: 'Completa 3 lezioni', emoji: '📚', target: 3, key: 'lessonsToday' as const },
  { id: 'perfect', de: 'Eine perfekte Lektion', it: 'Una lezione perfetta', emoji: '💎', target: 1, key: 'perfectToday' as const },
]

export type LessonResult = {
  xp: number
  stars: number
  acc: number
  nodeDone: boolean
  newStickers: number
  levelUp: boolean
  questsBefore: number
  questsAfter: number
  questReward: boolean
}

export type State = {
  childName: string
  bilingual: boolean
  sound: boolean
  voiceDe: string
  voiceIt: string
  parentUnlocked: boolean
  xp: number
  games: Record<string, GameStats>
  nodes: Record<string, NodeProgress>
  stickersUnlocked: number
  stickerXpClaimed: number
  lastDay: string
  streak: number
  xpToday: number
  lessonsToday: number
  perfectToday: number
  questRewardDay: string
  setName: (n: string) => void
  setBilingual: (b: boolean) => void
  setSound: (b: boolean) => void
  setVoice: (lang: 'de' | 'it', name: string) => void
  setParentUnlocked: (b: boolean) => void
  touchDay: () => void
  recordLesson: (p: { nodeId?: string; gameId: string; correct: number; total: number; hearts: number }) => LessonResult
  openChest: (nodeId: string) => { xp: number; stickers: number }
  reset: () => void
}

const emptyStats = (): GameStats => ({ level: 1, plays: 0, correct: 0, total: 0, history: [] })

const initial = {
  childName: '',
  bilingual: true,
  sound: true,
  voiceDe: '',
  voiceIt: '',
  parentUnlocked: false,
  xp: 0,
  games: {} as Record<string, GameStats>,
  nodes: {} as Record<string, NodeProgress>,
  stickersUnlocked: 0,
  stickerXpClaimed: 0,
  lastDay: '',
  streak: 0,
  xpToday: 0,
  lessonsToday: 0,
  perfectToday: 0,
  questRewardDay: '',
}

function questsDone(s: Pick<State, 'xpToday' | 'lessonsToday' | 'perfectToday'>) {
  return QUESTS.filter((q) => s[q.key] >= q.target).length
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      ...initial,
      setName: (childName) => set({ childName }),
      setBilingual: (bilingual) => set({ bilingual }),
      setSound: (sound) => set({ sound }),
      setVoice: (lang, name) => set(lang === 'de' ? { voiceDe: name } : { voiceIt: name }),
      setParentUnlocked: (parentUnlocked) => set({ parentUnlocked }),
      touchDay: () => {
        const today = todayKey()
        const { lastDay, streak } = get()
        if (lastDay === today) return
        const y = new Date()
        y.setDate(y.getDate() - 1)
        const yesterday = `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, '0')}-${String(y.getDate()).padStart(2, '0')}`
        set({ lastDay: today, streak: lastDay === yesterday ? streak + 1 : 1, xpToday: 0, lessonsToday: 0, perfectToday: 0 })
      },
      recordLesson: ({ nodeId, gameId, correct, total, hearts }) => {
        get().touchDay()
        const s = get()
        const acc = total ? correct / total : 0
        const perfect = hearts >= 3 && correct === total
        const stars = perfect ? 3 : acc >= 0.8 ? 2 : acc >= 0.6 ? 1 : 0

        // game stats + adaptive practice level
        const g = { ...(s.games[gameId] ?? emptyStats()) }
        g.plays += 1
        g.correct += correct
        g.total += total
        g.lastPlayed = todayKey()
        g.history = [...g.history, acc].slice(-5)
        let levelUp = false
        const last2 = g.history.slice(-2)
        if (g.level < 3 && last2.length === 2 && last2.every((a) => a >= 0.85)) {
          g.level += 1
          g.history = []
          levelUp = true
        }
        if (g.level > 1 && last2.length === 2 && last2.every((a) => a < 0.4)) {
          g.level -= 1
          g.history = []
        }

        // node progress
        const nodes = { ...s.nodes }
        let nodeDone = false
        let xp = 8 // free practice
        if (nodeId) {
          const prev = nodes[nodeId] ?? { stars: 0, acc: 0, done: false, plays: 0 }
          const done = prev.done || stars >= 1
          nodeDone = !prev.done && stars >= 1
          xp = prev.done ? 5 : 10
          nodes[nodeId] = { stars: Math.max(prev.stars, stars), acc: Math.max(prev.acc, acc), done, plays: prev.plays + 1 }
        }
        if (perfect) xp += 5

        const questsBefore = questsDone(s)
        const today = { xpToday: s.xpToday + xp, lessonsToday: s.lessonsToday + 1, perfectToday: s.perfectToday + (perfect ? 1 : 0) }
        let questsAfter = questsDone(today)
        let questReward = false
        let totalXp = s.xp + xp
        if (questsAfter === QUESTS.length && s.questRewardDay !== todayKey()) {
          questReward = true
          totalXp += 10
          today.xpToday += 10
          questsAfter = QUESTS.length
        }

        // stickers from XP (+1 for a completed quest set)
        const fromXp = Math.floor(totalXp / XP_PER_STICKER) - Math.floor(s.stickerXpClaimed / XP_PER_STICKER)
        const newStickers = Math.max(0, fromXp) + (questReward ? 1 : 0)

        set({
          games: { ...s.games, [gameId]: g },
          nodes,
          xp: totalXp,
          stickerXpClaimed: totalXp,
          stickersUnlocked: s.stickersUnlocked + newStickers,
          questRewardDay: questReward ? todayKey() : s.questRewardDay,
          ...today,
        })
        return { xp, stars, acc, nodeDone, newStickers, levelUp, questsBefore, questsAfter, questReward }
      },
      openChest: (nodeId) => {
        get().touchDay()
        const s = get()
        if (s.nodes[nodeId]?.done) return { xp: 0, stickers: 0 }
        const totalXp = s.xp + CHEST_XP
        set({
          nodes: { ...s.nodes, [nodeId]: { stars: 3, acc: 1, done: true, plays: 1 } },
          xp: totalXp,
          xpToday: s.xpToday + CHEST_XP,
          stickerXpClaimed: totalXp,
          stickersUnlocked: s.stickersUnlocked + 1,
        })
        return { xp: CHEST_XP, stickers: 1 }
      },
      reset: () => set({ ...initial }),
    }),
    {
      name: 'berli-vorschule-v1',
      version: 2,
      migrate: (persisted: unknown) => {
        const p = (persisted ?? {}) as Record<string, unknown>
        const oldStars = typeof p.totalStars === 'number' ? p.totalStars : 0
        return { ...p, xp: typeof p.xp === 'number' ? p.xp : oldStars * 5, stickerXpClaimed: oldStars * 5 } as State
      },
    },
  ),
)

export function statsFor(games: Record<string, GameStats>, id: string): GameStats {
  return games[id] ?? emptyStats()
}

/** Path status: which node is the current one, which are unlocked. */
export function pathStatus(nodes: Record<string, NodeProgress>) {
  let currentIndex = ALL_NODES.length
  for (let i = 0; i < ALL_NODES.length; i++) {
    const done = nodes[ALL_NODES[i].node.id]?.done
    if (!done) {
      currentIndex = i
      break
    }
  }
  return { currentIndex, isUnlocked: (i: number) => i <= currentIndex, isDone: (id: string) => !!nodes[id]?.done }
}
