import { useEffect, useRef, useState } from 'react'
import { on, onSectionChange, store } from '../../lib/store'
import { profile, sections } from '../../data/profile'

// TV-broadcast strip along the bottom of the screen. Each section is one ball (6 balls to an over),
// and it shows the speed-gun reading of every delivery bowled in the 3D scene.
// It sits in its own bar, so it never covers the page text.
export default function ScoreBug() {
  const [idx, setIdx] = useState(0)
  const [speed, setSpeed] = useState(null)
  const [replay, setReplay] = useState(false)
  useEffect(() => on('replay', setReplay), [])
  const timer = useRef()
  useEffect(() => onSectionChange(setIdx), [])
  useEffect(
    () =>
      on('delivery', (kmh) => {
        setSpeed(kmh.toFixed(1))
        clearTimeout(timer.current)
        timer.current = setTimeout(() => setSpeed(null), 3400)
      }),
    []
  )
  const over = Math.floor(idx / 6)
  const ball = (idx % 6) + 1
  const show = idx > 0 && idx < sections.length - 1
  const cell = 'flex items-center border-l border-white/15 px-4'
  return (
    <>
    <div
      className={`fixed right-4 top-20 z-30 flex items-center gap-2 rounded-md border border-saffron/70 bg-[#06102b]/95 py-1.5 pl-2.5 pr-3.5 font-display text-xl tracking-[0.14em] text-white transition-all duration-500 md:right-6 md:top-24 ${
        replay ? 'translate-x-0 opacity-100' : 'pointer-events-none translate-x-8 opacity-0'
      }`}
      aria-hidden="true"
    >
      <span className="grid h-6 w-6 place-items-center rounded-full bg-saffron text-sm text-[#04060e]">⟲</span>
      Replay
      <span className="ml-1 font-mono text-[0.62rem] tracking-[0.2em] text-saffron">SLOW-MO</span>
    </div>
    <div
      className={`fixed inset-x-0 bottom-0 z-30 hidden select-none transition-transform duration-700 md:block ${show ? 'translate-y-0' : 'translate-y-full'}`}
      aria-hidden="true"
    >
      <div className="flex h-9 items-stretch border-t border-white/15 bg-[#0a0508]/96 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-white">
        <span className="flex items-center bg-[#ff1f3d] px-4 font-display text-base tracking-wider">PK</span>
        <span className="flex items-center gap-2 px-4">
          <span className="red-dot !h-1.5 !w-1.5" /> Live
        </span>
        <span className={cell}>
          Over {over}.{ball}
        </span>
        <span className={`${cell} font-semibold text-saffron`}>{sections[idx]?.label}</span>
        <span className={`${cell} gap-1.5`}>
          {[1, 2, 3, 4, 5, 6].map((b) => (
            <span
              key={b}
              className={`h-2 w-2 rounded-full border transition-all duration-500 ${
                b <= ball ? 'border-saffron bg-saffron shadow-[0_0_8px_#ffa23a]' : 'border-white/45 bg-transparent'
              }`}
            />
          ))}
        </span>
        <span className={`${cell} transition-opacity duration-300 ${speed ? 'opacity-100' : 'opacity-40'}`}>
          Speed&nbsp;<span className="font-semibold text-saffron">{speed ?? '— —'}</span>&nbsp;km/h
        </span>
        <span className={`${cell} ml-auto hidden text-white/80 lg:flex`}>
          {profile.name} · {profile.role}
        </span>
      </div>
    </div>
    </>
  )
}
