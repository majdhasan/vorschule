import type { Round } from '../components/ChoiceGame'
import { SEASONS, WEEKDAYS } from '../data/misc'
import { speak } from '../lib/speech'
import { cap, getLang, t } from '../lib/i18n'
import { pickN, randInt, shuffle, coin } from '../lib/util'
import type { Builder } from './types'

type Daily = { q: string; qIt: string; a: [string, string, string]; d: [string, string, string][] }
// [German label = stable key, Italian label, emoji]
const DAILY: Daily[] = [
  { q: 'Was machst du morgens als Erstes?', qIt: 'Cosa fai per prima cosa al mattino?', a: ['Aufstehen', 'Mi alzo', '🛏️'], d: [['Schlafen gehen', 'Vado a dormire', '😴'], ['Abendessen', 'Ceno', '🍽️']] },
  { q: 'Womit putzt du deine Zähne?', qIt: 'Con cosa ti lavi i denti?', a: ['Zahnbürste', 'Lo spazzolino', '🪥'], d: [['Löffel', 'Il cucchiaio', '🥄'], ['Kamm', 'Il pettine', '💇']] },
  { q: 'Was scheint am Tag am Himmel?', qIt: 'Cosa splende nel cielo di giorno?', a: ['Sonne', 'Il sole', '☀️'], d: [['Mond', 'La luna', '🌙'], ['Sterne', 'Le stelle', '⭐']] },
  { q: 'Was siehst du nachts am Himmel?', qIt: 'Cosa vedi nel cielo di notte?', a: ['Mond', 'La luna', '🌙'], d: [['Sonne', 'Il sole', '☀️'], ['Regenbogen', "L'arcobaleno", '🌈']] },
  { q: 'Was isst du morgens?', qIt: 'Cosa mangi al mattino?', a: ['Frühstück', 'La colazione', '🥣'], d: [['Abendessen', 'La cena', '🍝'], ['Geburtstagstorte', 'La torta di compleanno', '🎂']] },
  { q: 'Welche Tage sind Wochenende?', qIt: 'Quali giorni sono il fine settimana?', a: ['Samstag und Sonntag', 'Sabato e domenica', '🎉'], d: [['Montag und Dienstag', 'Lunedì e martedì', '🏫'], ['Mittwoch', 'Mercoledì', '📅']] },
]

const dayName = (w: (typeof WEEKDAYS)[number]) => (getLang() === 'it' ? cap(w.it) : w.de)
const sayWeek = () => speak(WEEKDAYS.map(dayName).join(', '))

function weekday(i: number, after: boolean): Round {
  const it = getLang() === 'it'
  const ans = WEEKDAYS[(i + (after ? 1 : 6)) % 7]
  const d = pickN(WEEKDAYS, 2, (w) => w.de === ans.de || w.de === WEEKDAYS[i].de)
  return {
    prompt: it ? `Quale giorno viene ${after ? 'dopo' : 'prima di'} ${WEEKDAYS[i].it}?` : `Welcher Tag kommt ${after ? 'nach' : 'vor'} ${WEEKDAYS[i].de}?`,
    readOptions: true,
    item: `wd:${i}:${after ? 'n' : 'v'}`,
    visual: (
      <button className="week" onClick={sayWeek} aria-label={t('Wochentage anhören', 'Ascolta i giorni della settimana')}>
        {WEEKDAYS.map((w) => (
          <span key={w.de} className={'week-day' + (w.de === WEEKDAYS[i].de ? ' hl' : '')}>
            {w.emoji}
          </span>
        ))}
        <span className="week-say">🔊</span>
      </button>
    ),
    options: shuffle([ans, ...d]).map((w) => ({ key: w.de, node: <span className="row-opt"><span className="row-emoji">{w.emoji}</span><span className="row-label">{dayName(w)}</span></span>, say: dayName(w), wide: true })),
    answer: ans.de,
    columns: 1,
  }
}

function season(s: (typeof SEASONS)[number]): Round {
  const it = getLang() === 'it'
  const name = (x: (typeof SEASONS)[number]) => (it ? cap(x.it) : x.de)
  return {
    prompt: it ? `${s.hintIt} Quale stagione è?` : `${s.hint} Welche Jahreszeit ist das?`,
    readOptions: true,
    item: `s:${s.de}`,
    options: shuffle(SEASONS).map((x) => ({ key: x.de, node: <span className="pic-opt"><span className="emoji-opt">{x.emoji}</span><span className="pic-label">{name(x)}</span></span>, say: name(x) })),
    answer: s.de,
    columns: 2,
  }
}

function daily(q: Daily): Round {
  const it = getLang() === 'it'
  return {
    prompt: it ? q.qIt : q.q,
    readOptions: true,
    item: `d:${q.q}`,
    options: shuffle([q.a, ...q.d]).map(([de, itl, e]) => {
      const label = it ? itl : de
      return { key: de, node: <span className="row-opt"><span className="row-emoji">{e}</span><span className="row-label">{label}</span></span>, say: label, wide: true }
    }),
    answer: q.a[0],
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
