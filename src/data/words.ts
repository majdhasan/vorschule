// Nouns with emoji in German and Italian, syllable counts and the German Anlaut.
// anlaut = null → excluded from the German Anlaut game (diphthong / Sch / St / V-as-F etc.)
// itSyl = 0 → excluded from the Italian syllable game (more than one word)
export type Word = {
  de: string
  it: string
  itSyl: number
  emoji: string
  syl: number
  anlaut: string | null
  article: 'der' | 'die' | 'das'
}

export const WORDS: Word[] = [
  { de: 'Apfel', it: 'mela', itSyl: 2, emoji: '🍎', syl: 2, anlaut: 'A', article: 'der' },
  { de: 'Affe', it: 'scimmia', itSyl: 2, emoji: '🐵', syl: 2, anlaut: 'A', article: 'der' },
  { de: 'Ameise', it: 'formica', itSyl: 3, emoji: '🐜', syl: 3, anlaut: 'A', article: 'die' },
  { de: 'Ananas', it: 'ananas', itSyl: 3, emoji: '🍍', syl: 3, anlaut: 'A', article: 'die' },
  { de: 'Auto', it: 'macchina', itSyl: 3, emoji: '🚗', syl: 2, anlaut: null, article: 'das' },
  { de: 'Banane', it: 'banana', itSyl: 3, emoji: '🍌', syl: 3, anlaut: 'B', article: 'die' },
  { de: 'Ball', it: 'palla', itSyl: 2, emoji: '⚽', syl: 1, anlaut: 'B', article: 'der' },
  { de: 'Bär', it: 'orso', itSyl: 2, emoji: '🐻', syl: 1, anlaut: 'B', article: 'der' },
  { de: 'Baum', it: 'albero', itSyl: 3, emoji: '🌳', syl: 1, anlaut: 'B', article: 'der' },
  { de: 'Buch', it: 'libro', itSyl: 2, emoji: '📖', syl: 1, anlaut: 'B', article: 'das' },
  { de: 'Blume', it: 'fiore', itSyl: 2, emoji: '🌸', syl: 2, anlaut: 'B', article: 'die' },
  { de: 'Brot', it: 'pane', itSyl: 2, emoji: '🍞', syl: 1, anlaut: 'B', article: 'das' },
  { de: 'Biene', it: 'ape', itSyl: 2, emoji: '🐝', syl: 2, anlaut: 'B', article: 'die' },
  { de: 'Birne', it: 'pera', itSyl: 2, emoji: '🍐', syl: 2, anlaut: 'B', article: 'die' },
  { de: 'Bus', it: 'autobus', itSyl: 3, emoji: '🚌', syl: 1, anlaut: 'B', article: 'der' },
  { de: 'Drache', it: 'drago', itSyl: 2, emoji: '🐉', syl: 2, anlaut: 'D', article: 'der' },
  { de: 'Delfin', it: 'delfino', itSyl: 3, emoji: '🐬', syl: 2, anlaut: 'D', article: 'der' },
  { de: 'Dinosaurier', it: 'dinosauro', itSyl: 4, emoji: '🦖', syl: 5, anlaut: 'D', article: 'der' },
  { de: 'Elefant', it: 'elefante', itSyl: 4, emoji: '🐘', syl: 3, anlaut: 'E', article: 'der' },
  { de: 'Ente', it: 'anatra', itSyl: 3, emoji: '🦆', syl: 2, anlaut: 'E', article: 'die' },
  { de: 'Eis', it: 'gelato', itSyl: 3, emoji: '🍦', syl: 1, anlaut: null, article: 'das' },
  { de: 'Erdbeere', it: 'fragola', itSyl: 3, emoji: '🍓', syl: 3, anlaut: 'E', article: 'die' },
  { de: 'Eule', it: 'gufo', itSyl: 2, emoji: '🦉', syl: 2, anlaut: null, article: 'die' },
  { de: 'Ei', it: 'uovo', itSyl: 2, emoji: '🥚', syl: 1, anlaut: null, article: 'das' },
  { de: 'Fisch', it: 'pesce', itSyl: 2, emoji: '🐟', syl: 1, anlaut: 'F', article: 'der' },
  { de: 'Frosch', it: 'rana', itSyl: 2, emoji: '🐸', syl: 1, anlaut: 'F', article: 'der' },
  { de: 'Feuer', it: 'fuoco', itSyl: 2, emoji: '🔥', syl: 2, anlaut: 'F', article: 'das' },
  { de: 'Fahrrad', it: 'bicicletta', itSyl: 4, emoji: '🚲', syl: 2, anlaut: 'F', article: 'das' },
  { de: 'Giraffe', it: 'giraffa', itSyl: 3, emoji: '🦒', syl: 3, anlaut: 'G', article: 'die' },
  { de: 'Gitarre', it: 'chitarra', itSyl: 3, emoji: '🎸', syl: 3, anlaut: 'G', article: 'die' },
  { de: 'Geschenk', it: 'regalo', itSyl: 3, emoji: '🎁', syl: 2, anlaut: 'G', article: 'das' },
  { de: 'Gurke', it: 'cetriolo', itSyl: 3, emoji: '🥒', syl: 2, anlaut: 'G', article: 'die' },
  { de: 'Hund', it: 'cane', itSyl: 2, emoji: '🐶', syl: 1, anlaut: 'H', article: 'der' },
  { de: 'Haus', it: 'casa', itSyl: 2, emoji: '🏠', syl: 1, anlaut: 'H', article: 'das' },
  { de: 'Hase', it: 'coniglio', itSyl: 3, emoji: '🐰', syl: 2, anlaut: 'H', article: 'der' },
  { de: 'Hubschrauber', it: 'elicottero', itSyl: 5, emoji: '🚁', syl: 3, anlaut: 'H', article: 'der' },
  { de: 'Hut', it: 'cappello', itSyl: 3, emoji: '🎩', syl: 1, anlaut: 'H', article: 'der' },
  { de: 'Herz', it: 'cuore', itSyl: 2, emoji: '❤️', syl: 1, anlaut: 'H', article: 'das' },
  { de: 'Hemd', it: 'camicia', itSyl: 3, emoji: '👕', syl: 1, anlaut: 'H', article: 'das' },
  { de: 'Hand', it: 'mano', itSyl: 2, emoji: '✋', syl: 1, anlaut: 'H', article: 'die' },
  { de: 'Igel', it: 'riccio', itSyl: 2, emoji: '🦔', syl: 2, anlaut: 'I', article: 'der' },
  { de: 'Insel', it: 'isola', itSyl: 3, emoji: '🏝️', syl: 2, anlaut: 'I', article: 'die' },
  { de: 'Jacke', it: 'giacca', itSyl: 2, emoji: '🧥', syl: 2, anlaut: 'J', article: 'die' },
  { de: 'Katze', it: 'gatto', itSyl: 2, emoji: '🐱', syl: 2, anlaut: 'K', article: 'die' },
  { de: 'Kuh', it: 'mucca', itSyl: 2, emoji: '🐮', syl: 1, anlaut: 'K', article: 'die' },
  { de: 'Kerze', it: 'candela', itSyl: 3, emoji: '🕯️', syl: 2, anlaut: 'K', article: 'die' },
  { de: 'Käse', it: 'formaggio', itSyl: 3, emoji: '🧀', syl: 2, anlaut: 'K', article: 'der' },
  { de: 'Krokodil', it: 'coccodrillo', itSyl: 4, emoji: '🐊', syl: 3, anlaut: 'K', article: 'das' },
  { de: 'Karotte', it: 'carota', itSyl: 3, emoji: '🥕', syl: 3, anlaut: 'K', article: 'die' },
  { de: 'Kamera', it: 'macchina fotografica', itSyl: 0, emoji: '📷', syl: 3, anlaut: 'K', article: 'die' },
  { de: 'Koffer', it: 'valigia', itSyl: 3, emoji: '🧳', syl: 2, anlaut: 'K', article: 'der' },
  { de: 'Kiwi', it: 'kiwi', itSyl: 2, emoji: '🥝', syl: 2, anlaut: 'K', article: 'die' },
  { de: 'Löwe', it: 'leone', itSyl: 3, emoji: '🦁', syl: 2, anlaut: 'L', article: 'der' },
  { de: 'Lampe', it: 'lampada', itSyl: 3, emoji: '💡', syl: 2, anlaut: 'L', article: 'die' },
  { de: 'Lupe', it: 'lente', itSyl: 2, emoji: '🔍', syl: 2, anlaut: 'L', article: 'die' },
  { de: 'Maus', it: 'topo', itSyl: 2, emoji: '🐭', syl: 1, anlaut: 'M', article: 'die' },
  { de: 'Mond', it: 'luna', itSyl: 2, emoji: '🌙', syl: 1, anlaut: 'M', article: 'der' },
  { de: 'Milch', it: 'latte', itSyl: 2, emoji: '🥛', syl: 1, anlaut: 'M', article: 'die' },
  { de: 'Melone', it: 'melone', itSyl: 3, emoji: '🍉', syl: 3, anlaut: 'M', article: 'die' },
  { de: 'Mütze', it: 'berretto', itSyl: 3, emoji: '🧢', syl: 2, anlaut: 'M', article: 'die' },
  { de: 'Nase', it: 'naso', itSyl: 2, emoji: '👃', syl: 2, anlaut: 'N', article: 'die' },
  { de: 'Nuss', it: 'noce', itSyl: 2, emoji: '🥜', syl: 1, anlaut: 'N', article: 'die' },
  { de: 'Nilpferd', it: 'ippopotamo', itSyl: 5, emoji: '🦛', syl: 2, anlaut: 'N', article: 'das' },
  { de: 'Nudeln', it: 'pasta', itSyl: 2, emoji: '🍝', syl: 2, anlaut: 'N', article: 'die' },
  { de: 'Orange', it: 'arancia', itSyl: 3, emoji: '🍊', syl: 3, anlaut: 'O', article: 'die' },
  { de: 'Oma', it: 'nonna', itSyl: 2, emoji: '👵', syl: 2, anlaut: 'O', article: 'die' },
  { de: 'Pferd', it: 'cavallo', itSyl: 3, emoji: '🐴', syl: 1, anlaut: 'P', article: 'das' },
  { de: 'Pizza', it: 'pizza', itSyl: 2, emoji: '🍕', syl: 2, anlaut: 'P', article: 'die' },
  { de: 'Papagei', it: 'pappagallo', itSyl: 4, emoji: '🦜', syl: 3, anlaut: 'P', article: 'der' },
  { de: 'Pinguin', it: 'pinguino', itSyl: 3, emoji: '🐧', syl: 3, anlaut: 'P', article: 'der' },
  { de: 'Pilz', it: 'fungo', itSyl: 2, emoji: '🍄', syl: 1, anlaut: 'P', article: 'der' },
  { de: 'Rakete', it: 'razzo', itSyl: 2, emoji: '🚀', syl: 3, anlaut: 'R', article: 'die' },
  { de: 'Regen', it: 'pioggia', itSyl: 2, emoji: '🌧️', syl: 2, anlaut: 'R', article: 'der' },
  { de: 'Roboter', it: 'robot', itSyl: 2, emoji: '🤖', syl: 3, anlaut: 'R', article: 'der' },
  { de: 'Rose', it: 'rosa', itSyl: 2, emoji: '🌹', syl: 2, anlaut: 'R', article: 'die' },
  { de: 'Regenbogen', it: 'arcobaleno', itSyl: 5, emoji: '🌈', syl: 4, anlaut: 'R', article: 'der' },
  { de: 'Sonne', it: 'sole', itSyl: 2, emoji: '☀️', syl: 2, anlaut: 'S', article: 'die' },
  { de: 'Socke', it: 'calza', itSyl: 2, emoji: '🧦', syl: 2, anlaut: 'S', article: 'die' },
  { de: 'Schuh', it: 'scarpa', itSyl: 2, emoji: '👟', syl: 1, anlaut: null, article: 'der' },
  { de: 'Schlange', it: 'serpente', itSyl: 3, emoji: '🐍', syl: 2, anlaut: null, article: 'die' },
  { de: 'Schmetterling', it: 'farfalla', itSyl: 3, emoji: '🦋', syl: 3, anlaut: null, article: 'der' },
  { de: 'Schildkröte', it: 'tartaruga', itSyl: 4, emoji: '🐢', syl: 3, anlaut: null, article: 'die' },
  { de: 'Schiff', it: 'nave', itSyl: 2, emoji: '🚢', syl: 1, anlaut: null, article: 'das' },
  { de: 'Schnecke', it: 'lumaca', itSyl: 3, emoji: '🐌', syl: 2, anlaut: null, article: 'die' },
  { de: 'Schere', it: 'forbici', itSyl: 3, emoji: '✂️', syl: 2, anlaut: null, article: 'die' },
  { de: 'Stern', it: 'stella', itSyl: 2, emoji: '⭐', syl: 1, anlaut: null, article: 'der' },
  { de: 'Tiger', it: 'tigre', itSyl: 2, emoji: '🐯', syl: 2, anlaut: 'T', article: 'der' },
  { de: 'Tomate', it: 'pomodoro', itSyl: 4, emoji: '🍅', syl: 3, anlaut: 'T', article: 'die' },
  { de: 'Tasse', it: 'tazza', itSyl: 2, emoji: '☕', syl: 2, anlaut: 'T', article: 'die' },
  { de: 'Tür', it: 'porta', itSyl: 2, emoji: '🚪', syl: 1, anlaut: 'T', article: 'die' },
  { de: 'Telefon', it: 'telefono', itSyl: 4, emoji: '📱', syl: 3, anlaut: 'T', article: 'das' },
  { de: 'Teddy', it: 'orsacchiotto', itSyl: 4, emoji: '🧸', syl: 2, anlaut: 'T', article: 'der' },
  { de: 'Uhr', it: 'orologio', itSyl: 4, emoji: '⏰', syl: 1, anlaut: 'U', article: 'die' },
  { de: 'Vogel', it: 'uccello', itSyl: 3, emoji: '🐦', syl: 2, anlaut: null, article: 'der' },
  { de: 'Wal', it: 'balena', itSyl: 3, emoji: '🐳', syl: 1, anlaut: 'W', article: 'der' },
  { de: 'Wolke', it: 'nuvola', itSyl: 3, emoji: '☁️', syl: 2, anlaut: 'W', article: 'die' },
  { de: 'Wurm', it: 'verme', itSyl: 2, emoji: '🪱', syl: 1, anlaut: 'W', article: 'der' },
  { de: 'Zebra', it: 'zebra', itSyl: 2, emoji: '🦓', syl: 2, anlaut: 'Z', article: 'das' },
  { de: 'Zug', it: 'treno', itSyl: 2, emoji: '🚂', syl: 1, anlaut: 'Z', article: 'der' },
  { de: 'Zahn', it: 'dente', itSyl: 2, emoji: '🦷', syl: 1, anlaut: 'Z', article: 'der' },
  { de: 'Zitrone', it: 'limone', itSyl: 3, emoji: '🍋', syl: 3, anlaut: 'Z', article: 'die' },
]

export const ANLAUT_WORDS = WORDS.filter((w) => w.anlaut !== null)
export const SYLLABLE_WORDS = WORDS.filter((w) => w.syl <= 4)

export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
export const ANLAUT_LETTERS = Array.from(new Set(ANLAUT_WORDS.map((w) => w.anlaut as string)))

/** The 21 letters of the Italian alphabet (J K W X Y only appear in foreign words). */
export const ALPHABET_IT = 'ABCDEFGHILMNOPQRSTUVZ'.split('')

/** Italian first letter, or null when it doesn't sound like the letter on its own
 * (soft c/g, sc+e/i, gn, gl, ch/gh) or the word is not a single Italian word. */
export function itAnlaut(w: Word): string | null {
  if (w.it.includes(' ') || /^(c[ei]|g[ei]|sc[ei]|gn|gl|ch|gh|[jkwxy])/.test(w.it)) return null
  return w.it[0].toUpperCase()
}
export const ANLAUT_WORDS_IT = WORDS.filter((w) => itAnlaut(w) !== null)
export const ANLAUT_LETTERS_IT = Array.from(new Set(ANLAUT_WORDS_IT.map((w) => itAnlaut(w) as string)))
export const SYLLABLE_WORDS_IT = WORDS.filter((w) => w.itSyl > 0 && w.itSyl <= 4)

// Rhyme groups: each group rhymes internally; items have an emoji.
export type RhymeWord = { word: string; emoji: string }
export const RHYME_GROUPS: RhymeWord[][] = [
  [{ word: 'Haus', emoji: '🏠' }, { word: 'Maus', emoji: '🐭' }, { word: 'Laus', emoji: '🐜' }],
  [{ word: 'Hund', emoji: '🐶' }, { word: 'Mund', emoji: '👄' }],
  [{ word: 'Katze', emoji: '🐱' }, { word: 'Tatze', emoji: '🐾' }],
  [{ word: 'Sonne', emoji: '☀️' }, { word: 'Tonne', emoji: '🗑️' }],
  [{ word: 'Hase', emoji: '🐰' }, { word: 'Nase', emoji: '👃' }, { word: 'Vase', emoji: '🏺' }],
  [{ word: 'Nuss', emoji: '🥜' }, { word: 'Bus', emoji: '🚌' }, { word: 'Kuss', emoji: '💋' }],
  [{ word: 'Baum', emoji: '🌳' }, { word: 'Traum', emoji: '💭' }, { word: 'Schaum', emoji: '🫧' }],
  [{ word: 'Schuh', emoji: '👟' }, { word: 'Kuh', emoji: '🐮' }],
  [{ word: 'Zahn', emoji: '🦷' }, { word: 'Hahn', emoji: '🐓' }, { word: 'Bahn', emoji: '🚆' }],
  [{ word: 'Zug', emoji: '🚂' }, { word: 'Flug', emoji: '✈️' }, { word: 'Krug', emoji: '🏺' }],
  [{ word: 'Brot', emoji: '🍞' }, { word: 'Boot', emoji: '⛵' }, { word: 'rot', emoji: '🔴' }],
  [{ word: 'Reis', emoji: '🍚' }, { word: 'Eis', emoji: '🍦' }],
  [{ word: 'Schwein', emoji: '🐷' }, { word: 'Bein', emoji: '🦵' }, { word: 'Stein', emoji: '🪨' }],
  [{ word: 'Tor', emoji: '🥅' }, { word: 'Ohr', emoji: '👂' }],
  [{ word: 'Hand', emoji: '✋' }, { word: 'Sand', emoji: '🏖️' }, { word: 'Wand', emoji: '🧱' }],
  [{ word: 'Wurm', emoji: '🪱' }, { word: 'Turm', emoji: '🗼' }],
  [{ word: 'Biene', emoji: '🐝' }, { word: 'Schiene', emoji: '🛤️' }],
  [{ word: 'Rose', emoji: '🌹' }, { word: 'Hose', emoji: '👖' }, { word: 'Dose', emoji: '🥫' }],
  [{ word: 'Tasche', emoji: '👜' }, { word: 'Flasche', emoji: '🍾' }],
  [{ word: 'Glas', emoji: '🥛' }, { word: 'Gras', emoji: '🌿' }],
  [{ word: 'Fisch', emoji: '🐟' }, { word: 'Tisch', emoji: '🪑' }],
  [{ word: 'Ring', emoji: '💍' }, { word: 'Schmetterling', emoji: '🦋' }],
  [{ word: 'Ball', emoji: '⚽' }, { word: 'Knall', emoji: '💥' }],
  [{ word: 'Kerze', emoji: '🕯️' }, { word: 'Herzen', emoji: '💕' }],
  [{ word: 'Bär', emoji: '🐻' }, { word: 'Meer', emoji: '🌊' }],
  [{ word: 'Pfanne', emoji: '🍳' }, { word: 'Kanne', emoji: '🫖' }, { word: 'Tanne', emoji: '🎄' }],
]

// Italian rhymes (same ending from the stressed vowel on).
export const RHYME_GROUPS_IT: RhymeWord[][] = [
  [{ word: 'cane', emoji: '🐶' }, { word: 'pane', emoji: '🍞' }],
  [{ word: 'gatto', emoji: '🐱' }, { word: 'piatto', emoji: '🍽️' }, { word: 'matto', emoji: '🤪' }],
  [{ word: 'fiore', emoji: '🌸' }, { word: 'cuore', emoji: '❤️' }, { word: 'colore', emoji: '🎨' }],
  [{ word: 'mano', emoji: '✋' }, { word: 'piano', emoji: '🎹' }, { word: 'vulcano', emoji: '🌋' }],
  [{ word: 'stella', emoji: '⭐' }, { word: 'padella', emoji: '🍳' }, { word: 'caramella', emoji: '🍬' }],
  [{ word: 'rosa', emoji: '🌹' }, { word: 'sposa', emoji: '👰' }],
  [{ word: 'nave', emoji: '🚢' }, { word: 'chiave', emoji: '🔑' }],
  [{ word: 'mela', emoji: '🍎' }, { word: 'vela', emoji: '⛵' }, { word: 'candela', emoji: '🕯️' }],
  [{ word: 'pera', emoji: '🍐' }, { word: 'bandiera', emoji: '🚩' }],
  [{ word: 'letto', emoji: '🛏️' }, { word: 'tetto', emoji: '🏠' }, { word: 'berretto', emoji: '🧢' }],
  [{ word: 'palla', emoji: '⚽' }, { word: 'farfalla', emoji: '🦋' }],
  [{ word: 'nonna', emoji: '👵' }, { word: 'gonna', emoji: '👗' }, { word: 'colonna', emoji: '🏛️' }],
  [{ word: 'naso', emoji: '👃' }, { word: 'vaso', emoji: '🏺' }],
  [{ word: 'torta', emoji: '🎂' }, { word: 'porta', emoji: '🚪' }],
  [{ word: 'gelato', emoji: '🍦' }, { word: 'prato', emoji: '🌱' }],
  [{ word: 'fuoco', emoji: '🔥' }, { word: 'cuoco', emoji: '🧑‍🍳' }, { word: 'gioco', emoji: '🎲' }],
  [{ word: 'dente', emoji: '🦷' }, { word: 'serpente', emoji: '🐍' }],
  [{ word: 'zucca', emoji: '🎃' }, { word: 'mucca', emoji: '🐮' }],
  [{ word: 'rana', emoji: '🐸' }, { word: 'banana', emoji: '🍌' }, { word: 'campana', emoji: '🔔' }],
  [{ word: 'gallo', emoji: '🐓' }, { word: 'cavallo', emoji: '🐴' }],
  [{ word: 'sale', emoji: '🧂' }, { word: 'stivale', emoji: '👢' }],
  [{ word: 'fata', emoji: '🧚' }, { word: 'patata', emoji: '🥔' }, { word: 'insalata', emoji: '🥗' }],
  [{ word: 'cappello', emoji: '🎩' }, { word: 'castello', emoji: '🏰' }, { word: 'ombrello', emoji: '☂️' }],
]
