import { seededShuffle } from '../lib/util'

/** Per-day counters that quests read from. */
export type Daily = {
  day: string
  xp: number
  lessons: number
  perfect: number
  replays: number
  maxCombo: number
  chests: number
  games: Record<string, number>
}

export const emptyDaily = (day = ''): Daily => ({ day, xp: 0, lessons: 0, perfect: 0, replays: 0, maxCombo: 0, chests: 0, games: {} })

export type Quest = {
  id: string
  de: string
  it: string
  emoji: string
  target: number
  value: (d: Daily) => number
  /** spoken hint for what is left */
  left: (n: number) => string
}

const ZAHLEN = ['zaehlen', 'mengen', 'rechnen', 'formen', 'uhr']
const WELT = ['zeit', 'berlin', 'schulweg']
const sum = (d: Daily, ids: string[]) => ids.reduce((a, id) => a + (d.games[id] ?? 0), 0)

export const xpQuest = (goal: number): Quest => ({
  id: 'xp', de: `Sammle ${goal} XP`, it: `Guadagna ${goal} XP`, emoji: '⚡', target: goal,
  value: (d) => d.xp, left: (n) => `Noch ${n} XP bis zum Ziel!`,
})

const POOL: Quest[] = [
  { id: 'lessons2', de: 'Schaffe 2 Lektionen', it: 'Completa 2 lezioni', emoji: '📚', target: 2, value: (d) => d.lessons, left: (n) => (n === 1 ? 'Noch eine Lektion!' : `Noch ${n} Lektionen!`) },
  { id: 'lessons3', de: 'Schaffe 3 Lektionen', it: 'Completa 3 lezioni', emoji: '📚', target: 3, value: (d) => d.lessons, left: (n) => (n === 1 ? 'Noch eine Lektion!' : `Noch ${n} Lektionen!`) },
  { id: 'perfect', de: 'Eine perfekte Lektion', it: 'Una lezione perfetta', emoji: '💯', target: 1, value: (d) => d.perfect, left: () => 'Schaffe eine Lektion ohne Fehler!' },
  { id: 'combo5', de: '5 richtig in Folge', it: '5 giuste di fila', emoji: '🔥', target: 5, value: (d) => d.maxCombo, left: () => 'Schaffe fünf richtige Antworten hintereinander!' },
  { id: 'italiano', de: '2× Italiano', it: '2 volte Italiano', emoji: '🇮🇹', target: 2, value: (d) => d.games.italienisch ?? 0, left: (n) => (n === 1 ? 'Noch einmal Italiano!' : 'Spiel zweimal Italiano!') },
  { id: 'memory', de: 'Eine Memory-Runde', it: 'Una partita a Memory', emoji: '🃏', target: 1, value: (d) => d.games.memory ?? 0, left: () => 'Spiel eine Runde Memory!' },
  { id: 'spuren', de: 'Buchstaben nachspuren', it: 'Ripassa le lettere', emoji: '✏️', target: 1, value: (d) => d.games.spuren ?? 0, left: () => 'Fahre Buchstaben nach!' },
  { id: 'replay', de: 'Übe eine Lektion nochmal', it: 'Ripeti una lezione', emoji: '🔁', target: 1, value: (d) => d.replays, left: () => 'Spiel eine Lektion nochmal und hol dir eine Krone!' },
  { id: 'zahlen', de: '2 Zahlen-Übungen', it: '2 esercizi con i numeri', emoji: '🔢', target: 2, value: (d) => sum(d, ZAHLEN), left: (n) => (n === 1 ? 'Noch eine Zahlen-Übung!' : 'Mach zwei Zahlen-Übungen!') },
  { id: 'welt', de: 'Eine Welt-Übung', it: 'Un esercizio sul mondo', emoji: '🌍', target: 1, value: (d) => sum(d, WELT), left: () => 'Mach eine Übung über Berlin, die Zeit oder den Schulweg!' },
]

/** Three quests per day: always the XP goal plus two seeded picks. */
export function questsFor(day: string, goal: number): Quest[] {
  const picks: Quest[] = []
  for (const q of seededShuffle(POOL, day)) {
    if (picks.length === 2) break
    if (q.id.startsWith('lessons') && picks.some((p) => p.id.startsWith('lessons'))) continue
    picks.push(q)
  }
  return [xpQuest(goal), ...picks]
}

export function questProgress(quests: Quest[], d: Daily) {
  return quests.map((q) => ({ q, v: Math.min(q.target, q.value(d)), done: q.value(d) >= q.target }))
}

export const QUEST_REWARD_GEMS = 15
