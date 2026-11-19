import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { onSectionChange, reducedMotion, store } from '../../lib/store'
import { EASE } from '../../lib/motion'

// Broadcast-style light sweep (blue + saffron bands, no logo) when a new section arrives.
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
    })
  }, [])
  return (
    <div ref={root} className="wipe" aria-hidden="true">
      <div className="wipe__band wipe__band--blue" />
      <div className="wipe__band wipe__band--saffron" />
    </div>
  )
}
