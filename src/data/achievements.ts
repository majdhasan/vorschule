export type AchStats = {
  xp: number
  bestStreak: number
  perfectTotal: number
  lessonsTotal: number
  crowns: number
  legendary: number
  chests: number
  spuren: number
  stickers: number
}

export type Achievement = { id: string; emoji: string; de: string; it: string; tiers: [number, number, number]; value: (s: AchStats) => number; unit: string; unitIt: string }

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'xp', emoji: '⚡', de: 'XP-Sammler', it: 'Collezionista di XP', tiers: [100, 500, 1500], value: (s) => s.xp, unit: 'XP', unitIt: 'XP' },
  { id: 'streak', emoji: '🔥', de: 'Feuer und Flamme', it: 'Tutto fuoco', tiers: [3, 7, 30], value: (s) => s.bestStreak, unit: 'Tage', unitIt: 'giorni' },
  { id: 'perfect', emoji: '💯', de: 'Perfektionist', it: 'Perfezionista', tiers: [1, 10, 25], value: (s) => s.perfectTotal, unit: 'perfekte Lektionen', unitIt: 'lezioni perfette' },
  { id: 'lessons', emoji: '📚', de: 'Fleißig', it: 'Diligente', tiers: [10, 50, 150], value: (s) => s.lessonsTotal, unit: 'Lektionen', unitIt: 'lezioni' },
  { id: 'crowns', emoji: '👑', de: 'Kronensammler', it: 'Collezionista di corone', tiers: [5, 20, 60], value: (s) => s.crowns, unit: 'Kronen', unitIt: 'corone' },
  { id: 'legend', emoji: '🏅', de: 'Legende', it: 'Leggenda', tiers: [1, 5, 15], value: (s) => s.legendary, unit: 'legendäre Lektionen', unitIt: 'lezioni leggendarie' },
  { id: 'chests', emoji: '🎁', de: 'Schatzsucher', it: 'Cacciatore di tesori', tiers: [1, 4, 8], value: (s) => s.chests, unit: 'Truhen', unitIt: 'forzieri' },
  { id: 'spuren', emoji: '✏️', de: 'Schreibprofi', it: 'Scrittore provetto', tiers: [3, 10, 25], value: (s) => s.spuren, unit: 'Nachspur-Runden', unitIt: 'esercizi di scrittura' },
  { id: 'stickers', emoji: '🏆', de: 'Stickerfan', it: 'Fan degli adesivi', tiers: [5, 15, 30], value: (s) => s.stickers, unit: 'Sticker', unitIt: 'adesivi' },
]

export const MEDALS = ['', '🥉', '🥈', '🥇']
export const MEDAL_GEMS = [0, 5, 10, 20]

export function tierOf(a: Achievement, s: AchStats) {
  const v = a.value(s)
  return a.tiers.filter((t) => v >= t).length
}
