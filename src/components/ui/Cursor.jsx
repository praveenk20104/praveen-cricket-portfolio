import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { isTouch } from '../../lib/store'

// Dot + trailing ring. Turns into a cricket bat over projects ([data-cursor="bat"]),
// grows over links/buttons ([data-cursor="hover"] or any a/button).
export default function Cursor() {
  const dot = useRef()
  const ring = useRef()
  const bat = useRef()

  useEffect(() => {
    if (isTouch) return
    document.documentElement.classList.add('has-cursor')
    document.body.classList.add('cursor-hidden') // until the mouse first moves
    const dx = gsap.quickTo(dot.current, 'x', { duration: 0.08, ease: 'power3' })
    const dy = gsap.quickTo(dot.current, 'y', { duration: 0.08, ease: 'power3' })
    const rx = gsap.quickTo(ring.current, 'x', { duration: 0.45, ease: 'power3' })
    const ry = gsap.quickTo(ring.current, 'y', { duration: 0.45, ease: 'power3' })
    const bx = gsap.quickTo(bat.current, 'x', { duration: 0.18, ease: 'power3' })
    const by = gsap.quickTo(bat.current, 'y', { duration: 0.18, ease: 'power3' })

    const move = (e) => {
      dx(e.clientX)
      dy(e.clientY)
      rx(e.clientX)
      ry(e.clientY)
      bx(e.clientX)
      by(e.clientY)
      document.body.classList.remove('cursor-hidden')
    }
    const over = (e) => {
      const t = e.target instanceof Element ? e.target : null
      const batEl = t?.closest('[data-cursor="bat"]')
      const hoverEl = t?.closest('a, button, [data-cursor="hover"]')
      bat.current.classList.toggle('is-on', !!batEl)
      ring.current.classList.toggle('is-bat', !!batEl)
      dot.current.style.opacity = batEl ? '0' : '1'
      ring.current.classList.toggle('is-hover', !batEl && !!hoverEl)
    }
    const down = () => bat.current.classList.add('is-swing')
    const up = () => bat.current.classList.remove('is-swing')
    const leave = () => document.body.classList.add('cursor-hidden')

    window.addEventListener('mousemove', move)
    window.addEventListener('mouseover', over)
    window.addEventListener('mousedown', down)
    window.addEventListener('mouseup', up)
    document.addEventListener('mouseleave', leave)
    return () => {
      document.documentElement.classList.remove('has-cursor')
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseover', over)
      window.removeEventListener('mousedown', down)
      window.removeEventListener('mouseup', up)
      document.removeEventListener('mouseleave', leave)
    }
  }, [])

  if (isTouch) return null

  return (
    <>
      <div ref={ring} className="cursor-ring">
        <span />
      </div>
      <div ref={dot} className="cursor-dot" />
      <div ref={bat} className="cursor-bat">
        {/* Cricket bat — handle at top-left (cursor hotspot), blade pointing down-right */}
        <svg viewBox="0 0 100 100" fill="none">
          <defs>
            <linearGradient id="bat-wood" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f6e2b8" />
              <stop offset="100%" stopColor="#c9a26a" />
            </linearGradient>
          </defs>
          <g transform="rotate(45 50 50)">
            <rect x="46" y="-6" width="8" height="30" rx="4" fill="#ff1f3d" />
            <rect x="47" y="-6" width="6" height="30" rx="3" fill="url(#bat-wood)" opacity="0.15" />
            {[0, 6, 12, 18].map((y) => (
              <rect key={y} x="46" y={-4 + y} width="8" height="1.6" fill="#7a0a12" />
            ))}
            <path d="M42 24 h16 l2 56 q0 10 -10 10 q-10 0 -10 -10 z" fill="url(#bat-wood)" stroke="#8b6a3f" strokeWidth="1" />
            <rect x="43.5" y="56" width="13" height="6" fill="#ff1f3d" opacity="0.85" />
            <path d="M50 28 v58" stroke="#a9834f" strokeWidth="1" opacity="0.6" />
          </g>
        </svg>
      </div>
    </>
  )
}
