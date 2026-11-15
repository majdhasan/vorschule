import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ALL_NODES, UNITS, type PathNode } from '../data/path'
import { emptyDaily, questProgress, questsFor, QUEST_REWARD_GEMS, type Daily } from '../data/quests'
import { ACHIEVEMENTS, MEDAL_GEMS, tierOf, type AchStats } from '../data/achievements'
import { FREEZE_PRICE, MAX_FREEZES, OUTFITS, SET_BONUS_GEMS, STICKER_PACK_PRICE, STICKER_SETS, STICKERS, THEMES } from '../data/misc'
import { addDays, daysBetween, todayKey, weekKey } from './util'

export type GameStats = {
  level: number // 1..3 – practice difficulty, adapts in free practice
  plays: number
  correct: number
  total: number
  lastPlayed?: string
  history: number[]
}

export type NodeProgress = { stars: number; acc: number; done: boolean; plays: number; crowns: number }
/** Where a question came from, so mistakes can be practised again. */
export type Src = { g: string; l: number; item?: string }
export type Member = { id: string; name: string; avatar: string; weekXp: number }

export const XP_PER_STICKER = 80
export const CHEST_XP = 20
export const CHEST_GEMS = 10
export const STREAK_MILESTONES = [3, 7, 14, 30, 50, 100]

export type LessonInput = {
  kind: 'node' | 'practice' | 'mistakes'
  nodeId?: string
  gameId: string // 'review' or 'mistakes' for mixed lessons
  level: number
  correct: number
  total: number
  hearts: number // hearts left; games without hearts pass 3
  maxCombo: number
  missed: Src[]
  fixed: Src[]
}

export type XpLine = { label: string; xp: number }
export type LessonResult = {
  xp: number
  lines: XpLine[]
  gems: number
  stars: number
  acc: number
  perfect: boolean
  nodeDone: boolean
  crowns: number
  crownUp: boolean
  legendary: boolean
  unitPassed: boolean
  levelUp: boolean
  goalReached: boolean
  streakExtended: boolean
  streak: number
  streakSaved: boolean
  milestone: number
  newStickers: string[]
  setsCompleted: string[]
  newMedals: { id: string; tier: number }[]
  questsBefore: number
  questsAfter: number
  adult: boolean
}

export type Reward = { xp: number; gems: number; stickers: string[]; setsCompleted: string[] }

type Data = {
  childName: string
  childAvatar: string
  bilingual: boolean
  sound: boolean
  voiceDe: string
  voiceIt: string
  parentUnlocked: boolean
  dailyGoal: number
  dailyCap: number // 0 = no limit
  xp: number
  gems: number
  games: Record<string, GameStats>
  nodes: Record<string, NodeProgress>
  stickers: string[]
  stickerXpClaimed: number
  setsClaimed: string[]
  outfit: string
  outfitsOwned: string[]
  theme: string
  themesOwned: string[]
  streak: number
  bestStreak: number
  lastLessonDay: string
  lessonDays: string[]
  freezes: number
  daily: Daily
  questClaimDay: string
  xpByDay: Record<string, number>
  mistakes: Src[]
  perfectTotal: number
  lessonsTotal: number
  achClaimed: Record<string, number>
  members: Member[]
  activeMember: string // '' = the child
  weekKey: string
  childWeekXp: number
  lastWeek: { name: string; avatar: string; xp: number } | null
}

export type State = Data & {
  setName: (n: string) => void
  setChildAvatar: (a: string) => void
  setBilingual: (b: boolean) => void
  setSound: (b: boolean) => void
  setVoice: (lang: 'de' | 'it', name: string) => void
  setParentUnlocked: (b: boolean) => void
  setDailyGoal: (n: number) => void
  setDailyCap: (n: number) => void
  rollDay: () => void
  recordLesson: (p: LessonInput) => LessonResult
  openChest: (nodeId: string) => Reward
  claimQuests: () => Reward | null
  buy: (kind: 'pack' | 'freeze' | 'outfit' | 'theme', id?: string) => { ok: boolean; sticker?: string }
  setOutfit: (id: string) => void
  setTheme: (id: string) => void
  addMember: (name: string, avatar: string) => void
  removeMember: (id: string) => void
  setActiveMember: (id: string) => void
  reset: () => void
}

const emptyStats = (): GameStats => ({ level: 1, plays: 0, correct: 0, total: 0, history: [] })
const emptyNode = (): NodeProgress => ({ stars: 0, acc: 0, done: false, plays: 0, crowns: 0 })

const initial: Data = {
  childName: '',
  childAvatar: '🧒',
  bilingual: true,
  sound: true,
  voiceDe: '',
  voiceIt: '',
  parentUnlocked: false,
  dailyGoal: 20,
  dailyCap: 0,
  xp: 0,
  gems: 20,
  games: {},
  nodes: {},
  stickers: [],
  stickerXpClaimed: 0,
  setsClaimed: [],
  outfit: '',
  outfitsOwned: [''],
  theme: '',
  themesOwned: [''],
  streak: 0,
  bestStreak: 0,
  lastLessonDay: '',
  lessonDays: [],
  freezes: 1,
  daily: emptyDaily(),
  questClaimDay: '',
  xpByDay: {},
  mistakes: [],
  perfectTotal: 0,
  lessonsTotal: 0,
  achClaimed: {},
  members: [],
  activeMember: '',
  weekKey: '',
  childWeekXp: 0,
  lastWeek: null,
}

// ---------- pure helpers ----------

/** Pick n random stickers the child doesn't own yet (rare ones are less likely). */
function drawStickers(owned: string[], n: number): string[] {
  const out: string[] = []
  for (let k = 0; k < n; k++) {
    const pool = STICKERS.filter((s) => !owned.includes(s.id) && !out.includes(s.id))
    if (!pool.length) break
    const weights = pool.map((s) => (s.rare ? 0.25 : 1))
    let r = Math.random() * weights.reduce((a, b) => a + b, 0)
    let i = 0
    while (r > weights[i] && i < pool.length - 1) r -= weights[i++]
    out.push(pool[i].id)
  }
  return out
}

/** Apply XP / gems / extra stickers and everything that follows from them. */
function gain(s: Data, g: { xp: number; gems: number; stickers: number }) {
  const today = todayKey()
  const xp = s.xp + g.xp
  const fromXp = Math.max(0, Math.floor(xp / XP_PER_STICKER) - Math.floor(s.stickerXpClaimed / XP_PER_STICKER))
  const newStickers = drawStickers(s.stickers, fromXp + g.stickers)
  const stickers = [...s.stickers, ...newStickers]
  const setsCompleted = STICKER_SETS.filter((set) => !s.setsClaimed.includes(set.id) && STICKERS.filter((x) => x.set === set.id).every((x) => stickers.includes(x.id))).map((x) => x.id)
  const xpByDay: Record<string, number> = {}
  for (const [k, v] of Object.entries(s.xpByDay)) if (daysBetween(k, today) < 14) xpByDay[k] = v
  xpByDay[today] = (xpByDay[today] ?? 0) + g.xp
  const patch: Partial<Data> = {
    xp,
    gems: s.gems + g.gems + setsCompleted.length * SET_BONUS_GEMS,
    stickerXpClaimed: xp,
    stickers,
    setsClaimed: [...s.setsClaimed, ...setsCompleted],
    xpByDay,
    daily: { ...s.daily, xp: s.daily.xp + g.xp },
    childWeekXp: s.childWeekXp + g.xp,
  }
  return { patch, newStickers, setsCompleted }
}

export function achStats(s: Data): AchStats {
  const prog = Object.values(s.nodes)
  return {
    xp: s.xp,
    bestStreak: s.bestStreak,
    perfectTotal: s.perfectTotal,
    lessonsTotal: s.lessonsTotal,
    crowns: prog.reduce((a, n) => a + (n.crowns ?? 0), 0),
    legendary: prog.filter((n) => n.crowns >= 3).length,
    chests: Object.entries(s.nodes).filter(([id, n]) => id.startsWith('chest-') && n.done).length,
    italiano: s.games.italienisch?.plays ?? 0,
    stickers: s.stickers.length,
  }
}

/** New medal tiers reached; returns gems to add and the updated claim map. */
function medals(s: Data) {
  const st = achStats(s)
  const claimed = { ...s.achClaimed }
  const fresh: { id: string; tier: number }[] = []
  let gems = 0
  for (const a of ACHIEVEMENTS) {
    const t = tierOf(a, st)
    for (let k = (claimed[a.id] ?? 0) + 1; k <= t; k++) {
      gems += MEDAL_GEMS[k]
      fresh.push({ id: a.id, tier: k })
    }
    claimed[a.id] = Math.max(claimed[a.id] ?? 0, t)
  }
  return { gems, fresh, claimed }
}

/** Level a node is played at: replays climb towards level 3 to earn crowns. */
export function nodePlayLevel(node: PathNode, prog?: NodeProgress) {
  if (node.kind === 'chest') return 1
  if (!prog?.done) return node.level
  return Math.min(3, node.level + Math.max(0, prog.crowns))
}

export function streakInfo(s: Pick<Data, 'streak' | 'lastLessonDay' | 'freezes'>) {
  const gap = daysBetween(s.lastLessonDay, todayKey())
  if (gap === 0) return { streak: s.streak, doneToday: true, alive: true, atRisk: false }
  if (gap === 1) return { streak: s.streak, doneToday: false, alive: true, atRisk: true }
  if (gap - 1 <= s.freezes) return { streak: s.streak, doneToday: false, alive: true, atRisk: true }
  return { streak: 0, doneToday: false, alive: false, atRisk: false }
}

export function todaysQuests(s: Pick<Data, 'daily' | 'dailyGoal'>) {
  return questProgress(questsFor(s.daily.day || todayKey(), s.dailyGoal), s.daily)
}

export function capReached(s: Pick<Data, 'dailyCap' | 'daily' | 'activeMember'>) {
  return !s.activeMember && s.dailyCap > 0 && s.daily.lessons >= s.dailyCap
}

const sameSrc = (a: Src, b: Src) => a.g === b.g && a.l === b.l && (a.item ?? '') === (b.item ?? '')

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      ...initial,
      setName: (childName) => set({ childName }),
      setChildAvatar: (childAvatar) => set({ childAvatar }),
      setBilingual: (bilingual) => set({ bilingual }),
      setSound: (sound) => set({ sound }),
      setVoice: (lang, name) => set(lang === 'de' ? { voiceDe: name } : { voiceIt: name }),
      setParentUnlocked: (parentUnlocked) => set({ parentUnlocked }),
      setDailyGoal: (dailyGoal) => set({ dailyGoal }),
      setDailyCap: (dailyCap) => set({ dailyCap }),

      rollDay: () => {
        const s = get()
        const today = todayKey()
        const patch: Partial<Data> = {}
        if (s.daily.day !== today) patch.daily = emptyDaily(today)
        const wk = weekKey()
        if (s.weekKey !== wk) {
          const board = [{ name: s.childName, avatar: s.childAvatar, xp: s.childWeekXp }, ...s.members.map((m) => ({ name: m.name, avatar: m.avatar, xp: m.weekXp }))]
          const top = board.sort((a, b) => b.xp - a.xp)[0]
          patch.lastWeek = s.weekKey && top && top.xp > 0 ? top : null
          patch.weekKey = wk
          patch.childWeekXp = 0
          patch.members = s.members.map((m) => ({ ...m, weekXp: 0 }))
          if (s.weekKey) patch.freezes = Math.min(MAX_FREEZES, s.freezes + 1) // one free streak protection per week
        }
        if (Object.keys(patch).length) set(patch)
      },

      recordLesson: (p) => {
        get().rollDay()
        const s = get()
        const acc = p.total ? p.correct / p.total : 0
        const perfect = p.hearts >= 3 && p.correct === p.total
        const stars = perfect ? 3 : acc >= 0.8 ? 2 : acc >= 0.6 ? 1 : 0

        // XP lines
        const lines: XpLine[] = []
        let nodeDone = false
        let crownUp = false
        let unitPassed = false
        let crowns = 0
        let wasDone = false
        const nodes = { ...s.nodes }
        const nodeEntry = p.nodeId ? ALL_NODES.find((n) => n.node.id === p.nodeId) : undefined
        if (p.kind === 'node' && p.nodeId && nodeEntry) {
          const prev = { ...emptyNode(), ...nodes[p.nodeId] }
          const next = { ...prev, stars: Math.max(prev.stars, stars), acc: Math.max(prev.acc, acc), plays: prev.plays + 1 }
          const isReview = nodeEntry.node.kind === 'review'
          wasDone = prev.done
          if (!prev.done) {
            if (stars >= 1) {
              next.done = true
              next.crowns = 1
              nodeDone = true
              unitPassed = isReview
            }
            lines.push({ label: isReview ? 'Prüfung' : 'Lektion', xp: isReview ? 15 : 10 })
          } else if (stars >= 2 && prev.crowns < 3 && p.level === nodePlayLevel(nodeEntry.node, prev)) {
            next.crowns = prev.crowns + 1
            crownUp = true
            lines.push({ label: `Krone ${next.crowns}`, xp: 10 })
          } else {
            lines.push({ label: 'Wiederholung', xp: 5 })
          }
          crowns = next.crowns
          nodes[p.nodeId] = next
        } else if (p.kind === 'mistakes') {
          lines.push({ label: 'Fehler geübt', xp: 10 })
        } else {
          lines.push({ label: 'Übung', xp: 8 })
        }
        if (perfect) lines.push({ label: 'Perfekt-Bonus', xp: 5 })
        if (p.maxCombo >= 5) lines.push({ label: `Combo ×${p.maxCombo}`, xp: 3 })
        else if (p.maxCombo >= 3) lines.push({ label: `Combo ×${p.maxCombo}`, xp: 1 })
        const xp = lines.reduce((a, l) => a + l.xp, 0)
        const legendary = crownUp && crowns >= 3

        // Grown-ups only collect weekly league XP
        if (s.activeMember) {
          set({ members: s.members.map((m) => (m.id === s.activeMember ? { ...m, weekXp: m.weekXp + xp } : m)) })
          return {
            xp, lines, gems: 0, stars, acc, perfect, nodeDone: false, crowns: 0, crownUp: false, legendary: false, unitPassed: false, levelUp: false,
            goalReached: false, streakExtended: false, streak: s.streak, streakSaved: false, milestone: 0, newStickers: [], setsCompleted: [], newMedals: [],
            questsBefore: 0, questsAfter: 0, adult: true,
          }
        }

        // game stats (+ adaptive level only for free practice)
        const games = { ...s.games }
        let levelUp = false
        if (p.gameId !== 'review' && p.gameId !== 'mistakes') {
          const g = { ...(s.games[p.gameId] ?? emptyStats()) }
          g.plays += 1
          g.correct += p.correct
          g.total += p.total
          g.lastPlayed = todayKey()
          g.history = [...g.history, acc].slice(-5)
          if (p.kind === 'practice' && p.level === g.level) {
            const last2 = g.history.slice(-2)
            if (g.level < 3 && last2.length === 2 && last2.every((a) => a >= 0.85)) {
              g.level += 1
              g.history = []
              levelUp = true
            } else if (g.level > 1 && last2.length === 2 && last2.every((a) => a < 0.4)) {
              g.level -= 1
              g.history = []
            }
          }
          games[p.gameId] = g
        }

        // streak
        const today = todayKey()
        const gap = daysBetween(s.lastLessonDay, today)
        let streak = s.streak
        let freezes = s.freezes
        let streakSaved = false
        const streakExtended = gap !== 0
        if (gap === 1) streak += 1
        else if (gap > 1 && gap - 1 <= freezes) {
          streak += 1
          freezes -= gap - 1
          streakSaved = true
        } else if (gap !== 0) streak = 1
        const milestone = streakExtended && STREAK_MILESTONES.includes(streak) ? streak : 0

        // mistakes
        let mistakes = s.mistakes.filter((m) => !p.fixed.some((f) => sameSrc(f, m)))
        for (const m of p.missed) if (!mistakes.some((x) => sameSrc(x, m))) mistakes = [m, ...mistakes]
        mistakes = mistakes.slice(0, 40)

        // daily counters
        const questsBefore = todaysQuests(s).filter((q) => q.done).length
        const daily: Daily = {
          ...s.daily,
          lessons: s.daily.lessons + 1,
          perfect: s.daily.perfect + (perfect ? 1 : 0),
          replays: s.daily.replays + (wasDone ? 1 : 0),
          maxCombo: Math.max(s.daily.maxCombo, p.maxCombo),
          games: p.gameId === 'review' || p.gameId === 'mistakes' ? s.daily.games : { ...s.daily.games, [p.gameId]: (s.daily.games[p.gameId] ?? 0) + 1 },
        }

        let gems = 1 + (perfect ? 1 : 0) + (unitPassed ? 5 : 0) + (crownUp ? 2 : 0) + (legendary ? 5 : 0) + (milestone ? 10 : 0)
        const base: Data = {
          ...s, nodes, games, mistakes, daily, streak, freezes, bestStreak: Math.max(s.bestStreak, streak), lastLessonDay: today,
          lessonDays: streakExtended ? [...s.lessonDays, today].slice(-60) : s.lessonDays,
          perfectTotal: s.perfectTotal + (perfect ? 1 : 0), lessonsTotal: s.lessonsTotal + 1,
        }
        const { patch, newStickers, setsCompleted } = gain(base, { xp, gems, stickers: milestone ? 1 : 0 })
        const after: Data = { ...base, ...patch }
        const md = medals(after)
        gems += md.gems
        after.gems += md.gems
        after.achClaimed = md.claimed
        const goalReached = s.daily.xp < s.dailyGoal && after.daily.xp >= s.dailyGoal
        const questsAfter = todaysQuests(after).filter((q) => q.done).length
        set(after)
        return {
          xp, lines, gems, stars, acc, perfect, nodeDone, crowns, crownUp, legendary, unitPassed, levelUp, goalReached,
          streakExtended, streak, streakSaved, milestone, newStickers, setsCompleted, newMedals: md.fresh, questsBefore, questsAfter, adult: false,
        }
      },

      openChest: (nodeId) => {
        get().rollDay()
        const s = get()
        if (s.nodes[nodeId]?.done || s.activeMember) return { xp: 0, gems: 0, stickers: [], setsCompleted: [] }
        const base: Data = { ...s, nodes: { ...s.nodes, [nodeId]: { stars: 3, acc: 1, done: true, plays: 1, crowns: 1 } }, daily: { ...s.daily, chests: s.daily.chests + 1 } }
        const { patch, newStickers, setsCompleted } = gain(base, { xp: CHEST_XP, gems: CHEST_GEMS, stickers: 1 })
        const after = { ...base, ...patch }
        const md = medals(after)
        set({ ...after, gems: after.gems + md.gems, achClaimed: md.claimed })
        return { xp: CHEST_XP, gems: CHEST_GEMS + md.gems, stickers: newStickers, setsCompleted }
      },

      claimQuests: () => {
        get().rollDay()
        const s = get()
        const today = todayKey()
        if (s.activeMember || s.questClaimDay === today || !todaysQuests(s).every((q) => q.done)) return null
        const { patch, newStickers, setsCompleted } = gain(s, { xp: 0, gems: QUEST_REWARD_GEMS, stickers: 1 })
        set({ ...patch, questClaimDay: today })
        return { xp: 0, gems: QUEST_REWARD_GEMS, stickers: newStickers, setsCompleted }
      },

      buy: (kind, id) => {
        const s = get()
        if (kind === 'pack') {
          if (s.gems < STICKER_PACK_PRICE) return { ok: false }
          const { patch, newStickers } = gain({ ...s, gems: s.gems - STICKER_PACK_PRICE }, { xp: 0, gems: 0, stickers: 1 })
          if (!newStickers.length) return { ok: false }
          set({ ...patch, daily: s.daily, xpByDay: s.xpByDay, childWeekXp: s.childWeekXp })
          return { ok: true, sticker: newStickers[0] }
        }
        if (kind === 'freeze') {
          if (s.gems < FREEZE_PRICE || s.freezes >= MAX_FREEZES) return { ok: false }
          set({ gems: s.gems - FREEZE_PRICE, freezes: s.freezes + 1 })
          return { ok: true }
        }
        if (kind === 'outfit') {
          const o = OUTFITS.find((x) => x.id === id)
          if (!o || s.outfitsOwned.includes(o.id) || s.gems < o.price) return { ok: false }
          set({ gems: s.gems - o.price, outfitsOwned: [...s.outfitsOwned, o.id], outfit: o.id })
          return { ok: true }
        }
        const t = THEMES.find((x) => x.id === id)
        if (!t || s.themesOwned.includes(t.id) || s.gems < t.price) return { ok: false }
        set({ gems: s.gems - t.price, themesOwned: [...s.themesOwned, t.id], theme: t.id })
        return { ok: true }
      },
      setOutfit: (outfit) => set({ outfit }),
      setTheme: (theme) => set({ theme }),
      addMember: (name, avatar) => set((s) => ({ members: [...s.members, { id: String(Date.now()), name, avatar, weekXp: 0 }].slice(0, 3) })),
      removeMember: (id) => set((s) => ({ members: s.members.filter((m) => m.id !== id), activeMember: s.activeMember === id ? '' : s.activeMember })),
      setActiveMember: (activeMember) => set({ activeMember }),
      reset: () => set({ ...initial, daily: emptyDaily(todayKey()), weekKey: weekKey() }),
    }),
    {
      name: 'berli-vorschule-v1',
      version: 3,
      migrate: (persisted: unknown, version: number) => {
        const p = (persisted ?? {}) as Record<string, unknown>
        let xp = typeof p.xp === 'number' ? p.xp : 0
        if (version < 2) xp = (typeof p.totalStars === 'number' ? p.totalStars : 0) * 5
        // nodes: add crowns; units whose chest is open count as passed
        const oldNodes = (p.nodes ?? {}) as Record<string, Partial<NodeProgress>>
        const nodes: Record<string, NodeProgress> = {}
        for (const [id, n] of Object.entries(oldNodes)) nodes[id] = { ...emptyNode(), ...n, crowns: n.crowns ?? (n.done ? 1 : 0) }
        for (const u of UNITS) if (nodes[`chest-${u.id}`]?.done && !nodes[`review-${u.id}`]) nodes[`review-${u.id}`] = { stars: 3, acc: 1, done: true, plays: 1, crowns: 1 }
        // stickers: count → concrete stickers (keep the familiar first ones)
        const ORDER = ['🐻', '🚀', '🦄', '🐉', '🏆', '🦖', '🚆', '🦁', '🍕', '🛸', '🐬', '🐙', '🏰', '🦜', '🐼', '🦊', '🎓']
        const count = typeof p.stickersUnlocked === 'number' ? p.stickersUnlocked : 0
        const order = [...ORDER, ...STICKERS.filter((x) => !ORDER.includes(x.id)).map((x) => x.id)]
        const stickers = Array.isArray(p.stickers) ? (p.stickers as string[]) : order.slice(0, count)
        const games = (p.games ?? {}) as Record<string, GameStats>
        const today = todayKey()
        const lastDay = typeof p.lastDay === 'string' ? p.lastDay : ''
        const daily = lastDay === today
          ? { ...emptyDaily(today), xp: Number(p.xpToday ?? 0), lessons: Number(p.lessonsToday ?? 0), perfect: Number(p.perfectToday ?? 0) }
          : emptyDaily(today)
        // v2 bumped the streak on merely opening the app; now only lessons count
        const openedOnly = lastDay === today && !Number(p.lessonsToday ?? 0)
        const streak = Math.max(0, (typeof p.streak === 'number' ? p.streak : 0) - (openedOnly ? 1 : 0))
        const migrated: Data = {
          ...initial,
          ...(p as Partial<Data>),
          xp,
          nodes,
          stickers,
          stickerXpClaimed: xp,
          games,
          daily: (p.daily as Daily) ?? daily,
          lastLessonDay: (p.lastLessonDay as string) ?? (openedOnly ? addDays(today, -1) : lastDay),
          streak,
          bestStreak: (p.bestStreak as number) ?? streak,
          lessonsTotal: (p.lessonsTotal as number) ?? Object.values(games).reduce((a, g) => a + g.plays, 0),
          lessonDays: (p.lessonDays as string[]) ?? (openedOnly ? (streak > 0 ? [addDays(today, -1)] : []) : lastDay ? [lastDay] : []),
          weekKey: (p.weekKey as string) ?? weekKey(),
        }
        return migrated as State
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
    if (!nodes[ALL_NODES[i].node.id]?.done) {
      currentIndex = i
      break
    }
  }
  return { currentIndex, isUnlocked: (i: number) => i <= currentIndex, isDone: (id: string) => !!nodes[id]?.done }
}
