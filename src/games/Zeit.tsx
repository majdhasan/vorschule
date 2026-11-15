import { useMemo } from 'react'
import { ChoiceGame, type GameProps, type Round } from '../components/ChoiceGame'
import { SEASONS, WEEKDAYS } from '../data/misc'
import { pickN, randInt, shuffle, coin } from '../lib/util'

const DAILY = [
  { q: 'Was machst du morgens als Erstes?', qIt: 'Cosa fai per prima cosa al mattino?', a: 'Aufstehen', e: '🛏️', d: [{ l: 'Schlafen gehen', e: '😴' }, { l: 'Abendessen', e: '🍽️' }] },
  { q: 'Womit putzt du deine Zähne?', qIt: 'Con cosa ti lavi i denti?', a: 'Zahnbürste', e: '🪥', d: [{ l: 'Löffel', e: '🥄' }, { l: 'Kamm', e: '💇' }] },
  { q: 'Was scheint am Tag am Himmel?', qIt: 'Cosa splende nel cielo di giorno?', a: 'Sonne', e: '☀️', d: [{ l: 'Mond', e: '🌙' }, { l: 'Sterne', e: '⭐' }] },
  { q: 'Was siehst du nachts am Himmel?', qIt: 'Cosa vedi nel cielo di notte?', a: 'Mond', e: '🌙', d: [{ l: 'Sonne', e: '☀️' }, { l: 'Regenbogen', e: '🌈' }] },
  { q: 'Was isst du morgens?', qIt: 'Cosa mangi al mattino?', a: 'Frühstück', e: '🥣', d: [{ l: 'Abendessen', e: '🍝' }, { l: 'Geburtstagstorte', e: '🎂' }] },
  { q: 'Welche Tage sind Wochenende?', qIt: 'Quali giorni sono il fine settimana?', a: 'Samstag und Sonntag', e: '🎉', d: [{ l: 'Montag und Dienstag', e: '🏫' }, { l: 'Mittwoch', e: '📅' }] },
]

export default function Zeit({ level, bilingual, onFinish, onClose }: GameProps) {
  const rounds = useMemo<Round[]>(() => {
    const out: Round[] = []
    // 2 weekday rounds
    for (let k = 0; k < 2; k++) {
      const i = randInt(0, 6)
      const after = level >= 2 && coin() ? false : true
      const ans = WEEKDAYS[(i + (after ? 1 : 6)) % 7]
      const d = pickN(WEEKDAYS, 2, (w) => w.de === ans.de || w.de === WEEKDAYS[i].de)
      out.push({
        promptDe: `Welcher Tag kommt ${after ? 'nach' : 'vor'} ${WEEKDAYS[i].de}?`,
        promptIt: `Quale giorno viene ${after ? 'dopo' : 'prima di'} ${WEEKDAYS[i].it}?`,
        visual: (
          <div className="week">
            {WEEKDAYS.map((w) => (
              <span key={w.de} className={'week-day' + (w.de === WEEKDAYS[i].de ? ' hl' : '')}>
                {level === 3 ? '' : w.emoji} {w.de.slice(0, 2)}
              </span>
            ))}
          </div>
        ),
        options: shuffle([ans, ...d]).map((w) => ({ key: w.de, node: <span className="row-opt"><span className="row-emoji">{w.emoji}</span><span className="row-label">{w.de}</span></span>, sayDe: w.de, sayIt: w.it, wide: true })),
        answer: ans.de,
        columns: 1,
      })
    }
    // 2 season rounds
    for (const s of pickN(SEASONS, 2)) {
      out.push({
        promptDe: `${s.hint} Welche Jahreszeit ist das?`,
        promptIt: `Quale stagione è?`,
        options: shuffle(SEASONS).map((x) => ({ key: x.de, node: <span className="pic-opt"><span className="emoji-opt">{x.emoji}</span><span className="pic-label">{x.de}</span></span>, sayDe: x.de, sayIt: x.it })),
        answer: s.de,
        columns: 2,
      })
    }
    // 2 daily routine rounds
    for (const q of pickN(DAILY, 2)) {
      const opts = shuffle([{ l: q.a, e: q.e }, ...q.d])
      out.push({
        promptDe: q.q,
        promptIt: q.qIt,
        options: opts.map((o) => ({ key: o.l, node: <span className="row-opt"><span className="row-emoji">{o.e}</span><span className="row-label">{o.l}</span></span>, sayDe: o.l, wide: true })),
        answer: q.a,
        columns: 1,
      })
    }
    return shuffle(out)
  }, [level])
  return <ChoiceGame rounds={rounds} bilingual={bilingual} onFinish={onFinish} onClose={onClose} />
}
