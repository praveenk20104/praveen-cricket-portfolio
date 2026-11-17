import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

const MESSAGES = ['Rolling the pitch', 'Switching on the floodlights', 'Shining the new ball', 'Teams are walking out']
const MIN_TIME = 2200
const R = 64
const CIRC = 2 * Math.PI * R

// Loader: a cricket ball spins in the middle while the seam stitches around it fill up as the
// progress bar. At 100% the visitor chooses to enter with or without stadium sound
// (browsers only allow audio after a click, so this click is what switches it on).
export default function Preloader({ ready, onEnter, onDone }) {
  const [pct, setPct] = useState(0)
  const [msg, setMsg] = useState(0)
  const [gate, setGate] = useState(false)
  const root = useRef()
  const readyRef = useRef(ready)
  const finished = useRef(false)
  readyRef.current = ready

  useEffect(() => {
    const start = performance.now()
    let prev = start
    let value = 0
    let raf
    const tick = () => {
      const now = performance.now()
      const elapsed = now - start
      const dt = Math.min((now - prev) / 1000, 0.25)
      prev = now
      // Time-based easing (same speed on slow and fast devices).
      // Holds at 92% until the 3D scene has rendered its first frames.
      const cap = readyRef.current && elapsed > MIN_TIME ? 100 : 92
      const goal = Math.min(cap, (elapsed / MIN_TIME) * 100)
      value += (goal - value) * (1 - Math.exp(-dt * 7))
      if (cap === 100 && goal - value < 0.8) value = 100
      setPct(value)
      if (value >= 100) {
        setGate(true)
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    const iv = setInterval(() => setMsg((m) => (m + 1) % MESSAGES.length), 900)
    return () => {
      cancelAnimationFrame(raf)
      clearInterval(iv)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const enter = (withSound) => {
    if (finished.current) return
    finished.current = true
    onEnter?.(withSound)
    const q = gsap.utils.selector(root)
    gsap
      .timeline({ onComplete: () => onDone?.() })
      .to(q('.pl-center'), { scale: 0.6, opacity: 0, duration: 0.6, ease: 'power3.in' })
      .to(q('.preloader__half--top'), { yPercent: -100, duration: 1.0, ease: 'expo.inOut' }, '-=0.15')
      .to(q('.preloader__half--bottom'), { yPercent: 100, duration: 1.0, ease: 'expo.inOut' }, '<')
      .to(q('.pl-line'), { scaleX: 0, duration: 0.6, ease: 'power2.in' }, '<')
  }

  const shown = Math.floor(pct)

  return (
    <div ref={root} className="preloader" role="status" aria-live="polite" aria-label={`Loading ${shown}%`}>
      <div className="preloader__half preloader__half--top" />
      <div className="preloader__half preloader__half--bottom" />
      <div className="pl-line absolute left-0 right-0 top-1/2 h-px bg-gradient-to-r from-transparent via-[#ff1f3d] to-transparent opacity-60" />

      <div className="pl-center relative flex flex-col items-center gap-8">
        <svg viewBox="-95 -95 190 190" className="h-[11.9rem] w-[11.9rem] overflow-visible">
          <defs>
            <radialGradient id="pl-ball" cx="35%" cy="30%" r="75%">
              <stop offset="0%" stopColor="#ff4a5c" />
              <stop offset="45%" stopColor="#a50f1b" />
              <stop offset="100%" stopColor="#3a0408" />
            </radialGradient>
            <radialGradient id="pl-shade" cx="70%" cy="75%" r="70%">
              <stop offset="40%" stopColor="rgba(0,0,0,0)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.55)" />
            </radialGradient>
            <clipPath id="pl-clip">
              <circle r="44" />
            </clipPath>
            <mask id="pl-mask">
              <circle
                r={R}
                fill="none"
                stroke="#fff"
                strokeWidth="14"
                strokeDasharray={CIRC}
                strokeDashoffset={CIRC * (1 - pct / 100)}
                transform="rotate(-90)"
              />
            </mask>
          </defs>

          {/* Seam progress ring: dim stitches + lit stitches revealed by progress */}
          <g className="animate-[spin_9s_linear_infinite]" style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
            <circle r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            <circle r={R - 5} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="5" strokeDasharray="2 6" />
            <circle r={R + 5} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="5" strokeDasharray="2 6" />
            <g mask="url(#pl-mask)">
              <circle r={R} fill="none" stroke="#ff1f3d" strokeWidth="1.5" style={{ filter: 'drop-shadow(0 0 6px #ff1f3d)' }} />
              <circle r={R - 5} fill="none" stroke="#fff3e3" strokeWidth="5" strokeDasharray="2 6" />
              <circle r={R + 5} fill="none" stroke="#fff3e3" strokeWidth="5" strokeDasharray="2 6" />
            </g>
          </g>

          {/* Spinning ball: seam slides across a clipped sphere */}
          <circle r="44" fill="url(#pl-ball)" style={{ filter: 'drop-shadow(0 0 22px rgba(255,31,61,0.55))' }} />
          <g clipPath="url(#pl-clip)">
            <g className="seam-scroll">
              {[-56, 0, 56, 112].map((x) => (
                <g key={x} transform={`translate(${x} 0)`}>
                  <path d="M0 -46 Q 10 0 0 46" stroke="#3b0408" strokeWidth="3" fill="none" />
                  <path d="M-5 -44 Q 5 0 -5 44" stroke="#f4e9d6" strokeWidth="2.4" strokeDasharray="2 3.5" fill="none" />
                  <path d="M5 -44 Q 15 0 5 44" stroke="#f4e9d6" strokeWidth="2.4" strokeDasharray="2 3.5" fill="none" />
                </g>
              ))}
            </g>
            <circle r="44" fill="url(#pl-shade)" />
          </g>
          <ellipse cx="-14" cy="-18" rx="12" ry="7" fill="rgba(255,255,255,0.22)" transform="rotate(-30 -14 -18)" />
        </svg>

        {!gate ? (
          <div className="text-center">
            <div className="font-display text-6xl tabular-nums tracking-wide text-white">
              {String(shown).padStart(2, '0')}
              <span className="text-[#ff1f3d]">%</span>
            </div>
            <p className="eyebrow mt-3 h-4">{MESSAGES[msg]}…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="eyebrow">The batter is padded up</p>
            <button
              data-enter="sound"
              autoFocus
              onClick={() => enter(true)}
              className="cta-btn relative px-9 py-4 font-mono text-sm uppercase tracking-[0.22em] text-white shadow-[0_0_50px_rgba(255,31,61,0.55)]"
            >
              Enter the stadium · sound on
            </button>
            <button
              data-enter="mute"
              onClick={() => enter(false)}
              className="font-mono text-xs uppercase tracking-[0.2em] text-white/70 underline-offset-4 hover:text-white hover:underline"
            >
              Enter without sound
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
