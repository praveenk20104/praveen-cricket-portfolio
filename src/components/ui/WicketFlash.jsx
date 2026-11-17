import { useEffect, useRef, useState } from 'react'
import { on, store } from '../../lib/store'

// TV graphic that slides in when a delivery hits the stumps (every second wicket, so it never nags)
export default function WicketFlash() {
  const [show, setShow] = useState(false)
  const count = useRef(0)
  const timer = useRef()
  useEffect(
    () =>
      on('wicket', () => {
        if (store.stage < 1.6 || store.stage > 5.4) return
        if (count.current++ % 2 !== 0) return
        setShow(true)
        clearTimeout(timer.current)
        timer.current = setTimeout(() => setShow(false), 1900)
      }),
    []
  )
  return (
    <div
      className={`pointer-events-none fixed bottom-4 left-1/2 z-30 -translate-x-1/2 transition-all duration-300 md:bottom-14 md:left-5 md:translate-x-0 ${
        show ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
      aria-hidden="true"
    >
      <div className="flex items-stretch">
        <span className="l3 bg-[#e5142e] py-1.5 pl-4 pr-7 font-display text-3xl tracking-wide text-white md:text-4xl">WICKET!</span>
        <span className="l3 -ml-3 flex flex-col justify-center bg-white py-1 pl-6 pr-7 font-mono text-[0.68rem] font-semibold uppercase leading-tight tracking-[0.14em] text-[#0a0508]">
          Bowled
          <span className="font-normal text-[#5a1520]">Hawk-Eye: hitting</span>
        </span>
      </div>
    </div>
  )
}
