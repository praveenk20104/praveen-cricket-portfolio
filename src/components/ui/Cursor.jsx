import { useEffect, useRef } from 'react'
import { isTouch, reducedMotion } from '../../lib/store'

// Cursor: a 3D gyroscope.
// - A bright core sits exactly on the pointer (no lag, so clicking always feels precise).
// - Around it two rings (saffron + blue) spin on different axes in real CSS 3D, each carrying a
//   small satellite. The whole gyro follows with a soft lag and tilts towards the direction of travel.
// - Moving fast throws off glowing sparks; a click sends out a shockwave and a burst of sparks.
// - Over links and buttons the gyro opens up; over project screenshots it turns into a bat.
// Everything runs on the GPU compositor (transforms only), and the loop stops when the mouse rests.
const MAX_SPARKS = 140
const COLORS = ['255,162,58', '98,150,255', '255,240,220']

export default function Cursor() {
  const root = useRef()
  const dot = useRef()
  const orb = useRef()
  const gimbal = useRef()
  const bat = useRef()
  const canvas = useRef()
  const ripples = useRef([])

  useEffect(() => {
    if (isTouch) return
    const html = document.documentElement
    const el = root.current
    html.classList.add('has-cursor')
    el.classList.add('cx-hidden')

    const cv = canvas.current
    const ctx = cv.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const size = () => {
      cv.width = window.innerWidth * dpr
      cv.height = window.innerHeight * dpr
    }
    size()
    window.addEventListener('resize', size)

    const target = { x: -100, y: -100 }
    const lag = { x: -100, y: -100 }
    const tilt = { x: 0, y: 0 }
    const sparks = []
    let last = { x: -100, y: -100 }
    let raf = 0
    let prev = performance.now()
    let rip = 0

    const spawn = (x, y, vx, vy, n, power) => {
      for (let i = 0; i < n && sparks.length < MAX_SPARKS; i++) {
        const a = Math.random() * Math.PI * 2
        const sp = (0.2 + Math.random()) * power
        sparks.push({
          x,
          y,
          vx: vx + Math.cos(a) * sp,
          vy: vy + Math.sin(a) * sp,
          life: 1,
          decay: 1.6 + Math.random() * 1.4,
          r: 0.8 + Math.random() * 1.8,
          c: COLORS[(Math.random() * COLORS.length) | 0],
        })
      }
    }

    const tick = (now) => {
      raf = requestAnimationFrame(tick)
      const dt = Math.min((now - prev) / 1000, 0.05)
      prev = now
      const f = 1 - Math.exp(-dt * 14)
      lag.x += (target.x - lag.x) * f
      lag.y += (target.y - lag.y) * f

      // velocity of the pointer this frame
      const mvx = target.x - last.x
      const mvy = target.y - last.y
      last = { x: target.x, y: target.y }
      const speed = Math.hypot(mvx, mvy)

      // gyro leans towards the direction of travel
      const k = 1 - Math.exp(-dt * 10)
      tilt.x += (Math.max(-40, Math.min(40, -mvy * 2.2)) - tilt.x) * k
      tilt.y += (Math.max(-40, Math.min(40, mvx * 2.2)) - tilt.y) * k

      dot.current.style.transform = `translate3d(${target.x}px,${target.y}px,0)`
      orb.current.style.transform = `translate3d(${lag.x.toFixed(2)}px,${lag.y.toFixed(2)}px,0)`
      gimbal.current.style.transform = `rotateX(${tilt.x.toFixed(2)}deg) rotateY(${tilt.y.toFixed(2)}deg)`
      bat.current.style.transform = `translate3d(${target.x}px,${target.y}px,0)`

      // sparks thrown off when moving fast
      if (!reducedMotion && speed > 6) spawn(lag.x, lag.y, -mvx * 0.05, -mvy * 0.05, Math.min(3, speed / 14) | 0 || 1, 0.6)

      ctx.clearRect(0, 0, cv.width, cv.height)
      if (sparks.length) {
        ctx.globalCompositeOperation = 'lighter'
        for (let i = sparks.length - 1; i >= 0; i--) {
          const p = sparks[i]
          p.life -= p.decay * dt
          if (p.life <= 0) {
            sparks.splice(i, 1)
            continue
          }
          p.vx *= 0.96
          p.vy = p.vy * 0.96 + 0.04
          p.x += p.vx * dt * 60
          p.y += p.vy * dt * 60
          const a = p.life * p.life
          const r = p.r * (0.6 + p.life * 0.6) * dpr
          ctx.fillStyle = `rgba(${p.c},${(a * 0.22).toFixed(3)})`
          ctx.beginPath()
          ctx.arc(p.x * dpr, p.y * dpr, r * 3, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = `rgba(${p.c},${a.toFixed(3)})`
          ctx.beginPath()
          ctx.arc(p.x * dpr, p.y * dpr, r, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.globalCompositeOperation = 'source-over'
      }

      // stop when everything has settled (saves battery); CSS keeps the rings spinning
      const settled =
        !sparks.length &&
        speed < 0.01 &&
        Math.abs(target.x - lag.x) < 0.1 &&
        Math.abs(target.y - lag.y) < 0.1 &&
        Math.abs(tilt.x) < 0.1 &&
        Math.abs(tilt.y) < 0.1
      if (settled) {
        cancelAnimationFrame(raf)
        raf = 0
      }
    }
    const wake = () => {
      if (!raf) {
        prev = performance.now()
        raf = requestAnimationFrame(tick)
      }
    }

    const move = (e) => {
      target.x = e.clientX
      target.y = e.clientY
      if (el.classList.contains('cx-hidden')) {
        lag.x = last.x = target.x
        lag.y = last.y = target.y
        el.classList.remove('cx-hidden')
      }
      wake()
    }
    const over = (e) => {
      const t = e.target instanceof Element ? e.target : null
      const onBat = !!t?.closest('[data-cursor="bat"]')
      const onLink = !onBat && !!t?.closest('a, button, [data-cursor="hover"], input, textarea, label')
      el.classList.toggle('cx-bat', onBat)
      el.classList.toggle('cx-hover', onLink)
      bat.current.classList.toggle('is-on', onBat)
    }
    const down = (e) => {
      el.classList.add('cx-down')
      bat.current.classList.add('is-swing')
      if (reducedMotion || el.classList.contains('cx-bat')) return
      // shockwave + spark burst
      const r = ripples.current[rip++ % ripples.current.length]
      r.animate(
        [
          { transform: `translate3d(${e.clientX}px,${e.clientY}px,0) scale(0.25)`, opacity: 1 },
          { transform: `translate3d(${e.clientX}px,${e.clientY}px,0) scale(1.9)`, opacity: 0 },
        ],
        { duration: 620, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
      )
      spawn(e.clientX, e.clientY, 0, 0, 18, 3.2)
      wake()
    }
    const up = () => {
      el.classList.remove('cx-down')
      bat.current.classList.remove('is-swing')
    }
    const leave = () => el.classList.add('cx-hidden')

    window.addEventListener('mousemove', move, { passive: true })
    window.addEventListener('mouseover', over, { passive: true })
    window.addEventListener('mousedown', down)
    window.addEventListener('mouseup', up)
    document.addEventListener('mouseleave', leave)
    return () => {
      cancelAnimationFrame(raf)
      html.classList.remove('has-cursor')
      window.removeEventListener('resize', size)
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseover', over)
      window.removeEventListener('mousedown', down)
      window.removeEventListener('mouseup', up)
      document.removeEventListener('mouseleave', leave)
    }
  }, [])

  if (isTouch) return null

  return (
    <div ref={root} aria-hidden="true">
      <canvas ref={canvas} className="cx-trail" />
      {[0, 1, 2].map((i) => (
        <span key={i} ref={(r) => (ripples.current[i] = r)} className="cx-ripple" />
      ))}
      <div ref={orb} className="cx-orb">
        <div className="cx-scale">
          <div ref={gimbal} className="cx-gimbal">
            <span className="cx-ring cx-ring--c" />
            <span className="cx-ring cx-ring--a" />
            <span className="cx-ring cx-ring--b" />
          </div>
        </div>
      </div>
      <div ref={dot} className="cx-dot">
        <span />
      </div>
      <div ref={bat} className="cursor-bat">
        <svg viewBox="0 0 100 100" fill="none">
          <defs>
            <linearGradient id="bat-wood" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f6e2b8" />
              <stop offset="100%" stopColor="#c9a26a" />
            </linearGradient>
          </defs>
          <g transform="rotate(45 50 50)">
            <rect x="46" y="-6" width="8" height="30" rx="4" fill="#2f6bff" />
            <rect x="47" y="-6" width="6" height="30" rx="3" fill="url(#bat-wood)" opacity="0.15" />
            {[0, 6, 12, 18].map((y) => (
              <rect key={y} x="46" y={-4 + y} width="8" height="1.6" fill="#ffa23a" />
            ))}
            <path d="M42 24 h16 l2 56 q0 10 -10 10 q-10 0 -10 -10 z" fill="url(#bat-wood)" stroke="#8b6a3f" strokeWidth="1" />
            <rect x="43.5" y="56" width="13" height="6" fill="#2f6bff" opacity="0.85" />
            <path d="M50 28 v58" stroke="#a9834f" strokeWidth="1" opacity="0.6" />
          </g>
        </svg>
      </div>
    </div>
  )
}
