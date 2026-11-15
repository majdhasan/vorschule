import type { ComponentType } from 'react'
import type { GameProps } from '../components/ChoiceGame'
import { readableDark } from '../lib/util'
import { build as anlaute } from './Anlaute'
import { build as reime } from './Reime'
import { build as silben } from './Silben'
import { build as buchstaben } from './Buchstaben'
import Nachspuren from './Nachspuren'
import { build as italienisch } from './Italienisch'
import { build as zaehlen } from './Zaehlen'
import { build as mengen } from './Mengen'
import { build as rechnen } from './Rechnen'
import { build as muster } from './Muster'
import { build as formen } from './Formen'
import { build as uhr } from './Uhr'
import Memory from './Memory'
import { build as zeit } from './Zeit'
import { buildBerlin, buildSchulweg } from './Quiz'
import type { Builder } from './types'

export type Area = 'sprache' | 'zahlen' | 'denken' | 'welt'

export type Game = {
  id: string
  title: string
  titleIt: string
  emoji: string
  area: Area
  color: string
  skill: string // what it trains (for parents)
  /** question games: build rounds (also used for mixed tests and mistakes) */
  build?: Builder
  /** free-form games (Memory, Nachspuren) */
  component?: ComponentType<GameProps>
  /** darker shade of `color` that white text is readable on */
  dark: string
}

export const AREAS: Record<Area, { de: string; it: string; emoji: string }> = {
  sprache: { de: 'Sprache & Buchstaben', it: 'Lingua e lettere', emoji: '🔤' },
  zahlen: { de: 'Zahlen & Formen', it: 'Numeri e forme', emoji: '🔢' },
  denken: { de: 'Denken & Merken', it: 'Pensare e ricordare', emoji: '🧠' },
  welt: { de: 'Meine Welt', it: 'Il mio mondo', emoji: '🌍' },
}

const RAW: Omit<Game, 'dark'>[] = [
  { id: 'anlaute', title: 'Anlaute', titleIt: 'Suoni iniziali', emoji: '🔤', area: 'sprache', color: '#ffb703', skill: 'Phonologische Bewusstheit: Anfangslaute hören und Buchstaben zuordnen', build: anlaute },
  { id: 'reime', title: 'Reime', titleIt: 'Rime', emoji: '🎵', area: 'sprache', color: '#ff7b9c', skill: 'Reime erkennen – wichtig fürs Lesenlernen', build: reime },
  { id: 'silben', title: 'Silben klatschen', titleIt: 'Sillabe', emoji: '👏', area: 'sprache', color: '#8ecae6', skill: 'Wörter in Silben gliedern', build: silben },
  { id: 'buchstaben', title: 'Buchstaben', titleIt: 'Lettere', emoji: '🔎', area: 'sprache', color: '#a7c957', skill: 'Groß- und Kleinbuchstaben erkennen und zuordnen', build: buchstaben },
  { id: 'spuren', title: 'Nachspuren', titleIt: 'Ripassare', emoji: '✏️', area: 'sprache', color: '#cdb4db', skill: 'Feinmotorik: Buchstaben und Zahlen nachfahren', component: Nachspuren },
  { id: 'italienisch', title: 'Italiano', titleIt: 'Italiano', emoji: '🇮🇹', area: 'sprache', color: '#6ecb63', skill: 'Italienischer Wortschatz – hören und Bild finden', build: italienisch },
  { id: 'zaehlen', title: 'Zählen', titleIt: 'Contare', emoji: '🔢', area: 'zahlen', color: '#219ebc', skill: 'Mengen zählen und Zahlen zuordnen (bis 20)', build: zaehlen },
  { id: 'mengen', title: 'Mehr oder weniger', titleIt: 'Più o meno', emoji: '⚖️', area: 'zahlen', color: '#fb8500', skill: 'Mengen vergleichen', build: mengen },
  { id: 'rechnen', title: 'Plus und Minus', titleIt: 'Più e meno', emoji: '➕', area: 'zahlen', color: '#e63946', skill: 'Erstes Rechnen im Zahlenraum bis 10 – mit Punkten', build: rechnen },
  { id: 'formen', title: 'Formen & Farben', titleIt: 'Forme e colori', emoji: '🔷', area: 'zahlen', color: '#8e44ad', skill: 'Formen und Farben benennen (auch Italienisch)', build: formen },
  { id: 'uhr', title: 'Uhrzeit', titleIt: "L'ora", emoji: '🕐', area: 'zahlen', color: '#2a9d4b', skill: 'Volle Stunden auf der Uhr ablesen', build: uhr },
  { id: 'muster', title: 'Muster', titleIt: 'Sequenze', emoji: '🧩', area: 'denken', color: '#ff9f1c', skill: 'Logik: Muster erkennen und fortsetzen', build: muster },
  { id: 'memory', title: 'Memory', titleIt: 'Memory', emoji: '🃏', area: 'denken', color: '#06d6a0', skill: 'Konzentration und Merkfähigkeit', component: Memory },
  { id: 'zeit', title: 'Tage & Jahreszeiten', titleIt: 'Giorni e stagioni', emoji: '📅', area: 'welt', color: '#4cc9f0', skill: 'Wochentage, Jahreszeiten, Tagesablauf', build: zeit },
  { id: 'berlin', title: 'Mein Berlin', titleIt: 'La mia Berlino', emoji: '🐻', area: 'welt', color: '#e63946', skill: 'Heimatkunde: Berlin kennenlernen', build: buildBerlin },
  { id: 'schulweg', title: 'Schulweg & Schule', titleIt: 'A scuola', emoji: '🚦', area: 'welt', color: '#3a86ff', skill: 'Verkehrssicherheit, Schulregeln, Selbstständigkeit', build: buildSchulweg },
]

export const GAMES: Game[] = RAW.map((g) => ({ ...g, dark: readableDark(g.color) }))

export const gameById = (id: string) => GAMES.find((g) => g.id === id)!
