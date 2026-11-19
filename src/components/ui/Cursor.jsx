import { useEffect, useRef } from 'react'
import { isTouch, reducedMotion } from '../../lib/store'

// Cursor: a small 3D cricket ball that rolls in the direction you move it (the seam spins),
// leaving a short saffron-to-blue comet trail. Over links it shrinks and a saffron ring appears;
// over project screenshots it turns into a bat. White + dark outline keeps it visible on any colour.
const TRAIL = 22

export default function Cursor() {
  const root = useRef()
  const ball = useRef()
  const seam = useRef()
  const ring = useRef()
  const bat = useRef()
  const canvas = useRef()

  useEffect(() => {
    if (isTouch) return
    const html = document.documentElement
    html.classList.add('has-cursor')
    root.current.classList.add('cur-hidden')
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
    const pos = { x: -100, y: -100 }
    const ringPos = { x: -100, y: -100 }
    const pts = []
    let roll = 0
    let heading = 0
    let raf = 0
    let idle = 0

    const tick = () => {
      raf = requestAnimationFrame(tick)
      // ball follows tightly, ring lags a little
      pos.x += (target.x - pos.x) * 0.45
      pos.y += (target.y - pos.y) * 0.45
      ringPos.x += (target.x - ringPos.x) * 0.2
      ringPos.y += (target.y - ringPos.y) * 0.2
      const vx = target.x - pos.x
      const vy = target.y - pos.y
      const speed = Math.hypot(vx, vy)
      if (speed > 0.4) heading = Math.atan2(vy, vx) * (180 / Math.PI)
      roll = (roll + speed * 1.6) % 360
      ball.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`
      ring.current.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`
      bat.current.style.transform = `translate3d(${target.x}px, ${target.y}px, 0)`
      // seam turns to face the direction of travel and rolls across the ball
      const off = Math.sin((roll * Math.PI) / 180) * 9
      seam.current.style.transform = `rotate(${heading + 90}deg) translateX(${off}px)`

      // comet trail
      pts.unshift({ x: pos.x, y: pos.y })
      if (pts.length > TRAIL) pts.pop()
      ctx.clearRect(0, 0, cv.width, cv.height)
      if (!reducedMotion && pts.length > 2) {
        for (let i = 1; i < pts.length; i++) {
          const k = 1 - i / pts.length
          ctx.strokeStyle = i < pts.length / 2 ? `rgba(255,162,58,${k * 0.75})` : `rgba(77,134,255,${k * 0.65})`
          ctx.lineWidth = (1 + k * 6) * dpr
          ctx.lineCap = 'round'
          ctx.beginPath()
          ctx.moveTo(pts[i - 1].x * dpr, pts[i - 1].y * dpr)
          ctx.lineTo(pts[i].x * dpr, pts[i].y * dpr)
          ctx.stroke()
        }
      }
      // stop the loop when everything has settled (saves battery)
      idle = speed < 0.05 && Math.hypot(target.x - ringPos.x, target.y - ringPos.y) < 0.1 ? idle + 1 : 0
      if (idle > TRAIL + 2) {
        cancelAnimationFrame(raf)
        raf = 0
        ctx.clearRect(0, 0, cv.width, cv.height)
        pts.length = 0
      }
    }

    const move = (e) => {
      target.x = e.clientX
      target.y = e.clientY
      root.current.classList.remove('cur-hidden')
      if (!raf) raf = requestAnimationFrame(tick)
    }
    const over = (e) => {
      const t = e.target instanceof Element ? e.target : null
      const onBat = !!t?.closest('[data-cursor="bat"]')
      const onLink = !onBat && !!t?.closest('a, button, [data-cursor="hover"]')
      root.current.classList.toggle('cur-bat', onBat)
      root.current.classList.toggle('cur-hover', onLink)
      bat.current.classList.toggle('is-on', onBat)
    }
    const down = () => bat.current.classList.add('is-swing')
    const up = () => bat.current.classList.remove('is-swing')
    const leave = () => root.current.classList.add('cur-hidden')

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
      <canvas ref={canvas} className="cur-trail" />
      <div ref={ring} className="cur-ring">
        <span />
      </div>
      <div ref={ball} className="cur-ball">
        <span className="cur-ball__sphere">
          <span ref={seam} className="cur-ball__seam" />
          <span className="cur-ball__shine" />
        </span>
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
