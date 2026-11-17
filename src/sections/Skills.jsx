import { coreSkills, skillGroups } from '../data/profile'
import { Eyebrow, Chips } from '../components/ui/Bits'
import { isTouch } from '../lib/store'

export default function Skills() {
  return (
    <section id="skills" className="relative px-5 py-28 md:px-12 lg:px-16">
      <div className="mx-auto w-full max-w-7xl">
        <div className="flex flex-col landscape:min-h-[88vh] landscape:justify-center">
          {/* on phones the stumps sit at the top of the screen; the panel scrolls in below them */}
          <div className="h-[46svh] landscape:hidden" />
          <div data-reveal className="glass-strong w-full max-w-xl rounded-3xl p-6 md:p-9">
            <Eyebrow no="05">Defending the stumps</Eyebrow>
            <h2 className="h-display mt-4 text-[clamp(2.5rem,5vw,4.4rem)]">
              Four skills <span className="neon-red">guard</span> my wicket.
            </h2>
            <ul className="mt-6 divide-y divide-white/15">
              {coreSkills.map((s, i) => (
                <li key={s.name} className="flex items-baseline gap-4 py-3.5">
                  <span className="font-mono text-sm font-semibold text-[#ff3350]">0{i + 1}</span>
                  <div>
                    <p className="font-display text-2xl tracking-wide text-white md:text-3xl">{s.name}</p>
                    <p className="label mt-1 !text-white/85">{s.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <p data-reveal className="eyebrow mt-5">
            {isTouch ? 'The skills orbit the stumps above' : '↔ Move your mouse: the skills orbit the stumps'}
          </p>
        </div>

        <p data-reveal className="eyebrow mt-16">The full kit bag</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {skillGroups.map((g, i) => (
            <div key={g.title} data-reveal data-delay={(i % 3) * 0.08} className="glass-strong rounded-3xl p-6">
              <h3 className="font-display text-2xl tracking-wide text-white">{g.title}</h3>
              <Chips items={g.items} className="mt-4" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
