import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { isTouch } from '../../lib/store'

// Wrap any button/link: it gets pulled towards the cursor when hovered
export default function Magnetic({ children, strength = 0.35, className = '' }) {
  const ref = useRef()
  useEffect(() => {
    if (isTouch) return
    const el = ref.current
    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.4)' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.4)' })
    const move = (e) => {
      const r = el.getBoundingClientRect()
      xTo((e.clientX - (r.left + r.width / 2)) * strength)
      yTo((e.clientY - (r.top + r.height / 2)) * strength)
    }
    const leave = () => {
      xTo(0)
      yTo(0)
    }
    el.addEventListener('mousemove', move)
    el.addEventListener('mouseleave', leave)
    return () => {
      el.removeEventListener('mousemove', move)
      el.removeEventListener('mouseleave', leave)
    }
  }, [strength])
  return (
    <span ref={ref} className={`inline-block will-change-transform ${className}`} data-interactive>
      {children}
    </span>
  )
}
