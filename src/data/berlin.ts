export type Quiz = {
  q: string // German question
  qIt?: string
  options: { label: string; emoji: string; it?: string }[]
  answer: number // index into options
  fact?: string // spoken after a correct answer
}

export const BERLIN: Quiz[] = [
  {
    q: 'Wie heißt die Stadt, in der du wohnst?', qIt: 'Come si chiama la città in cui vivi?',
    options: [{ label: 'Berlin', emoji: '🐻' }, { label: 'Rom', emoji: '🏛️' }, { label: 'Hamburg', emoji: '⚓' }],
    answer: 0, fact: 'Berlin ist die Hauptstadt von Deutschland!',
  },
  {
    q: 'Welches Tier ist das Wappentier von Berlin?', qIt: 'Quale animale è il simbolo di Berlino?',
    options: [{ label: 'Löwe', emoji: '🦁' }, { label: 'Bär', emoji: '🐻' }, { label: 'Adler', emoji: '🦅' }],
    answer: 1, fact: 'Der Berliner Bär steht auf der Berliner Flagge.',
  },
  {
    q: 'Wie heißt der hohe Turm am Alexanderplatz?', qIt: 'Come si chiama la torre alta ad Alexanderplatz?',
    options: [{ label: 'Fernsehturm', emoji: '🗼' }, { label: 'Leuchtturm', emoji: '🏮' }, { label: 'Kirchturm', emoji: '⛪' }],
    answer: 0, fact: 'Der Fernsehturm ist 368 Meter hoch – das höchste Gebäude in Deutschland!',
  },
  {
    q: 'Welches große Tor steht mitten in Berlin?', qIt: 'Quale grande porta si trova nel centro di Berlino?',
    options: [{ label: 'Gartentor', emoji: '🚪' }, { label: 'Brandenburger Tor', emoji: '🏛️' }, { label: 'Fußballtor', emoji: '🥅' }],
    answer: 1, fact: 'Auf dem Brandenburger Tor steht eine Kutsche mit vier Pferden – die Quadriga.',
  },
  {
    q: 'Wie heißt der Fluss, der durch Berlin fließt?', qIt: 'Come si chiama il fiume che attraversa Berlino?',
    options: [{ label: 'Spree', emoji: '🌊' }, { label: 'Tiber', emoji: '🏞️' }, { label: 'Rhein', emoji: '🚤' }],
    answer: 0, fact: 'Auf der Spree fahren viele Ausflugsschiffe.',
  },
  {
    q: 'Mit welcher Bahn fährt man in Berlin unter der Erde?', qIt: 'Con quale treno si viaggia sotto terra a Berlino?',
    options: [{ label: 'Achterbahn', emoji: '🎢' }, { label: 'U-Bahn', emoji: '🚇' }, { label: 'Seilbahn', emoji: '🚡' }],
    answer: 1, fact: 'Die U-Bahn in Berlin ist gelb!',
  },
  {
    q: 'Welche Farben hat die Berliner Flagge?', qIt: 'Quali colori ha la bandiera di Berlino?',
    options: [{ label: 'Rot und Weiß', emoji: '🔴⚪' }, { label: 'Blau und Gelb', emoji: '🔵🟡' }, { label: 'Grün und Rot', emoji: '🟢🔴' }],
    answer: 0,
  },
  {
    q: 'Welches Männchen zeigt in Berlin an der Ampel, dass du gehen darfst?', qIt: 'Quale omino al semaforo di Berlino dice che puoi attraversare?',
    options: [{ label: 'Ampelmännchen', emoji: '🚶' }, { label: 'Schneemann', emoji: '⛄' }, { label: 'Lebkuchenmann', emoji: '🍪' }],
    answer: 0, fact: 'Das grüne Ampelmännchen trägt einen Hut!',
  },
  {
    q: 'Was isst man in Berlin gerne mit Soße und Pommes?', qIt: 'Cosa si mangia volentieri a Berlino con salsa e patatine?',
    options: [{ label: 'Currywurst', emoji: '🌭' }, { label: 'Sushi', emoji: '🍣' }, { label: 'Spaghetti', emoji: '🍝' }],
    answer: 0,
  },
  {
    q: 'Wo kann man in Berlin Elefanten, Giraffen und Pandas sehen?', qIt: 'Dove si possono vedere elefanti, giraffe e panda a Berlino?',
    options: [{ label: 'Im Zoo', emoji: '🦒' }, { label: 'Im Schwimmbad', emoji: '🏊' }, { label: 'In der Schule', emoji: '🏫' }],
    answer: 0, fact: 'Der Berliner Zoo ist der älteste Zoo in Deutschland.',
  },
  {
    q: 'Welche Bahn fährt in Berlin oben auf Brücken und ist rot-gelb?', qIt: 'Quale treno a Berlino viaggia sui ponti ed è rosso e giallo?',
    options: [{ label: 'S-Bahn', emoji: '🚆' }, { label: 'Rakete', emoji: '🚀' }, { label: 'Fähre', emoji: '⛴️' }],
    answer: 0,
  },
  {
    q: 'Wo war früher ein Flughafen und heute fahren Kinder dort Rad und lassen Drachen steigen?', qIt: 'Dove c’era un aeroporto e oggi i bambini vanno in bici e fanno volare aquiloni?',
    options: [{ label: 'Tempelhofer Feld', emoji: '🪁' }, { label: 'Alexanderplatz', emoji: '🗼' }, { label: 'Hauptbahnhof', emoji: '🚉' }],
    answer: 0,
  },
  {
    q: 'In welchem Land liegt Berlin?', qIt: 'In quale paese si trova Berlino?',
    options: [{ label: 'Italien', emoji: '🇮🇹' }, { label: 'Deutschland', emoji: '🇩🇪' }, { label: 'Frankreich', emoji: '🇫🇷' }],
    answer: 1,
  },
  {
    q: 'Wie heißt die Hauptstadt von Italien?', qIt: 'Come si chiama la capitale d’Italia?',
    options: [{ label: 'Rom', emoji: '🏛️' }, { label: 'Berlin', emoji: '🐻' }, { label: 'Paris', emoji: '🗼' }],
    answer: 0, fact: 'Rom ist die Hauptstadt von Italien, Berlin die Hauptstadt von Deutschland.',
  },
  {
    q: 'Wie heißt der große See in Berlin, wo man im Sommer baden kann?', qIt: 'Come si chiama il grande lago di Berlino dove si fa il bagno d’estate?',
    options: [{ label: 'Wannsee', emoji: '🏖️' }, { label: 'Nordsee', emoji: '🌊' }, { label: 'Gardasee', emoji: '⛵' }],
    answer: 0,
  },
  {
    q: 'Welche Nummer rufst du an, wenn es brennt?', qIt: 'Quale numero chiami se c’è un incendio?',
    options: [{ label: '112', emoji: '🚒' }, { label: '123', emoji: '🔢' }, { label: '999', emoji: '📞' }],
    answer: 0, fact: 'Eins, eins, zwei – die Feuerwehr kommt herbei!',
  },
]

export const SCHULWEG: Quiz[] = [
  {
    q: 'Die Ampel ist rot. Was machst du?', qIt: 'Il semaforo è rosso. Cosa fai?',
    options: [{ label: 'Stehen bleiben', emoji: '✋' }, { label: 'Schnell rennen', emoji: '🏃' }, { label: 'Hüpfen', emoji: '🦘' }],
    answer: 0, fact: 'Bei Rot bleibst du stehen. Bei Grün darfst du gehen.',
  },
  {
    q: 'Die Ampel ist grün. Was machst du, bevor du gehst?', qIt: 'Il semaforo è verde. Cosa fai prima di attraversare?',
    options: [{ label: 'Links und rechts schauen', emoji: '👀' }, { label: 'Augen zumachen', emoji: '🙈' }, { label: 'Tanzen', emoji: '💃' }],
    answer: 0,
  },
  {
    q: 'Wo gehst du sicher über die Straße?', qIt: 'Dove attraversi la strada in sicurezza?',
    options: [{ label: 'Zebrastreifen', emoji: '🦓' }, { label: 'Zwischen Autos', emoji: '🚗' }, { label: 'Auf der Kreuzung', emoji: '🚦' }],
    answer: 0, fact: 'Am Zebrastreifen müssen die Autos anhalten.',
  },
  {
    q: 'Was gehört in deinen Schulranzen?', qIt: 'Cosa va nello zaino di scuola?',
    options: [{ label: 'Hammer', emoji: '🔨' }, { label: 'Buch und Stifte', emoji: '📚' }, { label: 'Katze', emoji: '🐱' }],
    answer: 1,
  },
  {
    q: 'Was nimmst du als Pause mit in die Schule?', qIt: 'Cosa porti a scuola per la merenda?',
    options: [{ label: 'Brot und Apfel', emoji: '🍎' }, { label: 'Eine Torte', emoji: '🎂' }, { label: 'Nichts', emoji: '🤷' }],
    answer: 0,
  },
  {
    q: 'Was hilft dir, im Dunkeln gut gesehen zu werden?', qIt: 'Cosa ti aiuta a essere visto al buio?',
    options: [{ label: 'Reflektoren', emoji: '✨' }, { label: 'Schwarze Jacke', emoji: '🧥' }, { label: 'Sonnenbrille', emoji: '🕶️' }],
    answer: 0,
  },
  {
    q: 'Was trägst du beim Fahrradfahren auf dem Kopf?', qIt: 'Cosa porti in testa quando vai in bici?',
    options: [{ label: 'Helm', emoji: '🪖' }, { label: 'Krone', emoji: '👑' }, { label: 'Topf', emoji: '🍲' }],
    answer: 0,
  },
  {
    q: 'Was sagst du morgens zur Lehrerin?', qIt: 'Cosa dici alla maestra al mattino?',
    options: [{ label: 'Guten Morgen', emoji: '🌞' }, { label: 'Gute Nacht', emoji: '🌙' }, { label: 'Nichts', emoji: '🤐' }],
    answer: 0,
  },
  {
    q: 'Jemand möchte etwas sagen. Was machst du in der Schule?', qIt: 'Vuoi dire qualcosa. Cosa fai a scuola?',
    options: [{ label: 'Hand heben', emoji: '🙋' }, { label: 'Laut rufen', emoji: '📣' }, { label: 'Auf den Tisch klettern', emoji: '🧗' }],
    answer: 0,
  },
  {
    q: 'Was machst du, wenn ein Kind traurig ist?', qIt: 'Cosa fai se un bambino è triste?',
    options: [{ label: 'Trösten', emoji: '🤗' }, { label: 'Auslachen', emoji: '😆' }, { label: 'Weglaufen', emoji: '🏃' }],
    answer: 0,
  },
  {
    q: 'Was machst du vor dem Essen?', qIt: 'Cosa fai prima di mangiare?',
    options: [{ label: 'Hände waschen', emoji: '🧼' }, { label: 'Schuhe putzen', emoji: '👟' }, { label: 'Schlafen', emoji: '😴' }],
    answer: 0,
  },
  {
    q: 'Welche Zahl rufst du bei einem Notfall?', qIt: 'Quale numero chiami in caso di emergenza?',
    options: [{ label: '112', emoji: '🚑' }, { label: '555', emoji: '📞' }, { label: '100', emoji: '💯' }],
    answer: 0,
  },
]
