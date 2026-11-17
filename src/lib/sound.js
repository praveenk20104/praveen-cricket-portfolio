// Stadium sound, synthesised live with the Web Audio API — no audio files to download.
// Browsers only allow sound after a click, so it starts from the "Enter with sound" button.

let ctx = null
let master = null
let crowdGain = null
let noiseBuf = null
let enabled = false
const listeners = new Set()

function makeNoise(seconds = 4) {
  const buf = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate)
  const d = buf.getChannelData(0)
  let last = 0
  for (let i = 0; i < d.length; i++) {
    const white = Math.random() * 2 - 1
    last = (last + 0.02 * white) / 1.02 // brown-ish noise: soft, like a distant crowd
    d[i] = last * 3.5
  }
  return buf
}

function noiseSource(loop = false) {
  const src = ctx.createBufferSource()
  src.buffer = noiseBuf
  src.loop = loop
  return src
}

function startCrowd() {
  crowdGain = ctx.createGain()
  crowdGain.gain.value = 0
  crowdGain.connect(master)
  // two detuned layers of filtered noise = murmur of a full stadium
  ;[
    { f: 420, q: 0.6, g: 0.9, rate: 1 },
    { f: 1150, q: 0.8, g: 0.35, rate: 1.31 },
  ].forEach(({ f, q, g, rate }) => {
    const src = noiseSource(true)
    src.playbackRate.value = rate
    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = f
    bp.Q.value = q
    const gain = ctx.createGain()
    gain.gain.value = g
    // slow swell so the crowd "breathes"
    const lfo = ctx.createOscillator()
    lfo.frequency.value = 0.07 + Math.random() * 0.08
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = g * 0.35
    lfo.connect(lfoGain).connect(gain.gain)
    lfo.start()
    src.connect(bp).connect(gain).connect(crowdGain)
    src.start(0, Math.random() * 3)
  })
}

function env(node, t, peak, attack, decay) {
  node.gain.cancelScheduledValues(t)
  node.gain.setValueAtTime(0.0001, t)
  node.gain.exponentialRampToValueAtTime(peak, t + attack)
  node.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay)
}

function burst({ type = 'bandpass', freq = 1000, q = 1, peak = 0.5, attack = 0.005, decay = 0.1, sweepTo, at = 0 }) {
  const t = ctx.currentTime + at
  const src = noiseSource()
  const f = ctx.createBiquadFilter()
  f.type = type
  f.frequency.setValueAtTime(freq, t)
  if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, t + attack + decay)
  f.Q.value = q
  const g = ctx.createGain()
  env(g, t, peak, attack, decay)
  src.connect(f).connect(g).connect(master)
  src.start(t, Math.random() * 2)
  src.stop(t + attack + decay + 0.05)
}

function tone({ wave = 'sine', from = 200, to = 80, peak = 0.5, attack = 0.004, decay = 0.15, at = 0 }) {
  const t = ctx.currentTime + at
  const o = ctx.createOscillator()
  o.type = wave
  o.frequency.setValueAtTime(from, t)
  o.frequency.exponentialRampToValueAtTime(Math.max(to, 1), t + attack + decay)
  const g = ctx.createGain()
  env(g, t, peak, attack, decay)
  o.connect(g).connect(master)
  o.start(t)
  o.stop(t + attack + decay + 0.05)
}

const voices = {
  // bat tapped on the pitch: dull thud
  tap() {
    tone({ from: 150, to: 55, peak: 0.7, decay: 0.16 })
    burst({ type: 'lowpass', freq: 900, peak: 0.35, decay: 0.07 })
  },
  // leather on willow
  crack() {
    burst({ type: 'highpass', freq: 1800, peak: 0.55, decay: 0.05 })
    tone({ wave: 'triangle', from: 950, to: 260, peak: 0.5, decay: 0.09 })
    tone({ from: 220, to: 90, peak: 0.35, decay: 0.12 })
  },
  // ball into the stumps: wooden clatter
  stumps() {
    ;[0, 0.045, 0.1, 0.17].forEach((at, i) => {
      burst({ freq: 2100 + i * 380, q: 6, peak: 0.5 - i * 0.08, decay: 0.05, at })
      tone({ wave: 'triangle', from: 700 - i * 60, to: 300, peak: 0.25, decay: 0.06, at })
    })
    tone({ from: 130, to: 50, peak: 0.5, decay: 0.2 })
  },
  // crowd roar that swells and fades
  cheer() {
    const t = ctx.currentTime
    const src = noiseSource()
    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.setValueAtTime(700, t)
    bp.frequency.linearRampToValueAtTime(1500, t + 0.9)
    bp.frequency.linearRampToValueAtTime(900, t + 3.2)
    bp.Q.value = 0.5
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.9, t + 0.7)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 3.4)
    src.connect(bp).connect(g).connect(master)
    src.start(t, Math.random())
    src.stop(t + 3.5)
  },
  // camera move between sections
  whoosh() {
    burst({ freq: 300, sweepTo: 1900, q: 1.2, peak: 0.16, attack: 0.18, decay: 0.3 })
  },
  click() {
    tone({ from: 1300, to: 900, peak: 0.12, decay: 0.04 })
  },
  firework() {
    tone({ from: 110, to: 38, peak: 0.45, decay: 0.5 })
    burst({ type: 'highpass', freq: 2500, peak: 0.14, attack: 0.05, decay: 0.7, at: 0.12 })
  },
}

export const sound = {
  get enabled() {
    return enabled
  },
  subscribe(fn) {
    listeners.add(fn)
    fn(enabled)
    return () => listeners.delete(fn)
  },
  // must be called from a click / tap
  setEnabled(value) {
    try {
      if (value && !ctx) {
        const AC = window.AudioContext || window.webkitAudioContext
        if (!AC) return
        ctx = new AC()
        master = ctx.createGain()
        master.gain.value = 0.55
        master.connect(ctx.destination)
        noiseBuf = makeNoise()
        startCrowd()
      }
      enabled = !!value && !!ctx
      if (ctx) {
        if (enabled) ctx.resume()
        master.gain.setTargetAtTime(enabled ? 0.55 : 0, ctx.currentTime, 0.08)
        if (enabled && crowdGain.gain.value < 0.01) this.crowd(0.5)
      }
    } catch {
      enabled = false
    }
    listeners.forEach((fn) => fn(enabled))
  },
  // background crowd level, 0..1
  crowd(level) {
    if (!ctx || !crowdGain) return
    crowdGain.gain.setTargetAtTime(level * 0.22, ctx.currentTime, 0.8)
  },
  play(name) {
    if (!enabled || !ctx || ctx.state !== 'running' || document.hidden) return
    try {
      voices[name]?.()
    } catch {
      /* a sound failing must never break the page */
    }
  },
}
