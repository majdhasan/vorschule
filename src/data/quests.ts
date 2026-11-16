import { seededShuffle } from '../lib/util'
import { t } from '../lib/i18n'

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
  value: (d) => d.xp, left: (n) => t(`Noch ${n} XP bis zum Ziel!`, `Ancora ${n} XP all’obiettivo!`),
})

const POOL: Quest[] = [
  { id: 'lessons2', de: 'Schaffe 2 Lektionen', it: 'Completa 2 lezioni', emoji: '📚', target: 2, value: (d) => d.lessons, left: (n) => (n === 1 ? t('Noch eine Lektion!', 'Ancora una lezione!') : t(`Noch ${n} Lektionen!`, `Ancora ${n} lezioni!`)) },
  { id: 'lessons3', de: 'Schaffe 3 Lektionen', it: 'Completa 3 lezioni', emoji: '📚', target: 3, value: (d) => d.lessons, left: (n) => (n === 1 ? t('Noch eine Lektion!', 'Ancora una lezione!') : t(`Noch ${n} Lektionen!`, `Ancora ${n} lezioni!`)) },
  { id: 'perfect', de: 'Eine perfekte Lektion', it: 'Una lezione perfetta', emoji: '💯', target: 1, value: (d) => d.perfect, left: () => t('Schaffe eine Lektion ohne Fehler!', 'Fai una lezione senza errori!') },
  { id: 'combo5', de: '5 richtig in Folge', it: '5 giuste di fila', emoji: '🔥', target: 5, value: (d) => d.maxCombo, left: () => t('Schaffe fünf richtige Antworten hintereinander!', 'Dai cinque risposte giuste di fila!') },
  { id: 'memory', de: 'Eine Memory-Runde', it: 'Una partita a Memory', emoji: '🃏', target: 1, value: (d) => d.games.memory ?? 0, left: () => t('Spiel eine Runde Memory!', 'Fai una partita a Memory!') },
  { id: 'spuren', de: 'Buchstaben nachspuren', it: 'Ripassa le lettere', emoji: '✏️', target: 1, value: (d) => d.games.spuren ?? 0, left: () => t('Fahre Buchstaben nach!', 'Ripassa le lettere!') },
  { id: 'replay', de: 'Übe eine Lektion nochmal', it: 'Ripeti una lezione', emoji: '🔁', target: 1, value: (d) => d.replays, left: () => t('Spiel eine Lektion nochmal und hol dir eine Krone!', 'Rifai una lezione e conquista una corona!') },
  { id: 'zahlen', de: '2 Zahlen-Übungen', it: '2 esercizi con i numeri', emoji: '🔢', target: 2, value: (d) => sum(d, ZAHLEN), left: (n) => (n === 1 ? t('Noch eine Zahlen-Übung!', 'Ancora un esercizio con i numeri!') : t('Mach zwei Zahlen-Übungen!', 'Fai due esercizi con i numeri!')) },
  { id: 'welt', de: 'Eine Welt-Übung', it: 'Un esercizio sul mondo', emoji: '🌍', target: 1, value: (d) => sum(d, WELT), left: () => t('Mach eine Übung über Berlin, die Zeit oder den Schulweg!', 'Fai un esercizio su Berlino, il tempo o la strada per la scuola!') },
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
