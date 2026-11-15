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

// ---------- stickers: themed sets, some rare ----------
export type Sticker = { id: string; emoji: string; de: string; it: string; set: string; rare?: boolean }
export const STICKER_SETS = [
  { id: 'berlin', de: 'Berlin', it: 'Berlino', emoji: '🐻' },
  { id: 'tiere', de: 'Tiere', it: 'Animali', emoji: '🦁' },
  { id: 'weltall', de: 'Weltall', it: 'Spazio', emoji: '🚀' },
  { id: 'italia', de: 'Italia', it: 'Italia', emoji: '🇮🇹' },
  { id: 'schule', de: 'Schule', it: 'Scuola', emoji: '🎒' },
] as const

const st = (set: string, emoji: string, de: string, it: string, rare = false): Sticker => ({ id: emoji, emoji, de, it, set, rare })
export const STICKERS: Sticker[] = [
  st('berlin', '🐻', 'Berliner Bär', 'orso di Berlino'),
  st('berlin', '🚆', 'S-Bahn', 'treno'),
  st('berlin', '🚇', 'U-Bahn', 'metropolitana'),
  st('berlin', '🗼', 'Fernsehturm', 'torre della TV'),
  st('berlin', '🌭', 'Currywurst', 'currywurst'),
  st('berlin', '🚤', 'Spree-Boot', 'barca sulla Sprea'),
  st('berlin', '🚦', 'Ampelmännchen', 'omino del semaforo'),
  st('berlin', '🏰', 'Schloss', 'castello', true),
  st('tiere', '🦁', 'Löwe', 'leone'),
  st('tiere', '🐼', 'Panda', 'panda'),
  st('tiere', '🦊', 'Fuchs', 'volpe'),
  st('tiere', '🐬', 'Delfin', 'delfino'),
  st('tiere', '🐙', 'Krake', 'polpo'),
  st('tiere', '🦜', 'Papagei', 'pappagallo'),
  st('tiere', '🦖', 'T-Rex', 'T-Rex'),
  st('tiere', '🦄', 'Einhorn', 'unicorno', true),
  st('tiere', '🐉', 'Drache', 'drago', true),
  st('weltall', '🚀', 'Rakete', 'razzo'),
  st('weltall', '🛸', 'Ufo', 'ufo'),
  st('weltall', '🪐', 'Saturn', 'Saturno'),
  st('weltall', '🌙', 'Mond', 'luna'),
  st('weltall', '☄️', 'Komet', 'cometa'),
  st('weltall', '👽', 'Außerirdischer', 'alieno'),
  st('weltall', '👩‍🚀', 'Astronautin', 'astronauta', true),
  st('italia', '🍕', 'Pizza', 'pizza'),
  st('italia', '🍝', 'Spaghetti', 'spaghetti'),
  st('italia', '🍦', 'Gelato', 'gelato'),
  st('italia', '🛵', 'Vespa', 'Vespa'),
  st('italia', '🍋', 'Zitrone', 'limone'),
  st('italia', '⛵', 'Segelboot', 'barca a vela'),
  st('italia', '🌋', 'Vesuv', 'Vesuvio', true),
  st('schule', '🎒', 'Schulranzen', 'zaino'),
  st('schule', '✏️', 'Bleistift', 'matita'),
  st('schule', '📚', 'Bücher', 'libri'),
  st('schule', '🖍️', 'Wachsmalstifte', 'pastelli'),
  st('schule', '🧮', 'Rechenschieber', 'pallottoliere'),
  st('schule', '🏆', 'Pokal', 'coppa'),
  st('schule', '🎓', 'Schulkind!', 'scolaro!', true),
]
export const stickerById = (id: string) => STICKERS.find((s) => s.id === id)
export const SET_BONUS_GEMS = 20

// ---------- shop ----------
export const OUTFITS = [
  { id: '', emoji: '', de: 'Ohne', price: 0 },
  { id: 'kappe', emoji: '🧢', de: 'Kappe', price: 20 },
  { id: 'schleife', emoji: '🎀', de: 'Schleife', price: 20 },
  { id: 'brille', emoji: '🕶️', de: 'Sonnenbrille', price: 30 },
  { id: 'zylinder', emoji: '🎩', de: 'Zylinder', price: 30 },
  { id: 'doktorhut', emoji: '🎓', de: 'Doktorhut', price: 40 },
  { id: 'krone', emoji: '👑', de: 'Krone', price: 60 },
]
export const THEMES = [
  { id: '', de: 'Standard', emoji: '🏞️', deco: [] as string[], price: 0 },
  { id: 'wald', de: 'Wald', emoji: '🌲', deco: ['🌲', '🌳', '🍄', '🦔', '🌼'], price: 30 },
  { id: 'meer', de: 'Meer', emoji: '🌊', deco: ['🐚', '🐠', '🌊', '🦀', '🐳'], price: 30 },
  { id: 'weltall', de: 'Weltall', emoji: '🪐', deco: ['⭐', '🪐', '🌙', '✨', '☄️'], price: 40 },
]
export const STICKER_PACK_PRICE = 15
export const FREEZE_PRICE = 20
export const MAX_FREEZES = 2

export const AVATARS = ['🧒', '👦', '👧', '👩', '👨', '👵', '👴', '🧑', '🦸', '🧙']
