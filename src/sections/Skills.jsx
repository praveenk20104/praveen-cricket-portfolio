import { coreSkills, extraSkills } from '../data/profile'
import { isTouch } from '../lib/store'

export default function Skills() {
  return (
    <section id="skills" className="relative min-h-[150svh] px-5 py-28 md:min-h-screen md:px-12 lg:px-20">
      <div className="mx-auto flex max-w-7xl flex-col md:min-h-[75vh] md:justify-center">
        {/* On phones the stumps sit at the top of the screen; the panel scrolls in below them */}
        <div className="h-[48svh] md:hidden" />
        <div data-reveal className="glass-strong w-full max-w-xl rounded-3xl p-6 md:p-9">
          <p className="eyebrow flex items-center gap-3">
            <span className="font-mono text-[#ff1f3d]">02</span> Defending the stumps
          </p>
          <h2 className="mt-4 font-display text-[clamp(2.4rem,5vw,4.4rem)] leading-[0.92] tracking-wide">
            Four skills <span className="text-stroke">guard</span> my wicket.
          </h2>

          <ul className="mt-8 divide-y divide-white/10">
            {coreSkills.map((s, i) => (
              <li key={s.name} className="flex items-baseline gap-4 py-4">
                <span className="font-mono text-xs text-[#ff1f3d]">0{i + 1}</span>
                <div>
                  <p className="font-display text-2xl tracking-wide md:text-3xl">{s.name}</p>
                  <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-white/55">{s.detail}</p>
                </div>
              </li>
            ))}
          </ul>

          <p className="eyebrow mt-6">Also in the kit bag</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {extraSkills.map((s) => (
              <li key={s} className="rounded-full border border-white/12 bg-white/5 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-white/70">
                {s}
              </li>
            ))}
          </ul>
        </div>
        <p data-reveal className="eyebrow mt-6">
          {isTouch ? '↔ Swipe to spin the ball' : '↔ Move your mouse — the skills orbit the stumps'}
        </p>
      </div>
    </section>
  )
}
