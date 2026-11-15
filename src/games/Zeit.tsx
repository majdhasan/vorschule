import type { Round } from '../components/ChoiceGame'
import { SEASONS, WEEKDAYS } from '../data/misc'
import { speak } from '../lib/speech'
import { pickN, randInt, shuffle, coin } from '../lib/util'
import type { Builder } from './types'

const DAILY = [
  { q: 'Was machst du morgens als Erstes?', qIt: 'Cosa fai per prima cosa al mattino?', a: 'Aufstehen', e: '🛏️', d: [{ l: 'Schlafen gehen', e: '😴' }, { l: 'Abendessen', e: '🍽️' }] },
  { q: 'Womit putzt du deine Zähne?', qIt: 'Con cosa ti lavi i denti?', a: 'Zahnbürste', e: '🪥', d: [{ l: 'Löffel', e: '🥄' }, { l: 'Kamm', e: '💇' }] },
  { q: 'Was scheint am Tag am Himmel?', qIt: 'Cosa splende nel cielo di giorno?', a: 'Sonne', e: '☀️', d: [{ l: 'Mond', e: '🌙' }, { l: 'Sterne', e: '⭐' }] },
  { q: 'Was siehst du nachts am Himmel?', qIt: 'Cosa vedi nel cielo di notte?', a: 'Mond', e: '🌙', d: [{ l: 'Sonne', e: '☀️' }, { l: 'Regenbogen', e: '🌈' }] },
  { q: 'Was isst du morgens?', qIt: 'Cosa mangi al mattino?', a: 'Frühstück', e: '🥣', d: [{ l: 'Abendessen', e: '🍝' }, { l: 'Geburtstagstorte', e: '🎂' }] },
  { q: 'Welche Tage sind Wochenende?', qIt: 'Quali giorni sono il fine settimana?', a: 'Samstag und Sonntag', e: '🎉', d: [{ l: 'Montag und Dienstag', e: '🏫' }, { l: 'Mittwoch', e: '📅' }] },
]

const sayWeek = () => speak(WEEKDAYS.map((w) => w.de).join(', '), 'de')

function weekday(i: number, after: boolean): Round {
  const ans = WEEKDAYS[(i + (after ? 1 : 6)) % 7]
  const d = pickN(WEEKDAYS, 2, (w) => w.de === ans.de || w.de === WEEKDAYS[i].de)
  return {
    promptDe: `Welcher Tag kommt ${after ? 'nach' : 'vor'} ${WEEKDAYS[i].de}?`,
    promptIt: `Quale giorno viene ${after ? 'dopo' : 'prima di'} ${WEEKDAYS[i].it}?`,
    readOptions: true,
    item: `wd:${i}:${after ? 'n' : 'v'}`,
    visual: (
      <button className="week" onClick={sayWeek} aria-label="Wochentage anhören">
        {WEEKDAYS.map((w) => (
          <span key={w.de} className={'week-day' + (w.de === WEEKDAYS[i].de ? ' hl' : '')}>
            {w.emoji}
          </span>
        ))}
        <span className="week-say">🔊</span>
      </button>
    ),
    options: shuffle([ans, ...d]).map((w) => ({ key: w.de, node: <span className="row-opt"><span className="row-emoji">{w.emoji}</span><span className="row-label">{w.de}</span></span>, sayDe: w.de, sayIt: w.it, wide: true })),
    answer: ans.de,
    columns: 1,
  }
}

function season(s: (typeof SEASONS)[number]): Round {
  return {
    promptDe: `${s.hint} Welche Jahreszeit ist das?`,
    promptIt: 'Quale stagione è?',
    readOptions: true,
    item: `s:${s.de}`,
    options: shuffle(SEASONS).map((x) => ({ key: x.de, node: <span className="pic-opt"><span className="emoji-opt">{x.emoji}</span><span className="pic-label">{x.de}</span></span>, sayDe: x.de, sayIt: x.it })),
    answer: s.de,
    columns: 2,
  }
}

function daily(q: (typeof DAILY)[number]): Round {
  return {
    promptDe: q.q,
    promptIt: q.qIt,
    readOptions: true,
    item: `d:${q.q}`,
    options: shuffle([{ l: q.a, e: q.e }, ...q.d]).map((o) => ({ key: o.l, node: <span className="row-opt"><span className="row-emoji">{o.e}</span><span className="row-label">{o.l}</span></span>, sayDe: o.l, wide: true })),
    answer: q.a,
    columns: 1,
  }
}

function fromItem(item: string): Round | null {
  const [kind, a, b] = item.split(':')
  if (kind === 'wd') return weekday(Number(a), b === 'n')
  if (kind === 's') {
    const s = SEASONS.find((x) => x.de === a)
    return s ? season(s) : null
  }
  const q = DAILY.find((x) => x.q === item.slice(2))
  return q ? daily(q) : null
}

export const build: Builder = (level, { focus, count = 6 }) => {
  const focused = (focus ?? []).map(fromItem).filter((r): r is Round => !!r)
  const out: Round[] = []
  for (let k = 0; k < 2; k++) out.push(weekday(randInt(0, 6), level >= 2 ? coin() : true))
  for (const s of pickN(SEASONS, 2)) out.push(season(s))
  for (const q of pickN(DAILY, 2)) out.push(daily(q))
  return [...focused, ...shuffle(out)].slice(0, count)
}
