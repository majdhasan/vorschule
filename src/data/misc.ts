export const COLORS = [
  { id: 'rot', de: 'rot', it: 'rosso', hex: '#e63946' },
  { id: 'blau', de: 'blau', it: 'blu', hex: '#1d6fd1' },
  { id: 'gruen', de: 'grün', it: 'verde', hex: '#2a9d4b' },
  { id: 'gelb', de: 'gelb', it: 'giallo', hex: '#f6c90e' },
  { id: 'orange', de: 'orange', it: 'arancione', hex: '#f77f00' },
  { id: 'lila', de: 'lila', it: 'viola', hex: '#8e44ad' },
  { id: 'rosa', de: 'rosa', it: 'rosa', hex: '#ff85c0' },
  { id: 'braun', de: 'braun', it: 'marrone', hex: '#8d5524' },
] as const

export const SHAPES = [
  { id: 'kreis', de: 'Kreis', it: 'cerchio' },
  { id: 'quadrat', de: 'Quadrat', it: 'quadrato' },
  { id: 'dreieck', de: 'Dreieck', it: 'triangolo' },
  { id: 'rechteck', de: 'Rechteck', it: 'rettangolo' },
  { id: 'stern', de: 'Stern', it: 'stella' },
  { id: 'herz', de: 'Herz', it: 'cuore' },
] as const
export type ShapeId = (typeof SHAPES)[number]['id']
export type ColorId = (typeof COLORS)[number]['id']

export const NUMBER_WORDS_DE = ['null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn', 'elf', 'zwölf', 'dreizehn', 'vierzehn', 'fünfzehn', 'sechzehn', 'siebzehn', 'achtzehn', 'neunzehn', 'zwanzig']
export const NUMBER_WORDS_IT = ['zero', 'uno', 'due', 'tre', 'quattro', 'cinque', 'sei', 'sette', 'otto', 'nove', 'dieci', 'undici', 'dodici', 'tredici', 'quattordici', 'quindici', 'sedici', 'diciassette', 'diciotto', 'diciannove', 'venti']

export const WEEKDAYS = [
  { de: 'Montag', it: 'lunedì', emoji: '1️⃣' },
  { de: 'Dienstag', it: 'martedì', emoji: '2️⃣' },
  { de: 'Mittwoch', it: 'mercoledì', emoji: '3️⃣' },
  { de: 'Donnerstag', it: 'giovedì', emoji: '4️⃣' },
  { de: 'Freitag', it: 'venerdì', emoji: '5️⃣' },
  { de: 'Samstag', it: 'sabato', emoji: '6️⃣' },
  { de: 'Sonntag', it: 'domenica', emoji: '7️⃣' },
]

export const SEASONS = [
  { de: 'Frühling', it: 'primavera', emoji: '🌷', hint: 'Blumen blühen, die Vögel singen.' },
  { de: 'Sommer', it: 'estate', emoji: '☀️', hint: 'Es ist heiß, wir gehen ins Freibad.' },
  { de: 'Herbst', it: 'autunno', emoji: '🍂', hint: 'Die Blätter fallen, wir sammeln Kastanien.' },
  { de: 'Winter', it: 'inverno', emoji: '⛄', hint: 'Es schneit und wir bauen einen Schneemann.' },
]

// Stickers unlocked with stars (one per STICKER_EVERY stars)
export const STICKERS = [
  { emoji: '🐻', de: 'Berliner Bär', it: 'orso di Berlino' },
  { emoji: '🚀', de: 'Rakete', it: 'razzo' },
  { emoji: '🦄', de: 'Einhorn', it: 'unicorno' },
  { emoji: '🚒', de: 'Feuerwehr', it: 'pompieri' },
  { emoji: '🐉', de: 'Drache', it: 'drago' },
  { emoji: '🏆', de: 'Pokal', it: 'coppa' },
  { emoji: '🦖', de: 'T-Rex', it: 'T-Rex' },
  { emoji: '🚆', de: 'S-Bahn', it: 'treno' },
  { emoji: '🎸', de: 'Gitarre', it: 'chitarra' },
  { emoji: '🦁', de: 'Löwe', it: 'leone' },
  { emoji: '🍕', de: 'Pizza', it: 'pizza' },
  { emoji: '🛸', de: 'Ufo', it: 'ufo' },
  { emoji: '🐬', de: 'Delfin', it: 'delfino' },
  { emoji: '🎪', de: 'Zirkus', it: 'circo' },
  { emoji: '🦸', de: 'Superheld', it: 'supereroe' },
  { emoji: '🐙', de: 'Krake', it: 'polpo' },
  { emoji: '🏰', de: 'Schloss', it: 'castello' },
  { emoji: '🎠', de: 'Karussell', it: 'giostra' },
  { emoji: '🦜', de: 'Papagei', it: 'pappagallo' },
  { emoji: '🚁', de: 'Hubschrauber', it: 'elicottero' },
  { emoji: '🧙', de: 'Zauberer', it: 'mago' },
  { emoji: '🐼', de: 'Panda', it: 'panda' },
  { emoji: '⚽', de: 'Fußball', it: 'pallone' },
  { emoji: '🌈', de: 'Regenbogen', it: 'arcobaleno' },
  { emoji: '🦊', de: 'Fuchs', it: 'volpe' },
  { emoji: '🎂', de: 'Torte', it: 'torta' },
  { emoji: '🐳', de: 'Wal', it: 'balena' },
  { emoji: '🏎️', de: 'Rennauto', it: 'auto da corsa' },
  { emoji: '👑', de: 'Krone', it: 'corona' },
  { emoji: '🎓', de: 'Schulkind!', it: 'scolaro!' },
]
