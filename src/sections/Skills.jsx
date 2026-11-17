import { coreSkills, skillGroups } from '../data/profile'
import { Eyebrow, Chips } from '../components/ui/Bits'
import { isTouch } from '../lib/store'

const kitBag = [...new Set(skillGroups.flatMap((g) => g.items))].filter((s) => !['Python', 'Power BI'].includes(s)).slice(0, 22)

export default function Skills() {
  return (
    <section id="skills" className="relative px-5 py-24 md:px-12 lg:px-16">
      <div className="mx-auto flex w-full max-w-7xl flex-col landscape:min-h-[92vh] landscape:justify-center">
        {/* on phones the stumps sit at the top of the screen; the panel scrolls in below them */}
        <div className="h-[46svh] landscape:hidden" />
        <div data-reveal className="glass-strong w-full max-w-xl rounded-3xl p-6 md:p-8">
          <Eyebrow no="04">Defending the stumps</Eyebrow>
          <h2 className="h-display mt-4 text-[clamp(2.4rem,4.6vw,4.2rem)]">
            Four skills <span className="neon-red">guard</span> my wicket.
          </h2>
          <ul className="mt-5 grid grid-cols-1 gap-x-6 sm:grid-cols-2">
            {coreSkills.map((s, i) => (
              <li key={s.name} className="flex items-baseline gap-3 border-b border-white/15 py-3">
                <span className="font-mono text-sm font-semibold text-[#ff3350]">0{i + 1}</span>
                <div>
                  <p className="font-display text-2xl tracking-wide text-white">{s.name}</p>
                  <p className="label mt-0.5 !text-[0.68rem] !text-white/80">{s.detail}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="label mt-5 mb-3">Also in the kit bag</p>
          <Chips items={kitBag} />
        </div>
        <p data-reveal className="eyebrow mt-5">
          {isTouch ? 'The skills orbit the stumps above' : '↔ Move your mouse: the skills orbit the stumps'}
        </p>
      </div>
    </section>
  )
}
