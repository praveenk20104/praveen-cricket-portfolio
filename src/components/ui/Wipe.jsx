import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { onSectionChange, reducedMotion, store } from '../../lib/store'
import { EASE } from '../../lib/motion'

// Broadcast-style wipe (like the logo sting between replays on TV) when a new section arrives.
export default function Wipe() {
  const root = useRef()
  useEffect(() => {
    if (reducedMotion) return
    let last = 0
    let prev = -1
    return onSectionChange((idx) => {
      const now = performance.now()
      const changed = prev !== -1 && idx !== prev
      prev = idx
      if (!changed || !store.started || store.intro < 1 || now - last < 1400) return
      last = now
      const q = gsap.utils.selector(root)
      gsap
        .timeline()
        .set(q('.wipe__band'), { skewX: -18 })
        .fromTo(q('.wipe__band--blue'), { x: '-70vw' }, { x: '150vw', duration: 0.62, ease: EASE.inOut }, 0)
        .fromTo(q('.wipe__band--saffron'), { x: '-30vw' }, { x: '170vw', duration: 0.62, ease: EASE.inOut }, 0.05)
        .fromTo(q('.wipe__logo'), { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.18, ease: EASE.out }, 0.16)
        .to(q('.wipe__logo'), { opacity: 0, scale: 1.25, duration: 0.25, ease: EASE.in }, 0.36)
    })
  }, [])
  return (
    <div ref={root} className="wipe" aria-hidden="true">
      <div className="wipe__band wipe__band--blue" />
      <div className="wipe__band wipe__band--saffron" />
      <div className="wipe__logo grid h-16 w-16 place-items-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#ff6a72,#c5121f_55%,#3a0408)] shadow-[0_0_40px_rgba(255,162,58,0.6)] ring-2 ring-white/90">
        <span className="font-display text-2xl tracking-wider text-white">PK</span>
      </div>
    </div>
  )
}
