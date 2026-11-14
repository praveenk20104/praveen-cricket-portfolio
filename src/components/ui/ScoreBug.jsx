import { useEffect, useState } from 'react'
import { onSectionChange } from '../../lib/store'
import { sections } from '../../data/profile'

// TV-broadcast style score bug: 6 sections = 6 balls of an over
export default function ScoreBug() {
  const [idx, setIdx] = useState(0)
  useEffect(() => onSectionChange(setIdx), [])
  return (
    <div
      className={`fixed bottom-5 right-5 z-30 hidden select-none transition-all duration-700 md:block ${
        idx > 0 && idx < sections.length - 1 ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'
      }`}
    >
      <div className="glass flex items-stretch overflow-hidden rounded-xl">
        <div className="flex items-center bg-[#ff1f3d] px-3 font-display text-lg tracking-wider text-white">PK</div>
        <div className="px-4 py-2">
          <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-white/55">
            <span className="red-dot !h-1.5 !w-1.5" /> Live · Over 1.{idx}
          </div>
          <div className="mt-1 flex items-center gap-3">
            <span className="w-28 font-mono text-xs uppercase tracking-[0.12em] text-white">{sections[idx]?.label}</span>
            <span className="flex gap-1.5">
              {sections.map((s, i) => (
                <span
                  key={s.id}
                  className={`h-2.5 w-2.5 rounded-full border transition-all duration-500 ${
                    i <= idx
                      ? 'border-[#ff1f3d] bg-[#ff1f3d] shadow-[0_0_8px_#ff1f3d]'
                      : 'border-white/25 bg-transparent'
                  }`}
                />
              ))}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
