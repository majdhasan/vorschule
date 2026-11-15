// Tiny synthesized sound effects (no audio files). Respect the sound setting.
let ctx: AudioContext | null = null
let enabled = true

export function setSfxEnabled(on: boolean) {
  enabled = on
}

function ac(): AudioContext | null {
  if (!enabled) return null
  try {
    if (!ctx) {
      const C = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!C) return null
      ctx = new C()
    }
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

/** Call on first user gesture so iOS unlocks audio. */
export function unlockSfx() {
  ac()
}

type Note = { f: number; t: number; d: number; type?: OscillatorType; v?: number; slide?: number }

function play(notes: Note[]) {
  const a = ac()
  if (!a) return
  const now = a.currentTime + 0.01
  for (const n of notes) {
    const o = a.createOscillator()
    const g = a.createGain()
    o.type = n.type ?? 'sine'
    o.frequency.setValueAtTime(n.f, now + n.t)
    if (n.slide) o.frequency.exponentialRampToValueAtTime(n.slide, now + n.t + n.d)
    const v = n.v ?? 0.18
    g.gain.setValueAtTime(0.0001, now + n.t)
    g.gain.exponentialRampToValueAtTime(v, now + n.t + 0.015)
    g.gain.exponentialRampToValueAtTime(0.0001, now + n.t + n.d)
    o.connect(g).connect(a.destination)
    o.start(now + n.t)
    o.stop(now + n.t + n.d + 0.05)
  }
}

function buzz(ms: number | number[]) {
  try {
    navigator.vibrate?.(ms)
  } catch {
    /* ignore */
  }
}

export const sfx = {
  tap: () => play([{ f: 660, t: 0, d: 0.06, type: 'triangle', v: 0.08 }]),
  correct: () => {
    play([
      { f: 880, t: 0, d: 0.12, type: 'triangle' },
      { f: 1318.5, t: 0.09, d: 0.22, type: 'triangle' },
    ])
    buzz(30)
  },
  wrong: () => {
    play([
      { f: 220, t: 0, d: 0.16, type: 'square', v: 0.07, slide: 180 },
      { f: 196, t: 0.14, d: 0.2, type: 'square', v: 0.07, slide: 150 },
    ])
    buzz([60, 40, 60])
  },
  heart: () => play([{ f: 520, t: 0, d: 0.25, type: 'sine', v: 0.12, slide: 260 }]),
  combo: () =>
    play([
      { f: 784, t: 0, d: 0.1, type: 'triangle' },
      { f: 988, t: 0.08, d: 0.1, type: 'triangle' },
      { f: 1175, t: 0.16, d: 0.1, type: 'triangle' },
      { f: 1568, t: 0.24, d: 0.25, type: 'triangle' },
    ]),
  complete: () =>
    play([
      { f: 523.25, t: 0, d: 0.16, type: 'triangle' },
      { f: 659.25, t: 0.14, d: 0.16, type: 'triangle' },
      { f: 783.99, t: 0.28, d: 0.16, type: 'triangle' },
      { f: 1046.5, t: 0.42, d: 0.45, type: 'triangle' },
      { f: 1318.5, t: 0.42, d: 0.45, type: 'sine', v: 0.08 },
    ]),
  chest: () =>
    play([
      { f: 392, t: 0, d: 0.1, type: 'square', v: 0.06 },
      { f: 523.25, t: 0.08, d: 0.1, type: 'square', v: 0.06 },
      { f: 1046.5, t: 0.18, d: 0.5, type: 'triangle' },
      { f: 1568, t: 0.24, d: 0.5, type: 'sine', v: 0.08 },
    ]),
  count: () => play([{ f: 1200, t: 0, d: 0.03, type: 'triangle', v: 0.05 }]),
  streak: () =>
    play([
      { f: 330, t: 0, d: 0.3, type: 'sawtooth', v: 0.04, slide: 660 },
      { f: 880, t: 0.28, d: 0.4, type: 'triangle' },
    ]),
}
