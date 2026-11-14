import type { ComponentType } from 'react'
import type { GameProps } from '../components/ChoiceGame'
import Anlaute from './Anlaute'
import Reime from './Reime'
import Silben from './Silben'
import Buchstaben from './Buchstaben'
import Nachspuren from './Nachspuren'
import Italienisch from './Italienisch'
import Zaehlen from './Zaehlen'
import Mengen from './Mengen'
import Rechnen from './Rechnen'
import Muster from './Muster'
import Formen from './Formen'
import Uhr from './Uhr'
import Memory from './Memory'
import Zeit from './Zeit'
import { Berlin, Schulweg } from './Quiz'

export type Area = 'sprache' | 'zahlen' | 'denken' | 'welt'

export type Game = {
  id: string
  title: string
  titleIt: string
  emoji: string
  area: Area
  color: string
  skill: string // what it trains (for parents)
  component: ComponentType<GameProps>
}

export const AREAS: Record<Area, { de: string; it: string; emoji: string }> = {
  sprache: { de: 'Sprache & Buchstaben', it: 'Lingua e lettere', emoji: '🔤' },
  zahlen: { de: 'Zahlen & Formen', it: 'Numeri e forme', emoji: '🔢' },
  denken: { de: 'Denken & Merken', it: 'Pensare e ricordare', emoji: '🧠' },
  welt: { de: 'Meine Welt', it: 'Il mio mondo', emoji: '🌍' },
}

export const GAMES: Game[] = [
  { id: 'anlaute', title: 'Anlaute', titleIt: 'Suoni iniziali', emoji: '🔤', area: 'sprache', color: '#ffb703', skill: 'Phonologische Bewusstheit: Anfangslaute hören und Buchstaben zuordnen', component: Anlaute },
  { id: 'reime', title: 'Reime', titleIt: 'Rime', emoji: '🎵', area: 'sprache', color: '#ff7b9c', skill: 'Reime erkennen – wichtig fürs Lesenlernen', component: Reime },
  { id: 'silben', title: 'Silben klatschen', titleIt: 'Sillabe', emoji: '👏', area: 'sprache', color: '#8ecae6', skill: 'Wörter in Silben gliedern', component: Silben },
  { id: 'buchstaben', title: 'Buchstaben', titleIt: 'Lettere', emoji: '🔎', area: 'sprache', color: '#a7c957', skill: 'Groß- und Kleinbuchstaben erkennen und zuordnen', component: Buchstaben },
  { id: 'spuren', title: 'Nachspuren', titleIt: 'Ripassare', emoji: '✏️', area: 'sprache', color: '#cdb4db', skill: 'Feinmotorik: Buchstaben und Zahlen nachfahren', component: Nachspuren },
  { id: 'italienisch', title: 'Italiano', titleIt: 'Italiano', emoji: '🇮🇹', area: 'sprache', color: '#6ecb63', skill: 'Italienischer Wortschatz – hören und Bild finden', component: Italienisch },
  { id: 'zaehlen', title: 'Zählen', titleIt: 'Contare', emoji: '🔢', area: 'zahlen', color: '#219ebc', skill: 'Mengen zählen und Zahlen zuordnen (bis 20)', component: Zaehlen },
  { id: 'mengen', title: 'Mehr oder weniger', titleIt: 'Più o meno', emoji: '⚖️', area: 'zahlen', color: '#fb8500', skill: 'Mengen vergleichen', component: Mengen },
  { id: 'rechnen', title: 'Plus und Minus', titleIt: 'Più e meno', emoji: '➕', area: 'zahlen', color: '#e63946', skill: 'Erstes Rechnen im Zahlenraum bis 10 / 20', component: Rechnen },
  { id: 'formen', title: 'Formen & Farben', titleIt: 'Forme e colori', emoji: '🔷', area: 'zahlen', color: '#8e44ad', skill: 'Formen und Farben benennen (auch Italienisch)', component: Formen },
  { id: 'uhr', title: 'Uhrzeit', titleIt: "L'ora", emoji: '🕐', area: 'zahlen', color: '#2a9d4b', skill: 'Volle und halbe Stunden ablesen', component: Uhr },
  { id: 'muster', title: 'Muster', titleIt: 'Sequenze', emoji: '🧩', area: 'denken', color: '#ff9f1c', skill: 'Logik: Muster erkennen und fortsetzen', component: Muster },
  { id: 'memory', title: 'Memory', titleIt: 'Memory', emoji: '🃏', area: 'denken', color: '#06d6a0', skill: 'Konzentration und Merkfähigkeit', component: Memory },
  { id: 'zeit', title: 'Tage & Jahreszeiten', titleIt: 'Giorni e stagioni', emoji: '📅', area: 'welt', color: '#4cc9f0', skill: 'Wochentage, Jahreszeiten, Tagesablauf', component: Zeit },
  { id: 'berlin', title: 'Mein Berlin', titleIt: 'La mia Berlino', emoji: '🐻', area: 'welt', color: '#e63946', skill: 'Heimatkunde: Berlin kennenlernen', component: Berlin },
  { id: 'schulweg', title: 'Schulweg & Schule', titleIt: 'A scuola', emoji: '🚦', area: 'welt', color: '#3a86ff', skill: 'Verkehrssicherheit, Schulregeln, Selbstständigkeit', component: Schulweg },
]

export const gameById = (id: string) => GAMES.find((g) => g.id === id)!
