// Browser text-to-speech. Works offline on iOS/macOS/Android with system voices.
export type Lang = 'de' | 'it'

const LANG_TAG: Record<Lang, string> = { de: 'de-DE', it: 'it-IT' }

let voicesCache: SpeechSynthesisVoice[] = []
function loadVoices() {
  if (typeof speechSynthesis === 'undefined') return
  voicesCache = speechSynthesis.getVoices()
  if (voicesCache.length === 0) {
    speechSynthesis.onvoiceschanged = () => {
      voicesCache = speechSynthesis.getVoices()
    }
  }
}
loadVoices()

function pickVoice(lang: Lang): SpeechSynthesisVoice | undefined {
  const tag = LANG_TAG[lang]
  const prefix = tag.slice(0, 2)
  const candidates = voicesCache.filter((v) => v.lang.replace('_', '-').toLowerCase().startsWith(prefix))
  if (candidates.length === 0) return undefined
  // Prefer high quality / known good voices
  const preferred = ['Anna', 'Petra', 'Helena', 'Alice', 'Federica', 'Google', 'Premium', 'Enhanced']
  for (const p of preferred) {
    const v = candidates.find((c) => c.name.includes(p))
    if (v) return v
  }
  return candidates.find((c) => c.lang.replace('_', '-') === tag) ?? candidates[0]
}

let enabled = true
export function setSpeechEnabled(on: boolean) {
  enabled = on
  if (!on) stopSpeech()
}

export function stopSpeech() {
  if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel()
}

export function speak(text: string, lang: Lang = 'de', opts: { rate?: number; interrupt?: boolean } = {}): Promise<void> {
  return new Promise((resolve) => {
    if (!enabled || typeof speechSynthesis === 'undefined' || !text) return resolve()
    if (opts.interrupt !== false) speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = LANG_TAG[lang]
    const v = pickVoice(lang)
    if (v) u.voice = v
    u.rate = opts.rate ?? 0.9
    u.pitch = 1.05
    u.onend = () => resolve()
    u.onerror = () => resolve()
    speechSynthesis.speak(u)
    // Safety: resolve even if onend never fires (Safari quirk)
    setTimeout(resolve, Math.max(1500, text.length * 120))
  })
}

/** Speak German, then Italian if bilingual mode is on. */
export async function speakBoth(de: string, it: string | undefined, bilingual: boolean) {
  await speak(de, 'de')
  if (bilingual && it) {
    await new Promise((r) => setTimeout(r, 250))
    await speak(it, 'it', { interrupt: false })
  }
}

const praiseDe = ['Super!', 'Toll gemacht!', 'Richtig!', 'Klasse!', 'Prima!', 'Genau!', 'Wunderbar!', 'Spitze!']
const praiseIt = ['Bravo!', 'Perfetto!', 'Giusto!', 'Benissimo!', 'Ottimo!']
const retryDe = ['Fast! Versuch es nochmal.', 'Nicht ganz. Probier es noch einmal.', 'Hmm, schau nochmal genau hin.']

export function praise(bilingual: boolean) {
  const de = praiseDe[Math.floor(Math.random() * praiseDe.length)]
  const it = praiseIt[Math.floor(Math.random() * praiseIt.length)]
  return { de, it, say: () => speakBoth(de, it, bilingual) }
}
export function retry() {
  const de = retryDe[Math.floor(Math.random() * retryDe.length)]
  return { de, say: () => speak(de, 'de') }
}
