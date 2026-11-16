export type Quiz = {
  q: string // German question (also the stable id)
  qIt: string
  options: { label: string; it: string; emoji: string }[]
  answer: number // index into options
  fact?: string // spoken after a correct answer
  factIt?: string
}

export const BERLIN: Quiz[] = [
  {
    q: 'Wie heißt die Stadt, in der du wohnst?', qIt: 'Come si chiama la città in cui vivi?',
    options: [{ label: 'Berlin', it: 'Berlino', emoji: '🐻' }, { label: 'Rom', it: 'Roma', emoji: '🏛️' }, { label: 'Hamburg', it: 'Amburgo', emoji: '⚓' }],
    answer: 0, fact: 'Berlin ist die Hauptstadt von Deutschland!', factIt: 'Berlino è la capitale della Germania!',
  },
  {
    q: 'Welches Tier ist das Wappentier von Berlin?', qIt: 'Quale animale è il simbolo di Berlino?',
    options: [{ label: 'Löwe', it: 'Leone', emoji: '🦁' }, { label: 'Bär', it: 'Orso', emoji: '🐻' }, { label: 'Adler', it: 'Aquila', emoji: '🦅' }],
    answer: 1, fact: 'Der Berliner Bär steht auf der Berliner Flagge.', factIt: 'L’orso di Berlino è sulla bandiera della città.',
  },
  {
    q: 'Wie heißt der hohe Turm am Alexanderplatz?', qIt: 'Come si chiama la torre alta ad Alexanderplatz?',
    options: [{ label: 'Fernsehturm', it: 'Torre della TV', emoji: '🗼' }, { label: 'Leuchtturm', it: 'Faro', emoji: '🏮' }, { label: 'Kirchturm', it: 'Campanile', emoji: '⛪' }],
    answer: 0, fact: 'Der Fernsehturm ist 368 Meter hoch – das höchste Gebäude in Deutschland!', factIt: 'La torre della TV è alta 368 metri: è l’edificio più alto della Germania!',
  },
  {
    q: 'Welches große Tor steht mitten in Berlin?', qIt: 'Quale grande porta si trova nel centro di Berlino?',
    options: [{ label: 'Gartentor', it: 'Cancello del giardino', emoji: '🚪' }, { label: 'Brandenburger Tor', it: 'Porta di Brandeburgo', emoji: '🏛️' }, { label: 'Fußballtor', it: 'Porta da calcio', emoji: '🥅' }],
    answer: 1, fact: 'Auf dem Brandenburger Tor steht eine Kutsche mit vier Pferden – die Quadriga.', factIt: 'Sulla Porta di Brandeburgo c’è un carro con quattro cavalli: la Quadriga.',
  },
  {
    q: 'Wie heißt der Fluss, der durch Berlin fließt?', qIt: 'Come si chiama il fiume che attraversa Berlino?',
    options: [{ label: 'Spree', it: 'Sprea', emoji: '🌊' }, { label: 'Tiber', it: 'Tevere', emoji: '🏞️' }, { label: 'Rhein', it: 'Reno', emoji: '🚤' }],
    answer: 0, fact: 'Auf der Spree fahren viele Ausflugsschiffe.', factIt: 'Sulla Sprea navigano tante barche per i turisti.',
  },
  {
    q: 'Mit welcher Bahn fährt man in Berlin unter der Erde?', qIt: 'Con quale treno si viaggia sotto terra a Berlino?',
    options: [{ label: 'Achterbahn', it: 'Montagne russe', emoji: '🎢' }, { label: 'U-Bahn', it: 'Metropolitana', emoji: '🚇' }, { label: 'Seilbahn', it: 'Funivia', emoji: '🚡' }],
    answer: 1, fact: 'Die U-Bahn in Berlin ist gelb!', factIt: 'A Berlino la metropolitana è gialla!',
  },
  {
    q: 'Welche Farben hat die Berliner Flagge?', qIt: 'Quali colori ha la bandiera di Berlino?',
    options: [{ label: 'Rot und Weiß', it: 'Rosso e bianco', emoji: '🔴⚪' }, { label: 'Blau und Gelb', it: 'Blu e giallo', emoji: '🔵🟡' }, { label: 'Grün und Rot', it: 'Verde e rosso', emoji: '🟢🔴' }],
    answer: 0,
  },
  {
    q: 'Welches Männchen zeigt in Berlin an der Ampel, dass du gehen darfst?', qIt: 'Quale omino al semaforo di Berlino dice che puoi attraversare?',
    options: [{ label: 'Ampelmännchen', it: 'Omino del semaforo', emoji: '🚶' }, { label: 'Schneemann', it: 'Pupazzo di neve', emoji: '⛄' }, { label: 'Lebkuchenmann', it: 'Omino di pan di zenzero', emoji: '🍪' }],
    answer: 0, fact: 'Das grüne Ampelmännchen trägt einen Hut!', factIt: 'L’omino verde del semaforo porta il cappello!',
  },
  {
    q: 'Was isst man in Berlin gerne mit Soße und Pommes?', qIt: 'Cosa si mangia volentieri a Berlino con salsa e patatine?',
    options: [{ label: 'Currywurst', it: 'Currywurst', emoji: '🌭' }, { label: 'Sushi', it: 'Sushi', emoji: '🍣' }, { label: 'Spaghetti', it: 'Spaghetti', emoji: '🍝' }],
    answer: 0,
  },
  {
    q: 'Wo kann man in Berlin Elefanten, Giraffen und Pandas sehen?', qIt: 'Dove si possono vedere elefanti, giraffe e panda a Berlino?',
    options: [{ label: 'Im Zoo', it: 'Allo zoo', emoji: '🦒' }, { label: 'Im Schwimmbad', it: 'In piscina', emoji: '🏊' }, { label: 'In der Schule', it: 'A scuola', emoji: '🏫' }],
    answer: 0, fact: 'Der Berliner Zoo ist der älteste Zoo in Deutschland.', factIt: 'Lo zoo di Berlino è il più antico della Germania.',
  },
  {
    q: 'Welche Bahn fährt in Berlin oben auf Brücken und ist rot-gelb?', qIt: 'Quale treno a Berlino viaggia sui ponti ed è rosso e giallo?',
    options: [{ label: 'S-Bahn', it: 'S-Bahn', emoji: '🚆' }, { label: 'Rakete', it: 'Razzo', emoji: '🚀' }, { label: 'Fähre', it: 'Traghetto', emoji: '⛴️' }],
    answer: 0,
  },
  {
    q: 'Wo war früher ein Flughafen und heute fahren Kinder dort Rad und lassen Drachen steigen?', qIt: 'Dove c’era un aeroporto e oggi i bambini vanno in bici e fanno volare aquiloni?',
    options: [{ label: 'Tempelhofer Feld', it: 'Tempelhofer Feld', emoji: '🪁' }, { label: 'Alexanderplatz', it: 'Alexanderplatz', emoji: '🗼' }, { label: 'Hauptbahnhof', it: 'Stazione centrale', emoji: '🚉' }],
    answer: 0,
  },
  {
    q: 'In welchem Land liegt Berlin?', qIt: 'In quale paese si trova Berlino?',
    options: [{ label: 'Italien', it: 'Italia', emoji: '🇮🇹' }, { label: 'Deutschland', it: 'Germania', emoji: '🇩🇪' }, { label: 'Frankreich', it: 'Francia', emoji: '🇫🇷' }],
    answer: 1,
  },
  {
    q: 'Wie heißt die Hauptstadt von Italien?', qIt: 'Come si chiama la capitale d’Italia?',
    options: [{ label: 'Rom', it: 'Roma', emoji: '🏛️' }, { label: 'Berlin', it: 'Berlino', emoji: '🐻' }, { label: 'Paris', it: 'Parigi', emoji: '🗼' }],
    answer: 0, fact: 'Rom ist die Hauptstadt von Italien, Berlin die Hauptstadt von Deutschland.', factIt: 'Roma è la capitale d’Italia, Berlino è la capitale della Germania.',
  },
  {
    q: 'Wie heißt der große See in Berlin, wo man im Sommer baden kann?', qIt: 'Come si chiama il grande lago di Berlino dove si fa il bagno d’estate?',
    options: [{ label: 'Wannsee', it: 'Wannsee', emoji: '🏖️' }, { label: 'Nordsee', it: 'Mare del Nord', emoji: '🌊' }, { label: 'Gardasee', it: 'Lago di Garda', emoji: '⛵' }],
    answer: 0,
  },
  {
    q: 'Welche Nummer rufst du an, wenn es brennt?', qIt: 'Quale numero chiami se c’è un incendio?',
    options: [{ label: '112', it: '112', emoji: '🚒' }, { label: '123', it: '123', emoji: '🔢' }, { label: '999', it: '999', emoji: '📞' }],
    answer: 0, fact: 'Eins, eins, zwei – die Feuerwehr kommt herbei!', factIt: 'Uno, uno, due: arrivano i pompieri!',
  },
]

export const SCHULWEG: Quiz[] = [
  {
    q: 'Die Ampel ist rot. Was machst du?', qIt: 'Il semaforo è rosso. Cosa fai?',
    options: [{ label: 'Stehen bleiben', it: 'Mi fermo', emoji: '✋' }, { label: 'Schnell rennen', it: 'Corro veloce', emoji: '🏃' }, { label: 'Hüpfen', it: 'Salto', emoji: '🦘' }],
    answer: 0, fact: 'Bei Rot bleibst du stehen. Bei Grün darfst du gehen.', factIt: 'Con il rosso ti fermi. Con il verde puoi andare.',
  },
  {
    q: 'Die Ampel ist grün. Was machst du, bevor du gehst?', qIt: 'Il semaforo è verde. Cosa fai prima di attraversare?',
    options: [{ label: 'Links und rechts schauen', it: 'Guardo a sinistra e a destra', emoji: '👀' }, { label: 'Augen zumachen', it: 'Chiudo gli occhi', emoji: '🙈' }, { label: 'Tanzen', it: 'Ballo', emoji: '💃' }],
    answer: 0,
  },
  {
    q: 'Wo gehst du sicher über die Straße?', qIt: 'Dove attraversi la strada in sicurezza?',
    options: [{ label: 'Zebrastreifen', it: 'Strisce pedonali', emoji: '🦓' }, { label: 'Zwischen Autos', it: 'Tra le macchine', emoji: '🚗' }, { label: 'Auf der Kreuzung', it: 'In mezzo all’incrocio', emoji: '🚦' }],
    answer: 0, fact: 'Am Zebrastreifen müssen die Autos anhalten.', factIt: 'Alle strisce pedonali le macchine devono fermarsi.',
  },
  {
    q: 'Was gehört in deinen Schulranzen?', qIt: 'Cosa va nello zaino di scuola?',
    options: [{ label: 'Hammer', it: 'Martello', emoji: '🔨' }, { label: 'Buch und Stifte', it: 'Libro e matite', emoji: '📚' }, { label: 'Katze', it: 'Gatto', emoji: '🐱' }],
    answer: 1,
  },
  {
    q: 'Was nimmst du als Pause mit in die Schule?', qIt: 'Cosa porti a scuola per la merenda?',
    options: [{ label: 'Brot und Apfel', it: 'Pane e mela', emoji: '🍎' }, { label: 'Eine Torte', it: 'Una torta', emoji: '🎂' }, { label: 'Nichts', it: 'Niente', emoji: '🤷' }],
    answer: 0,
  },
  {
    q: 'Was hilft dir, im Dunkeln gut gesehen zu werden?', qIt: 'Cosa ti aiuta a essere visto al buio?',
    options: [{ label: 'Reflektoren', it: 'Catarifrangenti', emoji: '✨' }, { label: 'Schwarze Jacke', it: 'Giacca nera', emoji: '🧥' }, { label: 'Sonnenbrille', it: 'Occhiali da sole', emoji: '🕶️' }],
    answer: 0,
  },
  {
    q: 'Was trägst du beim Fahrradfahren auf dem Kopf?', qIt: 'Cosa porti in testa quando vai in bici?',
    options: [{ label: 'Helm', it: 'Casco', emoji: '🪖' }, { label: 'Krone', it: 'Corona', emoji: '👑' }, { label: 'Topf', it: 'Pentola', emoji: '🍲' }],
    answer: 0,
  },
  {
    q: 'Was sagst du morgens zur Lehrerin?', qIt: 'Cosa dici alla maestra al mattino?',
    options: [{ label: 'Guten Morgen', it: 'Buongiorno', emoji: '🌞' }, { label: 'Gute Nacht', it: 'Buonanotte', emoji: '🌙' }, { label: 'Nichts', it: 'Niente', emoji: '🤐' }],
    answer: 0,
  },
  {
    q: 'Jemand möchte etwas sagen. Was machst du in der Schule?', qIt: 'Vuoi dire qualcosa. Cosa fai a scuola?',
    options: [{ label: 'Hand heben', it: 'Alzo la mano', emoji: '🙋' }, { label: 'Laut rufen', it: 'Grido forte', emoji: '📣' }, { label: 'Auf den Tisch klettern', it: 'Salgo sul banco', emoji: '🧗' }],
    answer: 0,
  },
  {
    q: 'Was machst du, wenn ein Kind traurig ist?', qIt: 'Cosa fai se un bambino è triste?',
    options: [{ label: 'Trösten', it: 'Lo consolo', emoji: '🤗' }, { label: 'Auslachen', it: 'Lo prendo in giro', emoji: '😆' }, { label: 'Weglaufen', it: 'Scappo via', emoji: '🏃' }],
    answer: 0,
  },
  {
    q: 'Was machst du vor dem Essen?', qIt: 'Cosa fai prima di mangiare?',
    options: [{ label: 'Hände waschen', it: 'Mi lavo le mani', emoji: '🧼' }, { label: 'Schuhe putzen', it: 'Pulisco le scarpe', emoji: '👟' }, { label: 'Schlafen', it: 'Dormo', emoji: '😴' }],
    answer: 0,
  },
  {
    q: 'Welche Zahl rufst du bei einem Notfall?', qIt: 'Quale numero chiami in caso di emergenza?',
    options: [{ label: '112', it: '112', emoji: '🚑' }, { label: '555', it: '555', emoji: '📞' }, { label: '100', it: '100', emoji: '💯' }],
    answer: 0,
  },
]
