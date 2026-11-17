import { gamePlan } from '../data/profile'
import { Eyebrow } from '../components/ui/Bits'

export default function GamePlan() {
  return (
    <section id="gameplan" className="relative px-5 py-28 md:px-12 lg:px-16">
      <div className="mx-auto w-full max-w-7xl">
        <div className="ml-auto max-w-3xl">
          <Eyebrow no="04">The game plan</Eyebrow>
          <h2 data-reveal className="h-display mt-5 text-[clamp(2.7rem,6vw,5.6rem)]">
            Five overs from raw data to a <span className="neon-red">decision.</span>
          </h2>
          <ol className="mt-10 space-y-4">
            {gamePlan.map((g) => (
              <li key={g.over} data-reveal className="glass-strong flex gap-5 rounded-3xl p-5 md:gap-7 md:p-7">
                <div className="shrink-0 text-center">
                  <p className="label !text-[0.65rem]">Over</p>
                  <p className="font-display text-5xl leading-none text-[#ff3350] md:text-6xl">{g.over}</p>
                </div>
                <div>
                  <h3 className="font-display text-2xl tracking-wide text-white md:text-3xl">{g.title}</h3>
                  <p className="body mt-2">{g.text}</p>
                  <p className="label mt-3 !text-white/85">{g.tools}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
