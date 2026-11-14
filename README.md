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
sodass das Kind noch nicht lesen können muss. Jede Runde hat 6 Aufgaben, am Ende gibt es 1–3 Sterne.
Alle 8 Sterne wird ein Sticker fürs Album freigeschaltet. Die Startseite schlägt jeden Tag 3 Spiele vor
(bevorzugt die, die selten gespielt wurden oder noch schwerfallen).

| Bereich | Spiel | Trainiert |
|---|---|---|
| Sprache | Anlaute | Anfangslaute hören, Buchstaben zuordnen |
| Sprache | Reime | Reimwörter erkennen |
| Sprache | Silben klatschen | Wörter in Silben gliedern |
| Sprache | Buchstaben | Groß-/Kleinbuchstaben, Buchstaben des eigenen Namens |
| Sprache | Nachspuren | Feinmotorik: Buchstaben & Zahlen mit dem Finger nachfahren |
| Sprache | Italiano | Italienischen Wortschatz hören und Bild finden |
| Zahlen | Zählen | Mengen bis 20 |
| Zahlen | Mehr oder weniger | Mengen vergleichen |
| Zahlen | Plus und Minus | Rechnen bis 10, später bis 20 |
| Zahlen | Formen & Farben | Formen und Farben (de + it, mit korrekten Artikeln) |
| Zahlen | Uhrzeit | Volle und halbe Stunden |
| Denken | Muster | Muster erkennen und fortsetzen |
| Denken | Memory | Konzentration, Merkfähigkeit |
| Welt | Tage & Jahreszeiten | Wochentage, Jahreszeiten, Tagesablauf |
| Welt | Mein Berlin | Fernsehturm, Spree, Ampelmännchen, 112 … |
| Welt | Schulweg & Schule | Ampel, Zebrastreifen, Schulranzen, Schulregeln |

Jedes Spiel hat 3 Stufen. Zwei starke Runden hintereinander → eine Stufe höher, zwei schwache → eine Stufe zurück.

## Elternbereich

Unten rechts auf „Eltern“, dann eine Malaufgabe lösen. Dort: Name des Kindes, Zweisprachigkeit an/aus,
Sprachausgabe an/aus, Fortschrittstabelle pro Spiel, Hinweise zu den Berliner Schulerwartungen, Zurücksetzen.

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
