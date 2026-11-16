// The learning path: units of lessons, Duolingo style. Each lesson node is a
// game at a fixed level; every unit ends with a mixed test ("Prüfung") and a chest.
export type LessonNode = { kind: 'lesson'; id: string; game: string; level: number }
export type ReviewNode = { kind: 'review'; id: string; unit: string; level: number }
export type ChestNode = { kind: 'chest'; id: string }
export type PathNode = LessonNode | ReviewNode | ChestNode

export type Unit = {
  id: string
  title: string
  titleIt: string
  emoji: string
  color: string
  dark: string
  nodes: PathNode[]
}

const L = (game: string, level: number): LessonNode => ({ kind: 'lesson', id: `${game}-${level}`, game, level })

const u = (id: string, title: string, titleIt: string, emoji: string, color: string, dark: string, lessons: LessonNode[]): Unit => ({
  id, title, titleIt, emoji, color, dark,
  nodes: [...lessons, { kind: 'review', id: `review-${id}`, unit: id, level: Math.max(...lessons.map((l) => l.level)) }, { kind: 'chest', id: `chest-${id}` }],
})

export const UNITS: Unit[] = [
  u('1', "Los geht's!", 'Si parte!', '🚀', '#58CC02', '#46A302', [L('zaehlen', 1), L('formen', 1), L('anlaute', 1), L('memory', 1), L('muster', 1)]),
  u('2', 'Buchstaben & Zahlen', 'Lettere e numeri', '🔤', '#1CB0F6', '#1899D6', [L('buchstaben', 1), L('mengen', 1), L('reime', 1), L('rechnen', 1), L('silben', 1)]),
  u('3', 'Meine Stadt', 'La mia città', '🐻', '#FF4B4B', '#EA2B2B', [L('schulweg', 1), L('berlin', 1), L('uhr', 1), L('zeit', 1), L('spuren', 1)]),
  u('4', 'Schon besser!', 'Sempre meglio!', '💪', '#CE82FF', '#A560E8', [L('zaehlen', 2), L('anlaute', 2), L('formen', 2), L('muster', 2), L('memory', 2)]),
  u('5', 'Wörter & Rechnen', 'Parole e calcoli', '🧮', '#FF9600', '#E58700', [L('reime', 2), L('rechnen', 2), L('silben', 2), L('buchstaben', 2), L('mengen', 2)]),
  u('6', 'Welt entdecken', 'Scoprire il mondo', '🌍', '#00CD9C', '#00A47D', [L('uhr', 2), L('zeit', 2), L('spuren', 2), L('berlin', 2), L('schulweg', 2)]),
  u('7', 'Fast ein Schulkind', 'Quasi a scuola', '🎒', '#FF86D0', '#E05DAE', [L('zaehlen', 3), L('anlaute', 3), L('rechnen', 3), L('buchstaben', 3), L('formen', 3), L('muster', 3)]),
  u('8', 'Schulkind!', 'A scuola!', '🎓', '#FFC800', '#E5B400', [L('reime', 3), L('silben', 3), L('memory', 3), L('uhr', 3), L('spuren', 3), L('zeit', 3)]),
]

export const ALL_NODES: { node: PathNode; unit: Unit; index: number }[] = UNITS.flatMap((unit) => unit.nodes.map((node) => ({ node, unit, index: 0 }))).map((x, i) => ({ ...x, index: i }))

export function findNode(id: string) {
  return ALL_NODES.find((n) => n.node.id === id)
}

export function unitById(id: string) {
  return UNITS.find((x) => x.id === id)!
}

export function lessonsOf(unit: Unit): LessonNode[] {
  return unit.nodes.filter((n): n is LessonNode => n.kind === 'lesson')
}
