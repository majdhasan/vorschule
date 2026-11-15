// Browser text-to-speech. Works offline on iOS/macOS/Android with system voices.
export type Lang = 'de' | 'it'

const LANG_TAG: Record<Lang, string> = { de: 'de-DE', it: 'it-IT' }

// Novelty / effect voices shipped with macOS – never use these.
const NOVELTY = /^(Eddy|Flo|Grandma|Grandpa|Reed|Rocko|Sandy|Shelley|Bad News|Bahh|Bells|Boing|Bubbles|Cellos|Good News|Jester|Junior|Organ|Superstar|Trinoids|Whisper|Wobble|Zarvox|Albert|Fred|Kathy|Ralph)\b/i

export type VoiceInfo = { name: string; lang: string; quality: number; label: string; remote: boolean }

/** Higher = better. */
export function rankVoice(v: SpeechSynthesisVoice): number {
  const n = v.name
  if (NOVELTY.test(n)) return 0
  if (/premium/i.test(n)) return 100
  if (/enhanced|erweitert|migliorata/i.test(n)) return 90
  if (/natural|neural|online/i.test(n)) return 85 // Microsoft Edge natural voices
  if (/^Google/i.test(n)) return 80 // Chrome online voices – far better than compact Anna/Alice
  if (/siri/i.test(n)) return 75
  return 40 // plain local voice (e.g. compact Anna / Alice)
}

function allVoices(): SpeechSynthesisVoice[] {
  if (typeof speechSynthesis === 'undefined') return []
  return speechSynthesis.getVoices()
}
// Trigger async voice loading early (Chrome loads lazily)
if (typeof speechSynthesis !== 'undefined') {
  allVoices()
  speechSynthesis.addEventListener?.('voiceschanged', () => allVoices())
}

export function voicesFor(lang: Lang): VoiceInfo[] {
  const prefix = LANG_TAG[lang].slice(0, 2)
  return allVoices()
    .filter((v) => v.lang.replace('_', '-').toLowerCase().startsWith(prefix))
    .map((v) => {
      const q = rankVoice(v)
      const tag = q >= 90 ? '★★★' : q >= 75 ? '★★' : q > 0 ? '★' : '✗'
      return { name: v.name, lang: v.lang, quality: q, label: `${tag} ${v.name}${v.localService ? '' : ' (online)'}`, remote: !v.localService }
    })
    .sort((a, b) => b.quality - a.quality || a.name.localeCompare(b.name))
}

const preferred: Record<Lang, string> = { de: '', it: '' }
export function setPreferredVoice(lang: Lang, name: string) {
  preferred[lang] = name
}

function pickVoice(lang: Lang): SpeechSynthesisVoice | undefined {
  const tag = LANG_TAG[lang]
  const prefix = tag.slice(0, 2)
  const candidates = allVoices().filter((v) => v.lang.replace('_', '-').toLowerCase().startsWith(prefix))
  if (candidates.length === 0) return undefined
  if (preferred[lang]) {
    const chosen = candidates.find((v) => v.name === preferred[lang])
    if (chosen) return chosen
  }
  const online = typeof navigator !== 'undefined' ? navigator.onLine : true
  const usable = candidates.filter((v) => rankVoice(v) > 0 && (online || v.localService))
  const pool = usable.length ? usable : candidates
  return pool.sort((a, b) => {
    const d = rankVoice(b) - rankVoice(a)
    if (d !== 0) return d
    // exact region match wins, then stable by name
    return Number(b.lang.replace('_', '-') === tag) - Number(a.lang.replace('_', '-') === tag)
  })[0]
}

let enabled = true
export function setSpeechEnabled(on: boolean) {
  enabled = on
  if (!on) stopSpeech()
}
export function speechEnabled() {
  return enabled
}

/** True when the device has at least one voice for this language. */
export function hasVoice(lang: Lang) {
  return voicesFor(lang).length > 0
}

// Every interrupting speak() and every stopSpeech() starts a new generation.
// Anything awaited from an older generation is considered cancelled.
let generation = 0
export function speechGeneration() {
  return generation
}

export function stopSpeech() {
  generation++
  if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel()
}

/** Resolves true when the phrase was spoken to the end, false when it was cancelled or skipped. */
export function speak(text: string, lang: Lang = 'de', opts: { rate?: number; interrupt?: boolean } = {}): Promise<boolean> {
  if (opts.interrupt !== false) stopSpeech()
  const myGen = generation
  return new Promise((resolve) => {
    if (!enabled || typeof speechSynthesis === 'undefined' || !text) return resolve(false)
    // No Italian voice on this device → a German voice would read Italian badly. Skip.
    if (lang !== 'de' && allVoices().length > 0 && !hasVoice(lang)) return resolve(false)
    const u = new SpeechSynthesisUtterance(text)
    u.lang = LANG_TAG[lang]
    const v = pickVoice(lang)
    if (v) u.voice = v
    u.rate = opts.rate ?? 0.9
    u.pitch = 1.0
    let done = false
    const finish = () => {
      if (done) return
      done = true
      resolve(generation === myGen)
    }
    u.onend = finish
    u.onerror = finish
    // Chrome drops utterances queued synchronously after cancel(); defer a tick.
    setTimeout(() => {
      if (generation !== myGen) return finish()
      speechSynthesis.speak(u)
    }, 0)
    // Safety: resolve even if onend never fires (Safari quirk)
    setTimeout(finish, Math.max(2000, text.length * 130))
  })
}

/** Speak German, then Italian if bilingual mode is on. Resolves false if cancelled. */
export async function speakBoth(de: string, it: string | undefined, bilingual: boolean): Promise<boolean> {
  const myGen = generation + 1
  const ok = await speak(de, 'de')
  if (!ok && generation !== myGen) return false
  if (bilingual && it) {
    await new Promise((r) => setTimeout(r, 250))
    if (generation !== myGen) return false
    return speak(it, 'it', { interrupt: false })
  }
  return ok
}

const praiseDe = ['Super!', 'Toll gemacht!', 'Richtig!', 'Klasse!', 'Prima!', 'Genau!', 'Wunderbar!', 'Spitze!']
const praiseIt = ['Bravo!', 'Perfetto!', 'Giusto!', 'Benissimo!', 'Ottimo!']
const comboDe: Record<number, string> = { 3: 'Drei richtig in Folge!', 5: 'Wahnsinn! Fünf in Folge!', 8: 'Unglaublich! Acht in Folge!' }
const retryDe = ['Fast! Versuch es nochmal.', 'Nicht ganz. Probier es noch einmal.', 'Hmm, schau nochmal genau hin.']

export function praise(bilingual: boolean, combo = 0) {
  const de = comboDe[combo] ?? praiseDe[Math.floor(Math.random() * praiseDe.length)]
  const it = praiseIt[Math.floor(Math.random() * praiseIt.length)]
  return { de, it, say: () => speakBoth(de, it, bilingual) }
}
export function retry() {
  const de = retryDe[Math.floor(Math.random() * retryDe.length)]
  return { de, say: () => speak(de, 'de') }
}
