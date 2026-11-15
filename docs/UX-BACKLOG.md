# UX/UI backlog

Merged result of a four-way audit on 2026-11-15:

- child usability for a 6-year-old pre-reader
- Duolingo parity and gamification
- visual polish across 126 screenshots at iPhone SE, large phone and iPad
- code-level interaction bugs

Duplicates are merged. Each item names the file to touch. Priority: **P1** fix first, **P2** next, **P3** polish.
Effort: **S** under an hour, **M** a few hours, **L** a day or more.

## Status

**2026-11-15: every item below is implemented**, with these deviations:

- 4.1 Tracing shows a start dot and a first-direction arrow per glyph. Numbered multi-stroke arrows need stroke data per letter and are not done.
- 2.10 The parent gate no longer opens the keyboard. A long-press gate was not added.
- 5.20 The daily lesson limit defaults to off; parents set 3, 5 or 8.
- 1.7 Hearts never lock a lesson. Losing all hearts only removes the perfect bonus.

## Done earlier

- [x] **Retry the same question after a wrong answer** (kid's request). Wrong option turns red and is disabled, red "Nochmal versuchen" button, one heart lost per question, answer revealed after the second wrong pick, question re-queued at the end. `src/components/ChoiceGame.tsx`, commit 5cb1dc9.

## 1. Bugs the child hits today

| # | Pri | Eff | Problem | Fix |
|---|-----|-----|---------|-----|
| 1.1 | P1 | S | Double-tap skips screens. Überprüfen, Weiter, end-screen Weiter and quest Weiter sit at the same spot, so a second tap lands on the next screen's button. | Ignore footer clicks for ~400 ms after the footer content changes or a screen mounts. `ChoiceGame.tsx`, `EndScreen.tsx`, `QuestScreen.tsx` |
| 1.2 | P1 | S | ✕ in a lesson is 40 px, sits next to the progress bar, has no confirm and throws the lesson away. | 56 px target, confirm sheet with sad Berli, spoken "Wirklich aufhören?", big ✅/❌. `LessonShell.tsx`, `GameScreen.tsx` |
| 1.3 | P1 | S | Old praise/fact keeps talking over the next question; speech continues after leaving the lesson. | Generation token in `check()`, skip queued speech when token changed; `stopSpeech()` on unmount. `ChoiceGame.tsx:77`, `speech.ts:97` |
| 1.4 | P1 | S | Toggling "Sprachausgabe" in Eltern locks the parent area again. | Split the effect: lock only on mount. `App.tsx:26-29` |
| 1.5 | P2 | S | `speakBoth` plays the Italian half of an interrupted German phrase ("Apfel… Banane… mela… banana"). | `speak()` resolves `{cancelled}`; `speakBoth` skips Italian when cancelled. `speech.ts:96-110` |
| 1.6 | P2 | S | Memory finish timer and Nachspuren praise await still fire after ✕, granting XP or recording twice. | Clear timeout / cancel flag in effect cleanup. `Memory.tsx:49`, `Nachspuren.tsx:122-137` |
| 1.7 | P2 | S | Hearts reach 0 with no effect; 🖤🖤🖤 stays for the rest of the lesson. | No lockout at this age. Animate heart loss, and turn "kept all hearts" into a bonus card on the end screen. Drop hearts from Memory and Nachspuren. `LessonShell.tsx`, `EndScreen.tsx`, `store.ts` |
| 1.8 | P2 | S | Path never scrolls to the current node; every return from a lesson jumps to the top. | `scrollIntoView({block:'center'})` on `.node.current` after mount; remove forced `scrollTo(0,0)`. `Path.tsx`, `App.tsx:55` |
| 1.9 | P2 | S | Opening a chest swallows an XP sticker when it crosses an 80-XP boundary. | Grant `floor(xp/80) - floor(claimed/80)` stickers in `openChest`. `store.ts:186` |
| 1.10 | P2 | S | Chest XP can finish the daily quests but the reward only shows after the next lesson. | Run quest-reward logic in `openChest` too. `store.ts:177-190` |
| 1.11 | P2 | S | Empty name passes Welcome, so Welcome reappears every launch. Reset leaves app on tabs with no name. | Require a name; route to Welcome when `childName` is empty. `Welcome.tsx`, `App.tsx` |
| 1.12 | P3 | S | Streak counts on merely opening the app. | Bump streak in `recordLesson`/`openChest`, not in `touchDay` on mount. `store.ts:109`, `Path.tsx:16` |
| 1.13 | P3 | S | Path nodes (fixed level) change the hidden practice level and trigger "Neue Stufe!" that means nothing. | Adapt level only for practice runs. `store.ts:119-135` |
| 1.14 | P3 | S | Muster reveal shows "Richtig wäre:" with empty bold text. | Hide the line when the option has no `sayDe`. `ChoiceGame.tsx` |
| 1.15 | P3 | S | Progress bar never reaches 100 % when a re-queued question is missed again. | Count the reveal on the second pass. `ChoiceGame.tsx` |

## 2. Usable without reading

| # | Pri | Eff | Problem | Fix |
|---|-----|-----|---------|-----|
| 2.1 | P1 | M | Quiz answers in Berlin, Schulweg, Zeit, Uhr, Reime and Anlaute L3 are text only. Tapping to hear an option also selects it. | Read all options aloud after the prompt for text options, and give each a small 🔊. `Quiz.tsx`, `Zeit.tsx`, `Uhr.tsx`, `Reime.tsx` |
| 2.2 | P1 | S | "ÜBERPRÜFEN" is never spoken and has no icon. | ✓ icon on the button; speak "Drück auf den grünen Knopf!" if a selection idles 3 s. `ChoiceGame.tsx` |
| 2.3 | P1 | S | No signal when speech is off or no voice exists; a missing Italian voice makes the German voice read Italian. | 🔇 banner in the lesson when sound is off or no voice; skip Italian when no Italian voice. `LessonShell.tsx`, `speech.ts` |
| 2.4 | P2 | S | Tapping an option cuts off the question mid-sentence. | Queue option speech after the prompt instead of interrupting. `ChoiceGame.tsx:65` |
| 2.5 | P2 | S | In sound games the Italian voice reads German words ("Con quale lettera comincia Haus"). Every prompt is spoken twice. | No Italian prompt in Anlaute, Reime, Silben, Buchstaben; Italian only on second tap of the bubble elsewhere. |
| 2.6 | P2 | S | Node sheet shows parent-facing skill text and a text-only start button. | ▶️ icon, speak "Los geht's!", move the skill text to Eltern. `Path.tsx:136-150` |
| 2.7 | P2 | S | Quest screen is silent and quests are abstract ("Sammle 30 XP"). | Always speak progress ("Noch zwei Lektionen!"), pictorial quest rows. `QuestScreen.tsx`, `Path.tsx` |
| 2.8 | P3 | S | Anlaute speaks letter names ("Ha", "Zett"); Berlin schools teach sounds. | Per-letter sound map ("mmm", "sss"). `Anlaute.tsx:48` |
| 2.9 | P3 | S | Stufe chips are text, sheets close only by tapping the overlay. | ⭐/⭐⭐/⭐⭐⭐ chips ≥56 px, ✕ on sheets. `Practice.tsx`, `Sheet.tsx` |
| 2.10 | P3 | S | Eltern gate autofocuses and pops the keyboard at the child. | Remove `autoFocus`; consider long-press to open. `Parents.tsx:28-35` |

## 3. Visual, layout and contrast

| # | Pri | Eff | Problem | Fix |
|---|-----|-----|---------|-----|
| 3.1 | P1 | S | START bubble covers the previous node's label and, on a unit's first node, the unit header. | Extra top margin on the current node row or `.nodes` gap 60 px. `styles.css:90,106` |
| 3.2 | P1 | S | Practice and chest sheet text unreadable: white on light game colours and coloured text on white buttons (1.5–1.9:1). | Add a `dark` colour per game like units have; use it for sheet background and button text. `games/index.ts`, `styles.css:37,117` |
| 3.3 | P1 | S | Locked node sheet shows the unit colour instead of grey; "NOCH GESPERRT" is 1.7:1. | Pass grey `color` when locked; darker disabled text. `Path.tsx:130`, `styles.css:119` |
| 3.4 | P1 | S | Eltern "SPEICHERN" clipped off-screen on phones. | `.prow-right{flex:1;min-width:0}` and shrinkable input. `styles.css:283` |
| 3.5 | P1 | S | Yellow end-screen title and XP value at 1.9:1. | Darker yellow `#a67c00` for title, ink for value. `styles.css:235,242` |
| 3.6 | P1 | S | On iPad, Überprüfen/Weiter hug the left and the button jumps between states. | `.btn.block{display:flex}`. `styles.css` |
| 3.7 | P2 | S | Grey text (`--hare`, 2.2:1) used for node labels, tab labels, `.muted` copy, quest numbers; several are 11–12 px. | New `--muted:#6f6f6f` for text, 13–14 px minimum. `styles.css:8,18,60,76,104` |
| 3.8 | P2 | S | Start-bubble text uses raw unit colour (1.5–2.4:1). | Use `unit.dark`. `Path.tsx:88` |
| 3.9 | P2 | S | Locked node icons nearly invisible. | Opacity 0.75, darker grey fill. `styles.css:98` |
| 3.10 | P2 | M | On tall phones and iPad half the lesson screen is empty. | Flex column, `space-evenly`, options and emoji scale with `vh`. `styles.css:137,169` |
| 3.11 | P2 | S | Quest card plus header leave one path node above the fold on iPhone SE. | Collapse to a "🎯 0/3" chip that opens the list. `Path.tsx`, `styles.css:68` |
| 3.12 | P2 | S | Muster strip wraps so ❓ falls onto a second line. | `nowrap`, size items from width/count. `styles.css:208`, `Muster.tsx` |
| 3.13 | P2 | S | 6-option rounds overflow 667 px screens behind the fixed footer. | Max 4 options, or smaller `.opt` when more than 4. `Buchstaben.tsx`, `Italienisch.tsx` |
| 3.14 | P2 | S | Nachspuren footer buttons wrap and clip on SE; reset button label wraps out of its 50 px height. | `nowrap`, icon-only under 400 px, shorter labels. `styles.css:25,220` |
| 3.15 | P2 | S | Parents progress table unreadable at 375 px. | Hide skill and date columns under 480 px. `styles.css:286` |
| 3.16 | P2 | S | Opened chest shows 📭 (mailbox). | Done chest with ✓ badge. `Path.tsx:84` |
| 3.17 | P2 | S | Bottom sheet on iPad is a 640 px slab with square bottom corners. | Centre as a dialog above 700 px. `styles.css:117` |
| 3.18 | P3 | S | iPad: stat bar and tab bar float in a 640 px column or spread across 820 px. | Full-bleed bar with inner 640 px row. `styles.css:56,66` |
| 3.19 | P3 | S | Mascot ✨/🤔 badge overlaps the speech bubble border. | Adjust offset or gap. `styles.css:153-155` |
| 3.20 | P3 | S | Smaller polish: welcome button width, ragged reset-confirm buttons, emoji ⬜ next to ✅ in quests, practice grid orphans on iPad, small Nachspuren canvas on iPad. | See `Welcome.tsx:22`, `Parents.tsx:159`, `QuestScreen.tsx:43`, `styles.css:258`, `Nachspuren.tsx:37` |

## 4. Game content for age 6

| # | Pri | Eff | Problem | Fix |
|---|-----|-----|---------|-----|
| 4.1 | P1 | M | Nachspuren is too strict: 55 % coverage, manual text-only "Fertig", no start dot or stroke arrows, heart on first miss, skip only after two fails. | Threshold ~0.35, start dot and numbered arrows, auto-check on lift, skip always visible, no hearts. `Nachspuren.tsx` |
| 4.2 | P2 | S | Memory punishes after 7 moves for 4 pairs; cards flip back after 1.1 s. | Thresholds ×2.5/×3.5, 1.6 s flip-back. `Memory.tsx:47-64` |
| 4.3 | P2 | S | Rechnen L3 goes to 20 without dots; subtraction shows no take-away. | Cap at 10 with dots, cross out removed dots. `Rechnen.tsx`, `data/path.ts:31` |
| 4.4 | P2 | S | Uhr L2+ asks "halb 6", beyond Vorschule. | Full hours only; show "5:00" under the label. `Uhr.tsx` |
| 4.5 | P3 | S | Zeit weekday strip uses "Mo/Di" text. | Number emoji only, highlight, speak the sequence on tap. `Zeit.tsx:31` |
| 4.6 | P3 | S | Silben clap row is 17 px. | 28 px claps. `styles.css:187` |
| 4.7 | P3 | S | Formen L1 colours each shape differently, so it is unclear whether shape or colour matters. | Same colour at L1. `Formen.tsx:32` |
| 4.8 | P3 | S | Zählen answers are bare digits. | Dot pattern under digits at L1–L2. `Zaehlen.tsx:21` |
| 4.9 | P3 | S | Buchstaben L2 prompt shows the target glyph, so it becomes shape matching. | Audio-only prompt or other case. `Buchstaben.tsx:32` |
| 4.10 | P3 | S | Mengen rows of 5 wrap unevenly inside options. | Smaller dots or rows of 4 on phones. `Mengen.tsx:21` |

## 5. Duolingo-style motivation

Ranked by motivation gain per effort. All work offline, single family, no backend.

| # | Impact | Eff | Feature | Where |
|---|--------|-----|---------|-------|
| 5.1 | H | S | **Sound effects.** Correct ding, wrong buzz, heart lost, lesson-complete jingle, chest pop via WebAudio, plus `navigator.vibrate`. Strongest feedback loop for a pre-reader. | new `lib/sfx.ts` |
| 5.2 | H | S | **End-screen sequence.** Berli → XP counts up → "+5 Perfekt" chip pops → big ⭐⭐⭐ spoken → pulsing Weiter. Drop the time and percent cards; fix "Gesamt-XP" label. | `EndScreen.tsx` |
| 5.3 | H | S | **Streak screen.** After the first lesson of the day: big flame, Mo–So dots, "Tag 3!", milestones 3/7/14/30 with sticker. Tap 🔥 opens it. | `GameScreen.tsx`, `Path.tsx` |
| 5.4 | H | S | **Quest pool + claim moment.** Pick 3 of ~10 quests per day ("2× Italiano", "Eine Memory-Runde"), 🎁 to tap when all done. | `store.ts`, `Path.tsx` |
| 5.5 | H | M | **Crown levels per node.** Replays raise 👑 1–3, then gold "Legendär" ring. The main "level up the same challenge" loop. | `store.ts`, `Path.tsx` |
| 5.6 | H | M | **Unit test node ("Prüfung").** Mixed lesson from the unit's games before the chest; chest unlocks after it. Needs each game's round builder exported. | `data/path.ts`, `src/games/*` |
| 5.7 | H | M | **Mistakes practice.** Persist missed questions; "🩹 Fehler üben" card in Üben. Same refactor as 5.6. | `store.ts`, `Practice.tsx` |
| 5.8 | H | M | **Gems + shop.** Earn 💎 per lesson/chest/quest, spend on sticker packs, Berli outfits (🎩🧢👑), path themes. Choosing what to buy motivates strongly at 6. | `store.ts`, `Stickers.tsx`, `Mascot.tsx` |
| 5.9 | M | S | **Combo.** "🔥 3 in Folge!" toast + SFX at 3 and 5 first-try correct, small bonus XP. | `ChoiceGame.tsx` |
| 5.10 | M | S | **Path visuals.** Keep game emoji on done nodes with a ⭐/👑 corner badge, dashed ring on the current node, dotted trail between nodes. | `Path.tsx`, `styles.css` |
| 5.11 | M | S | **Unit header.** "WEITER" button that jumps to the current node, "3 / 6" progress, sticky while scrolling the unit. | `Path.tsx` |
| 5.12 | M | S | **Chest animation.** Tap to shake, tap to pop, confetti, sticker reveal. | `Path.tsx` |
| 5.13 | M | S | **Berli moods.** Sad, cheer, sleep moods with animations; praise varies by combo. | `Mascot.tsx`, `speech.ts` |
| 5.14 | M | S | **Streak protection.** Up to 2 🧊 per week so a missed weekend does not reset to 1. "Streak gerettet!" | `store.ts` |
| 5.15 | M | S | **Daily goal ring** around ⚡ with "Tagesziel erreicht!" burst; goal set by parents. | `Path.tsx`, `Parents.tsx` |
| 5.16 | M | M | **Family league.** Child + up to 3 family profiles with emoji avatars, weekly XP board, Monday reset. Parents play the same lessons. | `store.ts`, `Path.tsx` |
| 5.17 | M | M | **Profile and achievements.** Avatar, best streak, crowns, tiered medals (10 perfect lessons, 7-day streak, all Italiano nodes). | `Stickers.tsx`, `data/misc.ts` |
| 5.18 | L | M | **Sticker sets.** Themed sets (Berlin, Tiere, Weltraum, Italia) with set-complete bonus and rare stickers. | `data/misc.ts`, `Stickers.tsx` |
| 5.19 | L | S | **Listening mode** in Üben that hides prompt text. | `Practice.tsx` |
| 5.20 | L | S | **Gentle daily cap.** After N lessons (parent setting), Berli sleeps: "Bis morgen!", path still browsable. | `Parents.tsx`, `Path.tsx` |
| 5.21 | L | M | **Weekly report for parents.** 7-day XP bars and "woran üben" list of games under 60 %. | `store.ts`, `Parents.tsx` |

**Do not build:** leagues against strangers, push-notification pressure, friend streaks, heart refill purchases, timed double-XP boosts. Wrong for a 6-year-old or impossible offline. An opt-in local reminder set by parents is the only acceptable form.

## 6. Platform, offline, accessibility

| # | Pri | Eff | Problem | Fix |
|---|-----|-----|---------|-----|
| 6.1 | P2 | S | Nunito font not cached; installed app offline falls back to system font. | Self-host woff2 or add workbox runtime caching for Google Fonts. `index.html`, `vite.config.ts` |
| 6.2 | P3 | S | Clock and Nachspuren guide use "Fredoka", which is never loaded. | Use Nunito. `Clock.tsx:13`, `Nachspuren.tsx:44` |
| 6.3 | P3 | S | App updates silently; an open standalone session keeps old code. | Reload on `controllerchange` or show an update toast. `vite.config.ts` |
| 6.4 | P3 | S | No `touch-action: manipulation`; fast double taps can zoom on iOS. | Add to `button`, `body`. `styles.css` |
| 6.5 | P3 | S | `prefers-reduced-motion` ignored. | Disable bob/breathe/confetti under the media query. `styles.css` |
| 6.6 | P3 | S | Shape and colour options have no accessible name. | `aria-label` from `sayDe`. `ChoiceGame.tsx`, `Formen.tsx` |
| 6.7 | P3 | S | Rotating the device wipes the tracing canvas. | Fix size once or redraw guide on resize. `Nachspuren.tsx:37` |
| 6.8 | P3 | S | Parents voice picker keeps a stale voice name; unguarded `speechSynthesis` access. | Clear voice when missing; `typeof` guard. `Parents.tsx:17,87` |

## Suggested order

1. **Batch A, one sitting.** All of section 1, plus 3.1–3.6. Mostly small fixes, removes every frustration the child can hit today.
2. **Batch B.** 2.1–2.7, 4.1–4.4, 5.1, 5.2. Pre-reader independence plus the two cheapest big motivation wins.
3. **Batch C.** 5.3–5.5, 5.9–5.12. Streak, quests, crowns and path polish.
4. **Batch D.** 5.6–5.8 and the round-builder refactor they share. Then the rest.
