# Berli – Vorschule

Spielerische Schulvorbereitung für ein 6-jähriges Kind in Berlin, zweisprachig Deutsch / Italienisch.
Läuft als PWA im Browser (iPad, Android-Tablet, Laptop) – alles offline, keine Accounts, keine Werbung, kein Tracking.
Fortschritt liegt nur im `localStorage` des Geräts.

## Starten

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # Produktions-Build nach dist/
npm run preview    # Build lokal testen
```

Auf dem Tablet: Seite öffnen → „Zum Home-Bildschirm hinzufügen“. Danach startet die App wie eine native App.

## Was drin ist

Berli, der Berliner Bär, spricht alle Aufgaben vor (Browser-Sprachausgabe, Deutsch und optional Italienisch),
sodass das Kind noch nicht lesen können muss.

UI/UX nach Duolingo-Vorbild:

- **Lernpfad** mit 8 Einheiten (`src/data/path.ts`). Jede Einheit: Lektionen → **Prüfung** (alle Spiele der Einheit
  gemischt) → **Schatztruhe** (zweimal antippen). Der Pfad scrollt automatisch zur aktuellen Lektion; die
  Einheiten-Kopfzeile bleibt oben stehen und hat einen „Weiter“-Knopf.
- **Kronen**: Wiederholen einer geschafften Lektion spielt sie eine Stufe schwerer. 👑1 → 👑2 → 👑3 = 🏅 Legendär.
- **Lektion**: Antwort antippen → „Überprüfen“. Falsch → die Antwort wird rot, „Nochmal versuchen“ auf derselben Frage.
  Nach zwei Fehlversuchen zeigt Berli die Lösung, die Frage kommt am Ende noch einmal. Ein Herz pro Frage, keine Sperre.
  Combo-Anzeige bei 3/5/8 richtigen in Folge. Text-Antworten werden vorgelesen. Soundeffekte und Vibration.
- **Ende einer Lektion**: XP zählen hoch, Bonus-Chips, ⭐⭐⭐, dann Serien-Bildschirm 🔥 und Tagesaufgaben.
- **Tagesaufgaben**: täglich das XP-Tagesziel plus zwei wechselnde Aufgaben. Alle geschafft → Truhe mit 💎 und Sticker.
- **Serie** zählt nur Tage mit Lektion. 🧊 Streak-Schutz rettet verpasste Tage (1 gratis pro Woche, max. 2).
- **Edelsteine 💎** für Lektionen, Truhen, Aufgaben, Medaillen. Im **Laden**: Sticker, Streak-Schutz, Kleidung für Berli,
  Pfad-Themen.
- **Ich**-Tab: Profil, Sticker in Sets (mit seltenen Stickern und Set-Bonus), Medaillen in drei Stufen.
- **Üben**-Tab: jedes Spiel in jeder Stufe, „🎧 Nur hören“-Modus, **Fehler üben** mit den Fragen, die noch schwer waren.
- **Familien-Liga**: bis zu drei Erwachsene/Geschwister sammeln Wochen-XP mit, Montag geht es von vorne los.

| Bereich | Spiel | Trainiert |
|---|---|---|
| Sprache | Anlaute | Anfangslaute hören, Buchstaben zuordnen |
| Sprache | Reime | Reimwörter erkennen |
| Sprache | Silben klatschen | Wörter in Silben gliedern |
| Sprache | Buchstaben | Groß-/Kleinbuchstaben, Buchstaben des eigenen Namens |
| Sprache | Nachspuren | Buchstaben & Zahlen in Schreibreihenfolge nachfahren: nummerierte Striche, Pfeile, 👀-Vorführung |
| Sprache | Italiano | Italienischen Wortschatz hören und Bild finden |
| Zahlen | Zählen | Mengen bis 20, mit Punktbildern |
| Zahlen | Mehr oder weniger | Mengen vergleichen |
| Zahlen | Plus und Minus | Rechnen bis 10 mit Punkten, Minus zum Wegstreichen |
| Zahlen | Formen & Farben | Formen und Farben (de + it, mit korrekten Artikeln) |
| Zahlen | Uhrzeit | Volle Stunden |
| Denken | Muster | Muster erkennen und fortsetzen |
| Denken | Memory | Konzentration, Merkfähigkeit |
| Welt | Tage & Jahreszeiten | Wochentage, Jahreszeiten, Tagesablauf |
| Welt | Mein Berlin | Fernsehturm, Spree, Ampelmännchen, 112 … |
| Welt | Schulweg & Schule | Ampel, Zebrastreifen, Schulranzen, Schulregeln |

Jedes Spiel hat 3 Stufen. Im freien Üben gilt: zwei starke Runden hintereinander → eine Stufe höher, zwei schwache → eine
Stufe zurück. Lautspiele sprechen Laute („mmm“), keine Buchstabennamen, und nie mit italienischer Stimme.

## Elternbereich

Unten rechts auf „Eltern“, dann eine Malaufgabe lösen. Dort: Name und Avatar des Kindes, Zweisprachigkeit,
Sprachausgabe, Stimmenwahl, Tagesziel (10–50 XP), optionales Tageslimit an Lektionen, Familien-Liga-Mitglieder,
XP der letzten 7 Tage mit „Woran üben“, Fortschrittstabelle pro Spiel, Berliner Schulerwartungen, Zurücksetzen.

## Technik

Vite + React 19 + TypeScript, Zustand (persistiert), canvas-confetti, vite-plugin-pwa.
Alle Bilder sind Emojis, Sprachausgabe über die Web Speech API – daher keine Assets und kein Backend.

```
src/
  data/        Wörter (de/it/Emoji/Silben/Anlaut), Reimgruppen, Berlin- und Schulweg-Quiz, Sticker
  components/  ChoiceGame (gemeinsamer Spielrahmen), Mascot, Shape, Clock, EndScreen
  games/       ein Spiel pro Datei + Registry in index.ts
  screens/     Welcome, Home, GameScreen, Stickers, Parents
  lib/         speech, store, util
```

Neues Spiel hinzufügen: Komponente mit `GameProps` schreiben, die `ChoiceGame` mit einer Liste von `Round`s rendert,
und in `src/games/index.ts` eintragen.

## Deployment

Live unter **https://meramie.cc/vorschule/** (Hetzner, nginx-Gateway des meracoach-Stacks, Verzeichnis `html/meramie/vorschule/`).

```bash
DEPLOY_SSH_OPTS="-o IdentityAgent=none -o UseKeychain=yes -o IdentitiesOnly=yes" scripts/deploy.sh
```

Baut mit `VITE_BASE=/vorschule/`, lädt `dist/` per tar über ssh hoch und tauscht das Verzeichnis atomar aus. Kein Neustart nötig.
Der nginx-`location /vorschule/`-Block liegt in `nginx/gateway.conf` des meracoach-Repos auf dem Server.
